# Contenedor 1: API de Freelancer-App (Express + Mongoose)
# Imagen base oficial con versión fija (no "latest")
FROM node:20.18.0-alpine3.20

ENV NODE_ENV=production
WORKDIR /app

# 1) Dependencias primero, para aprovechar la caché de capas
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 2) Código fuente
COPY src ./src

# Se ejecuta con el usuario sin privilegios que trae la imagen oficial
USER node

EXPOSE 5000

# Docker marca el contenedor como "healthy" solo si la API responde y Mongo hace ping
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["npm", "start"]
