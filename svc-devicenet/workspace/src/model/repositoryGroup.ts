import { Repository, IOrm } from 'lambdaorm'
import { Group, QryGroup } from './model'
export class GroupRepository extends Repository<Group, QryGroup> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Groups', stage, Orm)
	}
	// Add your code here
}
