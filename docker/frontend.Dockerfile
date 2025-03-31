FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY frontend/package.json ./
RUN npm install

# Copy application code
COPY frontend/ .

# Build the application
RUN npm run build

# Expose port (will be overridden by environment variable)
EXPOSE ${PORT:-3000}

# Start the application in production mode
CMD ["npm", "start"] 