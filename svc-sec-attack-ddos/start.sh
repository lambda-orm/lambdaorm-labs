#!/bin/dash
# buidl code
npm run dist &&
# create database and start service
docker-compose -p sec-keyclock-kong up -d &&
# wait start databases
sleep 15 &&
# create tables
docker exec sec-keyclock-kong_orm_1 lambdaorm sync -w ./workspace &&
# import data
docker exec sec-keyclock-kong_orm_1 lambdaorm import -w ./workspace -d ./workspace/data.json
