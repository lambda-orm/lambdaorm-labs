# Lambdaorm client kotlin

lambdaorm client for kotlin

## Create client library

- [client kotlin generator](https://openapi-generator.tech/docs/generators/kotlin)

```sh
gradle openapi
```

## Swagger generate

```sh
java -jar ~/tools/swagger-codegen-cli-2.4.30.jar generate \
  -i https://petstore.swagger.io/v2/swagger.json \
  -l kotlin \
  -o samples/client/petstore/kotlin
```

## Create lab

- [spring initializr](https://start.spring.io/#!type=gradle-project-kotlin&language=kotlin&platformVersion=3.0.4&packaging=jar&jvmVersion=17&groupId=io.github.flaviolionelrita&artifactId=lambdaorm.client&name=lambdaorm.client&description=lambdaorm%20client%20for%20kotlin&packageName=io.github.flaviolionelrita.lambdaorm.client)

## Tasks

Clean:

```sh
gradle clean
```

Build:

```sh
gradle build
```

## Publish

Nota: previamente hay que actualizar la rama main de git

```sh
mvn clean deploy
mvn versions:set -DnewVersion=1.0.2
mvn clean deploy -P release
```

- [maven central](https://central.sonatype.com/artifact/io.github.flaviolionelrita/io.github.flaviolionelrita.lambdaorm.client/1.0.1/overview)

## Debugger

```sh
java', '-jar', '-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005', 'build/libs/lambdaorm.client-1.0.0.jar
```

### References

- [openapi generator](https://openapi-generator.tech/)
- [gradle configuration](https://openapi-generator.tech/docs/configuration/)
- [openapi plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-gradle-plugin)
