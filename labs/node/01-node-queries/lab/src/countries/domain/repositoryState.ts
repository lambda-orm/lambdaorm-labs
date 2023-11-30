import { Repository, IOrm } from 'lambdaorm'
import { State, QryState } from './model'
export class StateRepository extends Repository<State, QryState> {
	constructor (stage?: string, orm?:IOrm) {
		super('States', stage, orm)
	}
	// Add your code here
}
