/* groovylint-disable NestedBlockDepth */
pipeline {
    agent any
    stages {
        stage('Adiciona os arquivos em cache') {
            steps {
                dir(path: './AeroNoSQL-backend') {
                    wrap([$class: 'CacheWrapper', maxCacheSize: 250, caches: [
                        [$class: 'ArbitraryFileCache', excludes: '', includes: '**/*', path: './node_modules/.cache']
                    ]]) {
                            stage('Constroi a imagem da apĺicação no docker') {
                                steps {
                                        script {
                                            def app = docker.build('daanrsantiago/aerodb-backend', '--no-cache -f Dockerfile .')
                                        }
                                }
                            }

                            stage('Constroi a imagem de teste da aplicação no docker') {
                                steps {
                                        script {
                                            def app = docker.build('daanrsantiago/aerodb-backend-test', '--no-cache -f Dockerfile.test .')
                                        }
                                }
                            }

                            stage('Realiza os teste unitários') {
                                steps {
                                    script {
                                        sh 'docker run --rm daanrsantiago/aerodb-backend-test'
                                    }
                                }
                            }

                            stage('Da um Push na imagem para o Docker Hub') {
                                steps {
                                    script {
                                        def app = docker.image('daanrsantiago/aerodb-backend')
                                        docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                                            app.push("${env.BUILD_NUMBER}")
                                            app.push('latest')
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
            }
        }
    }
}
