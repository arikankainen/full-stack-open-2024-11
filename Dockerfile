# syntax = docker/dockerfile:1

FROM node:16 as base
LABEL fly_launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV="production"

FROM base as backend
COPY backend/package-lock.json backend/package.json ./
RUN npm install
COPY backend .

FROM base as frontend
COPY frontend/package-lock.json frontend/package.json ./
RUN npm install
COPY frontend .
RUN npm run build

FROM base
COPY --from=backend /app /app
COPY --from=frontend /app/build /app/build

EXPOSE 3000
CMD [ "npm", "run", "start" ]
