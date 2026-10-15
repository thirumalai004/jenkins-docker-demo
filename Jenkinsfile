pipeline {
    agent any

    environment {
        IMAGE = "thirudocker004/demo-app"
        APP_SERVER = "15.135.75.10"
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Build') {
            steps {
                sh 'docker build -t $IMAGE:$BUILD_NUMBER -t $IMAGE:latest .'
            }
        }

        stage('Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    sh '''
                        echo $DH_PASS | docker login -u $DH_USER --password-stdin
                        docker push $IMAGE:$BUILD_NUMBER
                        docker push $IMAGE:latest
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ubuntu@$APP_SERVER "
                            docker pull $IMAGE:$BUILD_NUMBER &&
                            (docker stop demo-app || true) &&
                            (docker rm demo-app || true) &&
                            docker run -d -p 3000:3000 --name demo-app $IMAGE:$BUILD_NUMBER
                        "
                    '''
                }
            }
        }
    }
}