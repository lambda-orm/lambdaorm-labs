import { Repository, IOrm } from 'lambdaorm'
import { Supplier, QrySupplier } from './model'
export class SupplierRepository extends Repository<Supplier, QrySupplier> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Suppliers', stage, Orm)
	}
	// Add your code here
}
