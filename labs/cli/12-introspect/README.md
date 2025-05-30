# CLI Lab - Introspect

**In this laboratory we will see:**

- How to use λORM CLI commands
- how to create a project that uses lambda ORM
- How update schema and synchronize source from data introspection with the introspect command

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

### Configure docker compose

Configure docker compose to create the following containers:

- mysql: MySQL database

Create file "docker compose.yaml"

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
docker compose -p lambdaorm-lab up -d
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

Running the introspect command:

```sh
lambdaorm introspect -d countries.json -n counties
```

This command updates the schema based on data introspection, in this case from the country.json file.

Files created:

```sh
├── countries.json
├── orm_state
│   ├── default-ddl-20240502T182117031Z-push-default.sql
│   └── default-model.json
├── docker compose.yaml
└── lambdaORM.yaml
```

Script the synchronization in file "default-ddl-20240502T182117031Z-push-default.sql":

```sql
CREATE TABLE CountiesLanguages (id INTEGER  AUTO_INCREMENT,languageCode VARCHAR(4) NOT NULL ,countyName VARCHAR(32) NOT NULL ,CONSTRAINT CountiesLanguages_PK PRIMARY KEY (id));
ALTER TABLE CountiesLanguages ADD CONSTRAINT CountiesLanguages_UK UNIQUE (countyName,languageCode);
CREATE TABLE Languages (code VARCHAR(4) NOT NULL ,name VARCHAR(16) NOT NULL ,CONSTRAINT Languages_PK PRIMARY KEY (code));
CREATE TABLE Regions (code VARCHAR(2) NOT NULL ,name VARCHAR(32) NOT NULL ,CONSTRAINT Regions_PK PRIMARY KEY (code));
CREATE TABLE Positions (lat DECIMAL(10,4) NOT NULL ,`long` DECIMAL(10,4) NOT NULL ,CONSTRAINT Positions_PK PRIMARY KEY (lat));
ALTER TABLE Positions ADD CONSTRAINT Positions_UK UNIQUE (`long`);
CREATE TABLE Timezones (GmtOffset INTEGER  ,name VARCHAR(32) NOT NULL ,positionLat DECIMAL(10,4) NOT NULL ,countyName VARCHAR(32) NOT NULL ,CONSTRAINT Timezones_PK PRIMARY KEY (name));
CREATE TABLE Counties (name VARCHAR(32) NOT NULL ,phoneCode INTEGER NOT NULL ,priority INTEGER NOT NULL ,regionCode VARCHAR(2) NOT NULL ,CONSTRAINT Counties_PK PRIMARY KEY (name));
ALTER TABLE Counties ADD CONSTRAINT Counties_UK UNIQUE (phoneCode);
ALTER TABLE CountiesLanguages ADD CONSTRAINT CountiesLanguages_counties_FK FOREIGN KEY (countyName) REFERENCES Counties (name);
ALTER TABLE CountiesLanguages ADD CONSTRAINT CountiesLanguages_languages_FK FOREIGN KEY (languageCode) REFERENCES Languages (code);
ALTER TABLE Timezones ADD CONSTRAINT Timezones_position_FK FOREIGN KEY (positionLat) REFERENCES Positions (lat);
ALTER TABLE Timezones ADD CONSTRAINT Timezones_counties_FK FOREIGN KEY (countyName) REFERENCES Counties (name);
ALTER TABLE Counties ADD CONSTRAINT Counties_region_FK FOREIGN KEY (regionCode) REFERENCES Regions (code);
```

Verify tables created in source:

```sh
docker exec lab-mysql mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "use test;show tables;"
```

Result:

```sh
Counties
CountiesLanguages
Languages
Positions
Regions
```

## End

To finish the lab we execute the following command to eliminate the containers.

```sh
docker compose -p lambdaorm-lab down
```
