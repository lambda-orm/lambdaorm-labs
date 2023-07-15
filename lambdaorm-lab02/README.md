# Lab 02

In this laboratory we will see:

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
lambdaorm init -w lab_02
```

position inside the project folder.

```sh
cd lab_02
```

### Create database for test

Create file "docker-compose.yaml"

```yaml
version: '3'
services:
  test:
    container_name: lambdaorm-test
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
docker-compose -p "lambdaorm-lab02" up -d
```

Create user and set character:

```sh
docker exec lambdaorm-test  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "GRANT ALL ON *.* TO 'test'@'%' with grant option; FLUSH PRIVILEGES;"
docker exec lambdaorm-test  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "ALTER DATABASE test CHARACTER SET utf8 COLLATE utf8_general_ci;"
```

### Complete Schema

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
  paths:
    domain: countries/domain      

```

### Update

```sh
lambdaorm update
```

the file model.ts will be created inside src/models/model.ts

```ts
/* eslint-disable no-use-before-define */
// THIS FILE IS NOT EDITABLE, IS MANAGED BY LAMBDA ORM
import { Queryable } from 'lambdaorm'
export abstract class Position {
	latitude?: string
	longitude?: string
}
export interface QryPosition {
	latitude: string
	longitude: string
}
export class Country extends Position {
	constructor () {
		super()
		this.states = []
	}

	name?: string
	iso3?: string
	iso2?: string
	capital?: string
	currency?: string
	region?: string
	subregion?: string
	states: State[]
}
export interface QryCountry extends QryPosition {
	name: string
	iso3: string
	iso2: string
	capital: string
	currency: string
	region: string
	subregion: string
	states: ManyToOne<State> & State[]
}
export class State extends Position {
	id?: number
	name?: string
	countryCode?: string
	country?: Country
}
export interface QryState extends QryPosition {
	id: number
	name: string
	countryCode: string
	country: Country & OneToMany<Country> & Country
}
export let Countries: Queryable<QryCountry>
export let States: Queryable<QryState>

```

### Sync

```sh
lambdaorm sync
```

It will generate the table in database and a status file in the "data" folder, with the following content:

default-model.json

```json
{
    "mappings": [
        {
            "name": "default",
            "entities": [
                {
                    "name": "Countries",
                    "primaryKey": [
                        "iso3"
                    ],
                    "uniqueKey": [
                        "name"
                    ],
                    "properties": [
                        {
                            "name": "name",
                            "nullable": false,
                            "type": "string",
                            "length": 80,
                            "mapping": "name"
                        },
                        {
                            "name": "iso3",
                            "length": 3,
                            "nullable": false,
                            "type": "string",
                            "mapping": "iso3"
                        },
                        {
                            "name": "iso2",
                            "nullable": false,
                            "length": 2,
                            "type": "string",
                            "mapping": "iso2"
                        },
                        {
                            "name": "capital",
                            "type": "string",
                            "length": 80,
                            "mapping": "capital"
                        },
                        {
                            "name": "currency",
                            "type": "string",
                            "length": 80,
                            "mapping": "currency"
                        },
                        {
                            "name": "region",
                            "type": "string",
                            "length": 80,
                            "mapping": "region"
                        },
                        {
                            "name": "subregion",
                            "type": "string",
                            "length": 80,
                            "mapping": "subregion"
                        },
                        {
                            "name": "latitude",
                            "length": 16,
                            "type": "string",
                            "mapping": "latitude"
                        },
                        {
                            "name": "longitude",
                            "length": 16,
                            "type": "string",
                            "mapping": "longitude"
                        }
                    ],
                    "relations": [
                        {
                            "name": "states",
                            "type": "manyToOne",
                            "composite": true,
                            "from": "iso3",
                            "entity": "States",
                            "to": "countryCode"
                        }
                    ],
                    "mapping": "Countries"
                },
                {
                    "name": "States",
                    "primaryKey": [
                        "id"
                    ],
                    "uniqueKey": [
                        "countryCode",
                        "name"
                    ],
                    "properties": [
                        {
                            "name": "id",
                            "type": "integer",
                            "nullable": false,
                            "mapping": "id"
                        },
                        {
                            "name": "name",
                            "nullable": false,
                            "type": "string",
                            "length": 80,
                            "mapping": "name"
                        },
                        {
                            "name": "countryCode",
                            "nullable": false,
                            "length": 3,
                            "type": "string",
                            "mapping": "countryCode"
                        },
                        {
                            "name": "latitude",
                            "length": 16,
                            "type": "string",
                            "mapping": "latitude"
                        },
                        {
                            "name": "longitude",
                            "length": 16,
                            "type": "string",
                            "mapping": "longitude"
                        }
                    ],
                    "relations": [
                        {
                            "name": "country",
                            "from": "countryCode",
                            "entity": "Countries",
                            "to": "iso3",
                            "type": "oneToMany"
                        }
                    ],
                    "mapping": "States"
                }
            ]
        }
    ],
    "mappingData": {},
    "pendingData": []
}
```

### Populate Data

for the import we will download the following file.

```sh
wget https://raw.githubusercontent.com/FlavioLionelRita/lambdaorm-lab02/main/data.json
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

### Drop

remove all tables from the schema and delete the state file, source-state.json

```sh
lambdaorm drop
```

## End

### Remove database for test

Remove MySql database:

```sh
docker-compose -p "lambdaorm-lab02" down
```
