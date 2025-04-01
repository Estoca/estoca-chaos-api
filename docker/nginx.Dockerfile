FROM nginx:alpine

# Copy the Nginx configuration template
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy the entrypoint script
COPY docker/nginx-entrypoint.sh /docker-entrypoint.sh

# Install envsubst (required by the entrypoint script)
RUN apk add --no-cache gettext

# Make the entrypoint script executable
RUN chmod +x /docker-entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]