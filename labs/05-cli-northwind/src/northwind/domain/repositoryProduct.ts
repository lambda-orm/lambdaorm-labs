import { Repository, IOrm } from 'lambdaorm'
import { Product, QryProduct } from './model'
export class ProductRepository extends Repository<Product, QryProduct> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Products', stage, Orm)
	}
	// Add your code here
}
