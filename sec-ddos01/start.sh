#!/bin/dash
# create database and start service
docker-compose -p sec-ddos up -d &&
# wait start databases
sleep 15 &&
# create tables
docker exec sec-ddos_orm_1 lambdaorm sync -w ./workspace &&
# import data
docker exec sec-ddos_orm_1 lambdaorm import -w ./workspace -d ./workspace/data.json
