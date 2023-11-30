# Northwind lab

## Start

```sh
docker-compose -p lambdaorm-svc up -d
mysql -h 0.0.0.0 -P 3306 -u northwind -pnorthwind northwind < northwind-mysql.sql
```

## Test

**Model:**

```sh
curl -X POST "http://localhost:9291/api/model?format=beautiful" -H "Content-Type: application/json" -d '{"expression": "Orders.filter(p=>p.id==id).include(p=>p.details)"}'
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
    "name": "employeeId",
    "type": "integer"
  },
  {
    "name": "orderDate",
    "type": "dateTime"
  },
  {
    "name": "requiredDate",
    "type": "date"
  },
  {
    "name": "shippedDate",
    "type": "date"
  },
  {
    "name": "shipViaId",
    "type": "integer"
  },
  {
    "name": "freight",
    "type": "decimal"
  },
  {
    "name": "name",
    "type": "string"
  },
  {
    "name": "address",
    "type": "string"
  },
  {
    "name": "city",
    "type": "string"
  },
  {
    "name": "region",
    "type": "string"
  },
  {
    "name": "postalCode",
    "type": "string"
  },
  {
    "name": "country",
    "type": "string"
  },
  {
    "name": "details",
    "type": "Orders.details[]",
    "children": [
      {
        "name": "orderId",
        "type": "integer"
      },
      {
        "name": "productId",
        "type": "integer"
      },
      {
        "name": "unitPrice",
        "type": "decimal"
      },
      {
        "name": "quantity",
        "type": "decimal"
      },
      {
        "name": "discount",
        "type": "decimal"
      },
      {
        "name": "LambdaOrmParentId",
        "type": "integer"
      }
    ]
  }
]
```

**Parameters:**

```sh
curl -X POST "http://localhost:9291/api/parameters?format=beautiful" -H "Content-Type: application/json" -d '{"expression": "Orders.filter(p=>p.id==id).include(p=>p.details)"}'
```

Result:

```json
[
  {
    "name": "id",
    "type": "integer"
  },
  {
    "name": "details",
    "type": "Orders.details",
    "children": [
      {
        "name": "LambdaOrmParentId",
        "type": "any"
      }
    ]
  }
]
```

**Constraints:**

```sh
curl -X POST "http://localhost:9291/api/constraints?format=beautiful" -H "Content-Type: application/json" -d '{"expression": "Orders.filter(p=>p.id==id).include(p=>p.details)"}'
```

Result:

```json
{
  "entity": "Orders",
  "constraints": [],
  "children": [
    {
      "entity": "Orders.details",
      "constraints": []
    }
  ]
}
```

**Sentence:**

```sh
curl -X POST "http://localhost:9291/api/sentence?format=beautiful" -H "Content-Type: application/json" -d '{"expression": "Orders.filter(p=>p.id==id).include(p=>p.details)"}'
```

Result:

```json
{
  "entity": "Orders",
  "dialect": "MySQL",
  "source": "default",
  "sentence": "SELECT o.OrderID AS id, o.CustomerID AS customerId, o.EmployeeID AS employeeId, o.OrderDate AS orderDate, o.RequiredDate AS requiredDate, o.ShippedDate AS shippedDate, o.ShipVia AS shipViaId, o.Freight AS freight, o.ShipName AS name, o.ShipAddress AS address, o.ShipCity AS city, o.ShipRegion AS region, o.ShipPostalCode AS postalCode, o.ShipCountry AS country, o.OrderID AS `__id` FROM Orders o  WHERE o.OrderID = ? ",
  "children": [
    {
      "entity": "Orders.details",
      "dialect": "MySQL",
      "source": "default",
      "sentence": "SELECT o1.OrderID AS orderId, o1.ProductID AS productId, o1.UnitPrice AS unitPrice, o1.Quantity AS quantity, o1.Discount AS discount, o1.OrderID AS LambdaOrmParentId FROM `Order Details` o1  WHERE  o1.OrderID IN (?) ",
      "children": []
    }
  ]
}
```

**Execute:**

```sh
curl -X POST "http://localhost:9291/api/execute?format=beautiful" -H "Content-Type: application/json" -d '{"expression": "Orders.filter(p=>p.id==id).include(p=>p.details)", "data": "{\"id\": 10248}" }'
```

Result:

```json
[
  {
    "id": 10248,
    "customerId": "VINET",
    "employeeId": 5,
    "orderDate": "1996-07-04T00:00:00.000Z",
    "requiredDate": "1996-08-01T00:00:00.000Z",
    "shippedDate": "1996-07-16T00:00:00.000Z",
    "shipViaId": 3,
    "freight": 32.38,
    "name": "Vins et alcools Chevalier",
    "address": "59 rue de l-Abbaye",
    "city": "Reims",
    "region": null,
    "postalCode": "51100",
    "country": "France",
    "details": [
      {
        "orderId": 10248,
        "productId": 11,
        "unitPrice": 14,
        "quantity": 12,
        "discount": 0
      },
      {
        "orderId": 10248,
        "productId": 42,
        "unitPrice": 9.8,
        "quantity": 10,
        "discount": 0
      },
      {
        "orderId": 10248,
        "productId": 72,
        "unitPrice": 34.8,
        "quantity": 5,
        "discount": 0
      }
    ]
  }
]
```

## End

```sh
docker-compose -p lambdaorm-svc down --remove-orphans
docker volume rm lambdaorm-svc_mysql-data
docker volume rm lambdaorm-svc_mysql-log
```
