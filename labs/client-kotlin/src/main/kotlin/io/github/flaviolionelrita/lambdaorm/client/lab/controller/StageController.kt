package io.github.flaviolionelrita.lambdaorm.client.lab.controller

import io.github.flaviolionelrita.lambdaorm.client.OrmClient
import io.github.flaviolionelrita.lambdaorm.client.model.*
import io.github.flaviolionelrita.lambdaorm.client.model.Enum
import kotlinx.coroutines.reactor.awaitSingle
import org.jetbrains.annotations.NotNull
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import org.springframework.web.bind.annotation.*

@RestController("stage")
class StageController(private val ormClient: OrmClient) {
    @GetMapping("/stages/{name}/exists")
    suspend fun existsStage(@NotNull @PathVariable(value = "name")name: String):Boolean = ormClient.existsStage(name).awaitSingle()
    @GetMapping("/stages/{name}/export")
    suspend fun export(@NotNull @PathVariable(value = "name")name: String):Flux<SchemaData> = ormClient.export(name)
    @PostMapping("/stages/{name}/import")
    suspend fun export(@NotNull @PathVariable(value = "name")name: String,@NotNull @RequestBody data: SchemaData):Flux<SchemaData> = ormClient.import(name,data)
}