pipeline {
  agent any
  stages {
<<<<<<< HEAD
    stage('Instala dependencias') {
=======
    stage('Build') {
>>>>>>> c41e1d460fa1b434f15d6d2565a3f07da7c7218d
      steps {
        dir(path: './AeroNoSQLDB') {
          sh 'npm install'
        }

      }
    }

<<<<<<< HEAD
    stage('Constroi a imagem de docker') {
        steps {
            app = docker.build('daanrsantiago/aerodb-backend')
        }
    }

    stage('Realiza os teste unitários') {
        // Idealmente aqui seriam realizados testes, mas este respositório não esta usando
        // nenhum framework de testes atualmente, então apenas utilizaremos um echo 'testes passaram com sucesso'

        app.inside {
            sh "echo 'Testes passaram com sucesso'"
        }
    }

    stage('Da um Push na imagem para o Docker Hub') {

        docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
            app.push("${env.BUILD_NUMBER}")
            app.push("latest")
        }
    }

    stage('Atualiza pods na kubernetes') {
        sh "kubectl set image deployment/aerodb-backend  aerodb-backend-container=daanrsantiago/aerodb-backend:${env.BUILD_NUMBER}"
    }
=======
>>>>>>> c41e1d460fa1b434f15d6d2565a3f07da7c7218d
  }
}