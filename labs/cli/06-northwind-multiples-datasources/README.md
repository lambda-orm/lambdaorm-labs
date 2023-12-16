# CLI Lab - Northwind multiple datasources

**In this laboratory we will see:**

- How to configure the schema to work with multiple data sources
- How to execute queries from CLI to obtain data from multiple data sources in the same query
- How to obtain the execution plan of a query and visualize which data sources the queries will be executed on

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

## Create database for test

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

Create MySql database for test:

```sh
docker-compose -p lambdaorm-lab up -d
```

Create user and set character:

```sh
docker exec lab-mysql  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "ALTER DATABASE test CHARACTER SET utf8 COLLATE utf8_general_ci;"
docker exec lab-mysql  mysql --host 127.0.0.1 --port 3306 -uroot -proot -e "GRANT ALL ON *.* TO 'test'@'%' with grant option; FLUSH PRIVILEGES;"
```

## Add environment file

Add file ".env"

```sh
CNN_MYSQL={"host":"localhost","port":3306,"user":"test","password":"test","database":"test"}
CNN_POSTGRES={"host":"localhost","port":5433,"user":"test","password":"test","database":"test"}
CNN_MONGODB={"url":"mongodb://test:test@localhost:27017","database":"test"}
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
```

### Sync

```sh
lambdaorm sync -e .env
```

It will generate:

```sh
── data
│   ├── default-ddl-20231129T090459304Z-sync-Catalog.sql
│   ├── default-ddl-20231129T090459305Z-sync-Crm.sql
│   ├── default-ddl-20231129T090459305Z-sync-Ordering.json
│   └── default-model.json
```

### Populate Data

for the import we will download the following file.

```sh
wget https://raw.githubusercontent.com/FlavioLionelRita/lambdaorm-labs/main/source/northwind/data.json
```

then we execute

```sh
lambdaorm import -e .env -d ./data.json
```

## Queries

### Shows some fields of the first product

```sh
lambdaorm execute -e ".env" -q "Products.first(p => ({ category: p.category.name, name: p.name, quantity: p.quantity, inStock: p.inStock }))"
```

Result:

```json
[
  {
    "category": "Beverages",
    "name": "Chai",
    "quantity": "10 boxes x 20 bags",
    "inStock": 39
  }
]
```

### Lists details of orders that meet a filter and sorts the records

the values to filter are passed as parameters

```sh
lambdaorm execute -e ".env" -q "Orders.details.filter(p => between(p.order.shippedDate, from, to) && p.unitPrice > minValue).map(p => ({ unitPrice: p.unitPrice, quantity: p.quantity })).include(p=>p.product.map(p=> [p.name,p.price]).include(p=> p.category) ).page(1,3)" -d "{ \"minValue\": 10, \"from\": \"1997-01-01\", \"to\": \"1997-12-31\" }"
```

Result:

```json
[
  {
    "unitPrice": 20.7,
    "quantity": 18,
    "product": {
      "name": "Nord-Ost Matjeshering",
      "price": 25.89,
      "category": {
        "id": 8,
        "name": "Seafood",
        "description": "Seaweed and fish"
      }
    }
  },
  {
    "unitPrice": 26.2,
    "quantity": 20,
    "product": {
      "name": "Perth Pasties",
      "price": 32.8,
      "category": {
        "id": 6,
        "name": "Meat/Poultry",
        "description": "Prepared meats"
      }
    }
  },
  {
    "unitPrice": 27.2,
    "quantity": 6,
    "product": {
      "name": "Camembert Pierrot",
      "price": 34,
      "category": {
        "id": 4,
        "name": "Dairy Products",
        "description": "Cheeses"
      }
    }
  }
]
```

### List the maximum price by category, ordered by descending price and filtering by maximum price greater than 100

```sh
lambdaorm execute -e ".env" -q "Products.having(p => max(p.price) > 100).map(p => ({ category: p.category.name, largestPrice: max(p.price) })).sort(p => desc(p.largestPrice))"
```

Result:

```json
[
  {
    "category": "Beverages",
    "largestPrice": 263.5
  },
  {
    "category": "Meat/Poultry",
    "largestPrice": 123.79
  }
]
```

### Distinct category of products

```sh
lambdaorm execute -e ".env" -q "Products.distinct(p => ({ quantity: p.quantity, category: p.category.name })).sort(p => p.category).page(1,3)"
```

Result:

```json
[
  {
    "quantity": "10 boxes x 20 bags",
    "category": "Beverages"
  },
  {
    "quantity": "24 - 12 oz bottles",
    "category": "Beverages"
  },
  {
    "quantity": "12 - 355 ml cans",
    "category": "Beverages"
  }
]
```

### Returns an order including customer fields, order detail, product and category

```sh
lambdaorm execute -e ".env" -q "Orders.filter(p => p.customerId == customerId).include(p => [p.customer.map(p => p.name), p.details.include(p => p.product.include(p => p.category.map(p => p.name)).map(p => p.name)).map(p => [p.quantity, p.unitPrice])]).page(1,2)" -d "{\"customerId\": \"HANAR\"}"
```

Result:

```json
[
  {
    "id": 3,
    "customerId": "HANAR",
    "employeeId": 4,
    "orderDate": "1996-07-08T00:00:00.000+02:00",
    "requiredDate": "1996-08-05",
    "shippedDate": "1996-07-12",
    "shipViaId": 2,
    "freight": 65.83,
    "name": "Hanari Carnes",
    "address": "Rua do Pao, 67",
    "city": "Rio de Janeiro",
    "region": "RJ",
    "postalCode": "05454-876",
    "country": "Brazil",
    "details": [
      {
        "quantity": 10,
        "unitPrice": 7.7,
        "product": {
          "name": "Jack's New England Clam Chowder",
          "category": {
            "name": "Seafood"
          }
        }
      },
      {
        "quantity": 35,
        "unitPrice": 42.4,
        "product": {
          "name": "Manjimup Dried Apples",
          "category": {
            "name": "Produce"
          }
        }
      },
      {
        "quantity": 15,
        "unitPrice": 16.8,
        "product": {
          "name": "Louisiana Fiery Hot Pepper Sauce",
          "category": {
            "name": "Condiments"
          }
        }
      }
    ],
    "customer": {
      "name": "Hanari Carnes"
    }
  },
  {
    "id": 6,
    "customerId": "HANAR",
    "employeeId": 3,
    "orderDate": "1996-07-10T00:00:00.000+02:00",
    "requiredDate": "1996-07-24",
    "shippedDate": "1996-07-16",
    "shipViaId": 2,
    "freight": 58.17,
    "name": "Hanari Carnes",
    "address": "Rua do Pao, 67",
    "city": "Rio de Janeiro",
    "region": "RJ",
    "postalCode": "05454-876",
    "country": "Brazil",
    "details": [
      {
        "quantity": 20,
        "unitPrice": 10,
        "product": {
          "name": "Gorgonzola Telino",
          "category": {
            "name": "Dairy Products"
          }
        }
      },
      {
        "quantity": 42,
        "unitPrice": 14.4,
        "product": {
          "name": "Chartreuse verte",
          "category": {
            "name": "Beverages"
          }
        }
      },
      {
        "quantity": 40,
        "unitPrice": 16,
        "product": {
          "name": "Maxilaku",
          "category": {
            "name": "Confections"
          }
        }
      }
    ],
    "customer": {
      "name": "Hanari Carnes"
    }
  }
]
```

### Plan

If we add the -o plan parameter we can see the different statements that will be executed and in what source they will be executed.

```sh
lambdaorm execute -e ".env" -o plan -q "Orders.filter(p => p.customerId == customerId).include(p => [p.customer.map(p => p.name), p.details.include(p => p.product.include(p => p.category.map(p => p.name)).map(p => p.name)).map(p => [p.quantity, p.unitPrice])]).page(1,2)" -d "{\"customerId\": \"HANAR\"}"
```

Result:

```json
{
  "entity": "Orders",
  "dialect": "MongoDB",
  "source": "Ordering",
  "sentence": "[{ \"$match\" : { \"CustomerID\":{{customerId}} } }, { \"$project\" :{ \"_id\": 0 , \"id\":\"$_id\", \"customerId\":\"$CustomerID\", \"employeeId\":\"$EmployeeID\", \"orderDate\":\"$OrderDate\", \"requiredDate\":\"$RequiredDate\", \"shippedDate\":\"$ShippedDate\", \"shipViaId\":\"$ShipVia\", \"freight\":\"$Freight\", \"name\":\"$ShipName\", \"address\":\"$ShipAddress\", \"city\":\"$ShipCity\", \"region\":\"$ShipRegion\", \"postalCode\":\"$ShipPostalCode\", \"country\":\"$ShipCountry\", \"__customerId\":\"$CustomerID\", \"__id\":\"$_id\" ,\"details\": { \"$map\":{ \"input\": \"$\\\"Order Details\\\"\", \"in\": { \"quantity\":\"$$this.Quantity\", \"unitPrice\":\"$$this.UnitPrice\", \"__productId\":\"$$this.ProductID\", \"LambdaOrmParentId\":\"$$this.OrderID\" } }} }} , { \"$sort\" :{ \"_id\":1 } } , { \"$skip\" : 0 }, { \"$limit\" : 2 } , { \"$project\": { \"_id\": 0 } }]",
  "children": [
    {
      "entity": "Customers",
      "dialect": "PostgreSQL",
      "source": "Crm",
      "sentence": "SELECT c.CompanyName AS \"name\", c.CustomerID AS \"LambdaOrmParentId\" FROM Customers c  WHERE  c.CustomerID IN ($1) "
    },
    {
      "entity": "Orders.details",
      "dialect": "MongoDB",
      "source": "Ordering",
      "sentence": "[{ \"$unwind\" : \"$\\\"Order Details\\\"\" }, { \"$replaceRoot\": { \"newRoot\": \"$\\\"Order Details\\\"\" } }, { \"$match\" : { \"OrderID\":{ \"$in\" :[{{LambdaOrmParentId}}]} } }, { \"$project\" :{ \"_id\": 0 , \"quantity\":\"$Quantity\", \"unitPrice\":\"$UnitPrice\", \"__productId\":\"$ProductID\", \"LambdaOrmParentId\":\"$OrderID\" }} , { \"$project\": { \"_id\": 0 } }]",
      "children": [
        {
          "entity": "Products",
          "dialect": "MySQL",
          "source": "Catalog",
          "sentence": "SELECT p.ProductName AS name, p.CategoryID AS `__categoryId`, p.ProductID AS LambdaOrmParentId FROM Products p  WHERE  p.ProductID IN (?) ",
          "children": [
            {
              "entity": "Categories",
              "dialect": "MySQL",
              "source": "Catalog",
              "sentence": "SELECT c1.CategoryName AS name, c1.CategoryID AS LambdaOrmParentId FROM Categories c1  WHERE  c1.CategoryID IN (?) "
            }
          ]
        }
      ]
    }
  ]
}
```

## End

Drop tables/collections and remove databases:

```sh
lambdaorm drop -e .env
docker-compose -p lambdaorm-lab down
```
