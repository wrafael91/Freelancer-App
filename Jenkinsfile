// Jenkinsfile — Freelancer-App · Entrega 2 (Integración Continua)
// Flujo: commit -> GitHub -> Jenkins (Poll SCM) -> Checkout -> Build -> Test
//
// Credenciales que deben existir en Jenkins (Manage Jenkins > Credentials):
//   freelancer-mongo       Username with password  -> MONGO_USER / MONGO_PASSWORD
//   freelancer-jwt-secret  Secret text             -> JWT_SECRET
// Ningún secreto vive en este archivo ni en el repositorio.

pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()          // el compose usa nombres fijos: un build a la vez
    timeout(time: 20, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  triggers {
    // Jenkins corre en localhost y GitHub no puede llegar a un webhook,
    // así que Jenkins consulta el repositorio cada ~2 minutos.
    pollSCM('H/2 * * * *')
  }

  environment {
    // Valores NO secretos
    MONGO_DB      = 'freelancerdb'
    BACKEND_PORT  = '5000'
    FRONTEND_URL  = 'http://localhost:3000'
    // Desde el contenedor de Jenkins, "localhost" es Jenkins mismo;
    // el puerto publicado del backend se alcanza por host.docker.internal
    API_URL       = 'http://host.docker.internal:5000'
    IMAGE_BACKEND = 'freelancer-app-backend'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git log -1 --pretty="Commit %h | %an | %s"'
      }
    }

    stage('Build') {
      steps {
        // El .env se arma desde las credenciales guardadas en Jenkins.
        // Jenkins enmascara los valores (****) en la consola.
        withCredentials([
          usernamePassword(credentialsId: 'freelancer-mongo',
                           usernameVariable: 'MONGO_USER',
                           passwordVariable: 'MONGO_PASSWORD'),
          string(credentialsId: 'freelancer-jwt-secret', variable: 'JWT_SECRET')
        ]) {
          sh '''
            umask 077
            {
              echo "MONGO_USER=$MONGO_USER"
              echo "MONGO_PASSWORD=$MONGO_PASSWORD"
              echo "MONGO_DB=$MONGO_DB"
              echo "JWT_SECRET=$JWT_SECRET"
              echo "BACKEND_PORT=$BACKEND_PORT"
              echo "FRONTEND_URL=$FRONTEND_URL"
            } > .env
          '''
        }
        sh 'docker version --format "Docker cliente {{.Client.Version}} / motor {{.Server.Version}}"'
        sh 'docker compose config --quiet'          // valida el compose antes de construir
        sh 'docker compose pull mongo'              // servicio 2: imagen oficial mongo:7.0.14
        sh 'docker compose build backend'           // servicio 1: Dockerfile propio
        sh 'docker tag ${IMAGE_BACKEND}:1.0.0 ${IMAGE_BACKEND}:build-${BUILD_NUMBER}'
        sh 'docker image ls --filter reference=${IMAGE_BACKEND} --filter reference=mongo'
      }
    }

    stage('Test') {
      steps {
        sh 'docker compose down -v --remove-orphans || true'     // parte de cero
        // --wait falla si mongo o backend no llegan a "healthy"
        sh 'docker compose up -d --wait --wait-timeout 120'
        sh 'docker compose ps'
        // DNS de "mongo" desde backend, health, escritura, lectura y verificación en mongo.
        // Si cualquier paso falla, el script sale con error y el build queda en FAILURE.
        sh 'bash scripts/prueba-comunicacion.sh'
      }
    }
  }

  post {
    success {
      echo "Build #${env.BUILD_NUMBER} OK: imágenes construidas y comunicación backend <-> mongo verificada."
    }
    fixed {
      echo "Build #${env.BUILD_NUMBER} corrige el fallo del build anterior."
    }
    failure {
      echo "Build #${env.BUILD_NUMBER} FALLÓ. Logs de los contenedores:"
      sh 'docker compose ps -a || true'
      sh 'docker compose logs --no-color --tail=80 || true'
    }
    cleanup {
      // Se ejecuta siempre, al final: apaga el stack y borra el .env con secretos
      sh 'docker compose down -v --remove-orphans || true'
      sh 'rm -f .env'
    }
  }
}
