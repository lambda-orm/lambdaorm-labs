# CLI Lab - Northwind CQRS

**In this laboratory we will see:**

Configure postgres databases, mysql, mongo using docker-compose.
How to configure different stages:

- default: where domain entities are mapped to different data sources.
- insights: where domain entities are mapped to a single data source.
- cqrs: where domain entities are mapped to different data sources and read-only queries are executed.

How to configure a listener to synchronize data between different data sources.

We will verify that lambdaorm behaves the same whether the domain entities are mapped to a single data source or to multiple data sources.

CQRS (Command Query Responsibility Segregation) is a design pattern that separates read and write operations of a domain model.
This pattern can be difficult to implement in conventional development or with a traditional ORM, but with lambdaorm it is very simple, since we can solve it through configuration.

Consider that in this lab we are not only implementing CQRS, but we are also implementing a distributed data model, where each entity in the domain can be mapped to a different data source.

## Install lambda ORM CLI

Install the package globally to use the CLI commands to help you create and maintain projects

```sh
npm install lambdaorm-cli -g
```

Test:

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

- mysql: database for the catalog and crm domains
- postgres: database for the ordering domain
- mongodb: database for the ordering domain

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
      - 5433:5432
  mongodb:    
    container_name: lab-mongo
    image: mongo:5.0
    restart: always
    environment:
      - MONGO_INITDB_DATABASE=test
      - MONGO_INITDB_ROOT_USERNAME=test
      - MONGO_INITDB_ROOT_PASSWORD=test
    ports:
      - 27017:27017           
```

### Configure Schema

In the schema we will configure:

- Domain
  - Entities
- Infrastructure
  - Default View
  - Default Mapping and MongoDb Mapping
  - Data Sources for Catalog, Crm, Ordering and Insights
  - Stages: default, insights and cqrs
- Application
  - Listeners to synchronize data between stages

In the creation of the project the schema was created but without any entity.
Modify the configuration of lambdaorm.yaml with the following content

```yaml
domain:  
  enums:
  entities:
  - name: Address
    abstract: true
    indexes:
    - name: postalCode
      fields: ["postalCode"]
    - name: region
      fields: ["region", "country"]
    - name: city
      fields: ["city"]
    properties:
    - name: address
    - name: city
    - name: region
    - name: postalCode
      length: 20
    - name: country
  - name: Categories
    primaryKey: ["id"]
    uniqueKey: ["name"]
    properties:
    - name: id
      type: integer
      required: true
      autoIncrement: true
    - name: name
      required: true
  - name: Customers
    extends: Address
    primaryKey: ["id"]
    indexes:
    - name: name
      fields: ["name"]
    properties:
    - name: id
      length: 5
      required: true
    - name: name
      required: true
  - name: Products
    primaryKey: ["id"]
    uniqueKey: ["name", "supplierId"]
    properties:
    - name: id
      type: integer
      required: true
      autoIncrement: true
    - name: name
      required: true
    - name: categoryId
      type: integer
    - name: quantity
    - name: price
      type: decimal
      default: 0
    relations:
    - name: category
      from: categoryId
      entity: Categories
      to: id
      target: products
  - name: Orders
    primaryKey: ["id"]
    indexes:
    - name: orderDate
      fields: ["orderDate"]
    properties:
    - name: id
      type: integer
      required: true
      autoIncrement: true
    - name: customerId
      required: true
      length: 5
    - name: orderDate
      type: dateTime 
    relations:
    - name: customer
      from: customerId
      entity: Customers
      to: id
      target: orders
  - name: Orders.details
    primaryKey: ["orderId", "productId"]
    properties:
    - name: orderId
      required: true
      type: integer
    - name: productId
      required: true
      type: integer
    - name: unitPrice
      type: decimal
    - name: quantity
      type: decimal
    relations:
    - name: order
      from: orderId
      entity: Orders
      to: id
      target: details
    - name: product
      from: productId
      entity: Products
      to: id
      target: orderDetails
infrastructure:
  views:
  - name: default  
  mappings:
  - name: default
    entities:
    - name: Address
      abstract: true
      properties:
      - name: address
        mapping: Address
      - name: city
        mapping: City
      - name: region
        mapping: Region
      - name: postalCode
        mapping: PostalCode
      - name: country
        mapping: Country
    - name: Categories
      mapping: Categories
      properties:
      - name: id
        mapping: CategoryID
      - name: name
        mapping: CategoryName
    - name: Customers
      extends: Address
      mapping: Customers
      properties:
      - name: id
        mapping: CustomerID
      - name: name
        mapping: CompanyName
    - name: Products
      mapping: Products
      properties:
      - name: id
        mapping: ProductID
      - name: name
        mapping: ProductName
      - name: categoryId
        mapping: CategoryID
      - name: quantity
        mapping: QuantityPerUnit
      - name: price
        mapping: UnitPrice
    - name: Orders
      mapping: Orders
      properties:
      - name: id
        mapping: OrderID
      - name: customerId
        mapping: CustomerID
      - name: orderDate
        mapping: OrderDate
    - name: Orders.details
      mapping: Order Details
      properties:
      - name: orderId
        mapping: OrderID
      - name: productId
        mapping: ProductID
      - name: unitPrice
        mapping: UnitPrice
      - name: quantity
        mapping: Quantity
  - name: mongoDb
    extends: default
    entities:
      - name: Orders
        sequence: SQ_ORDERS
        properties:
          - name: id
            mapping: _id
  sources:
  - name: Catalog      
    dialect: MySQL
    mapping: default
    connection: ${CNN_MYSQL}      
  - name: Crm    
    dialect: PostgreSQL
    mapping: default
    connection: ${CNN_POSTGRES}
  - name: Ordering
    dialect: MongoDB
    mapping: mongoDb      
    connection: ${CNN_MONGODB}
  - name: Insights    
    dialect: PostgreSQL
    mapping: default
    connection: ${CNN_INSIGHTS}      
  stages:
  - name: default
    sources:
    - name: Catalog
      condition: entity.in(["Categories","Products"])
    - name: Crm
      condition: entity.in(["Address","Customers"])
    - name: Ordering
      condition: entity.in(["Orders","Orders.details"])
  - name: insights
    sources:
    - name: Insights
  - name: cqrs
    sources:
    - name: Insights
      condition: action == "select"
    - name: Catalog
      condition: entity.in(["Categories","Products"])
    - name: Crm
      condition: entity.in(["Address","Customers"])
    - name: Ordering
      condition: entity.in(["Orders","Orders.details"])    
application:
  listeners:
    - name: syncInsights
      on: [insert, bulkInsert, update, delete ]
      condition: options.stage.in("default","cqrs")
      after: orm.execute(expression,data,{stage:"insights"})   
```

**Stages configuration:**

3 stages are defined:

- default: stage that contains the entities distributed in the MySql, Postgres and MongoDB databases
- insights: stage that contains all entities in a single Postgres database
- cqrs: stage that will execute the update, insert, bulkInsert and delete type queries in the MySql, Postgres and MongoDB databases but the select type queries will be executed in the Insights database

```yaml
...
  stages:
  - name: default
    sources:
    - name: Catalog
      condition: entity.in(["Categories","Products"])
    - name: Crm
      condition: entity.in(["Address","Customers"])
    - name: Ordering
      condition: entity.in(["Orders","Orders.details"])
  - name: insights
    sources:
    - name: Insights
  - name: cqrs
    sources:
    - name: Insights
      condition: action == "select"
    - name: Catalog
      condition: entity.in(["Categories","Products"])
    - name: Crm
      condition: entity.in(["Address","Customers"])
    - name: Ordering
      condition: entity.in(["Orders","Orders.details"]) 
...       
```

**listeners configuration:**

In order to synchronize the data between the databases, a listener is defined that will be executed after each insert, update, delete and bulkInsert operation in the stage default and cqrs.

```yaml
...
application:
  listeners:
    - name: syncInsights
      actions: [insert, bulkInsert, update, delete ]
      condition: options.stage.in("default","cqrs")
      after: orm.execute(expression,data,{stage:"insights"})
```

### Add environment file

Add file ".env"

```sh
CNN_MYSQL={"host":"localhost","port":3306,"user":"test","password":"test","database":"test"}
CNN_POSTGRES={"host":"localhost","port":5433,"user":"test","password":"test","database":"test"}
CNN_MONGODB={"url":"mongodb://test:test@localhost:27017","database":"test"}
CNN_INSIGHTS={"host":"localhost","port":5433,"user":"test","password":"test","database":"insights"}
```

## Start

Create MySql database for test:

```sh
docker-compose -p lambdaorm-lab up -d
```

Initialize databases:

```sh
docker exec lab-mysql  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "ALTER DATABASE test CHARACTER SET utf8 COLLATE utf8_general_ci;"
docker exec lab-mysql  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "GRANT ALL ON *.* TO 'test'@'%' with grant option; FLUSH PRIVILEGES;"
docker exec lab-postgres psql -U test -c "CREATE DATABASE insights" -W test
```

### Sync

```sh
lambdaorm sync -e .env -s default
lambdaorm sync -e .env -s insights
```

It will generate:

```sh
├── data
│   ├── default-ddl-20231201T191054280Z-sync-Catalog.sql
│   ├── default-ddl-20231201T191054280Z-sync-Crm.sql
│   ├── default-ddl-20231201T191054281Z-sync-Ordering.json
│   ├── default-model.json
│   ├── insights-ddl-20231201T191101577Z-sync-Insights.sql
│   └── insights-model.json
├── docker-compose.yaml
└── lambdaORM.yaml
```

### Populate Data

For the import we will download the following file.

```sh
wget https://raw.githubusercontent.com/lambda-orm/lambdaorm-labs/main/source/northwind/data.json
```

We import the records in the default stage and these will be replicated in the insights stage

```sh
lambdaorm import -e .env -s default -d ./data.json
```

## Queries

### Plan select on default stage

```sh
lambdaorm plan -e .env -s default -q "Orders.filter(p => p.customerId == customerId).include(p => p.customer.map(p => p.name)).order(p=> p.id).page(1,1)" -o beautiful
```

**Result:**

```json
{
  "entity": "Orders",
  "dialect": "MongoDB",
  "source": "Ordering",
  "sentence": "[{ \"$match\" : { \"CustomerID\":{{customerId}} } }, { \"$project\" :{ \"_id\": 0 , \"id\":\"$_id\", \"customerId\":\"$CustomerID\", \"orderDate\":\"$OrderDate\", \"__customerId\":\"$CustomerID\" }} , { \"$sort\" :{ \"_id\":1 } } , { \"$skip\" : 0 }, { \"$limit\" : 1 } , { \"$project\": { \"_id\": 0 } }]",
  "children": [
    {
      "entity": "Customers",
      "dialect": "PostgreSQL",
      "source": "Crm",
      "sentence": "SELECT c.CompanyName AS \"name\", c.CustomerID AS \"LambdaOrmParentId\" FROM Customers c  WHERE  c.CustomerID IN ($1) "
    }
  ]
}
```

### Plan select on cqrs stage

```sh
lambdaorm plan -e .env -s cqrs -q "Orders.filter(p => p.customerId == customerId).include(p => p.customer.map(p => p.name)).order(p=> p.id).page(1,1)" -o beautiful
```

**Result:**

```json
{
  "entity": "Orders",
  "dialect": "PostgreSQL",
  "source": "Insights",
  "sentence": "SELECT o.OrderID AS \"id\", o.CustomerID AS \"customerId\", o.OrderDate AS \"orderDate\", o.CustomerID AS \"__customerId\" FROM Orders o  WHERE o.CustomerID = $1 ORDER BY o.OrderID asc  OFFSET 0 LIMIT 1 ",
  "children": [
    {
      "entity": "Customers",
      "dialect": "PostgreSQL",
      "source": "Insights",
      "sentence": "SELECT c.CompanyName AS \"name\", c.CustomerID AS \"LambdaOrmParentId\" FROM Customers c  WHERE  c.CustomerID IN ($1) "
    }
  ]
}
```

### Plan insert on cqrs stage

```sh
lambdaorm plan -e .env -s cqrs -q "Orders.bulkInsert().include(p=> p.details) " -o beautiful
```

**Result:**

```json
{
  "entity": "Orders",
  "dialect": "MongoDB",
  "source": "Ordering",
  "sentence": "{ \"CustomerID\":{{customerId}},\"OrderDate\":{{orderDate}} }",
  "children": [
    {
      "entity": "Orders.details",
      "dialect": "MongoDB",
      "source": "Ordering",
      "sentence": "{ \"OrderID\":{{orderId}},\"ProductID\":{{productId}},\"UnitPrice\":{{unitPrice}},\"Quantity\":{{quantity}} }"
    }
  ]
}
```

## End

### Drop tables/collections and remove databases

```sh
lambdaorm drop -e .env -s default
lambdaorm drop -e .env -s insights
docker-compose -p lambdaorm-lab down
```

The data folder should remain like this:

```sh
.
├── data
│   ├── default-ddl-20231201T191054280Z-sync-Catalog.sql
│   ├── default-ddl-20231201T191054280Z-sync-Crm.sql
│   ├── default-ddl-20231201T191054281Z-sync-Ordering.json
│   ├── default-ddl-20231201T192143299Z-clean-Catalog.sql
│   ├── default-ddl-20231201T192143300Z-clean-Crm.sql
│   ├── default-ddl-20231201T192143300Z-clean-Ordering.json
│   ├── insights-ddl-20231201T191101577Z-sync-Insights.sql
│   └── insights-ddl-20231201T192149153Z-clean-Insights.sql
├── docker-compose.yaml
└── lambdaORM.yaml
```
