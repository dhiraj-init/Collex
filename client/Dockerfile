# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine

# Copy custom nginx config if you have one, or just use default and copy dist
# COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5173
# Optional: if using default Nginx, it runs on port 80. To map it to 5173 inside container:
# Nginx default config would need to be changed. For simplicity, we just expose 80 and let compose map it.
# Wait, if we want Nginx on 5173 inside:
RUN sed -i 's/listen  *80;/listen 5173;/g' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
