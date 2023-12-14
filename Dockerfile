FROM node:alpine AS builder

WORKDIR /chat-analytics

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY app app
COPY assets assets
COPY pipeline pipeline
COPY report report
COPY tsconfig.json .
COPY tsconfig.web.json .
COPY webpack.config.js .

ENV SELF_HOSTED=1
RUN npm run build:web

FROM nginx:alpine

COPY --from=builder /chat-analytics/dist_web /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
