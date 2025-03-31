FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY frontend/package.json ./
RUN npm install
RUN npm install --save clsx tailwind-merge

# Copy application code
COPY frontend/ .

# Create missing lib/utils directory and file if it doesn't exist
RUN mkdir -p ./src/lib && \
    echo 'import { clsx } from "clsx";\n\
import { twMerge } from "tailwind-merge";\n\
\n\
export function cn(...inputs) {\n\
  return twMerge(clsx(inputs));\n\
}\n\
\n\
export function formatDate(input) {\n\
  const date = new Date(input);\n\
  return date.toLocaleDateString("en-US", {\n\
    month: "long",\n\
    day: "numeric",\n\
    year: "numeric",\n\
  });\n\
}\n\
\n\
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));' > ./src/lib/utils.js

# Build the application without running linting
RUN npm run build -- --no-lint

# Expose port
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "start"] 