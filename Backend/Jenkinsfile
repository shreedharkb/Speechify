pipeline {
    agent any

    environment {
        SONAR_SCANNER_HOME = tool 'server-sonarqube'
        IMAGE_NAME = "shreedharkb/speechify"
        IMAGE_TAG = "latest"
    }

    stages {

        stage('Git Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/shreedharkb/Speechify.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'cd Backend && npm install'
                bat 'cd Frontend && npm install'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('server-sonarqube') {
                    withCredentials([string(credentialsId: 'speech', variable: 'SONAR_TOKEN')]) {
                        bat """
                            "%SONAR_SCANNER_HOME%\\bin\\sonar-scanner.bat" ^
                            -Dsonar.projectKey=Speechify ^
                            -Dsonar.projectName=Speechify ^
                            -Dsonar.sources=. ^
                            -Dsonar.host.url=http://localhost:9000 ^
                            -Dsonar.token=%SONAR_TOKEN%
                        """
                    }
                }
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                script {
                    def depCheckPath = tool name: 'DP', type: 'org.jenkinsci.plugins.DependencyCheck.tools.DependencyCheckInstallation'
                    
                    bat """
                        "${depCheckPath}\\bin\\dependency-check.bat" ^
                        --project Speechify ^
                        --scan . ^
                        --format XML ^
                        --out . ^
                        --disableAssembly ^
                        --disableYarnAudit
                    """
                }
            }
        }

        stage('Trivy Filesystem Scan') {
            steps {
                // Maps the Jenkins workspace and creates a local cache to prevent rate-limiting
                bat """
                    docker run --rm -v "%WORKSPACE%:/project" -v "%WORKSPACE%/.trivycache:/root/.cache" aquasec/trivy:latest filesystem /project --scanners vuln
                """
            }
        }

        stage('Docker Build') {
            steps {
                bat """
                    docker build -t %IMAGE_NAME%:%IMAGE_TAG% Backend
                """
            }
        }

        stage('Docker Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker1', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    bat """
                        echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin
                        docker push %IMAGE_NAME%:%IMAGE_TAG%
                    """
                }
            }
        }
    }

    post {
        always {
            dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            bat 'docker logout'
        }
    }
}