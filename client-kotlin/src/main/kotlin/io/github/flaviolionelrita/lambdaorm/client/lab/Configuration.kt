package io.github.flaviolionelrita.lambdaorm.client.lab

import org.springframework.context.annotation.Configuration
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.context.annotation.Bean
import io.github.flaviolionelrita.lambdaorm.client.OrmClient
@Configuration
@EnableAutoConfiguration
class Configuration {

    @Value("\${orm.url}") private lateinit var ormUrl: String

    @Bean
    fun ormClient(): OrmClient = OrmClient(ormUrl)
}