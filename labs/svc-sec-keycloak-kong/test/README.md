# Security with Keycloak and Reverse Proxy

## Requirement

- Add security in the service from receiving a json token
- Security mechanism must be out of service
- Using Keycloak and a reverse proxy

## Tutorial

- [Tutorial](https://refactorizando.com/arquitectura-microservicios-kong-konga/)
  - Nota: El docker-compose tiene mal configurada la base de datos.

```sh
docker-compose up -d
```

- [konga](http://localhost:1337)
- user: admin
- email: admin@email.com
- password: Ly#p52G.x!BtbZQ

### Test

```sh
curl -i http://localhost:8000/mock
curl -i -H "apikey:abcdef" http://localhost:8000/mock
```

### Uninstall

```sh
docker-compose down
docker volume rm sec-keycloak-kong_db-data-kong-postgres
```

## References

- [Kong](https://konghq.com/products/kong-gateway)
  - With Keycloak
  - [Kong / Konga / Keycloak: securing API through OIDC](https://github.com/d4rkstar/kong-konga-keycloak)
  - [Securing APIs with Kong and Keycloak - Part 1](https://www.jerney.io/secure-apis-kong-keycloak-1/)
  - [Securing APIs with Kong and Keycloak - Part 2](https://www.jerney.io/secure-apis-kong-keycloak-2/)
  - [Kong and Keycloak using OAuth 2.0 -Bearer only Client and JWT](https://cycykum.medium.com/kong-oauth2-0-keycloak-bearer-only-client-and-jwt-d29e7d860b75)
