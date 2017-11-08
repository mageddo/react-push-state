#### Running

```bash
bash -c 'cd ../ && docker-compose up -d --force-recreate rps-compiler &&\
docker exec -it rps-compiler sh -c "npm install && npm run build"
docker-compose stop rps-compiler' && docker-compose up --force-recreate react-state-sample
```
Access http://localhost:3000
