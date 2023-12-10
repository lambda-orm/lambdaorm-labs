# Devicenet service

## Init

init:

```sh
lambdaorm init -w devicenet
cd devicenet
```

Update:

```sh
lambdaorm update
```

Sync:

```sh
lambdaorm sync -e ./.env
```

Up:

``` sh
npm run dist
docker-compose -f ./docker-compose-win.yaml up -d 
```

Test:

- [swagger](http://localhost:9291/docs)
- [metrics](http://localhost:9291/metrics)
- [Prometheus](http://localhost:9090)
- [Grafana](http://localhost:3000)
- Dashboards
  - [NodeJS Application Dashboard](http://localhost:3000/d/PTSqcpJWk/nodejs-application-dashboard)
  - [High Level Application metrics](http://localhost:3000/d/OnjTYJg7k/high-level-application-metrics)
  - [Node Service Level Metrics Dashboard](http://localhost:3000/d/WBxkVyRnz/node-service-level-metrics-dashboard)
  - [NodeJS Request Flow Dashboard](http://localhost:3000/d/2Er5E1R7k/nodejs-request-flow-dashboard)

## End

Down:

``` sh
docker-compose -f ./docker-compose-win.yaml down --remove-orphans
docker rmi devicenet_lambdaorm-api
```

Clear database:

```sh
lambdaorm drop -e ./.env
```

## References

- [Prometheus](https://prometheus.io)
- [Grafana](https://grafana.com/oss/grafana)
- [prom-client](https://www.npmjs.com/package/prom-client)
- [monitoring prometheus-grafana](https://stackabuse.com/nodejs-application-monitoring-with-prometheus-and-grafana)
- [Prometheus client for node.js](https://github.com/siimon/prom-client)
- [Docker Engine](https://docs.docker.com/engine)
- [Docker Compose](https://docs.docker.com/compose)
- [Example](https://github.com/StackAbuse/node-prometheus-grafana)
- [Other example](https://github.com/RisingStack/example-prometheus-nodejs)
- JMeter
  - <https://www.vinsguru.com/jmeter-scaling-out-load-servers-using-docker-compose-in-distributed-load-testing/>
  - <https://hub.docker.com/r/justb4/jmeter>
  -<https://github.com/apolloclark/jmeter/blob/master/docker-compose.yml>

- KeyCloak
  - [docker-compose](https://github.com/keycloak/keycloak-containers/blob/main/docker-compose-examples/keycloak-postgres.yml)

Kill Port:

- [data](https://stackoverflow.com/questions/39632667/how-do-i-kill-the-process-currently-using-a-port-on-localhost-in-windows)

```sh
netstat -ano | findstr :9291
taskkill /PID 4500 /F
```
