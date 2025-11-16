# Stage 1: Build the Angular application
FROM node:22.21-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Build the Angular app for production
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Create SSL directory
RUN mkdir -p /etc/ssl

# Copy SSL certificates (make sure these files exist in your project root)
COPY nginx/localhost.crt /etc/ssl/localhost.crt
COPY nginx/localhost.key /etc/ssl/localhost.key

# Set proper permissions for SSL key
RUN chmod 600 /etc/ssl/localhost.key

# Copy built Angular app from build stage to nginx default directory
COPY --from=build /app/dist/secchub-frontend/browser /usr/share/nginx/html/

# Set proper permissions for the web content
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

# Expose ports 80 (HTTP) and 443 (HTTPS)
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
