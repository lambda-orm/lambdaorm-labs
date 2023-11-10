CREATE DATABASE kong;

CREATE ROLE
    IF NOT EXISTS "kong" SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN PASSWORD 'kong';

CREATE SCHEMA IF NOT EXISTS "kong" AUTHORIZATION "kong";

CREATE DATABASE keycloak;

CREATE ROLE
    IF NOT EXISTS "keycloak" SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN PASSWORD 'keycloak';

CREATE SCHEMA IF NOT EXISTS "keycloak" AUTHORIZATION "keycloak";