# Node Lab - Incorporate

**In this laboratory we will see:**

- How to use λORM CLI commands
- how to create a project that uses lambda ORM
- How to run the incorporate method to:
   - Update the schema according to the introspected type of data.
   - Synchronize the schema with the data source.
   - Create files with the model status and update scripts.
   - Import data in the data source.

## Install lambda ORM CLI

Install the package globally to use the CLI commands to help you create and maintain projects

```sh
npm install lambdaorm-cli -g
```

## Create project

will create the project folder with the basic structure.

```sh
lambdaorm init -w lab
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

### Build

Running the build command will create or update the following:

- Folder that will contain the source code and is taken from the "infrastructure.paths.scr" configuration in the lambdaorm.yaml file
- Folder that will contain the domain files, the path is relative to the src folder and is taken from the "infrastructure.paths.domain" configuration in the lambdaorm.yaml file
- Model file: file with the definition of the entities
- Repository files: one file for each entity with data access methods
- Install the necessary dependencies according to the databases used

```sh
lambdaorm build -l node
```

Result:

```sh
├── orm_state
├── countries.json
├── docker-compose.yaml
├── lambdaORM.yaml
├── northwind-mysql.sql
├── package.json
├── package-lock.json
|── node_modules
├── src
│   └── domain
│       └── model.ts
└── tsconfig.json
```

### Incorporate

The incorporate command does the following:

- Update the schema
- Generate and apply scripts to synchronize the schema with the data source
- Import data from data source

#### Add Source Code

In the src folder add the file "index.ts" in src folder with the following content:

```Typescript
import { Orm } from 'lambdaorm'
(async () => {
	const workspace = process.cwd()
	const schemaPath = workspace + '/lambdaOrm.yaml'		
	const orm = new Orm(workspace)
	try{
		const data = JSON.parse( await orm.helper.fs.read(workspace + '/countries.json') || '{}')
		await orm.init(schemaPath)	
		await orm.stage.incorporate(data, 'countries')
	}catch(e){
		console.log(e)
	} finally {
		await orm.end()
	}	
})()
```

### Run

```sh
npx tsc
node ./build/index.js
```

As a result:

- The "lambdaORM.yaml" file will be updated according to the type introspected from the data.
- The updated schema is synchronized with the data source.
- Files are created with the model status and update scripts.

File structure:

```sh
├── countries.json
├── orm_state
│   ├── default-data.json
│   ├── default-ddl-20240502T181420089Z-push-default.sql
│   └── default-model.json
├── docker-compose.yaml
├── lambdaORM.yaml
├── package.json
├── package-lock.json
├── src
│   ├── domain
│   │   └── model.ts
│   └── index.ts
└── tsconfig.json
```

Contents of the file "default-ddl-20240502T181420089Z-push-default.sql":

```sql
CREATE TABLE CountriesLanguages (id INTEGER  AUTO_INCREMENT,languageCode VARCHAR(4) NOT NULL ,countryName VARCHAR(32) NOT NULL ,CONSTRAINT CountriesLanguages_PK PRIMARY KEY (id));
ALTER TABLE CountriesLanguages ADD CONSTRAINT CountriesLanguages_UK UNIQUE (countryName,languageCode);
CREATE TABLE Languages (code VARCHAR(4) NOT NULL ,name VARCHAR(16) NOT NULL ,CONSTRAINT Languages_PK PRIMARY KEY (code));
CREATE TABLE Regions (code VARCHAR(2) NOT NULL ,name VARCHAR(32) NOT NULL ,CONSTRAINT Regions_PK PRIMARY KEY (code));
CREATE TABLE Positions (lat DECIMAL(10,4) NOT NULL ,`long` DECIMAL(10,4) NOT NULL ,CONSTRAINT Positions_PK PRIMARY KEY (lat));
ALTER TABLE Positions ADD CONSTRAINT Positions_UK UNIQUE (`long`);
CREATE TABLE Timezones (GmtOffset INTEGER  ,name VARCHAR(32) NOT NULL ,positionLat DECIMAL(10,4) NOT NULL ,countryName VARCHAR(32) NOT NULL ,CONSTRAINT Timezones_PK PRIMARY KEY (name));
CREATE TABLE Countries (name VARCHAR(32) NOT NULL ,phoneCode INTEGER NOT NULL ,priority INTEGER NOT NULL ,regionCode VARCHAR(2) NOT NULL ,CONSTRAINT Countries_PK PRIMARY KEY (name));
ALTER TABLE Countries ADD CONSTRAINT Countries_UK UNIQUE (phoneCode);
ALTER TABLE CountriesLanguages ADD CONSTRAINT CountriesLanguages_countries_FK FOREIGN KEY (countryName) REFERENCES Countries (name);
ALTER TABLE CountriesLanguages ADD CONSTRAINT CountriesLanguages_languages_FK FOREIGN KEY (languageCode) REFERENCES Languages (code);
ALTER TABLE Timezones ADD CONSTRAINT Timezones_position_FK FOREIGN KEY (positionLat) REFERENCES Positions (lat);
ALTER TABLE Timezones ADD CONSTRAINT Timezones_countries_FK FOREIGN KEY (countryName) REFERENCES Countries (name);
ALTER TABLE Countries ADD CONSTRAINT Countries_region_FK FOREIGN KEY (regionCode) REFERENCES Regions (code);
```

### Validate

```sh
lambdaorm execute -q "Countries.include(p=>[p.region,p.timezones.include(p=>p.position)]).filter(p=> p.name=='Argentina')" -o beautiful
```

Result:

```json
[
  {
    "name": "Argentina",
    "phoneCode": 54,
    "priority": 1,
    "regionCode": "SA",
    "region": {
      "code": "SA",
      "name": "South America"
    },
    "timezones": [
      {
        "GmtOffset": -3,
        "name": "Buenos Aires",
        "positionLat": -34.6037,
        "countryName": "Argentina",
        "position": {
          "lat": -34.6037,
          "long": -58.3816
        }
      }
    ]
  }
]
```

## End

To finish the lab we execute the following command to eliminate the containers.

```sh
docker-compose -p lambdaorm-lab down
```
