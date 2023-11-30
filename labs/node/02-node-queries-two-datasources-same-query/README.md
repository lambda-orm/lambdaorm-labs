# Lab CLI - Two data sources with the same query

In this laboratory we will see:

- How to insert data from a file to more than one table.
- how to define a stage that works with entities in different databases
- how to use environment variables to set connections to databases
- how to run a bulkInsert on entities in different databases
- how to export and import entity data in different databases

## Schema diagram

This schema has two entities that are in different databases.

![schema](schema4.svg)

In the definition of the stage, the rules are defined to determine which data source will be used.

This is done via the condition property on each dataSource.

In this example, if the entity is Country, it will be directed to data source 1 and if the entity is States, it will be directed to data source 2

```yaml
infrastructure:
  stages:
    - name: stage1
      sources:
        - name: source1
          condition: entity == "Countries"
        - name: source2
          condition: entity == "States"
```

## Lab

### Install lambda ORM CLI

Install the package globally to use the CLI commands to help you create and maintain projects

```sh
npm install lambdaorm-cli -g
```

Test

```sh
lambdaorm --version
```

### Create project

will create the project folder with the basic structure.

```sh
lambdaorm init -w lab
```

position inside the project folder.

```sh
cd lab
```

### Create database for test

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
  postgres:
    container_name: lab-postgres  
    image: postgres:10
    restart: always
    environment:
      - POSTGRES_DB=test
      - POSTGRES_USER=test
      - POSTGRES_PASSWORD=test
    ports:
      - 5432:5432
```

Create MySql database for test:

```sh
docker-compose -p "lambdaorm-lab" up -d
```

Create user and set character:

```sh
docker exec lab-mysql  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "ALTER DATABASE test CHARACTER SET utf8 COLLATE utf8_general_ci;"
docker exec lab-mysql  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "GRANT ALL ON *.* TO 'test'@'%' with grant option; FLUSH PRIVILEGES;"
```

### Add environment file

Add file ".env"

```sh
CNN_MYSQL={"host":"localhost","port":3306,"user":"test","password":"test","database":"test"}
CNN_POSTGRES={"host":"localhost","port":5432,"user":"test","password":"test","database":"test"}
```

### Complete Schema

At project creation the schema was created in the lambdaORM.yaml file with the initial example configuration\
We will replace this configuration with the following where the following changes are made:

- Added country and state entities
- "test" mapping was replaced by "default"
- Replaced "test" source with "source1" and "source2", which use environment variables to configure the connection
- The sources are replaced in the definition of the default stage

```yaml
domain:
  entities:
    - name: Countries
      primaryKey: ["iso3"]
      uniqueKey: ["name"]
      properties:
        - name: name
          required: true
        - name: iso3
          length: 3
          required: true
      relations:
        - name: states
          type: manyToOne
          composite: true
          from: iso3
          entity: States
          to: countryCode
    - name: States
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
    - name: default       
  sources:
    - name: source1
      dialect: MySQL
      mapping: default
      connection: ${CNN_MYSQL}
    - name: source2    
      dialect: PostgreSQL
      mapping: default
      connection: ${CNN_POSTGRES}
  stages:
    - name: default
      sources:
        - name: source1
          condition: entity == "Countries"
        - name: source2
          condition: entity == "States"
  paths:
    domain: countries/domain  
```

### Update

execute the following command to update the project according to changes in the schema

```sh
lambdaorm update
```

the model will be created inside file src/models/model.ts.

### Sync

```sh
lambdaorm sync -e ".env"
```

Structure:

```sh
├── data
│   ├── default-ddl-20231123T020138867Z-sync-source1.sql
│   ├── default-ddl-20231123T020138868Z-sync-source2.sql
│   └── default-model.json
├── docker-compose.yaml
├── lambdaORM.yaml
├── package.json
├── src
│   └── countries
│       └── domain
│           ├── model.ts
│           ├── repositoryCountry.ts
│           └── repositoryState.ts
└── tsconfig.json
```

It will generate:

- the Counties table is created in database test on MySql
- the States table is created in database test on Postgres
- status file "stage1-model.json" in the "data" folder.

### Populate Data

for the import we will download the following file.

```sh
wget https://raw.githubusercontent.com/FlavioLionelRita/lambdaorm-labs/main/source/countries/data.json
```

then we execute

```sh
lambdaorm execute -e ".env" -q "Countries.bulkInsert().include(p => p.states)" -d ./data.json
```

test:

```sh
lambdaorm execute -e ".env" -q "Countries.page(1,10).include(p => p.states)"
```

### Export data

```sh
lambdaorm export -e ".env"
```

### Delete data

```sh
lambdaorm execute -e ".env" -q "States.deleteAll()" 
lambdaorm execute -e ".env" -q "Countries.deleteAll()" 
```

### Import data

```sh
lambdaorm import -e ".env" -d ./default-export.json
```

test:

```sh
lambdaorm execute -e ".env" -q "Countries.page(1,10).include(p => p.states)"
```

### Drop

remove all tables from the schema and delete the state file, stage1-model.json

```sh
lambdaorm drop -e ".env"
```

## End

### Remove database for test

Remove databases:

```sh
docker-compose -p "lambdaorm-lab" down
```
