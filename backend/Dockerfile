FROM node:18-alpine

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar os arquivos de lock do pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate
RUN pnpm run build

EXPOSE 3001

CMD ["pnpm", "run", "start:prod"]
