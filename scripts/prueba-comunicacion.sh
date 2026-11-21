#!/usr/bin/env bash
# Prueba de comunicación backend <-> mongo (ida y vuelta)
# 1) Verifica que "mongo" se resuelve por DNS dentro de la red de Docker
# 2) Health check: el backend hace ping a Mongo por el host "mongo"
# 3) ESCRIBE: registra un usuario (POST) -> el backend lo guarda en Mongo
# 4) LEE: consulta ese usuario (GET con el token) -> el backend lo lee de Mongo
# 5) Confirma directamente en el contenedor de Mongo que el documento existe
set -euo pipefail

# Carga variables del .env (MONGO_USER, MONGO_PASSWORD, MONGO_DB, BACKEND_PORT)
set -a; [ -f .env ] && . ./.env; set +a

# API_URL permite correr la prueba desde otro contenedor (Jenkins usa
# http://host.docker.internal:5000). Sin API_URL se usa localhost, como en local y en GitHub Actions.
API="${API_URL:-http://localhost:${BACKEND_PORT:-5000}}"
EMAIL="prueba_$(date +%s)@freelancer.test"

echo "== 1. Resolución DNS del nombre de servicio 'mongo' desde el backend =="
docker compose exec -T backend node -e \
  "require('dns').lookup('mongo',(e,a)=>{if(e)throw e;console.log('mongo ->',a)})"

echo; echo "== 2. Health check =="
curl -fsS "$API/api/health"; echo

echo; echo "== 3. ESCRITURA: POST /api/auth/register ($EMAIL) =="
REG=$(curl -fsS -X POST "$API/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Usuario Prueba\",\"email\":\"$EMAIL\",\"password\":\"secreto123\"}")
# Se extrae el token con sed (no depende de Node ni jq en la máquina que corre la prueba)
TOKEN=$(printf '%s' "$REG" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[ -n "$TOKEN" ] || { echo "FALLO: el registro no devolvió token: $REG"; exit 1; }
echo "Token recibido: ${TOKEN:0:25}..."

echo; echo "== 4. LECTURA: GET /api/auth/user =="
RESP=$(curl -fsS "$API/api/auth/user" -H "Authorization: Bearer $TOKEN")
echo "$RESP"
echo "$RESP" | grep -q "$EMAIL" || { echo "FALLO: el usuario leído no coincide"; exit 1; }

echo; echo "== 5. Verificación directa en el contenedor mongo =="
docker compose exec -T mongo mongosh --quiet \
  -u "$MONGO_USER" -p "$MONGO_PASSWORD" --authenticationDatabase admin "$MONGO_DB" \
  --eval "printjson(db.users.findOne({email:'$EMAIL'},{name:1,email:1,createdAt:1}))"

echo; echo "OK: el backend guardó y leyó un dato en Mongo usando el nombre de servicio 'mongo'."
