import { Repository, IOrm } from 'lambdaorm'
import { Country, QryCountry } from './model'
export class CountryRepository extends Repository<Country, QryCountry> {
	constructor (stage?: string, orm?:IOrm) {
		super('Countries', stage, orm)
	}
	// Add your code here
}
