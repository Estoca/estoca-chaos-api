#!/bin/sh

# Substitute environment variables in the Nginx configuration
envsubst '$DOMAIN' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.tmp
mv /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf

# Start Nginx in the foreground
exec nginx -g "daemon off;" 