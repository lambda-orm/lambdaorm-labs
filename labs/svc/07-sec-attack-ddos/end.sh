# remove tables
docker exec orm-svc-pentest_orm_1 lambdaorm drop -w ./workspace
# stop database and service
docker-compose -p orm-svc-pentest down --remove-orphans
# remove image
docker rmi orm-svc-pentest_orm
# remove volumes
docker volume rm orm-svc-pentest_grafana_data
docker volume rm orm-svc-pentest_prometheus_data
docker volume rm orm-svc-pentest_postgres_data