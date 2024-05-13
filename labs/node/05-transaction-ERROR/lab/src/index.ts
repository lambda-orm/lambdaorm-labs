import { QueryTransaction, orm } from 'lambdaorm'
import { Countries, Country, States } from './countries/domain/model'
(async () => {
	try {
        // Initialize the ORM by passing the schema file
        await orm.init('./lambdaORM.yaml')
        let originalName    
        // Get record    
        orm.transaction({}, async (tr:QueryTransaction) =>  {
            // Insert the country and associated states       
            let country:Country = { name: 'Argentina' , iso3: 'ARG', states:[{id:1, name:'Bs As'}, {id:2 ,name:'Cordoba'}] }         
            country = await tr.execute('Countries.insert().include(p => p.states)',country)
            console.log(JSON.stringify(country))
            // First query with parameter
            const arg = await tr.execute('Countries.first(p => p.iso3 ===iso )',{iso:'ARG'})
            console.log(`name is ${arg.name}`)
            originalName = arg.name
            arg.name =  arg.name + '1'
            // Update entity using string query
            await  tr.execute('Countries.update()',arg)
            // get record modified and set original name
            const modified = await tr.execute('Countries.first(p => p.iso3 ===iso )',{iso:'ARG'})
            console.log(`name is ${modified.name}`)
            modified.name =  originalName
            // Update entity using lambda query
            await  tr.execute(()=>Countries.update(),modified)
            // Delete all records from tables
            await tr.execute('States.deleteAll()')
            await tr.execute('Countries.delete()',modified)
        })  
	} catch (error: any) {
		console.error(error)
	} finally{
        await orm.end()
    }
})()