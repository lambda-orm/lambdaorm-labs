import { Repository, IOrm } from 'lambdaorm'
import { Order, QryOrder } from './model'
export class OrderRepository extends Repository<Order, QryOrder> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Orders', stage, Orm)
	}
	// Add your code here
}
