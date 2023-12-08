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
    console.log('List 3 countries including states')
    const query1 = () => Countries.include(p=> p.states) .map(p=> p.name).page(1,3)
    let result =  await orm.execute(query1)
    console.log(JSON.stringify(result,null,2))
    console.log('List 3 countries including some state fields')
    const query2 = () => Countries.include(p => p.states.map(p=> [p.name,p.latitude,p.longitude])).page(1,2)
    result =  await orm.execute(query2)
    console.log(JSON.stringify(result,null,2))
    console.log('List the number of countries per region using string query')
    const query3 = 'Countries.map(p=> {region:p.region,count:count(p.iso3)})'
    result =  await orm.execute(query3)
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