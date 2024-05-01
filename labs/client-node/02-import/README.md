# Node Client - Import data

**In this laboratory we will see:**

- how to create a project that uses lambda ORM with CLI
- How configure the schema
- How to synchronize the database  with lambda ORM CLI
- How to set up the lambda ORM service
- How to consume the lambda ORM service from a Node client
- How to import data using Node client and lambda ORM service
- How to drop a schema using lambda CLI

## Install lambda ORM CLI

Install the package globally to use the CLI commands to help you create and maintain projects

```sh
npm install lambdaorm-cli -g
```

## Create service

will create the service folder with the basic structure.

```sh
lambdaorm init -w service
cd service
```

### Configure Service Infrastructure

Create docker-compose file to create a postgres database and lambdaorm service

Create file "docker-compose.yaml"

```yaml
version: "3"
networks:
  northwind:
    driver: bridge  
services:
  postgres:
    container_name: postgres
    image: postgres:10
    restart: always
    environment:
      - POSTGRES_DB=northwind
      - POSTGRES_USER=northwind
      - POSTGRES_PASSWORD=northwind
    ports:
      - 5432:5432
    networks:
      - northwind   
  orm:
    depends_on:
      - postgres
    container_name: orm
    image: flaviorita/lambdaorm-svc:1.1.1
    restart: always  
    environment:
      HOST: http://0.0.0.0
      PORT: 9291
      REQUEST_BODY_SIZE: 1000mb
      RATE_LIMIT_WINDOWS_MS: 60000
      RATE_LIMIT_MAX: 1000
      WORKSPACE: /workspace
      POSTGRES_CNX: '{"host":"postgres","port":5432,"user":"northwind","password":"northwind","database":"northwind" }'
    ports:
      - 9291:9291
    expose:
      - 9291  
    networks:
      - northwind
    volumes:
      - ./:/workspace
```

### Configure Service Schema

In the schema we will configure:

- Domain
  - Entities
    - Address
    - Categories
    - Customers
    - Products
    - Orders
    - Orders.details
- Infrastructure
  - Default mapping
  - Default source
  - Default stage
  - Service

In the creation of the project the schema was created but without any entity.
Modify the configuration of lambdaorm.yaml with the following content

```yaml
domain:
  version: 0.0.1  
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
  sources:
    - name: default
      mapping: default
      dialect: PostgreSQL
      connection: ${POSTGRES_CNX}
  stages:
  - name: default
    sources:
      - name: default
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
POSTGRES_CNX={"host":"localhost","port":5432,"user":"northwind","password":"northwind","database":"northwind"}
```

### Service Structure

```sh
├── data
├── docker-compose.yaml
├── .env
└── lambdaORM.yaml
```

### Create Service Infrastructure

```sh
# create infrastructure
  docker-compose -p lambdaorm-lab up -d
# create tables in database
lambdaorm sync -e .env
# exit the service folder
cd .. 
```

## Create client

will create the client folder with the basic structure.

```sh
lambdaorm init -w client -u http://localhost:9291
cd client
```

When initializing, passing the service url, the lambdaorm.yaml file is created with the domain configuration and the service url is set.

### Create Client Infrastructure

Run the build command to create the model file and repositories.

```sh
lambdaorm build -l client-node --all -u http://localhost:9291
```

### Download data for import

for the import we will download the following file.

```sh
wget https://raw.githubusercontent.com/lambda-orm/lambdaorm-labs/main/source/northwind/data.json
```

### Source Code

Add file Typescript in the src folder add the file "index.ts" with the following content:

```ts
import { orm } from 'lambdaorm-client-node'
import fs from 'fs'
import path from'path'
( async () => {
 try { 
  orm.init('http://localhost:9291')
  // test connection
  console.log(await orm.general.ping())
  // Gets the content of the data.json file to insert the data
  const content = fs.readFileSync(path.join(__dirname,'../data.json'), 'utf-8')
  const data = JSON.parse(content)
  // Import data: ERROR
  await orm.stage.import('default',data)
  // query as string
  const query = `Orders.filter(p =>p.customerId==customerId)
                   .include(p=>[p.customer.map(p=>p.name),p.details
                    .include(p=>p.product
                     .include(p=>p.category.map(p=>p.name))
                    .map(p=>p.name))
                   .map(p=>[p.quantity,p.unitPrice])])`
  // get plan 
  const plan = await orm.plan(query, { stage: 'default'})
  console.log(JSON.stringify(plan,null,2))
  // execute query
  const result = await orm.execute(query, {customerId: 'CENTC' },{ stage: 'default'})
  console.log(JSON.stringify(result,null,2))
 } catch (error: any) {
  console.error(error)
 } finally {
  await orm.end()
 }
})()
```

### Structure

```sh
├── data
├── data.json
├── lambdaORM.yaml
├── package.json
├── package-lock.json
├── src
│   ├── index.ts
│   └── northwind
│       └── domain
│           ├── model.ts
│           ├── repositoryCategory.ts
│           ├── repositoryCustomer.ts
│           ├── repositoryOrdersDetail.ts
│           ├── repositoryOrder.ts
│           └── repositoryProduct.ts
└── tsconfig.json
```

### Run

```sh
npx tsc
node ./build/index.js
```

**Result:**

```sh
ping:
{ message: 'pong', time: '2023-12-13T13:48:07.687Z' }
plan:
{
  "entity": "Orders",
  "dialect": "PostgreSQL",
  "source": "default",
  "sentence": "SELECT o.OrderID AS \"id\", o.CustomerID AS \"customerId\", o.OrderDate AS \"orderDate\", o.CustomerID AS \"__customerId\", o.OrderID AS \"__id\" FROM Orders o  WHERE o.CustomerID = $1 ",
  "children": [
    {
      "entity": "Customers",
      "dialect": "PostgreSQL",
      "source": "default",
      "sentence": "SELECT c.CompanyName AS \"name\", c.CustomerID AS \"LambdaOrmParentId\" FROM Customers c  WHERE  c.CustomerID IN ($1) "
    },
    {
      "entity": "Orders.details",
      "dialect": "PostgreSQL",
      "source": "default",
      "sentence": "SELECT o1.Quantity AS \"quantity\", o1.UnitPrice AS \"unitPrice\", o1.ProductID AS \"__productId\", o1.OrderID AS \"LambdaOrmParentId\" FROM \"Order Details\" o1  WHERE  o1.OrderID IN ($1) ",
      "children": [
        {
          "entity": "Products",
          "dialect": "PostgreSQL",
          "source": "default",
          "sentence": "SELECT p.ProductName AS \"name\", p.CategoryID AS \"__categoryId\", p.ProductID AS \"LambdaOrmParentId\" FROM Products p  WHERE  p.ProductID IN ($1) ",
          "children": [
            {
              "entity": "Categories",
              "dialect": "PostgreSQL",
              "source": "default",
              "sentence": "SELECT c1.CategoryName AS \"name\", c1.CategoryID AS \"LambdaOrmParentId\" FROM Categories c1  WHERE  c1.CategoryID IN ($1) "
            }
          ]
        }
      ]
    }
  ]
}
query:
[
  {
    "id": 12,
    "customerId": "CENTC",
    "orderDate": "1996-07-17T22:00:00.000Z",
    "customer": {
      "name": "Centro comercial Moctezuma"
    },
    "details": [
      {
        "quantity": 10,
        "unitPrice": 8,
        "product": {
          "name": "Sir Rodney's Scones",
          "category": {
            "name": "Confections"
          }
        }
      },
      {
        "quantity": 1,
        "unitPrice": 20.8,
        "product": {
          "name": "Gravad lax",
          "category": {
            "name": "Seafood"
          }
        }
      }
    ]
  }
]
```

## End

To finish the lab we execute the following commands to drop the tables and stop the containers and delete them associated to service

```sh
cd ..
cd service
lambdaorm drop -e .env
docker-compose -p lambdaorm-lab down
```
