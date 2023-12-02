# Lab CLI - Simple

In this laboratory we will see:

- How to use the λORM CLI commands
- how to create a project that uses lambda ORM
- How to define a schema
- how to run a bulkInsert from a file
- how to export data from a schema
- how to import data into a schema from a previously generated export file

## Schema diagram

The schema defines how the entities of the model are mapped with the database tables.

![schema](schema.svg)

## Pre-requisites

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
  postgres:
    container_name: lab-postgres
    image: postgres:10
    restart: always
    environment:
      - POSTGRES_DB=test
      - POSTGRES_USER=test
      - POSTGRES_PASSWORD=test
    ports:
      - '5436:5432' 
```

Create MySql database for test:

```sh
docker-compose -p "lambdaorm-lab" up -d
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
  sources:
    - name: default
      dialect: PostgreSQL
      mapping: default
      connection:
        host: localhost
        port: 5436
        user: test
        password: test
        database: test
  stages:
    - name: default
      sources:
        - name: default
  paths:
    src: src
    domain: countries/domain
```

### Build

Running the build command will create or update the following:

- Folder that will contain the source code and is taken from the "infrastructure.paths.scr" configuration in the lambdaorm.yaml file
- Folder that will contain the domain files, the path is relative to the src folder and is taken from the "infrastructure.paths.domain" configuration in the lambdaorm.yaml file
- Model file: file with the definition of the entities
- Repository files: one file for each entity with data access methods
- Install the necessary dependencies according to the databases used

```sh
lambdaorm build --all
```

Result:

```sh
├── data
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
│   ├── default-ddl-20231126T110624181Z-sync-default.sql
│   └── default-model.json
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

## TypeScript lab

```sh

```

## End

Empty and Remove database:

```sh
lambdaorm drop
docker-compose -p "lambdaorm-lab" down
```
