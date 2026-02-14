# Stage 1: Build the Angular application
FROM node:20-slim as build

WORKDIR /app

# Copy package.json and package-lock.json first to install dependencies
COPY package*.json ./
RUN rm -rf node_modules package-lock.json # Clean up before install
RUN npm install --legacy-peer-deps         # Install dependencies

# Copy the rest of your application code
COPY . .

# Build the Angular application for production
# IMPORTANT: Replace 'your-app-name' with the actual folder name
# that 'ng build' creates inside the 'dist/' directory.
# You can find this by running 'ng build' locally and checking the 'dist' folder.
RUN npm run build -- --output-path=./dist/your-app-name --configuration=production

# Stage 2: Serve the Angular application with Nginx
FROM nginx:alpine

# Copy the custom Nginx configuration into the Nginx config directory
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default Nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy the built Angular application from the build stage to the Nginx web root
# Ensure this path matches the output-path from the build stage
COPY --from=build /app/dist/your-app-name /usr/share/nginx/html

# Cloud Run expects your container to listen on the port specified by the PORT environment variable.
# Nginx is configured to listen on port 80, and Cloud Run will automatically map its PORT env var to this.
EXPOSE 8080

# Command to start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
