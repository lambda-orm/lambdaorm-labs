import { Repository, IOrm } from 'lambdaorm'
import { State, QryState } from './model'
export class StateRepository extends Repository<State, QryState> {
	constructor (stage?: string, Orm?:IOrm) {
		super('States', stage, Orm)
	}
	// Add your code here
}
