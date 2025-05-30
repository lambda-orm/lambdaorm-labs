# Service Labs

It is a series of laboratories that show how to use the [lambda ORM Service](https://github.com/lambda-orm/lambdaorm-svc)

- [Documentation](https://github.com/lambda-orm/lambdaorm-svc/wiki)
- [Docker Hub](https://hub.docker.com/repository/docker/flaviorita/lambdaorm-svc/general)

## Northwind Simple Lab

**In this laboratory we will see:**

Stand up a postgres database and lambdaorm service using docker compose.
Create the Northwind sample database tables using the lambdaorm cli.
Access lambdaorm service endpoints to:

- Execute ping
- Obtain the data model corresponding to a query
- Get the parameters of a query
- Obtain the constraints of a query
- Get the execution plan of a query
- Import data
- Run a query

[lab](https://github.com/lambda-orm/lambdaorm-labs/tree/main/labs/svc/01-northwind-simple)

## Northwind Multiples Datasources Lab

**In this laboratory we will see:**

Set up a postgres, mysql and mongo database and lambdaorm service using docker compose.
Configure a lambdaorm schema where entities defined in the domain are mapped to different databases.
Create the Northwind sample database tables using the lambdaorm cli.
Access lambdaorm service endpoints to:

- Execute ping
- Obtain the data model corresponding to a query
- Get the parameters of a query
- Obtain the constraints of a query
- Get the execution plan of a query
- Import data
- Run a query

We will verify that lambdaorm behaves in the same way if the domain entities are mapped to a single datasource or to multiple datasources.

[lab](https://github.com/lambda-orm/lambdaorm-labs/tree/main/labs/svc/02-northwind-multiples-datasources)

## Northwind CQRS (Command Query Responsibility Segregation) Lab

**In this laboratory we will see:**

Configure postgres databases, mysql, mongo and a lambdaorm service using docker compose.
How to configure different stages:

- default: where domain entities are mapped to different data sources.
- insights: where domain entities are mapped to a single data source.
- cqrs: where domain entities are mapped to different data sources and read-only queries are executed.

How to configure a listener to synchronize data between different data sources.

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

[lab](https://github.com/lambda-orm/lambdaorm-labs/tree/main/labs/svc/03-northwind-cqrs)

## Northwind CQRS (Command Query Responsibility Segregation) with kafka Lab

**In this laboratory we will see:**

Configure postgres databases, mysql, mongo and a lambdaorm service using docker compose.
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

In this case, every time a stage is inserted, updated or deleted in the default stage or cqrs, a message will be sent to the "insights-sync" topic with the query and the data.
and this message will be consumed and the query will be executed in the insights stage, thus achieving synchronization between the data sources and the insights source.

[lab](https://github.com/lambda-orm/lambdaorm-labs/tree/main/labs/svc/04-northwind-cqrs-with-kafka)

## Pentest DDoS (Distributed Denial of Service) Lab

**In this laboratory we will see:**

We will set up a test environment to perform a distributed denial of service (DDoS) attack on a lambdaorm service.
We will configure a docker compose with the following services:

- postgres:database
- orm: lambdaorm service
- prometheus: prometheus service for monitoring
- grafana: grafana service for visualization of metrics

We will execute DDoS attacks using the following tools:

- Slowloris
- GoldenEye

[lab](https://github.com/lambda-orm/lambdaorm-labs/tree/main/labs/svc/05-pentest-ddos)

## Load Balancer Pentest DDoS (Distributed Denial of Service) Lab

**In this laboratory we will see:**

We will set up a test environment to perform a distributed denial of service (DDoS) attack on a lambdaorm service.
We will configure a docker compose with the following services:

- postgres:database
- orm: lambdaorm service
- nginx: nginx service for load balancing
- prometheus: prometheus service for monitoring
- grafana: grafana service for visualization of metrics

We will execute DDoS attacks using the following tools:

- Slowloris
- GoldenEye

[lab](https://github.com/lambda-orm/lambdaorm-labs/tree/main/labs/svc/06-pentest-ddos-load-balancer)
