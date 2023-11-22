import { Repository, IOrm } from 'lambdaorm'
import { Category, QryCategory } from './model'
export class CategoryRepository extends Repository<Category, QryCategory> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Categories', stage, Orm)
	}
	// Add your code here
}
