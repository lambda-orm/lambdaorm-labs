import { Repository, IOrm } from 'lambdaorm'
import { Journey, QryJourney } from './model'
export class JourneyRepository extends Repository<Journey, QryJourney> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Journeys', stage, Orm)
	}
	// Add your code here
}
