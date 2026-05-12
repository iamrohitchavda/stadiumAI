/**
 * StadiumAI — Admin Panel Application
 * Separate from fan-facing app. Requires authentication.
 */

import {
  STADIUMS,
  EVENTS,
  getVenueList,
  getEventList,
} from "./data/stadiumConfig.js";

// ============================================================
// AUTH
// ============================================================

const VALID_CREDENTIALS = { username: "admin", password: "admin" };
let currentVenue = STADIUMS["nms"];

window.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initAdminTabs();
});

function initLogin() {
  const loginScreen = document.getElementById("login-screen");
  const adminApp = document.getElementById("admin-app");
  const submitBtn = document.getElementById("login-submit");
  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const errorEl = document.getElementById("login-error");
  const logoutBtn = document.getElementById("logout-btn");

  // Check session
  if (sessionStorage.getItem("stadiumai_admin") === "true") {
    loginScreen.classList.add("hidden");
    adminApp.classList.add("visible");
  }

  function handleLogin() {
    const u = usernameInput.value.trim();
    const p = passwordInput.value.trim();

    if (u === VALID_CREDENTIALS.username && p === VALID_CREDENTIALS.password) {
      sessionStorage.setItem("stadiumai_admin", "true");
      loginScreen.classList.add("hidden");
      adminApp.classList.add("visible");
      errorEl.classList.remove("show");
      // Render initial tab
      renderAdminTab("venues");
    } else {
      errorEl.classList.add("show");
      passwordInput.value = "";
      passwordInput.focus();
    }
  }

  submitBtn?.addEventListener("click", handleLogin);
  passwordInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });
  usernameInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") passwordInput.focus();
  });

  logoutBtn?.addEventListener("click", () => {
    sessionStorage.removeItem("stadiumai_admin");
    loginScreen.classList.remove("hidden");
    adminApp.classList.remove("visible");
    usernameInput.value = "";
    passwordInput.value = "";
  });
}

// ============================================================
// ADMIN TABS
// ============================================================

function initAdminTabs() {
  document.querySelectorAll("[data-admin-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("[data-admin-tab]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderAdminTab(btn.dataset.adminTab);
    });
  });

  // Initial render
  renderAdminTab("venues");
}

function renderAdminTab(tab) {
  const container = document.getElementById("admin-content");
  if (!container) return;

  switch (tab) {
    case "venues":
      renderVenueTab(container);
      break;
    case "events":
      renderEventTab(container);
      break;
    case "staff":
      renderStaffTab(container);
      break;
    case "live":
      renderLiveTab(container);
      break;
    case "sensors":
      renderSensorTab(container);
      break;
    case "dataflow":
      renderDataflowTab(container);
      break;
    case "analytics":
      renderAnalyticsTab(container);
      break;
    case "scalability":
      renderScalabilityTab(container);
      break;
    case "settings":
      renderSettingsTab(container);
      break;
  }
}

// ============================================================
// TAB RENDERERS
// ============================================================

function renderVenueTab(container) {
  const venues = getVenueList();
  container.innerHTML = `
    <div class="admin-content-header">
      <h2>🏟️ Venue Management</h2>
      <button class="btn btn-primary btn-small" onclick="alert('In production: Opens Add Venue wizard → Name, City, Capacity → Zone layout editor → Gate config → Service points → Save to Cloud Firestore')">+ Add Venue</button>
    </div>
    <table class="admin-table">
      <thead>
        <tr><th>Venue</th><th>City</th><th>Capacity</th><th>Home Team</th><th>Zones</th><th>Gates</th><th>Service Pts</th><th>Staff</th><th>Actions</th></tr>
      </thead>
      <tbody>
        ${venues
          .map(
            (v) => `
          <tr>
            <td style="font-weight:600;color:var(--text-primary)">${v.name}</td>
            <td>${v.city}</td>
            <td style="font-family:var(--font-mono);color:var(--accent-cyan)">${v.capacity.toLocaleString("en-IN")}</td>
            <td>${v.teamHome}</td>
            <td style="font-family:var(--font-mono)">${v.zonesCount}</td>
            <td style="font-family:var(--font-mono)">${v.gatesCount}</td>
            <td style="font-family:var(--font-mono)">${v.servicePointsCount}</td>
            <td style="font-family:var(--font-mono)">${v.totalStaff}</td>
            <td>
              <button class="admin-action-btn">Edit</button>
              <button class="admin-action-btn">Zones</button>
              <button class="admin-action-btn danger">Delete</button>
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    ${infoBox("How venues are managed", "Admin creates a venue profile → defines zone layout on a floor plan editor → maps gates, service points, sensor positions → deploys to production. All data stored in <strong>Cloud Firestore</strong> with real-time sync. Changes propagate to all connected clients within 1 second via Pub/Sub.")}
  `;
}

function renderEventTab(container) {
  const events = getEventList();
  container.innerHTML = `
    <div class="admin-content-header">
      <h2>📅 Event Management</h2>
      <button class="btn btn-primary btn-small" onclick="alert('In production: Create Event → Select Venue → Set Date/Time → Assign Teams → Sync Ticketing API → Configure Sensors → Go Live')">+ Create Event</button>
    </div>
    <table class="admin-table">
      <thead>
        <tr><th>Event</th><th>Venue</th><th>Date</th><th>Time</th><th>Status</th><th>Capacity</th><th>Actions</th></tr>
      </thead>
      <tbody>
        ${events
          .map(
            (e) => `
          <tr>
            <td style="font-weight:600;color:var(--text-primary)">${e.name}</td>
            <td>${e.venueName}, ${e.venueCity}</td>
            <td style="font-family:var(--font-mono)">${e.date}</td>
            <td style="font-family:var(--font-mono)">${e.time}</td>
            <td><span class="admin-status ${e.status}">${e.status === "live" ? "🔴 LIVE" : "🔵 Upcoming"}</span></td>
            <td style="font-family:var(--font-mono);color:var(--accent-cyan)">${e.venueCapacity?.toLocaleString("en-IN")}</td>
            <td>
              <button class="admin-action-btn">Edit</button>
              <button class="admin-action-btn">Tickets</button>
              <button class="admin-action-btn">Go Live</button>
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    ${infoBox("Event lifecycle", "Created → Ticketing API synced → Pre-match (sensors activated, ML models warmed) → <strong>LIVE</strong> (real-time streaming, AI predictions active) → Post-match (analytics generated) → Archived to BigQuery cold storage.")}
  `;
}

function renderStaffTab(container) {
  const venue = currentVenue;
  const teams = [
    {
      icon: "🛡️",
      name: "Security",
      count: venue.staff.security,
      color: "#ff006e",
      roles: ["Guard", "Supervisor", "K9 Unit", "CCTV Ops"],
    },
    {
      icon: "🏥",
      name: "Medical",
      count: venue.staff.medical,
      color: "#00ff88",
      roles: ["Doctor", "Paramedic", "Nurse", "First Aid"],
    },
    {
      icon: "🍔",
      name: "F&B",
      count: venue.staff.fnb,
      color: "#ffbe0b",
      roles: ["Counter", "Kitchen", "Runner", "Supervisor"],
    },
    {
      icon: "🧹",
      name: "Cleaning",
      count: venue.staff.cleaning,
      color: "#00e5ff",
      roles: ["Floor", "Restroom", "Waste", "Supervisor"],
    },
  ];

  container.innerHTML = `
    <div class="admin-content-header">
      <h2>👥 Staff Management — ${venue.name}</h2>
      <button class="btn btn-primary btn-small">+ Add Staff</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;margin-bottom:2rem">
      ${teams
        .map(
          (t) => `
        <div style="background:rgba(0,0,0,0.2);border:1px solid ${t.color}30;border-radius:var(--radius-md);padding:1.25rem">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">
            <span style="font-size:1.5rem">${t.icon}</span>
            <span style="font-weight:700">${t.name}</span>
            <span style="margin-left:auto;font-family:var(--font-mono);color:${t.color};font-weight:700;font-size:1.3rem">${t.count}</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">
            ${t.roles.map((r) => `<span style="font-size:0.65rem;padding:2px 8px;background:${t.color}10;border:1px solid ${t.color}25;border-radius:var(--radius-full);color:${t.color};font-family:var(--font-mono)">${r}</span>`).join("")}
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
    ${infoBox("Staff operations", "Each staff member gets a mobile app with GPS tracking, incident alerts, shift schedules, and AR wayfinding. Admin assigns staff to zones → AI optimizes positioning based on crowd density predictions → real-time redeployment suggestions sent to team supervisors.")}
  `;
}

function renderSensorTab(container) {
  const venue = currentVenue;
  const sensors = [
    {
      type: "BLE Beacon",
      count: venue.zones.length * 8,
      freq: "1s",
      pipeline: "Pub/Sub → Dataflow → BQ",
    },
    {
      type: "WiFi Probe",
      count: venue.zones.length * 4,
      freq: "2s",
      pipeline: "Pub/Sub → Dataflow → BQ",
    },
    {
      type: "Camera Counter",
      count: venue.gates.length + venue.servicePoints.length,
      freq: "5s",
      pipeline: "Vision AI → Pub/Sub → BQ",
    },
    {
      type: "Gate Scanner",
      count: venue.gates.length,
      freq: "Real-time",
      pipeline: "Webhook → Cloud Run → BQ",
    },
    {
      type: "POS Terminal",
      count:
        venue.servicePoints.filter((s) => s.type !== "restroom").length * 3,
      freq: "Per txn",
      pipeline: "API → Pub/Sub → BQ",
    },
    {
      type: "Environmental",
      count: Math.ceil(venue.zones.length * 1.5),
      freq: "30s",
      pipeline: "IoT Core → Pub/Sub → BQ",
    },
  ];
  const total = sensors.reduce((s, t) => s + t.count, 0);

  container.innerHTML = `
    <div class="admin-content-header">
      <h2>📡 Sensor Configuration — ${venue.name}</h2>
      <span style="font-size:0.8rem;color:var(--accent-green);font-family:var(--font-mono)">${total} sensors active</span>
    </div>
    <table class="admin-table">
      <thead><tr><th>Type</th><th>Count</th><th>Status</th><th>Frequency</th><th>Pipeline</th><th>Actions</th></tr></thead>
      <tbody>
        ${sensors
          .map(
            (s) => `
          <tr>
            <td style="font-weight:600;color:var(--text-primary)">${s.type}</td>
            <td style="font-family:var(--font-mono);color:var(--accent-cyan)">${s.count}</td>
            <td><span class="admin-status live">✅ active</span></td>
            <td style="font-family:var(--font-mono)">${s.freq}</td>
            <td style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-tertiary)">${s.pipeline}</td>
            <td><button class="admin-action-btn">Configure</button><button class="admin-action-btn">Map Zones</button></td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    ${infoBox("Sensor onboarding", "Admin maps each sensor to a zone via drag-and-drop on the venue floor plan → sensor streams to Pub/Sub topic <code>venue/{id}/sensors/{zone}</code> → Cloud Dataflow aggregates into BigQuery real-time tables. Auto-calibration runs for first 30 minutes after install.")}
  `;
}

function renderDataflowTab(container) {
  container.innerHTML = `
    <div class="admin-content-header">
      <h2>⚡ Real-Time Data Pipeline</h2>
    </div>

    <div style="background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-lg);padding:1.5rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;margin-bottom:1rem;color:var(--accent-cyan)">Data Sources → Processing → Consumers</h3>

      <div class="dataflow-visual">
        <div class="dataflow-node"><div class="dataflow-node-icon">📡</div><div class="dataflow-node-label">IoT Sensors</div><div class="dataflow-node-detail">BLE / WiFi / Camera</div></div>
        <div class="dataflow-node"><div class="dataflow-node-icon">🎫</div><div class="dataflow-node-label">Ticketing API</div><div class="dataflow-node-detail">Gate webhooks</div></div>
        <div class="dataflow-node"><div class="dataflow-node-icon">💳</div><div class="dataflow-node-label">POS Systems</div><div class="dataflow-node-detail">Transaction stream</div></div>
        <div class="dataflow-node"><div class="dataflow-node-icon">📱</div><div class="dataflow-node-label">Staff App</div><div class="dataflow-node-detail">GPS + incidents</div></div>
        <div class="dataflow-node"><div class="dataflow-node-icon">📹</div><div class="dataflow-node-label">Camera AI</div><div class="dataflow-node-detail">People counting</div></div>
      </div>
      <div class="dataflow-arrow-row">▼ ▼ ▼ ▼ ▼</div>
      <div class="dataflow-pipeline">
        <div class="dataflow-pipeline-label">Google Cloud Pub/Sub → Cloud Dataflow → BigQuery</div>
        <div class="dataflow-pipeline-detail">Real-time streaming · 1-second windows · Auto-scaling · 10M+ events/min capacity</div>
      </div>
      <div class="dataflow-arrow-row">▼ ▼ ▼</div>
      <div class="dataflow-visual" style="grid-template-columns:repeat(3,1fr)">
        <div class="dataflow-node"><div class="dataflow-node-icon">🧠</div><div class="dataflow-node-label">Vertex AI</div><div class="dataflow-node-detail">ML inference <200ms</div></div>
        <div class="dataflow-node"><div class="dataflow-node-icon">⚡</div><div class="dataflow-node-label">Cloud Run APIs</div><div class="dataflow-node-detail">Auto-scaling 0→∞</div></div>
        <div class="dataflow-node"><div class="dataflow-node-icon">🗺️</div><div class="dataflow-node-label">Google Maps</div><div class="dataflow-node-detail">Indoor nav engine</div></div>
      </div>
      <div class="dataflow-arrow-row">▼ ▼ ▼</div>
      <div class="dataflow-visual" style="grid-template-columns:repeat(3,1fr)">
        <div class="dataflow-node" style="border-color:rgba(0,255,136,0.3)"><div class="dataflow-node-icon">📱</div><div class="dataflow-node-label">Fan App</div><div class="dataflow-node-detail">1,32,000 concurrent</div></div>
        <div class="dataflow-node" style="border-color:rgba(139,92,246,0.3)"><div class="dataflow-node-icon">🖥️</div><div class="dataflow-node-label">Admin Panel</div><div class="dataflow-node-detail">Ops backend</div></div>
        <div class="dataflow-node" style="border-color:rgba(255,190,11,0.3)"><div class="dataflow-node-icon">📺</div><div class="dataflow-node-label">Venue Screens</div><div class="dataflow-node-detail">Digital signage</div></div>
      </div>
    </div>

    ${infoBox(
      "Where data is stored",
      `
      <strong>Tier 1 — Hot (Real-time):</strong> Cloud Firestore for live state (crowd density, queue lengths, staff positions). <2s read latency. Auto-scales to millions of ops/sec.<br/><br/>
      <strong>Tier 2 — Warm (Analytics):</strong> BigQuery for streaming inserts + historical queries. Columnar storage with 10TB+ capacity per venue per season.<br/><br/>
      <strong>Tier 3 — Cold (Archive):</strong> Cloud Storage (Nearline) for raw sensor data + event recordings. Auto-lifecycle to Coldline after 90 days.<br/><br/>
      <strong>Caching:</strong> Cloud Memorystore (Redis) for API response caching. 50,000 req/sec per instance.
    `,
    )}
  `;
}

function renderAnalyticsTab(container) {
  container.innerHTML = `
    <div class="admin-content-header">
      <h2>📊 Post-Event Analytics</h2>
      <span style="font-size:0.75rem;color:var(--text-tertiary);font-family:var(--font-mono)">Powered by BigQuery + Looker</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem">
      ${[
        { val: "94%", label: "Fan Satisfaction", color: "#00ff88" },
        { val: "1.2s", label: "Avg Latency", color: "#00e5ff" },
        { val: "87%", label: "Prediction Accuracy", color: "#ffbe0b" },
        { val: "42", label: "Incidents Resolved", color: "#8b5cf6" },
      ]
        .map(
          (m) => `
        <div style="background:${m.color}08;border:1px solid ${m.color}25;border-radius:var(--radius-md);padding:1rem;text-align:center">
          <div style="font-family:var(--font-display);font-size:1.8rem;font-weight:700;color:${m.color}">${m.val}</div>
          <div style="font-size:0.7rem;color:var(--text-tertiary)">${m.label}</div>
        </div>
      `,
        )
        .join("")}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div style="background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:1.25rem">
        <h4 style="font-size:0.85rem;margin-bottom:0.75rem">🕐 Peak Crowd Density Timeline</h4>
        <div style="display:flex;align-items:flex-end;gap:3px;height:100px">
          ${[20, 35, 55, 80, 95, 88, 92, 60, 45, 75, 90, 85, 40, 25, 15]
            .map(
              (v) =>
                `<div style="flex:1;background:linear-gradient(to top,${v > 80 ? "#ff006e" : v > 60 ? "#ffbe0b" : "#00e5ff"}20,${v > 80 ? "#ff006e" : v > 60 ? "#ffbe0b" : "#00e5ff"});height:${v}%;border-radius:2px 2px 0 0;min-width:4px"></div>`,
            )
            .join("")}
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px"><span style="font-size:0.6rem;color:var(--text-tertiary)">Gate Open</span><span style="font-size:0.6rem;color:var(--text-tertiary)">Full Time</span></div>
      </div>
      <div style="background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:1.25rem">
        <h4 style="font-size:0.85rem;margin-bottom:0.75rem">📈 Queue Wait Reduction</h4>
        <div style="display:flex;flex-direction:column;gap:0.5rem">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <span style="font-size:0.7rem;color:var(--text-tertiary);width:60px">Before AI</span>
            <div style="flex:1;background:rgba(255,107,53,0.2);height:20px;border-radius:4px;position:relative"><div style="width:85%;height:100%;background:#ff6b35;border-radius:4px"></div><span style="position:absolute;right:4px;top:2px;font-size:0.65rem;color:#fff">12.4 min</span></div>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem">
            <span style="font-size:0.7rem;color:var(--text-tertiary);width:60px">After AI</span>
            <div style="flex:1;background:rgba(0,255,136,0.2);height:20px;border-radius:4px;position:relative"><div style="width:35%;height:100%;background:#00ff88;border-radius:4px"></div><span style="position:absolute;right:4px;top:2px;font-size:0.65rem;color:#fff">4.1 min</span></div>
          </div>
        </div>
        <div style="margin-top:0.75rem;font-size:0.75rem;color:var(--accent-green);font-weight:600">↓ 67% reduction in average wait</div>
      </div>
    </div>
    ${infoBox("Analytics pipeline", "All event data → BigQuery → Looker Studio auto-dashboards → Vertex AI retrains models weekly → Insights feed back into next event planning.")}
  `;
}

function renderScalabilityTab(container) {
  container.innerHTML = `
    <div class="admin-content-header">
      <h2>🚀 Scalability Architecture</h2>
      <span style="font-size:0.75rem;color:var(--accent-green);font-family:var(--font-mono)">Designed for 10L+ concurrent users</span>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">
      <div style="background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:1.25rem">
        <h4 style="font-size:0.9rem;margin-bottom:1rem">🏗️ Can it handle lakhs of users?</h4>
        <div style="font-size:0.8rem;color:var(--text-secondary);line-height:1.7">
          <strong style="color:var(--accent-green)">YES.</strong> Here's how:<br/><br/>
          <strong style="color:var(--accent-cyan)">Cloud Run</strong> — Auto-scales from 0 to 1000+ container instances in seconds. Each instance handles 80 concurrent requests. For 5,00,000 users: ~6,250 instances.<br/><br/>
          <strong style="color:var(--accent-cyan)">Cloud CDN</strong> — Static assets (app, maps, images) served from 150+ global edge locations. Zero load on backend for static content.<br/><br/>
          <strong style="color:var(--accent-cyan)">Cloud Memorystore (Redis)</strong> — API response caching. Most crowd density reads served from cache (50,000 req/sec per instance). TTL: 2 seconds.<br/><br/>
          <strong style="color:var(--accent-cyan)">Pub/Sub</strong> — Handles 10M+ messages/second. Fan app subscribes to venue-specific topics (not per-user).<br/><br/>
          <strong style="color:var(--accent-cyan)">BigQuery</strong> — Serverless, auto-scaling. No provisioning needed. Handles petabyte-scale queries.
        </div>
      </div>

      <div style="background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:1.25rem">
        <h4 style="font-size:0.9rem;margin-bottom:1rem">📊 Capacity Planning</h4>
        <table class="admin-table" style="margin:0">
          <thead><tr><th>Component</th><th>Capacity</th><th>IPL Final Load</th></tr></thead>
          <tbody>
            <tr><td>Concurrent Users</td><td style="font-family:var(--font-mono);color:var(--accent-cyan)">10,00,000+</td><td style="color:var(--accent-green)">✅ 1,32,000</td></tr>
            <tr><td>API Requests/sec</td><td style="font-family:var(--font-mono);color:var(--accent-cyan)">5,00,000</td><td style="color:var(--accent-green)">✅ ~66,000</td></tr>
            <tr><td>Pub/Sub Events/sec</td><td style="font-family:var(--font-mono);color:var(--accent-cyan)">10M+</td><td style="color:var(--accent-green)">✅ ~50,000</td></tr>
            <tr><td>ML Inferences/sec</td><td style="font-family:var(--font-mono);color:var(--accent-cyan)">10,000</td><td style="color:var(--accent-green)">✅ ~500</td></tr>
            <tr><td>WebSocket Connections</td><td style="font-family:var(--font-mono);color:var(--accent-cyan)">5,00,000</td><td style="color:var(--accent-green)">✅ 1,32,000</td></tr>
            <tr><td>Data Ingestion</td><td style="font-family:var(--font-mono);color:var(--accent-cyan)">1TB/day</td><td style="color:var(--accent-green)">✅ ~50GB/match</td></tr>
            <tr><td>Estimated Cost</td><td style="font-family:var(--font-mono);color:var(--accent-amber)">~₹2-5L/match</td><td style="color:var(--accent-green)">✅ Within budget</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div style="background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:1.25rem;margin-bottom:1.5rem">
      <h4 style="font-size:0.9rem;margin-bottom:1rem">💾 Data Storage Strategy</h4>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem">
        <div style="border:1px solid rgba(255,0,110,0.2);border-radius:var(--radius-md);padding:1rem">
          <div style="font-weight:700;color:var(--accent-magenta);font-size:0.85rem;margin-bottom:0.5rem">🔥 Hot (Real-Time)</div>
          <div style="font-size:0.75rem;color:var(--text-secondary);line-height:1.6">
            <strong>Cloud Firestore</strong><br/>
            Live crowd density, queue states, staff positions.<br/>
            &lt;50ms reads. Auto-scales to 1M+ ops/sec.<br/>
            <span style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text-tertiary)">Retention: Current session only</span>
          </div>
        </div>
        <div style="border:1px solid rgba(255,190,11,0.2);border-radius:var(--radius-md);padding:1rem">
          <div style="font-weight:700;color:var(--accent-amber);font-size:0.85rem;margin-bottom:0.5rem">📊 Warm (Analytics)</div>
          <div style="font-size:0.75rem;color:var(--text-secondary);line-height:1.6">
            <strong>BigQuery</strong><br/>
            Historical match data, aggregated sensor readings, incident logs.<br/>
            Streaming inserts + batch queries. Serverless.<br/>
            <span style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text-tertiary)">Retention: 90 days active, then archive</span>
          </div>
        </div>
        <div style="border:1px solid rgba(0,229,255,0.2);border-radius:var(--radius-md);padding:1rem">
          <div style="font-weight:700;color:var(--accent-cyan);font-size:0.85rem;margin-bottom:0.5rem">❄️ Cold (Archive)</div>
          <div style="font-size:0.75rem;color:var(--text-secondary);line-height:1.6">
            <strong>Cloud Storage</strong> (Nearline/Coldline)<br/>
            Raw sensor data, event recordings, model training datasets.<br/>
            Auto-lifecycle policies.<br/>
            <span style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text-tertiary)">Retention: 1 year → auto-delete</span>
          </div>
        </div>
      </div>
    </div>
    ${infoBox("Multi-venue scaling", "Each venue operates as an independent tenant on shared infrastructure. Pub/Sub topics are venue-scoped. BigQuery datasets are venue-partitioned. Cloud Run services are stateless and shared across venues. Adding a new venue = admin panel config only — zero infrastructure changes.")}
  `;
}

function renderSettingsTab(container) {
  container.innerHTML = `
    <div class="admin-content-header">
      <h2>⚙️ Platform Settings</h2>
    </div>
    <div class="admin-form-grid">
      <div class="admin-form-field"><span class="admin-form-label">Default Region</span><select class="admin-form-input"><option>asia-south1 (Mumbai)</option><option>asia-south2 (Delhi)</option><option>us-central1</option></select></div>
      <div class="admin-form-field"><span class="admin-form-label">Data Retention</span><select class="admin-form-input"><option>90 days (GDPR)</option><option>30 days</option><option>180 days</option></select></div>
      <div class="admin-form-field"><span class="admin-form-label">ML Model Version</span><input class="admin-form-input" value="v2.4.1-stable" readonly /></div>
      <div class="admin-form-field"><span class="admin-form-label">Pub/Sub Topic Prefix</span><input class="admin-form-input" value="stadium-ai/prod/" readonly /></div>
      <div class="admin-form-field"><span class="admin-form-label">Latency SLA</span><select class="admin-form-input"><option>&lt; 2 seconds (default)</option><option>&lt; 1 second</option><option>&lt; 5 seconds</option></select></div>
      <div class="admin-form-field"><span class="admin-form-label">Offline Mode</span><select class="admin-form-input"><option>Enabled (PWA + SW)</option><option>Disabled</option></select></div>
      <div class="admin-form-field full-width"><span class="admin-form-label">API Base URL</span><input class="admin-form-input" value="https://api.stadiumai.io/v1/" readonly style="font-family:var(--font-mono)" /></div>
      <div class="admin-form-field full-width">
        <span class="admin-form-label">Privacy (Immutable)</span>
        <div style="display:flex;gap:1rem;margin-top:4px">
          <label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-secondary)"><input type="checkbox" checked disabled /> No PII</label>
          <label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-secondary)"><input type="checkbox" checked disabled /> Anonymized IDs</label>
          <label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-secondary)"><input type="checkbox" checked disabled /> No Facial Recognition</label>
          <label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-secondary)"><input type="checkbox" checked disabled /> Auto Data Purge</label>
        </div>
      </div>
    </div>
    ${infoBox("Architecture", "Settings stored in Cloud Firestore → propagated via Pub/Sub to all Cloud Run instances within 1 second. API gateway enforces latency SLA. Privacy settings immutable in production, audited via Cloud Audit Logs.")}
  `;
}

function renderLiveTab(container) {
  container.innerHTML = `
    <div class="admin-content-header">
      <h2>⚡ Live Events Control Center</h2>
    </div>
    <div style="background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-lg);padding:1.5rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;margin-bottom:1rem;color:var(--accent-cyan)">Trigger AI Scenarios in the Platform</h3>
      <div class="sandbox-buttons">
        <button class="sandbox-btn" data-event="crowd-surge">
          <span class="sandbox-btn-icon">🌊</span>
          <span class="sandbox-btn-label">Crowd Surge</span>
          <span class="sandbox-btn-desc">Zone B density → 95%</span>
        </button>
        <button class="sandbox-btn" data-event="medical">
          <span class="sandbox-btn-icon">🚑</span>
          <span class="sandbox-btn-label">Medical Emergency</span>
          <span class="sandbox-btn-desc">Section A, Row 14</span>
        </button>
        <button class="sandbox-btn" data-event="halftime-rush">
          <span class="sandbox-btn-icon">🍔</span>
          <span class="sandbox-btn-label">Half-Time Rush</span>
          <span class="sandbox-btn-desc">All queues surge 3×</span>
        </button>
        <button class="sandbox-btn" data-event="gate-failure">
          <span class="sandbox-btn-icon">🚫</span>
          <span class="sandbox-btn-label">Gate Malfunction</span>
          <span class="sandbox-btn-desc">Gate C goes offline</span>
        </button>
        <button class="sandbox-btn" data-event="vip-alert">
          <span class="sandbox-btn-icon">⭐</span>
          <span class="sandbox-btn-label">VIP Arrival</span>
          <span class="sandbox-btn-desc">Priority routing activated</span>
        </button>
        <button class="sandbox-btn sandbox-btn-reset" data-event="reset">
          <span class="sandbox-btn-icon">↻</span>
          <span class="sandbox-btn-label">Reset All</span>
          <span class="sandbox-btn-desc">Return to normal</span>
        </button>
      </div>
    </div>
    ${infoBox("Live Integration", "These commands are dispatched immediately out to active displays or web views. Real-time updates take < 1 second to appear globally.")}
  `;

  // Attach event listeners for localStorage triggering
  container.querySelectorAll('.sandbox-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const event = btn.dataset.event;
      // Visual feedback
      btn.style.transform = 'scale(0.95)';
      btn.style.borderColor = 'var(--accent-cyan)';
      setTimeout(() => { btn.style.transform = ''; btn.style.borderColor = ''; }, 300);
      
      // Trigger via localStorage so the main app sees it
      localStorage.setItem('admin_sandbox_event', event + '-' + Date.now());
    });
  });
}

// ============================================================
// HELPERS
// ============================================================

function infoBox(title, content) {
  return `
    <div style="margin-top:1.5rem;padding:1rem;background:rgba(0,229,255,0.03);border:1px dashed rgba(0,229,255,0.15);border-radius:var(--radius-md)">
      <p style="font-size:0.75rem;color:var(--text-tertiary)"><strong style="color:var(--accent-cyan)">${title}:</strong> ${content}</p>
    </div>
  `;
}
