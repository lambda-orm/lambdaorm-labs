import { orm } from 'lambdaorm'
import { Country } from './countries/domain/model'
import { CountryRepository } from './countries/domain/repositoryCountry'
import { StateRepository } from './countries/domain/repositoryState'
(async () => {
	try {
    // Initialize the ORM by passing the schema file
    await orm.init('./lambdaORM.yaml')
    const countryRepository = new CountryRepository()
    // Insert the country and associated states       
    let country:Country = { name: 'Argentina' , iso3: 'ARG', states:[{id:1, name:'Bs As'}, {id:2 ,name:'Cordoba'}] } 
    country = await countryRepository.insert(country, (p => p.states))    
    console.log(JSON.stringify(country))    
    let originalName    
    // Get record    
    const arg = await countryRepository.first({},(p => p.iso3 === 'ARG'))
    if (arg){
        console.log(`name is ${arg.name}`)
        originalName = arg.name
        // modify and update
        arg.name =  arg.name + '1'
        await countryRepository.update(arg)
    }
    // get record modified and set original name
    const modified = await countryRepository.first({},(p => p.iso3 === 'ARG'))
    if (modified){
        console.log(`name is ${modified.name}`)
        modified.name =  originalName
        await countryRepository.update(modified)
    }
    // Delete all records from tables
    if (modified){
        await (new StateRepository()).deleteAll({},(p => p.countryCode=== 'ARG'))
        await countryRepository.delete(modified)
    }    
	} catch (error: any) {
		console.error(error)
	} finally{
        await orm.end()
    }
})()