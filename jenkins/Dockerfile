# Jenkins para Freelancer-App — Entrega 2 (Integración Continua)
# Base recomendada por el curso: jenkins/jenkins:lts
# Se agrega SOLO el cliente de Docker y el plugin de Compose. El motor (daemon)
# sigue siendo el de Docker Desktop: Jenkins le habla por el socket montado.
FROM jenkins/jenkins:lts

USER root

# Cliente de Docker + buildx (lo exige "compose build") + docker compose v2,
# desde el repositorio oficial de Docker
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
 && install -m 0755 -d /etc/apt/keyrings \
 && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
 && chmod a+r /etc/apt/keyrings/docker.asc \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
      > /etc/apt/sources.list.d/docker.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends docker-ce-cli docker-buildx-plugin docker-compose-plugin \
 && rm -rf /var/lib/apt/lists/*

# Jenkins vuelve a correr con su usuario sin privilegios
USER jenkins

# Plugins preinstalados (lista versionada en el repo)
COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
