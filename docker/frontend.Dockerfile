FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment variables explicitly during build
ENV NEXT_PUBLIC_API_URL=http://localhost:8033/api/v1
ENV INTERNAL_API_URL=http://backend:8033/api/v1

# Install dependencies
COPY frontend/package.json ./
RUN npm install
RUN npm install --save clsx tailwind-merge

# Copy application code
COPY frontend/ .

# Create missing lib/utils directory and file if it doesn't exist
RUN mkdir -p ./src/lib
RUN echo 'import { clsx } from "clsx";' > ./src/lib/utils.js
RUN echo 'import { twMerge } from "tailwind-merge";' >> ./src/lib/utils.js
RUN echo '' >> ./src/lib/utils.js
RUN echo 'export function cn(...inputs) {' >> ./src/lib/utils.js
RUN echo '  return twMerge(clsx(inputs));' >> ./src/lib/utils.js
RUN echo '}' >> ./src/lib/utils.js
RUN echo '' >> ./src/lib/utils.js
RUN echo 'export function formatDate(input) {' >> ./src/lib/utils.js
RUN echo '  const date = new Date(input);' >> ./src/lib/utils.js
RUN echo '  return date.toLocaleDateString("en-US", {' >> ./src/lib/utils.js
RUN echo '    month: "long",' >> ./src/lib/utils.js
RUN echo '    day: "numeric",' >> ./src/lib/utils.js
RUN echo '    year: "numeric",' >> ./src/lib/utils.js
RUN echo '  });' >> ./src/lib/utils.js
RUN echo '}' >> ./src/lib/utils.js
RUN echo '' >> ./src/lib/utils.js
RUN echo 'export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));' >> ./src/lib/utils.js

# Build the application without running linting
RUN npm run build -- --no-lint

# Expose port (will use environment variable if provided)
EXPOSE 3000

# Start the application in production mode
# Next.js will use the PORT environment variable if set
CMD ["npm", "start"] 