# Devicenet

## keycloak

- [localhost](http://localhost:8180)

## Realms

### devicenet-dev

description: DeviceNet Devevelopment environment

## Clients

### λORM Service

description: Lambda ORM Service
client_id: lambdaorm-svc
secret: 8xZPwILUJvbPXIl7do299PH75zsMDOVV
acces-type: confidential

server:

- [localhost](http://localhost:9291)

scopes:

- lambdaorm:expression:read
- lambdaorm:expression:execute
- lambdaorm:schema:read
- lambdaorm:stage:read
- lambdaorm:stage:import
- lambdaorm:stage:export

### Collector Service

description: Register and collect Device status
client_id: collector-svc
secret: dwBTkmy6Op7xZeULXsglOWr7ScQ5wcWr
acces-type: confidential

server:

- [localhost](http://localhost:9301)

scopes:

- device:status:write
- device:register

### Admin Service

description: Service for managing devices, users and groups
client_id: admin-svc
secret: mca8jvj7O343b3FKDLgMUMsHK4w7hn3d
acces-type: confidential

server:

- [localhost](http://localhost:9302)

scopes:

- device:read
- device:write
- device:status:read
- user:read
- user:write
- group:read
- group:write

### Devicenet WebApp

description: Main Web Application
client_id: devicenet-web
secret:
acces-type: public

server:

- [localhost](http://localhost:9401)

### Admin WebApp

description: Admin Web Application
client_id: admin-web
secret: FtObzn97jPdrW0ctutxivnFnzYTGysLr
acces-type: confidential

server:

- [localhost](http://localhost:9402)

### Prometheus

description: Monitoring and alerts
client_id: prometheus
secret: hXPDBFAnv8j67DJoAlzD2RV9vPkFogxV
acces-type: confidential

server:

- [localhost](http://localhost:9090)

### Grafana

description: Data analysis, extract metrics that make sense of huge amounts of data and monitor
client_id: grafana
secret: KCAIuNaDPhybjVLOXRi5SiRF7J6AbuTi
acces-type: confidential

server:

- [localhost](http://localhost:3000)

## Roles

- [data](http://www.dmartin.es/2014/07/rbac-role-based-access-control-en-eap-6-2-parte-i/#:~:text=El%20rol%20maintainer%20es%20el,contrase%C3%B1as%20y%20otra%20informaci%C3%B3n%20sensible.)

### admin

scopes:

- lambdaorm:expression:execute
- device:read
- device:write
- device:status:read
- user:read
- user:write
- group:read
- group:write

### auditor

scopes:

- lambdaorm:expression:execute
- device:read
- device:status:read
- user:read
- group:read

### collector

scopes:

- lambdaorm:expression:execute
- device:register
- device:status:write

### operator

### guest

## Users

admin:admin
auditor:auditor
operator:operator
collector1:collector1
