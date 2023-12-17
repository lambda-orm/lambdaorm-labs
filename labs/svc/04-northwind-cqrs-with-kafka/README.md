# Service - Northwind CQRS (Command Query Responsibility Segregation) with kafka

**In this laboratory we will see:**

Configure postgres databases, mysql, mongo and a lambdaorm service using docker-compose.
How to configure different stages:

- default: where domain entities are mapped to different data sources.
- insights: where domain entities are mapped to a single data source.
- cqrs: where domain entities are mapped to different data sources and read-only queries are executed.

How to configure a listener to synchronize data between different data sources.
How to configure a consumer to listen to messages from a Kafka topic.

Consume the lambdaorm service to:

- Execute ping
- Obtain the data model corresponding to a query
- Obtain the parameters of a query.
- Obtain the restrictions of a query.
- Obtain the execution plan of a query.
- Import data to be distributed across different data sources.
- Execute a query that, according to the stage, will be executed in one or more data sources.

We will verify that lambdaorm behaves the same whether the domain entities are mapped to a single data source or to multiple data sources.

CQRS (Command Query Responsibility Segregation) is a design pattern that separates read and write operations of a domain model.
This pattern can be difficult to implement in conventional development or with a traditional ORM, but with lambdaorm it is very simple, since we can solve it through configuration.

Consider that in this lab we are not only implementing CQRS, but we are also implementing a distributed data model, where each entity in the domain can be mapped to a different data source.

In this case, every time a stage is inserted, updated or deleted in the default stage or cqrs, a message will be sent to the "insights-sync" topic with the expression and the data.
and this message will be consumed and the expression will be executed in the insights stage, thus achieving synchronization between the data sources and the insights source.

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

## Configure

### Configure docker-compose

Configure docker-compose to create the following containers:

- mysql: database for the catalog
- postgres: database for crm and insights
- mongodb: database for ordering
- zookeeper: kafka dependency
- kafka: kafka dependency
- kafdrop: kafka dependency
- orm: lambdaorm service  

Create file "docker-compose.yaml"

```yaml
version: '3'
networks:
  northwind:
    driver: bridge
services:
  mysql:
    container_name: mysql
    image: mysql:5.7
    restart: always
    environment:
      - MYSQL_DATABASE=test
      - MYSQL_USER=test
      - MYSQL_PASSWORD=test
      - MYSQL_ROOT_PASSWORD=root
    ports:
      - 3306:3306
    networks:
      - northwind  
  postgres:
    container_name: postgres  
    image: postgres:10
    restart: always
    environment:
      - POSTGRES_DB=test
      - POSTGRES_USER=test
      - POSTGRES_PASSWORD=test
    ports:
      - 5432:5432
    networks:
      - northwind  
  mongodb:    
    container_name: mongodb
    image: mongo:5.0
    restart: always
    environment:
      - MONGO_INITDB_DATABASE=test
      - MONGO_INITDB_ROOT_USERNAME=test
      - MONGO_INITDB_ROOT_PASSWORD=test
    ports:
      - 27017:27017
    networks:
      - northwind
  zookeeper:
    depends_on:
      - orm
    container_name: zookeeper
    image: bitnami/zookeeper:latest
    ports:
      - 2181:2181
    networks:
      - northwind  
    environment:
      - ALLOW_ANONYMOUS_LOGIN=yes
  kafka:
    depends_on:
      - zookeeper
    container_name: kafka
    image: bitnami/kafka:latest
    ports:
      - 9092:9092
      - 9093:9093
    networks:
      - northwind  
    environment:
      - KAFKA_BROKER_ID=1
      - KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181
      - ALLOW_PLAINTEXT_LISTENER=yes
      - KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CLIENT:PLAINTEXT,EXTERNAL:PLAINTEXT
      - KAFKA_CFG_LISTENERS=CLIENT://:9092,EXTERNAL://:9093
      - KAFKA_CFG_ADVERTISED_LISTENERS=CLIENT://kafka:9092,EXTERNAL://localhost:9093
      - KAFKA_CFG_INTER_BROKER_LISTENER_NAME=CLIENT
  kafdrop:
    depends_on:
      - kafka
    container_name: kafdrop
    image: obsidiandynamics/kafdrop:latest      
    ports:
      - 19000:9000
    networks: 
      - northwind  
    environment:
      KAFKA_BROKERCONNECT: kafka:9092  
  orm:
    depends_on:
      - mysql      
      - postgres
      - mongodb
    container_name: orm
    image: flaviorita/lambdaorm-svc:0.8.57
    restart: always  
    environment:
      HOST: http://0.0.0.0
      PORT: 9291
      REQUEST_BODY_SIZE: 100mb
      RATE_LIMIT_WINDOWS_MS: 60000
      RATE_LIMIT_MAX: 1000
      WORKSPACE: /workspace
      CNN_MYSQL: '{"host":"mysql","port":3306,"user":"test","password":"test","database":"test"}'
      CNN_POSTGRES: '{"host":"postgres","port":5432,"user":"test","password":"test","database":"test"}'
      CNN_MONGODB: '{"url":"mongodb://test:test@mongodb:27017","database":"test"}'
      CNN_INSIGHTS: '{"host":"postgres","port":5432,"user":"test","password":"test","database":"insights"}'
      QUEUE_CONFIG: '{"clientId": "northwind", "brokers": ["kafka:9092"]}'
    ports:
      - 9291:9291
    expose:
      - 9291  
    networks:
      - northwind
    volumes:
      - ./:/workspace
```

### Configure Schema

In the schema we will configure:

- Domain
  - Entities
- Infrastructure
  - Mappings of domain entities to database tables
  - Data sources for Crm, Catalog, Ordering and Insights
  - Stages with conditions to define which domain entity applies to each data source
  - Service
  - Consumers to listen to messages from a kafka topic
- Application  
  - Listeners to synchronize data between databases

In the creation of the project the schema was created but without any entity.
Modify the configuration of lambdaorm.yaml with the following content

```yaml
domain:  
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
  service:
    host: $HOST
    port: $PORT
    requestBodySize: $REQUEST_BODY_SIZE
    rateLimitWindowMs: $RATE_LIMIT_WINDOWS_MS
    rateLimitMax: $RATE_LIMIT_MAX
  queue: 
    config: $QUEUE_CONFIG
    consumers:
      - name: syncInsights
        config:
          groupId: group1
        subscribe:
          topic: insights-sync
          fromBeginning: true
        execute: orm.execute(message.expression,message.data, {stage:"insights"})    
application:
  listeners:
    - name: syncInsights
      on: [insert, bulkInsert, update, delete ]
      condition: options.stage.in("default","cqrs")
      after: queue.send("insights-sync",[{expression:expression,data:data}])  
```

**Listeners configuration:**

To synchronize data between databases, a listener is defined that will be executed after each insert, update, delete and bulk insert operation in the default and cqrs scenario. \
After each operation, a message is sent to the "insights-sync" topic with the expression and the data.

```yaml
...
application:
  listeners:
    - name: syncInsights
      on: [insert, bulkInsert, update, delete ]
      condition: options.stage.in("default","cqrs")
      after: queue.send("insights-sync",[{expression:expression,data:data}])  
```

**Consumer configuration:**

A consumer is defined that will listen to the "insights-sync" topic and execute the expression received in the "insights" scenario.

```yaml
...
infrastructure:
  ...
  queue: 
    consumers:
      - name: syncInsights
        config:
          groupId: group1
        subscribe:
          topic: insights-sync
          fromBeginning: true
        execute: orm.execute(message.expression,message.data, {stage:"insights"})
...            
```

### Create .env file

Create file ".env" with the following content:

```sh
CNN_MYSQL={"host":"localhost","port":3306,"user":"test","password":"test","database":"test"}
CNN_POSTGRES={"host":"localhost","port":5432,"user":"test","password":"test","database":"test"}
CNN_MONGODB={"url":"mongodb://test:test@localhost:27017","database":"test"}
CNN_INSIGHTS={"host":"localhost","port":5432,"user":"test","password":"test","database":"insights"}
```

## Start

```sh
# Create infrastructure
docker-compose -p lambdaorm-lab up -d
# Configure databases
docker exec mysql  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "ALTER DATABASE test CHARACTER SET utf8 COLLATE utf8_general_ci;"
docker exec mysql  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "GRANT ALL ON *.* TO 'test'@'%' with grant option; FLUSH PRIVILEGES;"
docker exec postgres psql -U test -c "CREATE DATABASE insights" -W test
# create tables/collections
lambdaorm sync -e .env -s default
lambdaorm sync -e .env -s insights
```

Structure of the project:

```sh
├── data
│   ├── default-ddl-20231216T162738057Z-sync-Catalog.sql
│   ├── default-ddl-20231216T162738058Z-sync-Crm.sql
│   ├── default-ddl-20231216T162738059Z-sync-Ordering.json
│   ├── default-model.json
│   ├── insights-ddl-20231216T162746066Z-sync-Insights.sql
│   └── insights-model.json
├── docker-compose.yaml
├── .env
└── lambdaORM.yaml
```

Apps:

- [orm swagger](http://localhost:9291)
- [kafdrop](http://localhost:19000)

## Import Data

for the import we will download the following file.

```sh
# download data.json
wget https://raw.githubusercontent.com/FlavioLionelRita/lambdaorm-labs/main/source/northwind/data.json
# import data.json
curl -X POST -H "Content-Type: application/json" -d @data.json http://localhost:9291/stages/default/import
```

## Test

### Execute on default Stage

```sh
curl -X POST "http://localhost:9291/execute?format=beautiful" -H "Content-Type: application/json" -d '{"expression": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)","data":"{\"customerId\": \"CENTC\"}", "options":"{\"stage\": \"default\"}"}'
```

Result:

```json
[
  {
    "id": 12,
    "customerId": "CENTC",
    "orderDate": "1996-07-18T00:00:00.000+02:00",
    "details": [
      {
        "subTotal": 80,
        "product": {
          "name": "Sir Rodney's Scones"
        }
      },
      {
        "subTotal": 20.8,
        "product": {
          "name": "Gravad lax"
        }
      }
    ],
    "customer": {
      "name": "Centro comercial Moctezuma"
    }
  }
]
```

### Execute on CQRS Stage

```sh
curl -X POST "http://localhost:9291/execute?format=beautiful" -H "Content-Type: application/json" -d '{"expression": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)","data":"{\"customerId\": \"CENTC\"}", "options":"{\"stage\": \"cqrs\"}"}'
```

Result:

```json
[
  {
    "id": 12,
    "customerId": "CENTC",
    "orderDate": "1996-07-18T00:00:00.000Z",
    "details": [
      {
        "subTotal": 80,
        "product": {
          "name": "Sir Rodney's Scones"
        }
      },
      {
        "subTotal": 20.8,
        "product": {
          "name": "Gravad lax"
        }
      }
    ],
    "customer": {
      "name": "Centro comercial Moctezuma"
    }
  }
]
```

## End

```sh
docker-compose -p lambdaorm-lab down
rm -rf data
```
