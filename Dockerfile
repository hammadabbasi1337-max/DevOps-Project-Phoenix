# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copy only package files first so npm install layer is cached
# as long as dependencies don't change between builds.
COPY package*.json ./
RUN npm install

# Now copy the rest of the source and build the frontend
COPY . .
RUN npm run build

# ---------- Stage 2: Production ----------
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies (smaller image, still cached layer)
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund \
    && npm cache clean --force

# Bring in backend code and the built frontend from the build stage
COPY index.js ./
COPY --from=build /app/dist ./dist

EXPOSE 5000

CMD ["node", "index.js"]