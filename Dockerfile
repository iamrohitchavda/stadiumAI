# Stage 1: Build the Vite application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve the application using NGINX
FROM nginx:alpine
# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built dist folder from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html
# Cloud Run listens on port 8080 by default (our nginx.conf is configured to listen here)
EXPOSE 8080
# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
