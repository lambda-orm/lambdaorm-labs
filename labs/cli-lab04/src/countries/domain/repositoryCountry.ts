import { Repository, IOrm } from 'lambdaorm'
import { Country, QryCountry } from './model'
export class CountryRepository extends Repository<Country, QryCountry> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Countries', stage, Orm)
	}
	// Add your code here
}
