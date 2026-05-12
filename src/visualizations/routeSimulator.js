/**
 * Route Simulator
 * Renders animated wayfinding routes on a venue floor plan
 */

// Venue points of interest
const POI = {
  "seat-a142": { x: 0.35, y: 0.15, floor: 1, label: "Seat A-142" },
  "seat-b55": { x: 0.65, y: 0.2, floor: 1, label: "Seat B-55" },
  "gate-north": { x: 0.5, y: 0.03, floor: 0, label: "North Gate" },
  "gate-east": { x: 0.95, y: 0.5, floor: 0, label: "East Gate" },
  "food-b": { x: 0.7, y: 0.6, floor: 0, label: "Food Court B" },
  "restroom-2": { x: 0.3, y: 0.65, floor: 0, label: "Restroom S" },
  "merch-main": { x: 0.15, y: 0.6, floor: 0, label: "Main Merch" },
  medical: { x: 0.5, y: 0.45, floor: 0, label: "Medical" },
  "family-zone": { x: 0.2, y: 0.72, floor: 0, label: "Family Zone" },
  "exit-south": { x: 0.5, y: 0.95, floor: 0, label: "South Exit" },
};

// Pre-defined route paths (simplified waypoints)
const ROUTES = {
  "seat-a142|food-b": {
    normal: [
      { x: 0.35, y: 0.15 },
      { x: 0.35, y: 0.25 },
      { x: 0.4, y: 0.35 },
      { x: 0.5, y: 0.4 },
      { x: 0.6, y: 0.45 },
      { x: 0.65, y: 0.55 },
      { x: 0.7, y: 0.6 },
    ],
    congested: [
      { x: 0.35, y: 0.15 },
      { x: 0.3, y: 0.25 },
      { x: 0.25, y: 0.35 },
      { x: 0.3, y: 0.5 },
      { x: 0.4, y: 0.55 },
      { x: 0.55, y: 0.58 },
      { x: 0.7, y: 0.6 },
    ],
    accessible: [
      { x: 0.35, y: 0.15 },
      { x: 0.35, y: 0.2 },
      { x: 0.35, y: 0.3 },
      { x: 0.35, y: 0.4 },
      { x: 0.4, y: 0.5 },
      { x: 0.5, y: 0.55 },
      { x: 0.6, y: 0.58 },
      { x: 0.7, y: 0.6 },
    ],
    steps: [
      { icon: "📍", text: "Start at Seat A-142, North Stand" },
      { icon: "⬇️", text: "Head down Aisle 14 to concourse level" },
      { icon: "➡️", text: "Turn right along Main Concourse" },
      { icon: "⬇️", text: "Continue past Gate B junction" },
      { icon: "➡️", text: "Turn right into Food Court B" },
      { icon: "🏁", text: "Arrive at Food Court B" },
    ],
    distance: "180m",
    time: "3 min",
    congestion: "Low",
  },
};

// Generate a default route between any two points
function generateRoute(fromId, toId) {
  const key = `${fromId}|${toId}`;
  if (ROUTES[key]) return ROUTES[key];

  const from = POI[fromId] || { x: 0.3, y: 0.2 };
  const to = POI[toId] || { x: 0.7, y: 0.7 };

  // Generate smooth path between two points
  const steps = 6;
  const normal = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Add some curve
    const cx = from.x + (to.x - from.x) * t + Math.sin(t * Math.PI) * 0.08;
    const cy =
      from.y + (to.y - from.y) * t + Math.cos(t * Math.PI * 0.5) * 0.05;
    normal.push({ x: cx, y: cy });
  }

  // Congested route - detour
  const congested = normal.map((p, i) => ({
    x: p.x + (i > 1 && i < steps - 1 ? 0.1 : 0),
    y: p.y + (i > 1 && i < steps - 1 ? 0.08 : 0),
  }));

  // Accessible route - wider path
  const accessible = normal.map((p, i) => ({
    x: p.x + (i > 0 && i < steps ? -0.05 : 0),
    y: p.y,
  }));

  const dist = Math.round(
    Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)) * 500,
  );

  return {
    normal,
    congested,
    accessible,
    steps: [
      { icon: "📍", text: `Start at ${POI[fromId]?.label || fromId}` },
      { icon: "⬇️", text: "Head toward nearest concourse" },
      { icon: "➡️", text: "Follow corridor signs" },
      { icon: "⬆️", text: `Proceed to ${POI[toId]?.label || toId}` },
      { icon: "🏁", text: `Arrive at ${POI[toId]?.label || toId}` },
    ],
    distance: `${dist}m`,
    time: `${Math.max(1, Math.round(dist / 60))} min`,
    congestion: dist > 200 ? "Medium" : "Low",
  };
}

export class RouteSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.currentRoute = null;
    this.routeType = "normal"; // normal | congested | accessible
    this.animationProgress = 0;
    this.animationId = null;
    this.crowdDensities = {};

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    this.canvas.width = container.offsetWidth;
    this.canvas.height = container.offsetWidth * 0.625; // 16:10
    this.canvas.style.height = this.canvas.height + "px";
    if (this.currentRoute) this.draw();
  }

  setRoute(fromId, toId, densityAware = true, accessible = false) {
    const route = generateRoute(fromId, toId);
    this.currentRoute = route;

    if (accessible) {
      this.routeType = "accessible";
    } else if (densityAware) {
      this.routeType = "congested"; // Show alternative
    } else {
      this.routeType = "normal";
    }

    this.animationProgress = 0;
    this.startAnimation();
    return route;
  }

  updateCrowdDensities(zones) {
    zones.forEach((z) => {
      this.crowdDensities[z.id] = z.currentDensity;
    });
  }

  startAnimation() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animate();
  }

  animate() {
    this.animationProgress = Math.min(1, this.animationProgress + 0.015);
    this.draw();

    if (this.animationProgress < 1) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      // Continue drawing the dot moving along the path
      this.animateDot();
    }
  }

  animateDot() {
    this.dotProgress = (this.dotProgress || 0) + 0.005;
    if (this.dotProgress > 1) this.dotProgress = 0;
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animateDot());
  }

  draw() {
    if (!this.ctx || !this.currentRoute) return;
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw venue floor plan
    this.drawFloorPlan(ctx, w, h);

    // Draw route
    const points =
      this.currentRoute[this.routeType] || this.currentRoute.normal;
    if (!points || points.length < 2) return;

    // Draw the route path (animated)
    const numPointsToDraw = Math.ceil(points.length * this.animationProgress);

    // Route shadow
    ctx.beginPath();
    ctx.moveTo(points[0].x * w, points[0].y * h);
    for (let i = 1; i < numPointsToDraw; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = ((prev.x + curr.x) / 2) * w;
      const cpy = ((prev.y + curr.y) / 2) * h;
      ctx.quadraticCurveTo(prev.x * w, prev.y * h, cpx, cpy);
    }
    ctx.strokeStyle = "rgba(0, 229, 255, 0.1)";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Route main line
    ctx.beginPath();
    ctx.moveTo(points[0].x * w, points[0].y * h);
    for (let i = 1; i < numPointsToDraw; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = ((prev.x + curr.x) / 2) * w;
      const cpy = ((prev.y + curr.y) / 2) * h;
      ctx.quadraticCurveTo(prev.x * w, prev.y * h, cpx, cpy);
    }

    const routeColor =
      this.routeType === "accessible"
        ? "#8b5cf6"
        : this.routeType === "congested"
          ? "#ffbe0b"
          : "#00e5ff";
    ctx.strokeStyle = routeColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Animated dot along path
    if (this.animationProgress >= 1 && this.dotProgress !== undefined) {
      const dotIdx = Math.min(
        points.length - 1,
        Math.floor(this.dotProgress * (points.length - 1)),
      );
      const nextIdx = Math.min(points.length - 1, dotIdx + 1);
      const localT = this.dotProgress * (points.length - 1) - dotIdx;

      const dx =
        points[dotIdx].x + (points[nextIdx].x - points[dotIdx].x) * localT;
      const dy =
        points[dotIdx].y + (points[nextIdx].y - points[dotIdx].y) * localT;

      // Dot glow
      ctx.beginPath();
      ctx.arc(dx * w, dy * h, 10, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 255, 0.2)`;
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(dx * w, dy * h, 5, 0, Math.PI * 2);
      ctx.fillStyle = routeColor;
      ctx.fill();
    }

    // Start/end markers
    const start = points[0];
    const end = points[points.length - 1];

    // Start
    ctx.beginPath();
    ctx.arc(start.x * w, start.y * h, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#00ff88";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = '10px "Space Grotesk"';
    ctx.textAlign = "center";
    ctx.fillText("A", start.x * w, start.y * h + 3.5);

    // End
    ctx.beginPath();
    ctx.arc(end.x * w, end.y * h, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#ff006e";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText("B", end.x * w, end.y * h + 3.5);

    // Draw POI markers
    this.drawPOIMarkers(ctx, w, h);
  }

  drawFloorPlan(ctx, w, h) {
    // Hidden per user request
  }

  drawPOIMarkers(ctx, w, h) {
    Object.entries(POI).forEach(([id, poi]) => {
      ctx.beginPath();
      ctx.arc(poi.x * w, poi.y * h, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 229, 255, 0.3)";
      ctx.fill();
    });
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
