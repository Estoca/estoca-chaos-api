FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY frontend/package.json ./
RUN npm install

# Copy application code
COPY frontend/ .

# Expose port
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "start"] 