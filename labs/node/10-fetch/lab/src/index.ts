import { Orm } from 'lambdaorm'
(async () => {
	const workspace = process.cwd()
	const orm = new Orm(workspace)
	try{		
		const originalSchema = orm.helper.yaml.load(await orm.helper.fs.read(workspace + '/lambdaOrm.yaml'))
		await orm.init(originalSchema)	
		const mappings = await orm.stage.fetch()
		await orm.helper.fs.write( workspace + '/mappings.yaml', orm.helper.yaml.dump(mappings))
	}catch(e){
		console.log(e)
	} finally {
		orm.end()
	}	
})()