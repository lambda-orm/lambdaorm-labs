# CLI Lab - Introspect

**In this laboratory we will see:**

- How to use λORM CLI commands
- how to create a project that uses lambda ORM
- How to obtain schema from data introspection with the introspect command

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

### Download data

download json file the countries for the lab:

```sh
wget https://raw.githubusercontent.com/lambda-orm/lambdaorm-labs/main/source/countries/countries.json
```

### Introspect

The introspect command allows you to obtain the schema from data introspection.

Running the match command:

```sh
lambdaorm introspect -d countries.json -n counties -o yaml > schema.yaml
```

This command obtains the schema from data introspection, in this case from the countries.json file. \
In the example the output will be in yaml format and is redirected to a schema.yaml file.\

In this example we are creating a new file with the schema updated from introspection.
But we can also update the original schema "lambdaORM.yaml" if we wish.

```sh

## End

To finish the lab we execute the following command to eliminate the containers.

```sh
docker-compose -p lambdaorm-lab down
```
