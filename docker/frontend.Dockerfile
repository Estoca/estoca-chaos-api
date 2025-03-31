FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY frontend/package.json ./
RUN npm install

# Copy application code
COPY frontend/ .

# Build the application without running linting
RUN npm run build -- --no-lint

# Expose port
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "start"] 