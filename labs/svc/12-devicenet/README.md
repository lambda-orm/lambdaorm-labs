# Service - DeviceNet

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
version: "3"
networks:
  devicenet:
    driver: bridge
services:
  postgres:
    container_name: postgres
    image: postgres:10
    restart: always
    environment:
      - POSTGRES_DB=keycloak
      - POSTGRES_USER=devicenet
      - POSTGRES_PASSWORD=devicenet
    ports:
      - 5432:5432
    networks:
      - devicenet
  keycloak:
    depends_on:
      - postgres
    image: quay.io/keycloak/keycloak:legacy
    container_name: keycloak
    environment:
      DB_VENDOR: POSTGRES
      DB_ADDR: postgres
      DB_SCHEMA: public
      DB_DATABASE: keycloak
      DB_USER: devicenet
      DB_PASSWORD: devicenet
      KEYCLOAK_USER: admin
      KEYCLOAK_PASSWORD: Pa55w0rd
    ports:
      - 8180:8080
    networks:
      - devicenet
  orm:
    depends_on:
      - postgres
    container_name: orm
    image: flaviorita/lambdaorm-svc:0.8.52
    restart: always  
    environment:
      HOST: http://localhost
      PORT: 9291
      REQUEST_BODY_SIZE: 100mb
      RATE_LIMIT_WINDOWS_MS: 60000
      RATE_LIMIT_MAX: 1000
      WORKSPACE: /workspace
      REALM_ID: devicenet
      USERS_SECRET_KEY: rifk863hmKSJDJ87hd*nhJ98
      DEVICES_SECRET_KEY: hhd843hf8HD7HDg65GD&^5
      CNN_POSTGRES: '{"host":"postgres","port":5432,"user":"devicenet","password":"devicenet","database":"devicenet"}'
    ports:
      - 9291:9291
    networks:
      - devicenet
    volumes:
      - ./:/workspace
```

Create database for test:

```sh
docker-compose -p "lambdaorm-lab" up -d
```

Initialize databases:

```sh
docker exec postgres psql -U devicenet -c "CREATE DATABASE devicenet" -W keycloak
```

## Complete Schema

In the creation of the project the schema was created but without any entity.
Modify the configuration of lambdaorm.yaml with the following content

```yaml
domain:
  enums:
    - name: DeviceType
      values:
      - name: phone
        value: phone
      - name: computer
        value: computer
      - name: robot
        value: robot
    - name: ComponentType
      values:
      - name: camera
        value: camera
      - name: microphone
        value: microphone
      - name: speaker
        value: speaker
      - name: gps
        value: gps
    - name: FileType
      values:
      - name: video
        value: video
      - name: audio
        value: audio
    - name: Role
      values:
      - name: admin
        value: admin
      - name: auditor
        value: auditor
      - name: operator
        value: operator
      - name: guest
        value: guest
  entities:
  - name: Basics
    abstract: true
    properties:
    - name: created
      type: dateTime
      default: now()
  - name: Positions
    abstract: true
    properties:
    - name: latitude
      type: decimal
    - name: longitude
      type: decimal
    - name: altitude
      type: decimal
  - name: Products
    extends: Basics
    abstract: true
    properties:
      - name: brand
        length: 32
      - name: model
        length: 32
      - name: serialNumber
        length: 32
  # model structure define
  - name: Users
    view: true
    extends: Basics
    primaryKey: ["username"]
    uniqueKey: ["email"]
    properties:
    - name: username
      length: 32
      required: true
    - name: firstname
      required: true
    - name: lastname
      required: true
    - name: fullmane
      view: true
      readExp: concat(lastname,", ",firstname)
    - name: email
      required: true
      length: 255
      readExp: mask(email)
    constraints:
    - message: invalid email
      condition: test(email,"^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$")
  - name: Groups
    extends: Basics
    primaryKey: ["id"]
    uniqueKey: ["name"]
    properties:
    - name: id
      length: 32
      default: lower(substring(replace(name," ","-"),0,32))
      required: true
    - name: name
      length: 32
      required: true
  - name: GroupUsers
    primaryKey: ["id"]
    uniqueKey: ["groupId", "username"]
    properties:
    - name: id
      default: "`${groupId}-${username}`"
      length: 64
      required: true
    - name: username
      length: 32
      required: true
    - name: groupId
      length: 32
      required: true
    - name: role
      length: 32
      required: true
      enum: Role
    relations:
    - name: group
      from: groupId
      entity: Groups
      to: id
      target: members
      targetComposite: true
    - name: user
      from: username
      entity: Users
      to: username
      target: members
  - name: Devices
    extends: Products
    primaryKey: ["id"]
    uniqueKey: ["name"]
    properties:
    # tipo + identificador (el identificador es de acuerdo al tipo , en un telefono es el imei, en una pc la mac)
    - name: id
      length: 32
      required: true
      default: 'concat(type,"-",switch(type){case"phone":imei;default:mac;})'
    - name: type
      length: 16
      required: true
      enum: DeviceType
    - name: name
      length: 32
      required: true
    - name: ownerId
      length: 32
      required: true
    - name: so
      length: 32
    - name: imei
      length: 16
    - name: imei2
      length: 16
    - name: mac
      length: 24
    - name: macBluetooth
      length: 24
    - name: ip
      length: 24
    - name: apiKey
      length: 255
    relations:
    - name: owner
      from: ownerId
      entity: Users
      to: username
      target: devices
  - name: Components
    extends: Products
    primaryKey: ["id"]
    uniqueKey: ["deviceId", "name"]
    properties:
    - name: id
      length: 50
      required: true
      # el ID del componente debe ser establecido por el  dispositivo, ejemplo  deviceID + name , example 233943849384483-cam01
      default: concat(deviceId,"-",lower(substring(replace(name," ","-"),0,16)))
    - name: deviceId
      length: 32
      required: true
    - name: name
      length: 16
      required: true
    - name: type
      length: 16
      required: true
      enum: ComponentType
    relations:
    - name: device
      from: deviceId
      entity: Devices
      to: id
      target: components
      targetComposite: true
  # model status
  - name: DeviceStatuses
    extends: Basics
    primaryKey: ["id"]
    indexes:
    - name: time
      fields: ["time"]
    properties:
    - name: id
      type: integer
      required: true
      autoincrement: true
    - name: deviceId
      length: 32
      required: true
    - name: time
      type: dateTime
    relations:
    - name: device
      from: deviceId
      entity: Devices
      to: id
      target: statuses
  - name: DevicePositionStatuses
    extends: Positions
    primaryKey: ["id"]
    properties:
    - name: id
      type: integer
      required: true
    relations:
    - name: status
      type: oneToOne
      from: id
      entity: DevicePerformanceStatuses
      to: id
      target: performance
  - name: DevicePerformanceStatuses
    primaryKey: ["id"]
    properties:
    - name: id
      type: integer
      required: true
    - name: cpu
      type: decimal
    - name: gpu
      type: decimal
    - name: memory
      type: decimal
    - name: wifiSignal
      type: decimal
    - name: battery
      type: decimal
    - name: temperature
      type: decimal
    relations:
    - name: status
      type: oneToOne
      from: id
      entity: DevicePerformanceStatuses
      to: id
      target: position
  - name: Files
    #  use MinIO for save files, field file is path
    extends: Basics
    primaryKey: ["id"]
    properties:
    #  el id es el fullpath del file, ejemplo: /deviceId/componentId/202202100922.mp3
    - name: id
      length: 255
      required: true
    - name: type
      length: 16
      required: true
      enum: FileType
    - name: deviceId
      length: 32
      required: true
    - name: componentId
      length: 50
    - name: startDate
      type: dateTime
      required: true
    - name: endDate
      type: dateTime
      required: true
    relations:
    - name: device
      from: deviceId
      entity: Devices
      to: id
      target: files
    - name: component
      from: componentId
      entity: Components
      to: id
      target: files
    constraints:
    - message: endDate cannot be less than startDate
      condition: startDate<=endDate
infrastructure:
  views:
  - name: default
    entities:
    - name: Devices
      properties:
      - name: apyKey
        readExp: "***"
  - name: collector
    entities:
    - name: Users
      exclude: true
    - name: Groups
      exclude: true
    - name: GroupUsers
      exclude: true
  - name: admin
    entities: []
  mappings:
  - name: default
  - name: Keycloak
    entities:
    - name: Users
      mapping: user_entity
      filter: realmId == "${REALM_ID}"
      properties:
      - name: username
        mapping: username
      - name: firstname
        mapping: first_name
      - name: lastname
        mapping: last_name
      - name: email
        mapping: email
      - name: created
        mapping: created_timestamp
        readMappingExp: millisecondToDate(created/1000)
      - name: realmId
        length: 255
        mapping: realm_id
  sources:
  - name: default
    mapping: default
    dialect: PostgreSQL
    connection: ${CNN_POSTGRES}
  - name: Keycloak
    mapping: Keycloak
    dialect: PostgreSQL
    connection: ${CNN_KEYCLOAK}
  stages:
  - name: default
    dataSources:
    - name: default
      condition: entity != "Users"
    - name: Keycloak
      condition: entity == "Users"
```

### Create .env file

Create file ".env" with the following content:

```sh
CNN_POSTGRES={"host":"localhost","port":5432,"user":"devicenet","password":"devicenet","database":"devicenet"}
REALM_ID=devicenet
USERS_SECRET_KEY=rifk863hmKSJDJ87hd*nhJ98
DEVICES_SECRET_KEY=hhd843hf8HD7HDg65GD&^5
```

### Push

```sh
lambdaorm push -e .env -s default
```

Structure of the project:

```sh
├── orm_state
│   ├── default-ddl-20231211T102254673Z-push-default.sql
│   └── default-model.json
├── docker-compose.yaml
└── lambdaORM.yaml
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
  "time": "2023-12-10T12:51:38.290Z"
}
```

### Model

```sh
curl -X POST "http://localhost:9291/execute?format=beautiful" \
-H "Content-Type: application/json" \
-d '{"query": "Users.bulkInsert()",
"options": "{\"stage\": \"default\"}",
"data": "
    [
      {
        \"username\": \"flaviolrita\",
        \"firstname\": \"Flavio Lionel\",
        \"lastname\": \"Rita\",
        \"email\": \"flaviolrita@hotmail.com\"
      },
      {
        \"username\": \"griss512\",
        \"firstname\": \"Gricelda Rocio\",
        \"lastname\": \"Puchuri Corilla\",
        \"email\": \"griss512@hotmail.com\"
      },
      {
        \"username\": \"micaela\",
        \"firstname\": \"Micaela Valentina\",
        \"lastname\": \"Rita Puchuri\",
        \"email\": \"flaviolrita@hotmail.com\"
      },
      {
        \"username\": \"joaquin\",
        \"firstname\": \"Joaquin Ignacio\",
        \"lastname\": \"Rita Puchuri\",
        \"email\": \"flaviolrita@hotmail.com\"
      }
    ]"
}'
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
curl -X POST "http://localhost:9291/parameters?format=beautiful" -H "Content-Type: application/json" -d '{"query": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)"}'
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
curl -X POST "http://localhost:9291/constraints?format=beautiful" -H "Content-Type: application/json" -d '{"query": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)"}'
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

### Plan on default Stage

```sh
curl -X POST "http://localhost:9291/plan?format=beautiful" -H "Content-Type: application/json" -d '{"query": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)", "options":"{\"default\": \"cqrs\"}"}'
```

Result:

```sh
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

### Plan on CQRS Stage

```sh
curl -X POST "http://localhost:9291/plan?format=beautiful" -H "Content-Type: application/json" -d '{"query": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)", "options":"{\"stage\": \"cqrs\"}"}'
```

Result:

```json
{
  "entity": "Orders",
  "dialect": "PostgreSQL",
  "source": "Insights",
  "sentence": "SELECT o.OrderID AS \"id\", o.CustomerID AS \"customerId\", o.OrderDate AS \"orderDate\", o.OrderID AS \"__id\", o.CustomerID AS \"__customerId\" FROM Orders o  WHERE o.CustomerID = $1 ORDER BY o.OrderDate asc  OFFSET 0 LIMIT 1 ",
  "children": [
    {
      "entity": "Orders.details",
      "dialect": "PostgreSQL",
      "source": "Insights",
      "sentence": "SELECT (o1.Quantity * o1.UnitPrice) AS \"subTotal\", o1.ProductID AS \"__productId\", o1.OrderID AS \"LambdaOrmParentId\" FROM \"Order Details\" o1  WHERE  o1.OrderID IN ($1) ",
      "children": [
        {
          "entity": "Products",
          "dialect": "PostgreSQL",
          "source": "Insights",
          "sentence": "SELECT p.ProductName AS \"name\", p.ProductID AS \"LambdaOrmParentId\" FROM Products p  WHERE  p.ProductID IN ($1) "
        }
      ]
    },
    {
      "entity": "Customers",
      "dialect": "PostgreSQL",
      "source": "Insights",
      "sentence": "SELECT c.CompanyName AS \"name\", c.CustomerID AS \"LambdaOrmParentId\" FROM Customers c  WHERE  c.CustomerID IN ($1) "
    }
  ]
}
```

### Execute on default Stage

```sh
curl -X POST "http://localhost:9291/execute?format=beautiful" -H "Content-Type: application/json" -d '{"query": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)","data":"{\"customerId\": \"CENTC\"}", "options":"{\"stage\": \"default\"}"}'
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
curl -X POST "http://localhost:9291/execute?format=beautiful" -H "Content-Type: application/json" -d '{"query": "Orders.filter(p=>p.customerId==customerId).include(p=>[p.details.include(p=>p.product.map(p=>p.name)).map(p=>{subTotal:p.quantity*p.unitPrice}),p.customer.map(p=>p.name)]).order(p=>p.orderDate).page(1,1)","data":"{\"customerId\": \"CENTC\"}", "options":"{\"stage\": \"cqrs\"}"}'
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
lambdaorm drop -e .env -s default
docker-compose -p lambdaorm-lab down
```

Structure of the project:

```sh
├── orm_state
│   ├── default-ddl-20231211T102254673Z-push-default.sql
│   └── default-ddl-20231211T110104970Z-clean-default.sql
├── docker-compose.yaml
└── lambdaORM.yaml
```
