# CLI Labs

## CLI Lab - Simple

In this laboratory we will see:

- How to use the λORM CLI commands
- how to create a project that uses lambda ORM
- How to define a schema
- how to run a bulkInsert from a file
- how to export data from a schema
- how to import data into a schema from a previously generated export file

[lab](https://github.com/FlavioLionelRita/lambdaorm-labs/tree/main/labs/cli/01-simple)

## CLI Lab Extend Model

In this laboratory we will see:

- how to create a project that uses lambda ORM
- How to define a schema
- how to extend entities using abstract entities
- How to insert data from a file.
- how to run queries from cli to perform different types of queries

[lab](https://github.com/FlavioLionelRita/lambdaorm-labs/tree/main/labs/cli/02-extend-model)

## CLI Lab - Two stages

In this laboratory we will see:

- how to work with two sources with different mappings
- how to define two stages and work with them
- how to use environment variables to set connections to databases
- How to insert data from a file to more than one table.
- how to use imported data from one stage to import it to another

[lab](https://github.com/FlavioLionelRita/lambdaorm-labs/tree/main/labs/cli/03-two-stages)

## CLI Lab - Two data sources with the same query

In this laboratory we will see:

- How to insert data from a file to more than one table.
- how to define a stage that works with entities in different databases
- how to use environment variables to set connections to databases
- how to run a bulkInsert on entities in different databases
- how to export and import entity data in different databases

[lab](https://github.com/FlavioLionelRita/lambdaorm-labs/tree/main/labs/cli/04-two-datasource-same-query)

## CLI Lab - Northwind

In this laboratory we will see:

Creating the northwind sample database tables and loading it with sample data.
This database presents several non-standard cases such as:
	- Name of tables and fields with spaces
	- Tables with composite primary keys
	- Tables with autonumeric ids and others with ids strings

Since this is the database that was used for many examples and unit tests, you can test the example queries that are in the documentation.
We will also see some example queries to execute from CLI

[lab](https://github.com/FlavioLionelRita/lambdaorm-labs/tree/main/labs/cli/05-northwind)

## CLI Lab - Northwind multiple datasources

In this laboratory we will see:

- How to configure the schema to work with multiple data sources
- How to execute queries from CLI to obtain data from multiple data sources in the same query
- How to obtain the execution plan of a query and visualize which data sources the queries will be executed on

[lab](https://github.com/FlavioLionelRita/lambdaorm-labs/tree/main/labs/cli/06-northwind-multiples-datasources)

## CLI Lab - Northwind multiple stages

In this laboratory we will see:

- How to configure the schema to work with multiple data sources
- How to configure the schema to work with multiple stages
- How to execute queries from CLI to obtain data from multiple data sources in the same query
- How to obtain the execution plan of a query and visualize which data sources the queries will be executed on
- How to export data from one stage and import it into another
- How can you obtain the same results regardless of whether they are stored in a single data source or in multiple data sources

[lab](https://github.com/FlavioLionelRita/lambdaorm-labs/tree/main/labs/cli/07-northwind-multiples-stages)

## CLI Lab - Northwind CQRS

In this laboratory we will see:

- How to configure several stages with conditions
- How to configure listeners to synchronize data between stages
- How to implement the CQRS pattern

[lab](https://github.com/FlavioLionelRita/lambdaorm-labs/tree/main/labs/cli/08-northwind-cqrs)
