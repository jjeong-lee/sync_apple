FROM node:20.11.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY tailwind.config.js postcss.config.js ./
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
RUN npm ci
RUN npm run build

FROM nginx:1.27.2-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
