# keycloak

## Db

```sql
CREATE ROLE keycloak SUPERUSER NOCREATEDB NOCREATEROLE INHERIT LOGIN PASSWORD 'keycloak';
```

## Docker

Up:

``` sh
docker-compose -f ./docker-compose.yaml up -d 
```

``` sh
docker-compose -f ./docker-compose.yaml down --remove-orphans
```

## Example

- [keycloak - authorization](https://ordina-jworks.github.io/security/2019/08/22/Securing-Web-Applications-With-Keycloak.html#/)

## References

- [Authentication](https://www.keycloak.org/docs/latest/server_admin/index.html#_role_scope_mappings)
- [Authorization](https://www-keycloak-org.translate.goog/docs/latest/authorization_services/index.html?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=wapp)
- [tutorial básico](https://www.youtube.com/watch?v=4lAMd2hnU04)
- [tutorial](https://www.youtube.com/watch?v=0TiRsueDmO4)
- [tutorial Authorization](https://www.youtube.com/watch?v=j3uydtrYLSE)
- [public api example](https://medium.com/devops-dudes/securing-node-js-express-rest-apis-with-keycloak-a4946083be51)
- [swagger authorization](https://swagger.io/docs/specification/authentication/)
- others examples:
  - [nodejs_adapter](https://www.keycloak.org/docs/latest/securing_apps/#_nodejs_adapter)
  - [securing-node-js](https://medium.com/devops-dudes/securing-node-js-express-rest-apis-with-keycloak-a4946083be51)
  - [secure-front-end](https://medium.com/devops-dudes/secure-front-end-react-js-and-back-end-node-js-express-rest-api-with-keycloak-daf159f0a94e)

- [Keycloak: Authorization Code Grant Example](https://www.appsdeveloperblog.com/keycloak-authorization-code-grant-example/)
