# Issue 179

## Initialize

```bash
# Install cli for library lambdaorm
npm install lambdaorm-cli -g
# Install dependencies
npm install
# Deploy MySQL database
docker-compose -p issue-179 up -d
docker exec lab-mysql  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "ALTER DATABASE test CHARACTER SET utf8 COLLATE utf8_general_ci;"
docker exec lab-mysql  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "GRANT ALL ON *.* TO 'test'@'%' with grant option; FLUSH PRIVILEGES;"
# create DDL
lambdaorm sync -e ".env"
# import data for test
lambdaorm import -e ".env" -d ./data.json
```

Test:

```bash
lambdaorm execute -e .env -q 'Orders.details.filter(o => o.orderId === ordNo).map(o => { ordNo:o.orderId, total: avg(o.unitPrice * o.quantity )})' -d '{"ordNo":5}'
```

End:

```bash
# remove DDL
lambdaorm drop -e .env
# remove MySQL database
docker-compose -p issue-179 down
docker volume rm issue-179_mysql-data
docker volume rm issue-179_mysql-log
```
