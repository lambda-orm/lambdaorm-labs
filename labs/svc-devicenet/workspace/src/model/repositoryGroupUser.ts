import { Repository, IOrm } from 'lambdaorm'
import { GroupUser, QryGroupUser } from './model'
export class GroupUserRepository extends Repository<GroupUser, QryGroupUser> {
	constructor (stage?: string, Orm?:IOrm) {
		super('GroupUsers', stage, Orm)
	}
	// Add your code here
}
