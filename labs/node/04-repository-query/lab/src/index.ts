import { orm } from 'lambdaorm'
import { CountryRepository } from './countries/domain/repositoryCountry'
import { StateRepository } from './countries/domain/repositoryState'
import fs from 'fs'
import path from'path'
(async () => {
	try {
        // Initialize the ORM by passing the schema file
        await orm.init('./lambdaORM.yaml')
        const countryRepository = new CountryRepository()
        const content = fs.readFileSync(path.join(__dirname,'../data.json'), 'utf-8')
        const data = JSON.parse(content)
        // Insert the countries and associated states
        await countryRepository.query().bulkInsert().include(p => p.states).execute(data)
        // Query
        const result = await countryRepository.query().filter(p=> p.name.startsWith('A'))
                                 .map( p => ({ country:p.name,code:p.iso3}))
                                 .sort(p => p.country)
                                 .execute ({})    
        console.log(JSON.stringify(result,null,2))
        // Delete all records and delete
        await (new StateRepository).query().deleteAll().execute({})
        await countryRepository.query().deleteAll().execute({})
	} catch (error: any) {
		console.error(error)
	} finally{
        await orm.end()
    }
})()