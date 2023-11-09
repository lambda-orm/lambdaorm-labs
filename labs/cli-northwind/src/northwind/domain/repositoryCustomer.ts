import { Repository, IOrm } from 'lambdaorm'
import { Customer, QryCustomer } from './model'
export class CustomerRepository extends Repository<Customer, QryCustomer> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Customers', stage, Orm)
	}
	// Add your code here
}
