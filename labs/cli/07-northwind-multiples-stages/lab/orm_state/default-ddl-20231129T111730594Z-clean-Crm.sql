UPDATE Employees a SET ReportsTo = NULL;
ALTER TABLE Employees DROP CONSTRAINT Employees_reportsTo_FK;
DROP TABLE IF EXISTS Shippers;
DROP TABLE IF EXISTS Suppliers;
DROP INDEX Customers_name;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Employees;