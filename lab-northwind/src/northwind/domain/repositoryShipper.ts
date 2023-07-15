import { Repository, IOrm } from 'lambdaorm'
import { Shipper, QryShipper } from './model'
export class ShipperRepository extends Repository<Shipper, QryShipper> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Shippers', stage, Orm)
	}
	// Add your code here
}
