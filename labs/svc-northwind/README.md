# Northwind lab

## Start

```sh
docker-compose -p lambdaorm-svc up -d
mysql -h 0.0.0.0 -P 3306 -u northwind -pnorthwind northwind < northwind-mysql.sql
```

## End

```sh
docker-compose -p lambdaorm-svc down --remove-orphans
docker rmi lambdaorm-svc_lambdaorm-api
```

## TODO

- resolver el problema de conexión a la base desde otro servicio en el mismo docker file
- agregar nginx y escalar el servicio (tag deploy)
- agregar aquí el laboratorio de pentest

## References

- [network host](https://stackoverflow.com/questions/56582446/how-to-use-host-network-for-docker-compose)
- connection refused
  - [one](https://nayak.io/posts/docker-compose-postgres-and-connection-refused/)
  - [two](https://www.appsloveworld.com/docker/100/2/econnrefused-for-postgres-on-nodejs-with-dockers)
