# CLI Lab Extend Model

**In this laboratory we will see:**

- how to create a project that uses lambda ORM
- How to define a schema
- how to extend entities using abstract entities
- How to insert data from a file.
- how to run queries from cli to perform different types of queries

## Schema diagram

In this scheme we can see how to extend entities.

![schema](schema2.svg)

To understand an entity we use the extends attribute in the definition of the entity

```yaml
      - name: Countries
        extends: Positions
```

## Install lambda ORM CLI

Install the package globally to use the CLI commands to help you create and maintain projects

```sh
npm install lambdaorm-cli -g
```

Test

```sh
lambdaorm --version
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

## Configure

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

### Configure Schema

In the schema we will configure:

- Domain
  - Entities
- Infrastructure
  - Default Mapping
  - Default Source
  - Default Stage

In the creation of the project the schema was created but without any entity. \
Add the Country and State entity as seen in the following example

```yaml
domain:
  entities:
    - name: Positions
      abstract: true
      properties:
        - name: latitude
          length: 16
        - name: longitude
          length: 16
    - name: Countries
      extends: Positions
      primaryKey: ["iso3"]
      uniqueKey: ["name"]
      properties:
        - name: name
          required: true
        - name: iso3
          length: 3
          required: true
        - name: iso2
          required: true
          length: 2
        - name: capital
        - name: currency
        - name: region
        - name: subregion
      relations:
        - name: states
          type: manyToOne
          composite: true
          from: iso3
          entity: States
          to: countryCode
    - name: States
      extends: Positions
      primaryKey: ["id"]
      uniqueKey: ["countryCode", "name"]
      properties:
        - name: id
          type: integer
          required: true
        - name: name
          required: true
        - name: countryCode
          required: true
          length: 3
      relations:
        - name: country
          from: countryCode
          entity: Countries
          to: iso3
infrastructure:
  mappings:
    - name: test
  sources:
    - name: test
      dialect: MySQL
      mapping: test
      connection:
        host: localhost
        port: 3306
        user: test
        password: test
        database: test
        multipleStatements: true
        waitForConnections: true
        connectionLimit: 10
        queueLimit: 0
  stages:
    - name: default
      sources:
        - name: test
```

## Start

Create MySql database for test:

```sh
docker-compose -p lambdaorm-lab up -d
```

Create user and set character:

```sh
docker exec lab-mysql  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "GRANT ALL ON *.* TO 'test'@'%' with grant option; FLUSH PRIVILEGES;"
docker exec lab-mysql  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "ALTER DATABASE test CHARACTER SET utf8 COLLATE utf8_general_ci;"
```

### Sync

When executing the sync command, ddl code will be executed according to the definition in the lambdaorm schema file.

- Tables, indexes and keys will be created
- The executed code is added to a file in the data folder.
- The [source-name]-model.json file will be created or updated which maintains the source state since the last synchronization.

```sh
lambdaorm sync
```

Files generated:

```sh
├── data
│   ├── default-ddl-20231122T154351640Z-sync-test.sql
│   └── default-model.json
```

Verify that the database was created:

```sh
docker exec lab-mysql  mysql --host 127.0.0.1 --port 3306 -utest -ptest -e "use test;show tables;"
```

### Populate Data

for the import we will download the following file.

```sh
wget https://raw.githubusercontent.com/lambda-orm/lambdaorm-labs/main/source/countries/data.json
```

then we will execute the following command

```sh
lambdaorm execute -q "Countries.bulkInsert().include(p => p.states)" -d ./data.json
```

### Queries

List all Countries:

```sh
lambdaorm execute -q "Countries"
```

List all States:

```sh
lambdaorm execute -q "States"
```

List 10 countries including states:

```sh
lambdaorm execute -q "Countries.page(1,10).include(p => p.states)"
```

List 10 countries including some state fields:

```sh
lambdaorm execute -q "Countries.page(1,10).include(p => p.states.map(p=> [p.name,p.latitude,p.longitude]))"
```

List some fields from 10 countries including some fields from states:

```sh
lambdaorm execute -q "Countries.map(p=> [p.name,p.capital,p.currency,p.region]).page(1,10).include(p => p.states.map(p=> [p.name,p.latitude,p.longitude] ))"
```

List the number of countries per region:

```sh
lambdaorm execute -q "Countries.map(p=> {region:p.region,count:count(p.iso3)})"
```

List the number of countries by region and sub region:

```sh
lambdaorm execute -q "Countries.map(p=> {region:p.region,subregion:p.subregion,count:count(p.iso3)})"
```

## End

To finish the lab we execute the following commands to drop the tables and remove the containers

```sh
lambdaorm drop
docker-compose -p lambdaorm-lab down
```
