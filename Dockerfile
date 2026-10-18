FROM node:22-alpine AS build

WORKDIR /app

COPY package.json ./
COPY apps/backend/package.json ./apps/backend/

RUN npm install --workspace=apps/backend

COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/src ./apps/backend/src

RUN npm run build --workspace=apps/backend

FROM node:22-alpine AS runtime

WORKDIR /app/apps/backend

ENV NODE_ENV=production

COPY package.json /app/
COPY apps/backend/package.json ./

RUN npm install --omit=dev --workspace=apps/backend

COPY --from=build /app/apps/backend/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
