# Northwind lab

## Scripts

Start:

```sh
./start.sh
```

End:

```sh
./end.sh
```

## Lab

Execute query for cli

```sh
# verify
docker exec orm-svc-pentest_orm_1 lambdaorm execute -w ./workspace -e .env -q 'Products.having(p => max(p.price) > 100).map(p => ({ category: p.category.name, largestPrice: max(p.price) })).sort(p => desc(p.largestPrice))'

docker exec orm-svc-pentest_orm_1 lambdaorm execute -w ./workspace -e .env -q 'Orders.filter(p => p.id === id)' -d '{"id": 2 }'

docker exec orm-svc-pentest_orm_1 lambdaorm execute -w ./workspace -e .env -q 'Orders.filter(p => p.id === id).include(p => [p.customer.map(p => p.name), p.details.include(p => p.product.include(p => p.category.map(p => p.name)).map(p => p.name)).map(p => [p.quantity, p.unitPrice])])' -d '{"id": 2 }'
```

## Endpoints

- [Prometheus](http://localhost:9090)
- [Grafana](http://localhost:3000)
  - Dashboards
    - [NodeJS Application Dashboard](http://localhost:3000/d/PTSqcpJWk/nodejs-application-dashboard?orgId=1&refresh=5s)
    - [High Level Application metrics](http://localhost:3000/d/OnjTYJg7k/high-level-application-metrics)
    - [Node Service Level Metrics Dashboard](http://localhost:3000/d/WBxkVyRnz/node-service-level-metrics-dashboard)
    - [NodeJS Request Flow Dashboard](http://localhost:3000/d/2Er5E1R7k/nodejs-request-flow-dashboard)

## DDOS tools

### Slowloris

```sh
cd ~/Desktop
git clone https://github.com/gkbrk/slowloris.git
cd slowloris
python3 slowloris.py 192.168.1.33 -p 9292 -s 1000 -v
```

### Test

start wireshark:

```sh
sudo wireshark
```

Filter: tcp.port == 9292

## TODO

- agregar nginx y escalar el servicio (tag deploy)
- agregar aquí el laboratorio de pentest

## References

- Slowloris
  - [Install and use tutorial](https://www.youtube.com/watch?v=EccCgGuUJaA)
  - [Prueba de concepto](https://www.youtube.com/watch?v=dbOfYzcijFw)
  - [Ataque DDoS con Slowloris](https://www.youtube.com/watch?v=G_RPCkWE5jE)

- Mitigar DDOS
  - [Mitigando denegación de servicio con IPtables](https://juncotic.com/ddos-mitigando-denegacion-iptables/)
  - [Como proteger un servidor de ataques DDoS](https://www.sysadminsdecuba.com/2021/07/como-proteger-un-servidor-de-ataques-ddos/)
  - [Ataques DDoS. Recomendaciones y buenas prácticas](https://www.ccn-cert.cni.es/informes/abstracts/4925-ataques-ddos-recomendaciones-y-buenas-practicas/file.html)
    - [Cómo protegerse de un ataque DDoS](https://telefonicatech.com/blog/ddos)
  
  - [What is a DDoS Attack and How to Mitigate it](https://www.loginradius.com/blog/engineering/how-to-mitigate-ddos-attack/)  
  - [HOW TO AVOID TIME-BASED DDOS ATTACKS IN NODE](https://www.nearform.com/blog/avoid-time-based-ddos-attacks-node-js/)
  - [sqlmap](https://sqlmap.org/)

  - sysctl.conf

  - Node Application
    - [Mejores prácticas de producción: rendimiento y fiabilidad](https://expressjs.com/es/advanced/best-practice-performance.html)
    - [We’re under attack! 23+ Node.js security best practices](https://medium.com/@nodepractices/were-under-attack-23-node-js-security-best-practices-e33c146cb87d)
    - Rate Limiting
      - [Implement Rate Limiting](https://www.linkedin.com/pulse/mitigation-ddos-attack-from-nodejs-server-vartul-goyal/)
      - [DDoS attacks protection in Node](https://medium.com/@animirr/rate-limiting-brute-force-and-ddos-attacks-protection-in-node-js-2492c4a9249)
      - Express Rate Limit
        - [npm](https://www.npmjs.com/package/express-rate-limit)
        - [How to prevent a DDoS attack (or a Brute-force attack)](https://www.youtube.com/watch?v=TtPsUq09OZU)
      - node-rate-limiter-flexible
        - [github](https://github.com/animir/node-rate-limiter-flexible)  

  - Ngrok
    - [tutorial rápido](https://www.youtube.com/watch?v=NqCYquO3byk)
    - [NGROK - Como exponer tu aplicación en localhost (con SSL GRATIS)](https://www.youtube.com/watch?v=frvY3Ywxs-I)  
    - [Configuración de Certificado Digital con NGROK](https://www.youtube.com/watch?v=Bw5sVqXA2aA)
  - Load Balancer
    - [Using multiple nodes](https://socket.io/docs/v4/using-multiple-nodes)
    - [Nginx and SSL in Docker Compose](https://medium.com/geekculture/webapp-nginx-and-ssl-in-docker-compose-6d02bdbe8fa0)
    - NgInx load balancer
      - [Load Balancing using docker compose](https://medium.com/@vinodkrane/microservices-scaling-and-load-balancing-using-docker-compose-78bf8dc04da9)
      - [multiple instances](https://pspdfkit.com/blog/2018/how-to-use-docker-compose-to-run-multiple-instances-of-a-service-in-development/)  
  - Keycloak and Nginx
    - [Running Keycloak behind a Reverse Proxy](https://www.youtube.com/watch?v=MFqdgUcr2-A)
    - [example](https://github.com/jinnerbichler/keycloak-nginx/blob/master/docker-compose.yml)
    - [How to Dockerize your Keycloak set up with nginx reverse proxy](https://ishanul.medium.com/how-to-dockerize-your-keycloak-set-up-with-nginx-reverse-proxy-2f78f6260147)
    - [example](https://stackoverflow.com/questions/74366273/keycloak-in-docker-with-proxy-such-as-nginx-using-non-standard-ports)
  - Mitigating DDoS Attacks with NGINX
    - [Using NGINX to prevent DDoS Attacks](https://inmediatum.com/en/blog/engineering/ddos-attacks-prevention-nginx/)
    - [Mitigating DDoS Attacks](https://www.nginx.com/blog/mitigating-ddos-attacks-with-nginx-and-nginx-plus/)
    - [DDoS attacks prevention with Nginx](https://inmediatum.com/en/blog/engineering/ddos-attacks-prevention-nginx/)
    - [How to prevent DDoS attacks using nginx](https://github.com/icon-project/documentation/blob/master/node/p-rep/how-to-using-nginx-to-prevent-DDoS-attacks.md)
    - [DDoS Protection With Nginx](https://ddos-guard.net/en/blog/ddos-protection-with-nginx)
  - Redes con docker-compose
    - [redes](https://iesgn.github.io/curso_docker_2021/sesion5/redes.html)
    - [networking]( https://docs.docker.com/compose/networking/)

  - Docker Network
    - [NETWORKING EN DOCKER!](https://www.youtube.com/watch?v=BNHNMoSJz4g)
