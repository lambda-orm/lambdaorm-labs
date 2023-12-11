# Service - Northwind Multiples Datasources

In this laboratory we will see:

Creating the northwind sample database tables and loading it with sample data.
This database presents several non-standard cases such as:
	- Name of tables and fields with spaces
	- Tables with composite primary keys
	- Tables with autonumeric ids and others with ids strings

Since this is the database that was used for many examples and unit tests, you can test the example queries that are in the documentation.
We will also see some example queries to execute from CLI

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

## Create database for test

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
  orm:
    depends_on:
      - mysql      
      - postgres
      - mongodb
    container_name: orm
    image: flaviorita/lambdaorm-svc:0.8.52
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
    ports:
      - 9291:9291
    expose:
      - 9291  
    networks:
      - northwind
    volumes:
      - ./:/workspace
```

Create database for test:

```sh
docker-compose -p "lambdaorm-lab" up -d
```

## Complete Schema

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
  stages:
  - name: default
    sources:
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
```

### Create .env file

Create file ".env" with the following content:

```sh
CNN_MYSQL={"host":"localhost","port":3306,"user":"test","password":"test","database":"test"}
CNN_POSTGRES={"host":"localhost","port":5432,"user":"test","password":"test","database":"test"}
CNN_MONGODB={"url":"mongodb://test:test@localhost:27017","database":"test"}
```

### Sync

```sh
lambdaorm sync -e ".env"
```

### Populate Data

for the import we will download the following file.

```sh
wget https://raw.githubusercontent.com/FlavioLionelRita/lambdaorm-labs/main/source/northwind/data.json
```

then we execute

```sh
lambdaorm import -e ".env" -d ./data.json
```

## Service endpoints

### Ping

```sh
curl -X GET "http://localhost:9291/ping?format=beautiful"
```

Result:

```json
{
  "message": "pong",
  "time": "2023-12-08T19:41:00.543Z"
}
```

### Model

```sh
curl -X POST "http://localhost:9291/model?format=beautiful" -H "Content-Type: application/json" -d '{"expression": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)"}'
```

Result:

```json
[
  {
    "name": "id",
    "type": "integer"
  },
  {
    "name": "customerId",
    "type": "string"
  },
  {
    "name": "orderDate",
    "type": "dateTime"
  },
  {
    "name": "details",
    "type": "Orders.details[]",
    "children": [
      {
        "name": "subTotal",
        "type": "number"
      },
      {
        "name": "LambdaOrmParentId",
        "type": "integer"
      },
      {
        "name": "product",
        "type": "Products",
        "children": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "LambdaOrmParentId",
            "type": "integer"
          }
        ]
      }
    ]
  },
  {
    "name": "customer",
    "type": "Customers",
    "children": [
      {
        "name": "name",
        "type": "string"
      },
      {
        "name": "LambdaOrmParentId",
        "type": "string"
      }
    ]
  }
]
```

### Parameters

```sh
curl -X POST "http://localhost:9291/parameters?format=beautiful" -H "Content-Type: application/json" -d '{"expression": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)"}'
```

Result:

```json
[
  {
    "name": "customerId",
    "type": "string"
  },
  {
    "name": "details",
    "type": "Orders.details",
    "children": [
      {
        "name": "LambdaOrmParentId",
        "type": "any"
      },
      {
        "name": "product",
        "type": "Products",
        "children": [
          {
            "name": "LambdaOrmParentId",
            "type": "any"
          }
        ]
      }
    ]
  },
  {
    "name": "customer",
    "type": "Customers",
    "children": [
      {
        "name": "LambdaOrmParentId",
        "type": "any"
      }
    ]
  }
]
```

### Constraints

```sh
curl -X POST "http://localhost:9291/constraints?format=beautiful" -H "Content-Type: application/json" -d '{"expression": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)"}'
```

Result:

```json
{
  "entity": "Orders",
  "constraints": [],
  "children": [
    {
      "entity": "Orders.details",
      "constraints": [],
      "children": [
        {
          "entity": "Products",
          "constraints": []
        }
      ]
    },
    {
      "entity": "Customers",
      "constraints": []
    }
  ]
}
```

### Plan

```sh
curl -X POST "http://localhost:9291/plan?format=beautiful" -H "Content-Type: application/json" -d '{"expression": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)"}'
```

Result:

```json
{
  "entity": "Orders",
  "dialect": "MongoDB",
  "source": "Ordering",
  "sentence": "[{ \"$match\" : { \"CustomerID\":{{customerId}} } }, { \"$project\" :{ \"_id\": 0 , \"id\":\"$_id\", \"customerId\":\"$CustomerID\", \"orderDate\":\"$OrderDate\", \"__id\":\"$_id\", \"__customerId\":\"$CustomerID\" ,\"details\": { \"$map\":{ \"input\": \"$\\\"Order Details\\\"\", \"in\": { \"subTotal\":{ \"$multiply\" :[\"$$this.Quantity\",\"$$this.UnitPrice\"] }, \"__productId\":\"$$this.ProductID\", \"LambdaOrmParentId\":\"$$this.OrderID\" } }} }} , { \"$sort\" :{ \"OrderDate\":1 } } , { \"$skip\" : 0 }, { \"$limit\" : 1 } , { \"$project\": { \"_id\": 0 } }]",
  "children": [
    {
      "entity": "Orders.details",
      "dialect": "MongoDB",
      "source": "Ordering",
      "sentence": "[{ \"$unwind\" : \"$\\\"Order Details\\\"\" }, { \"$replaceRoot\": { \"newRoot\": \"$\\\"Order Details\\\"\" } }, { \"$match\" : { \"OrderID\":{ \"$in\" :[{{LambdaOrmParentId}}]} } }, { \"$project\" :{ \"_id\": 0 , \"subTotal\":{ \"$multiply\" :[\"$Quantity\",\"$UnitPrice\"] }, \"__productId\":\"$ProductID\", \"LambdaOrmParentId\":\"$OrderID\" }} , { \"$project\": { \"_id\": 0 } }]",
      "children": [
        {
          "entity": "Products",
          "dialect": "MySQL",
          "source": "Catalog",
          "sentence": "SELECT p.ProductName AS name, p.ProductID AS LambdaOrmParentId FROM Products p  WHERE  p.ProductID IN (?) "
        }
      ]
    },
    {
      "entity": "Customers",
      "dialect": "PostgreSQL",
      "source": "Crm",
      "sentence": "SELECT c.CompanyName AS \"name\", c.CustomerID AS \"LambdaOrmParentId\" FROM Customers c  WHERE  c.CustomerID IN ($1) "
    }
  ]
}
```

### Execute

```sh
curl -X POST "http://localhost:9291/execute?format=beautiful" -H "Content-Type: application/json" -d '{"expression": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)","data":"{\"customerId\": \"CENTC\"}"}'
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

## End

```sh
lambdaorm drop -e ".env"
docker-compose -p lambdaorm-lab down
```