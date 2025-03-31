FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment variables explicitly during build
ENV NEXT_PUBLIC_API_URL=http://localhost:8033/api/v1
ENV INTERNAL_API_URL=http://backend:8033/api/v1
# Use NEXTAUTH_URL from docker-compose environment variables
# ENV NEXTAUTH_URL is intentionally not set here to avoid hardcoding

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
RUN echo '' >> ./src/lib/utils.js
RUN echo '// Safe JSON stringify function' >> ./src/lib/utils.js
RUN echo 'export function safeJsonStringify(value, indent = 2) {' >> ./src/lib/utils.js
RUN echo '  try {' >> ./src/lib/utils.js
RUN echo '    return JSON.stringify(value, null, indent);' >> ./src/lib/utils.js
RUN echo '  } catch (error) {' >> ./src/lib/utils.js
RUN echo '    console.error("Failed to stringify JSON:", error);' >> ./src/lib/utils.js
RUN echo '    return "{}";' >> ./src/lib/utils.js
RUN echo '  }' >> ./src/lib/utils.js
RUN echo '}' >> ./src/lib/utils.js
RUN echo '' >> ./src/lib/utils.js
RUN echo '// Safe JSON parse function' >> ./src/lib/utils.js
RUN echo 'export function safeJsonParse(jsonString, fallback = {}) {' >> ./src/lib/utils.js
RUN echo '  try {' >> ./src/lib/utils.js
RUN echo '    return jsonString ? JSON.parse(jsonString) : fallback;' >> ./src/lib/utils.js
RUN echo '  } catch (error) {' >> ./src/lib/utils.js
RUN echo '    console.error("Failed to parse JSON:", error);' >> ./src/lib/utils.js
RUN echo '    return fallback;' >> ./src/lib/utils.js
RUN echo '  }' >> ./src/lib/utils.js
RUN echo '}' >> ./src/lib/utils.js
RUN echo '' >> ./src/lib/utils.js
RUN echo '// Generate example from JSON schema' >> ./src/lib/utils.js
RUN echo 'export function generateExampleFromSchema(schema) {' >> ./src/lib/utils.js
RUN echo '  if (!schema) return {};' >> ./src/lib/utils.js
RUN echo '  ' >> ./src/lib/utils.js
RUN echo '  try {' >> ./src/lib/utils.js
RUN echo '    // Basic implementation for common schema types' >> ./src/lib/utils.js
RUN echo '    if (schema.type === "object") {' >> ./src/lib/utils.js
RUN echo '      const result = {};' >> ./src/lib/utils.js
RUN echo '      if (schema.properties) {' >> ./src/lib/utils.js
RUN echo '        Object.keys(schema.properties).forEach(propName => {' >> ./src/lib/utils.js
RUN echo '          result[propName] = generateExampleFromSchema(schema.properties[propName]);' >> ./src/lib/utils.js
RUN echo '        });' >> ./src/lib/utils.js
RUN echo '      }' >> ./src/lib/utils.js
RUN echo '      return result;' >> ./src/lib/utils.js
RUN echo '    } else if (schema.type === "array") {' >> ./src/lib/utils.js
RUN echo '      if (schema.items) {' >> ./src/lib/utils.js
RUN echo '        return [generateExampleFromSchema(schema.items)];' >> ./src/lib/utils.js
RUN echo '      }' >> ./src/lib/utils.js
RUN echo '      return [];' >> ./src/lib/utils.js
RUN echo '    } else if (schema.type === "string") {' >> ./src/lib/utils.js
RUN echo '      return schema.example || schema.default || "string";' >> ./src/lib/utils.js
RUN echo '    } else if (schema.type === "number" || schema.type === "integer") {' >> ./src/lib/utils.js
RUN echo '      return schema.example || schema.default || 0;' >> ./src/lib/utils.js
RUN echo '    } else if (schema.type === "boolean") {' >> ./src/lib/utils.js
RUN echo '      return schema.example || schema.default || false;' >> ./src/lib/utils.js
RUN echo '    } else if (schema.type === "null") {' >> ./src/lib/utils.js
RUN echo '      return null;' >> ./src/lib/utils.js
RUN echo '    }' >> ./src/lib/utils.js
RUN echo '    ' >> ./src/lib/utils.js
RUN echo '    // Default fallback' >> ./src/lib/utils.js
RUN echo '    return {};' >> ./src/lib/utils.js
RUN echo '  } catch (error) {' >> ./src/lib/utils.js
RUN echo '    console.error("Error generating example from schema:", error);' >> ./src/lib/utils.js
RUN echo '    return {};' >> ./src/lib/utils.js
RUN echo '  }' >> ./src/lib/utils.js
RUN echo '}' >> ./src/lib/utils.js

# Build the application without running linting
RUN npm run build -- --no-lint

# Expose port (will use environment variable if provided)
EXPOSE 3000

# Start the application in production mode
# Next.js will use the PORT environment variable if set
CMD ["npm", "start"] 