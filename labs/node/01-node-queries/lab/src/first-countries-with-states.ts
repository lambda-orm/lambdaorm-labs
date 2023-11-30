import { orm } from 'lambdaorm'
import { Countries } from './countries/domain/model'

(async () => {
	try {	
		await orm.init()
		const query = ()=>Countries.include(p=> p.states).first(p=>[p.name, p.iso3])
		const result = await orm.execute(query)
		console.log(JSON.stringify(result,null,2))		
	} catch (error: any) {
		console.error(error)
	} finally{
        await orm.end()
    }
})()
