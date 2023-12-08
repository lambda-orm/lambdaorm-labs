import { orm } from 'lambdaorm'
import { Countries, States } from './countries/domain/model'
import fs from 'fs'
import path from'path'
(async () => {
	try {
    // Initialize the ORM by passing the schema file
	await orm.init('./lambdaORM.yaml')
    // Gets the content of the data.json file to insert the data
	const content = fs.readFileSync(path.join(__dirname,'../data.json'), 'utf-8')
	const data = JSON.parse(content)
    // Insert the countries and associated states
	await orm.execute(()=> Countries.bulkInsert().include(p => p.states),data)
    // Test query that gets the states of a country		
	const result =  await orm.execute(()=> Countries.filter(p=> p.iso3 === 'ARG')
                        .include(p => p.states.map(p=>p.name)
                            .filter(p=> p.name.startsWith('C'))))
	console.log(JSON.stringify(result,null,2))
    // Delete all records from tables	
    await orm.execute(()=> States.deleteAll())
    await orm.execute(()=> Countries.deleteAll())
	} catch (error: any) {
		console.error(error)
	} finally{
        await orm.end()
    }
})()