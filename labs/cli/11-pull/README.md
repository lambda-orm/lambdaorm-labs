# CLI Lab - Pull

**In this laboratory we will see:**

- How to use λORM CLI commands
- how to create a project that uses lambda ORM
- How to synchronize the schema with respect to the data source with the pull command

## Install lambda ORM CLI

Install the package globally to use the CLI commands to help you create and maintain projects

```sh
npm install lambdaorm-cli -g
```

## Create project

will create the project folder with the basic structure.

```sh
lambdaorm init -w lab
```

position inside the project folder.

```sh
cd lab
```

## Crete environment

### Configure docker-compose

Configure docker-compose to create the following containers:

- mysql: MySQL database

Create file "docker-compose.yaml"

```yaml
version: '3'
services:
  mysql:
    container_name: lab-mysql
    image: mysql:5.7
    restart: always
    environment:
      - MYSQL_DATABASE=test
      - MYSQL_USER=test
      - MYSQL_PASSWORD=test
      - MYSQL_ROOT_PASSWORD=root
    ports:
      - 3306:3306
```

Create MySql database for test:

```sh
docker-compose -p lambdaorm-lab up -d
```

create user and define character set:

```sh
docker exec lab-mysql mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "ALTER DATABASE test CHARACTER SET utf8 COLLATE utf8_general_ci;"
docker exec lab-mysql mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "GRANT ALL ON *.* TO 'test'@'%' with grant option; FLUSH PRIVILEGES;"
```

### Create tables and Import data

```sh
# download the northwind-mysql.sql file
wget https://raw.githubusercontent.com/lambda-orm/lambdaorm-labs/main/source/northwind/northwind-mysql.sql
# copy the file to the container
docker cp northwind-mysql.sql lab-mysql:/northwind-mysql.sql
# connect to the container
docker exec -it lab-mysql bash
# ejecute the script in test database
mysql -uroot -proot -D test < ./northwind-mysql.sql
# exit from the container
exit
```

Verify that teh tables were created:

```sh
docker exec lab-mysql mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "use test;show tables;"
```

### Pull

The pull command is used to update the schema with respect to the sources (Databases). \
Once executed, the schema will be synchronized with the database. \
It also adds a file with the pulling scripts. \

Running the pull command:

```sh
lambdaorm pull
```

Once the command is executed, the schema file (lambdaORM.yaml in this case) will be updated with respect to the data source.

Files created:

```sh
├── orm_state
│   ├── default-ddl-20240501T212640369Z-pull-default.sql
│   └── default-model.json
```

## End

To finish the lab we execute the following command to eliminate the containers.

```sh
docker-compose -p lambdaorm-lab down
```
