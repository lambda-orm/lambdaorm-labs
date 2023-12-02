import { orm } from 'lambdaorm'
import { Countries } from './countries/domain/model'

(async () => {
	try {	
		await orm.init()
		const query = ()=>Countries.filter(p=> p.iso3 === 'ARG' ).include(p=> p.states.filter(p=> p.name.startsWith('B')) ).map(p=>[p.name])
		const result = await orm.execute(query)
		console.log(JSON.stringify(result,null,2))		
	} catch (error: any) {
		console.error(error)
	} finally{
        await orm.end()
    }
})()
