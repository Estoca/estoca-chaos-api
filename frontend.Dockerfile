FROM node:18-alpine

WORKDIR /app

COPY frontend/package.json ./
COPY frontend/package-lock.json ./

RUN npm ci

COPY frontend/ .

RUN npm run build

CMD ["npm", "run", "dev"] 