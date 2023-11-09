import { Repository, IOrm } from 'lambdaorm'
import { Component, QryComponent } from './model'
export class ComponentRepository extends Repository<Component, QryComponent> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Components', stage, Orm)
	}
	// Add your code here
}
