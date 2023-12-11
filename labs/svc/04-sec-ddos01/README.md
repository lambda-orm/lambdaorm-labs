# Service - Northwind DDoS (Distributed Denial of Service)

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

### Complete Schema

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
  sources:    
    - name: default
      mapping: default
      dialect: PostgreSQL
      connection: ${CNN_POSTGRES}    
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

### Add .env file

Create file ".env" with the following content:

```sh
CNN_POSTGRES={"host":"localhost","port":5432,"user":"northwind","password":"northwind","database":"northwind"}
```

### Download file data for import

```sh
wget https://raw.githubusercontent.com/FlavioLionelRita/lambdaorm-labs/main/source/northwind/data.json
```

## Configure infrastructure

### Prometheus configuration

Create folder "prometheus" and file "prometheus.yml"

```yaml
global:
  scrape_interval:     15s
  evaluation_interval: 15s
scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ['prometheus:9090']
  - job_name: "node"
    static_configs:
      - targets: ["orm:9291"]
```

### Grafana configuration

Create folder "grafana/provisioning/datasources"  and file "datasources.yml"

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    orgId: 1
    url: http://prometheus:9090
    basicAuth: false
    isDefault: true
    editable: true
```

Create folder "grafana/provisioning/dashboards"  and file "dashboard.yml"

```yaml
apiVersion: 1
providers:
- name: 'Prometheus'
  orgId: 1
  folder: ''
  type: file
  disableDeletion: false
  editable: true
  options:
    path: /etc/grafana/provisioning/dashboards
```

download the following dashboard file and add in folder "grafana/provisioning/dashboards":

```sh
wget https://raw.githubusercontent.com/FlavioLionelRita/lambdaorm-labs/main/source/grafana/nodejs_application_dashboard.json
```

### Add file docker-compose.yaml

```yaml
version: "3"
networks:
  backend:
  frontend:
services:
  postgres:
    container_name: postgres
    image: postgres:12-alpine
    restart: always
    environment:
      - POSTGRES_DB=northwind    
      - POSTGRES_USER=northwind
      - POSTGRES_PASSWORD=northwind
    ports:
      - 5432:5432  
    networks:
      - backend
    healthcheck:
      test: [ "CMD", "pg_isready", "-U", "northwind" ]
      interval: 3s
      timeout: 1s
      retries: 10  
  orm:
    depends_on:
      - postgres
    container_name: orm
    image: flaviorita/lambdaorm-svc:0.8.52
    restart: always  
    environment:
      HOST: http://0.0.0.0
      PORT: 9291
      NODE_ENV: production
      REQUEST_BODY_SIZE: 100mb
      RATE_LIMIT_WINDOWS_MS: 60000
      RATE_LIMIT_MAX: 1000
      WORKSPACE: /workspace
      CNN_POSTGRES: '{"host":"postgres","port":5432,"user":"northwind","password":"northwind","database":"northwind"}'
    ports:
      - 9291:9291
    expose:
      - 9291  
    networks:
      - frontend
      - backend
    volumes:
      - ./:/workspace      
    healthcheck:
      test: curl --fail http://localhost:9291/health || exit 1
      interval: 10s
      retries: 3
      start_period: 30s
      timeout: 5s 
  prometheus:
    depends_on:
      - orm
    image: prom/prometheus:v2.20.1
    container_name: prometheus
    volumes:
      - ./prometheus:/etc/prometheus      
    ports:
      - 9090:9090
    expose:
      - 9090
    networks:
      - backend
      - frontend
  grafana:
    depends_on:
      - prometheus
    image: grafana/grafana:7.1.5
    container_name: grafana    
    environment:
      - GF_AUTH_DISABLE_LOGIN_FORM=true
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
    ports:
      - 3000:3000
    expose:
      - 3000
    networks:
      - frontend
    volumes:      
      - ./grafana/provisioning:/etc/grafana/provisioning  
```

### Structure of the project

```sh
├── data
├── data.json
├── docker-compose.yaml
├── .env
├── grafana
│   └── provisioning
│       ├── dashboards
│       │   ├── dashboard.yml
│       │   └── nodejs_application_dashboard.json
│       └── datasources
│           └── datasource.yml
├── lambdaORM.yaml
└── prometheus
    └── prometheus.yml
```

## Create infrastructure

```sh
# create infrastructure
docker-compose -p "lambdaorm-lab" up -d
# create tables in database
lambdaorm sync -e .env
# populate data
lambdaorm import -e .env -d ./data.json 
```

## Endpoints

- [swagger](http://localhost:9291/api-docs)
- [metrics](http://localhost:9291/metrics)
- [Prometheus](http://localhost:9090)
- [Grafana](http://localhost:3000)
  - Dashboards
    - [NodeJS Application Dashboard](http://localhost:3000/d/PTSqcpJWk/nodejs-application-dashboard?orgId=1&refresh=5s)

## DDoS pentest tools

### Slowloris

It is advisable to run it from a different terminal than the one where the service is running.

```sh
cd ~/Desktop
git clone https://github.com/gkbrk/slowloris.git
cd slowloris
python3 slowloris.py localhost -p 9291 -s 1000 -v
```

### GoldenEye

It is advisable to run it from a different terminal than the one where the service is running.

```sh
git clone https://github.com/jseidl/GoldenEye.git
cd ./GoldenEye/
./goldeneye.py http://localhost:9291/metrics -s 1000 -w 10 
```

## End

```sh
lambdaorm drop -e .env
docker-compose -p lambdaorm-lab down
cd ..
rm -rf GoldenEye
rm -rf slowloris
```