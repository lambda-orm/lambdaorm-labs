# Node Lab - Fetch

**In this laboratory we will see:**

- how to create a project that uses lambda ORM
- How to obtain the mapping schema from a database with the fetch command

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
├── data
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

### Fetch

The fetch command allows you to obtain the mapping of the database tables. \
Using the -o argument you can specify the output format, in this case yaml. \
The mapping.yaml file will contain the mapping of the database tables. \

#### Add Source Code

In the src folder add the file "index.ts" in src folder with the following content:

```Typescript
import { Orm } from 'lambdaorm'
(async () => {
	const workspace = process.cwd()
	const orm = new Orm(workspace)
	try{		
		const originalSchema = orm.helper.yaml.load(await orm.helper.fs.read(workspace + '/lambdaOrm.yaml'))
		await orm.init(originalSchema)	
		const mappings = await orm.stage.fetch()
		await orm.helper.fs.write( workspace + '/mappings.yaml', orm.helper.yaml.dump(mappings))
	}catch(e){
		console.log(e)
	} finally {
		orm.end()
	}	
})()
```

### Run

```sh
npx tsc
node ./build/index.js
```

As a result, the "mappings.yaml" file will be created with the mapping of the corresponding schema to the data source.

## End

To finish the lab we execute the following command to eliminate the containers.

```sh
docker-compose -p lambdaorm-lab down
```
