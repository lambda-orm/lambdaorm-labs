import { Repository, IOrm } from 'lambdaorm'
import { Orders.detail, QryOrders.detail } from './model'
export class Orders.detailRepository extends Repository<Orders.detail, QryOrders.detail> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Orders.details', stage, Orm)
	}
	// Add your code here
}
