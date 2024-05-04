# Node Lab - Pull

**In this laboratory we will see:**

- How to use λORM CLI commands
- how to create a project that uses lambda ORM
- How to synchronize the schema with respect to the data source with the pull command

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

### Pull

The pull command is used to update the schema with respect to the sources (Databases). \
Once executed, the schema will be synchronized with the database. \
It also adds a file with the pulling scripts. \

#### Add Source Code

In the src folder add the file "index.ts" in src folder with the following content:

```Typescript
import { Orm } from 'lambdaorm'
(async () => {
	const workspace = process.cwd()
	const orm = new Orm(workspace)
	try{		
		await orm.helper.fs.removeDir(workspace + '/data')
		const originalSchema = orm.helper.yaml.load(await orm.helper.fs.read(workspace + '/lambdaOrm.yaml'))
		await orm.init(originalSchema)	
		await orm.stage.pull()
		await orm.helper.fs.write( workspace + '/result.yaml', orm.helper.yaml.dump(orm.state.originalSchema))
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

As a result:

- The "lambdaORM.yaml" file will be updated according to the data source.
- Files with the model status and update scripts are created.
- A "result.yaml" file is created with the result of the operation. (Optional)

File structure:

```sh
.
├── data
│   ├── default-ddl-20240502T165327450Z-pull-default.sql
│   └── default-model.json
├── docker-compose.yaml
├── lambdaORM.yaml
├── northwind-mysql.sql
├── package.json
├── package-lock.json
├── result.yaml
├── src
│   ├── domain
│   │   └── model.ts
│   └── index.ts
└── tsconfig.json
```

Contents of the file "default-ddl-20240502T165327450Z-pull-default.sql":

```sql
CREATE TABLE Categories (CategoryID INTEGER  AUTO_INCREMENT,CategoryName VARCHAR(15) NOT NULL ,Description TEXT  ,Picture LONGBLOB  ,CONSTRAINT Categories_PK PRIMARY KEY (CategoryID));
CREATE TABLE CustomerCustomerDemo (CustomerID VARCHAR(5) NOT NULL ,CustomerTypeID VARCHAR(10) NOT NULL ,CONSTRAINT CustomerCustomerDemo_PK PRIMARY KEY (CustomerID,CustomerTypeID));
CREATE TABLE CustomerDemographics (CustomerTypeID VARCHAR(10) NOT NULL ,CustomerDesc TEXT  ,CONSTRAINT CustomerDemographics_PK PRIMARY KEY (CustomerTypeID));
CREATE TABLE Customers (CustomerID VARCHAR(5) NOT NULL ,CompanyName VARCHAR(40) NOT NULL ,ContactName VARCHAR(30)  ,ContactTitle VARCHAR(30)  ,Address VARCHAR(60)  ,City VARCHAR(15)  ,Region VARCHAR(15)  ,PostalCode VARCHAR(10)  ,Country VARCHAR(15)  ,Phone VARCHAR(24)  ,Fax VARCHAR(24)  ,CONSTRAINT Customers_PK PRIMARY KEY (CustomerID));
CREATE TABLE EmployeeTerritories (EmployeeID INTEGER NOT NULL ,TerritoryID VARCHAR(20) NOT NULL ,CONSTRAINT EmployeeTerritories_PK PRIMARY KEY (EmployeeID,TerritoryID));
CREATE TABLE Employees (EmployeeID INTEGER  AUTO_INCREMENT,LastName VARCHAR(20) NOT NULL ,FirstName VARCHAR(10) NOT NULL ,Title VARCHAR(30)  ,TitleOfCourtesy VARCHAR(25)  ,BirthDate DATETIME  ,HireDate DATETIME  ,Address VARCHAR(60)  ,City VARCHAR(15)  ,Region VARCHAR(15)  ,PostalCode VARCHAR(10)  ,Country VARCHAR(15)  ,HomePhone VARCHAR(24)  ,Extension VARCHAR(4)  ,Photo LONGBLOB  ,Notes TEXT NOT NULL ,ReportsTo INTEGER  ,PhotoPath VARCHAR(255)  ,Salary DECIMAL(10,4)  ,CONSTRAINT Employees_PK PRIMARY KEY (EmployeeID));
CREATE TABLE `Order Details` (OrderID INTEGER NOT NULL ,ProductID INTEGER NOT NULL ,UnitPrice DECIMAL(10,4) NOT NULL ,Quantity INTEGER NOT NULL ,Discount DECIMAL(10,4) NOT NULL ,CONSTRAINT `Order Details_PK` PRIMARY KEY (OrderID,ProductID));
CREATE TABLE Orders (OrderID INTEGER  AUTO_INCREMENT,CustomerID VARCHAR(5) NOT NULL ,EmployeeID INTEGER NOT NULL ,OrderDate DATETIME  ,RequiredDate DATETIME  ,ShippedDate DATETIME  ,ShipVia INTEGER  ,Freight DECIMAL(10,4)  ,ShipName VARCHAR(40)  ,ShipAddress VARCHAR(60)  ,ShipCity VARCHAR(15)  ,ShipRegion VARCHAR(15)  ,ShipPostalCode VARCHAR(10)  ,ShipCountry VARCHAR(15)  ,CONSTRAINT Orders_PK PRIMARY KEY (CustomerID,EmployeeID,OrderID));
CREATE TABLE Products (ProductID INTEGER  AUTO_INCREMENT,ProductName VARCHAR(40) NOT NULL ,SupplierID INTEGER NOT NULL ,CategoryID INTEGER NOT NULL ,QuantityPerUnit VARCHAR(20)  ,UnitPrice DECIMAL(10,4)  ,UnitsInStock INTEGER  ,UnitsOnOrder INTEGER  ,ReorderLevel INTEGER  ,Discontinued INTEGER NOT NULL ,CONSTRAINT Products_PK PRIMARY KEY (CategoryID,ProductID,SupplierID));
CREATE TABLE Region (RegionID INTEGER NOT NULL ,RegionDescription VARCHAR(50) NOT NULL ,CONSTRAINT Region_PK PRIMARY KEY (RegionID));
CREATE TABLE Shippers (ShipperID INTEGER  AUTO_INCREMENT,CompanyName VARCHAR(40) NOT NULL ,Phone VARCHAR(24)  ,CONSTRAINT Shippers_PK PRIMARY KEY (ShipperID));
CREATE TABLE Suppliers (SupplierID INTEGER  AUTO_INCREMENT,CompanyName VARCHAR(40) NOT NULL ,ContactName VARCHAR(30)  ,ContactTitle VARCHAR(30)  ,Address VARCHAR(60)  ,City VARCHAR(15)  ,Region VARCHAR(15)  ,PostalCode VARCHAR(10)  ,Country VARCHAR(15)  ,Phone VARCHAR(24)  ,Fax VARCHAR(24)  ,HomePage TEXT  ,CONSTRAINT Suppliers_PK PRIMARY KEY (SupplierID));
CREATE TABLE Territories (TerritoryID VARCHAR(20) NOT NULL ,TerritoryDescription VARCHAR(50) NOT NULL ,RegionID INTEGER NOT NULL ,CONSTRAINT Territories_PK PRIMARY KEY (TerritoryID,RegionID));
ALTER TABLE CustomerCustomerDemo ADD CONSTRAINT CustomerCustomerDemo_customerCustomerDemo_FK FOREIGN KEY (CustomerTypeID) REFERENCES CustomerDemographics (CustomerTypeID);
ALTER TABLE CustomerCustomerDemo ADD CONSTRAINT CustomerCustomerDemo_customerCustomerDemo_FK FOREIGN KEY (CustomerID) REFERENCES Customers (CustomerID);
ALTER TABLE EmployeeTerritories ADD CONSTRAINT EmployeeTerritories_employeeTerritories_FK FOREIGN KEY (EmployeeID) REFERENCES Employees (EmployeeID);
ALTER TABLE Employees ADD CONSTRAINT Employees_employees_FK FOREIGN KEY (ReportsTo) REFERENCES Employees (EmployeeID);
ALTER TABLE `Order Details` ADD CONSTRAINT `Order Details_order_FK` FOREIGN KEY (OrderID) REFERENCES Orders (OrderID);
ALTER TABLE `Order Details` ADD CONSTRAINT `Order Details_order_FK` FOREIGN KEY (ProductID) REFERENCES Products (ProductID);
ALTER TABLE Orders ADD CONSTRAINT Orders_orders_FK FOREIGN KEY (CustomerID) REFERENCES Customers (CustomerID);
ALTER TABLE Orders ADD CONSTRAINT Orders_orders_FK FOREIGN KEY (EmployeeID) REFERENCES Employees (EmployeeID);
ALTER TABLE Orders ADD CONSTRAINT Orders_orders_FK FOREIGN KEY (ShipVia) REFERENCES Shippers (ShipperID);
ALTER TABLE Products ADD CONSTRAINT Products_products_FK FOREIGN KEY (CategoryID) REFERENCES Categories (CategoryID);
ALTER TABLE Products ADD CONSTRAINT Products_products_FK FOREIGN KEY (SupplierID) REFERENCES Suppliers (SupplierID);
ALTER TABLE Territories ADD CONSTRAINT Territories_territories_FK FOREIGN KEY (RegionID) REFERENCES Region (RegionID);
```

## End

To finish the lab we execute the following command to eliminate the containers.

```sh
docker-compose -p lambdaorm-lab down
```
