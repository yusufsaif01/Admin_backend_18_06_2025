docker rm -f yftchain-admin
docker build -t yftchain-admin .
docker run -d --name yftchain-admin --env-file ../.env-docker-admin -v /var/www/yftchain-admin/logs/:/usr/src/app/logs/ -p 3002:3000 --net=host yftchain-admin 
