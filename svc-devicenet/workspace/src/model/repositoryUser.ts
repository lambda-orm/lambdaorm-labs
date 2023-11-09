import { Repository, IOrm } from 'lambdaorm'
import { User, QryUser } from './model'
export class UserRepository extends Repository<User, QryUser> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Users', stage, Orm)
	}
	// Add your code here
}
