#### Building the lib

```bash
docker-compose up rps-compiler --force-recreate &&\
docker exec -it rps-compiler sh -c 'npm install && npm run build'
```

It will generate the transpiled javascript at build folder
