# CLI Lab - Simple

**In this laboratory we will see:**

- How to use the λORM CLI commands
- how to create a project that uses lambda ORM
- How to define a schema
- how to run a bulkInsert from a file
- how to export data from a schema
- how to import data into a schema from a previously generated export file

## Schema diagram

The schema defines how the entities of the model are mapped with the database tables.

![schema](schema.svg)

## Lab

### Install lambda ORM CLI

Install the package globally to use the CLI commands to help you create and maintain projects

```sh
npm install lambdaorm-cli -g
```

Test

```sh
lambdaorm version
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
```

Create MySql database for test:

```sh
docker-compose -p "lambdaorm-lab" up -d
```

create user and define character set:

```sh
docker exec lab-mysql mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "ALTER DATABASE test CHARACTER SET utf8 COLLATE utf8_general_ci;"
docker exec lab-mysql mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "GRANT ALL ON *.* TO 'test'@'%' with grant option; FLUSH PRIVILEGES;"
```

### Complete Schema

Since in the creation of the project the schema was created but without any entity. \
Add the Country and State entity as seen in the following example to the "lambdaorm.yaml" file

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
          required: true
          length: 3
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
    - name: test
      entities: []
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
  stages:
    - name: default
      sources:
        - name: test
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
wget https://raw.githubusercontent.com/FlavioLionelRita/lambdaorm-labs/main/source/countries/data.json
```

then we will execute the following command

```sh
lambdaorm execute -q "Countries.bulkInsert().include(p => p.states)" -d ./data.json
```

### Export Data

We proceed to export the data from the database with the following command

```sh
lambdaorm export 
```

will generate a file called "default-export.json"

### Import Data

Before importing we are going to delete all the records:

```sh
lambdaorm execute -q "States.deleteAll()"
lambdaorm execute -q "Countries.deleteAll()"
```

We verify that there are no records left:

```sh
lambdaorm execute -q "Countries.page(1,10).include(p=>p.states)"
```

we import the file that we generate when exporting

```sh
lambdaorm import -d ./default-export.json
```

We verify that the data was imported.

```sh
lambdaorm execute -q "Countries.page(1,10).include(p => p.states)"
```

### Drop

remove all tables from the schema and delete the state file, myDb-state.json

```sh
lambdaorm drop
```

## End

### Remove database for test

Remove MySql database:

```sh
docker-compose -p "lambdaorm-lab" down
```
