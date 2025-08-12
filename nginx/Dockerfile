# Step 1: Start from the official NGINX lightweight image
FROM nginx:alpine

# Step 2: Remove default NGINX config
RUN rm /etc/nginx/conf.d/default.conf

# Step 3: Copy your custom NGINX config into the container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Step 4: Expose port 80 for HTTP traffic
EXPOSE 80
