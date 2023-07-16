# remove tables
docker exec sec-ddos_orm_1 lambdaorm drop -w ./workspace
# stop database and service
docker-compose -p sec-ddos down --remove-orphans
# remove volumes
docker volume rm sec-ddos_grafana_data
docker volume rm sec-ddos_prometheus_data
docker volume rm sec-ddos_postgres_data