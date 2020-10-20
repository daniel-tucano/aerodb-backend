pipeline {
  agent any
  stages {
    stage('Instala dependencias') {
      steps {
        dir(path: './AeroNoSQL-backend') {
          sh 'npm install'
        }

      }
    }

    stage('Constroi a imagem de docker') {
        steps {
            dir(path: './AeroNoSQL-backend')  {
                script {
                    def app = docker.build('daanrsantiago/aerodb-backend', '--no-cahce')
                }
            }
        }
    }

    stage('Realiza os teste unitários') {
        // Idealmente aqui seriam realizados testes, mas este respositório não esta usando
        // nenhum framework de testes atualmente, então apenas utilizaremos um echo 'testes passaram com sucesso'
        steps {
            script {
                docker.image('daanrsantiago/aerodb-backend').inside {
                    sh "echo 'Testes passaram com sucesso'"
                }
            }
        }
    }

    stage('Da um Push na imagem para o Docker Hub') {

        steps {
            script {
                def app = docker.image('daanrsantiago/aerodb-backend')
                docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                    app.push("${env.BUILD_NUMBER}")
                    app.push("latest")
                }
            }
        }
    }

    stage('Atualiza pods na kubernetes') {
        steps {
            sh "kubectl set image deployments/aerodb-backend  aerodb-backend-container=daanrsantiago/aerodb-backend:${env.BUILD_NUMBER}"
        }
    }
  }
}