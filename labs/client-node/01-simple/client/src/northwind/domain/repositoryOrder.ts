import { Repository, IOrm } from 'lambdaorm-client-node'
import { Order, QryOrder } from './model'
export class OrderRepository extends Repository<Order, QryOrder> {
	constructor (stage?: string, orm?:IOrm) {
		super('Orders', stage, orm)
	}
	// Add your code here
}
