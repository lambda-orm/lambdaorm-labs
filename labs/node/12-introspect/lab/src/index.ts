import { Orm } from 'lambdaorm'
(async () => {
	const workspace = process.cwd()
	const schemaPath = workspace + '/lambdaORM.yaml'		
	const orm = new Orm(workspace)
	try{
		const data = JSON.parse( await orm.helper.fs.read(workspace + '/countries.json') || '{}')
		await orm.init(schemaPath)	
		await orm.stage.introspect(data, 'countries')
	}catch(e){
		console.log(e)
	} finally {
		await orm.end()
	}	
})()