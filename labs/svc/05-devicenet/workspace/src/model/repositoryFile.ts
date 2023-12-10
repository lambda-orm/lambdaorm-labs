import { Repository, IOrm } from 'lambdaorm'
import { File, QryFile } from './model'
export class FileRepository extends Repository<File, QryFile> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Files', stage, Orm)
	}
	// Add your code here
}
