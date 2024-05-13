# CLI - Client

**In this laboratory we will see:**

- How to set up the lambda ORM service
- How to consume the lambda ORM service from a CLI Client

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
      REQUEST_BODY_SIZE: 100mb
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

### Download data for import

for the import we will download the following file.

```sh
wget https://raw.githubusercontent.com/lambda-orm/lambdaorm-labs/main/source/northwind/data.json
```

### Service Structure

```sh
├── orm_state
├── orm_state.json
├── docker-compose.yaml
├── .env
└── lambdaORM.yaml
```

### Create Service Infrastructure

```sh
# create infrastructure
docker-compose -p lambdaorm-lab up -d
# create tables in database
lambdaorm push -e .env
# populate data
lambdaorm import -e .env -d ./data.json
# exit the service folder
cd .. 
```

### Test Service

**Query:**

```sh
curl -X POST "http://localhost:9291/execute?format=beautiful" -H "Content-Type: application/json" -d '{"query": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)","data":"{\"customerId\": \"CENTC\"}", "options":"{\"stage\": \"default\"}"}'
```

**Result:**

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

## CLI as client

### Queries

#### Shows some fields of the first product:

```sh
lambdaorm execute -u http://localhost:9291 -q "Products.first(p => ({ category: p.category.name, name: p.name, quantity: p.quantity }))"
```

**Result:**

```json
[{"category":"Beverages","name":"Chai","quantity":"10 boxes x 20 bags"}]
```

#### lists details of orders that meet a filter and sorts the records

the values to filter are passed as parameters:

```sh
lambdaorm execute -u http://localhost:9291 -o beautiful -q "Orders.details.filter(p => between(p.order.orderDate, from, to) && p.unitPrice > minValue).map(p => ({ category: p.product.category.name, product: p.product.name, unitPrice: p.unitPrice, quantity: p.quantity })).sort(p => [p.category, p.product]).page(1,2)" -d "{ \"minValue\": 10, \"from\": \"1997-01-01\", \"to\": \"1997-12-31\" }"
```

**Result:**

```json
[
  {
    "category": "Beverages",
    "product": "Chai",
    "unitPrice": 14.4,
    "quantity": 10
  },
  {
    "category": "Beverages",
    "product": "Chai",
    "unitPrice": 14.4,
    "quantity": 24
  }
]
```

#### List the maximum price by category, ordered by descending price and filtering by maximum price greater than 100

```sh
lambdaorm execute -u http://localhost:9291 -q "Products.having(p => max(p.price) > 100).map(p => ({ category: p.category.name, largestPrice: max(p.price) })).sort(p => desc(p.largestPrice))"
```

**Result:**

```json
[{"category":"Beverages","largestPrice":263.5},{"category":"Meat/Poultry","largestPrice":123.79}]
```

#### distinct category of products:

```sh
lambdaorm execute -u http://localhost:9291 -q "Products.distinct(p => ({ quantity: p.quantity, category: p.category.name })).sort(p => p.category).page(1,3)"
```

**Result:**

```json
[{"quantity":"24 - 0.5 l bottles","category":"Beverages"},{"quantity":"16 - 500 g tins","category":"Beverages"},{"quantity":"500 ml","category":"Beverages"}]
```

#### Returns an order including customer fields, order detail, product and category:

```sh
lambdaorm execute -u http://localhost:9291 -o beautiful -q "Orders.filter(p => p.id == id).include(p => [p.customer.map(p => p.name), p.details.include(p => p.product.include(p => p.category.map(p => p.name)).map(p => p.name)).map(p => [p.quantity, p.unitPrice])])" -d "{\"id\": 1}"
```

**Result:**

```json
[
  {
    "id": 1,
    "customerId": "VINET",
    "orderDate": "1996-07-04T00:00:00.000Z",
    "customer": {
      "name": "Vins et alcools Chevalier"
    },
    "details": [
      {
        "quantity": 12,
        "unitPrice": 14,
        "product": {
          "name": "Queso Cabrales",
          "category": {
            "name": "Dairy Products"
          }
        }
      },
      {
        "quantity": 10,
        "unitPrice": 9.8,
        "product": {
          "name": "Singaporean Hokkien Fried Mee",
          "category": {
            "name": "Grains/Cereals"
          }
        }
      },
      {
        "quantity": 5,
        "unitPrice": 34.8,
        "product": {
          "name": "Mozzarella di Giovanni",
          "category": {
            "name": "Dairy Products"
          }
        }
      }
    ]
  }
]
```

#### Parameters

```sh
lambdaorm parameters -u http://localhost:9291 -o beautiful -q "Orders.filter(p => p.id == id).include(p => [p.customer.map(p => p.name), p.details.include(p => p.product.include(p => p.category.map(p => p.name)).map(p => p.name)).map(p => [p.quantity, p.unitPrice])])"
```

**Result:**

```json
[
  {
    "name": "id",
    "type": "integer"
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
          },
          {
            "name": "category",
            "type": "Categories",
            "children": [
              {
                "name": "LambdaOrmParentId",
                "type": "any"
              }
            ]
          }
        ]
      }
    ]
  }
]
```

#### Model

```sh
lambdaorm model -u http://localhost:9291 -o beautiful -q "Orders.filter(p => p.id == id).include(p => [p.customer.map(p => p.name), p.details.include(p => p.product.include(p => p.category.map(p => p.name)).map(p => p.name)).map(p => [p.quantity, p.unitPrice])])"
```

**Result:**

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
  },
  {
    "name": "details",
    "type": "Orders.details[]",
    "children": [
      {
        "name": "quantity",
        "type": "decimal"
      },
      {
        "name": "unitPrice",
        "type": "decimal"
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
          },
          {
            "name": "category",
            "type": "Categories",
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
      }
    ]
  }
]
```

#### Constraint

```sh
lambdaorm constraints -u http://localhost:9291 -o beautiful -q "Orders.bulkInsert().include(p => p.details)"
```

**Result:**

```json
{
  "entity": "Orders",
  "constraints": [
    {
      "message": "Cannot be null property customerId in entity Orders",
      "condition": "isNotNull(customerId)"
    }
  ],
  "children": [
    {
      "entity": "Orders.details",
      "constraints": [
        {
          "message": "Cannot be null property orderId in entity Orders.details",
          "condition": "isNotNull(orderId)"
        },
        {
          "message": "Cannot be null property productId in entity Orders.details",
          "condition": "isNotNull(productId)"
        }
      ]
    }
  ]
}
```

#### Plan

```sh
lambdaorm plan -u http://localhost:9291 -o beautiful -q "Orders.filter(p => p.id == id).include(p => [p.customer.map(p => p.name), p.details.include(p => p.product.include(p => p.category.map(p => p.name)).map(p => p.name)).map(p => [p.quantity, p.unitPrice])])"
```

**Result:**

```json
{
  "entity": "Orders",
  "dialect": "PostgreSQL",
  "source": "default",
  "sentence": "SELECT o.OrderID AS \"id\", o.CustomerID AS \"customerId\", o.OrderDate AS \"orderDate\", o.CustomerID AS \"__customerId\", o.OrderID AS \"__id\" FROM Orders o  WHERE o.OrderID = $1 ",
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
```

## End

To finish the lab we execute the following commands to drop the tables and stop the containers and delete them associated to service

```sh
cd service
lambdaorm drop -e .env
docker-compose -p lambdaorm-lab down
```
