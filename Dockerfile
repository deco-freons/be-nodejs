FROM node:16.16.0-alpine as builder
WORKDIR /app
COPY package.json .
RUN npm install bcrypt@5.0.0
RUN npm install algoliasearch
RUN npm install
COPY . .
ENV NODE_OPTIONS=--max_old_space_size=2048
RUN npm run build

FROM node:16.16.0-alpine
WORKDIR /app
ENV NODE_ENV=PROD

COPY package.json ./
RUN npm install bcrypt@5.0.0
RUN npm install algoliasearch
RUN npm install --omit=dev

COPY --from=builder /app/build ./build

CMD ["node", "./build/index.js"]