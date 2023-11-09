# Lab 01

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
lambdaorm init -w lab_01
```

position inside the project folder.

```sh
cd lab_01
```

### Create database for test

Create file "docker-compose.yaml"

```yaml
version: '3'
services:
  test:
    container_name: lambdaorm-lab01
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
docker-compose -p "lambdaorm-lab01" up -d
```

create user and define character set:

```sh
docker exec lambdaorm-lab01  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "ALTER DATABASE test CHARACTER SET utf8 COLLATE utf8_general_ci;"
docker exec lambdaorm-lab01  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "GRANT ALL ON *.* TO 'test'@'%' with grant option; FLUSH PRIVILEGES;"
```

### Complete Schema

In the creation of the project the schema was created but without any entity. \
Add the Country and State entity as seen in the following example

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

execute the following command to update the project according to changes in the schema

```sh
lambdaorm update
```

the file model will be created inside src/models/model.ts  with the following content

```ts
/* eslint-disable no-use-before-define */
// THIS FILE IS NOT EDITABLE, IS MANAGED BY LAMBDA ORM
import { Queryable } from 'lambdaorm'
export class Country {
	constructor () {
		this.states = []
	}

	name?: string
	iso3?: string
	states: State[]
}
export interface QryCountry {
	name: string
	iso3: string
	states: ManyToOne<State> & State[]
}
export class State {
	id?: number
	name?: string
	countryCode?: string
	country?: Country
}
export interface QryState {
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
			"name": "test",
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
							"nullable": false,
							"length": 3,
							"type": "string",
							"mapping": "iso3"
						}
					],
					"relations": [
						{
							"name": "states",
							"type": "manyToOne",
							"composite": true,
							"from": "iso3",
							"entity": "States",
							"to": "countryCode",
							"weak": true
						}
					],
					"indexes": [],
					"dependents": [
						{
							"entity": "States",
							"relation": {
								"name": "country",
								"from": "countryCode",
								"entity": "Countries",
								"to": "iso3",
								"type": "oneToMany",
								"weak": false
							}
						}
					],
					"constraints": [],
					"composite": false,
					"hadReadExps": false,
					"hadWriteExps": false,
					"hadReadValues": false,
					"hadWriteValues": false,
					"hadDefaults": false,
					"hadViewReadExp": false,
					"mapping": "Countries",
					"hadKeys": false
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
						}
					],
					"relations": [
						{
							"name": "country",
							"from": "countryCode",
							"entity": "Countries",
							"to": "iso3",
							"type": "oneToMany",
							"weak": false
						}
					],
					"indexes": [],
					"dependents": [],
					"constraints": [],
					"composite": false,
					"hadReadExps": false,
					"hadWriteExps": false,
					"hadReadValues": false,
					"hadWriteValues": false,
					"hadDefaults": false,
					"hadViewReadExp": false,
					"mapping": "States",
					"hadKeys": false
				}
			]
		}
	]
}
```

### Populate Data

for the import we will download the following file.

```sh
wget https://raw.githubusercontent.com/FlavioLionelRita/lambdaorm-lab01/main/data.json
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
docker-compose -p "lambdaorm-lab01" down
```
