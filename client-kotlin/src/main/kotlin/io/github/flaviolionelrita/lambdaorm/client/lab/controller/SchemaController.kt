package io.github.flaviolionelrita.lambdaorm.client.lab.controller

import io.github.flaviolionelrita.lambdaorm.client.OrmClient
import io.github.flaviolionelrita.lambdaorm.client.model.*
import io.github.flaviolionelrita.lambdaorm.client.model.Enum
import kotlinx.coroutines.reactor.awaitSingle
import org.jetbrains.annotations.NotNull
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import org.springframework.web.bind.annotation.*

@RestController("schema")
class SchemaController(private val ormClient: OrmClient) {
    @GetMapping("/entities")
    suspend fun health():Flux<Entity> = ormClient.entities()
    @GetMapping("/entities/{name}")
    suspend fun ping(@NotNull @PathVariable(value = "name")name: String):Entity = ormClient.entity(name).awaitSingle()
    @GetMapping("/enums")
    suspend fun enums():Flux<Enum> = ormClient.enums()
    @GetMapping("/enum/{name}")
    suspend fun enum(@NotNull @PathVariable(value = "name")name: String):Enum = ormClient.enum(name).awaitSingle()
    @GetMapping("/stages")
    suspend fun stages():Flux<Stage> = ormClient.stages()
    @GetMapping("/stages/{name}")
    suspend fun stage(@NotNull @PathVariable(value = "name")name: String):Stage = ormClient.stage(name).awaitSingle()

}