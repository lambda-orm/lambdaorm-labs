package io.github.flaviolionelrita.lambdaorm.client.lab.controller

import io.github.flaviolionelrita.lambdaorm.client.OrmClient
import io.github.flaviolionelrita.lambdaorm.client.model.*
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import kotlinx.coroutines.*
import kotlinx.coroutines.reactor.awaitSingle
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

@RestController("general")
class GeneralController(private val ormClient:OrmClient) {
    @GetMapping("/health")
    suspend fun health():Health = ormClient.health().awaitSingle()
    @GetMapping("/ping")
    suspend fun ping():Ping = ormClient.ping().awaitSingle()
    @GetMapping("/metrics")
    suspend fun metrics():Flux<Any> =  ormClient.metrics()
}