# remove tables
docker exec sec-keyclock-kong_orm_1 lambdaorm drop -w ./workspace
# stop database and service
docker-compose -p sec-keyclock-kong down --remove-orphans
# remove volumes
docker volume rm sec-keyclock-kong_grafana_data
docker volume rm sec-keyclock-kong_prometheus_data
docker volume rm sec-keyclock-kong_postgres_data