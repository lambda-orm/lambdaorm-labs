/* eslint-disable no-use-before-define */
// THIS FILE IS NOT EDITABLE, IS MANAGED BY LAMBDA ORM
import { Queryable } from 'lambdaorm'
export class Country {
	constructor () {
		this.states = []
	}

	name?: string
	iso3?: string
	states: State[]
}
export interface QryCountry {
	name: string
	iso3: string
	states: ManyToOne<QryState> & State[]
}
export class State {
	id?: number
	name?: string
	countryCode?: string
	country?: Country
}
export interface QryState {
	id: number
	name: string
	countryCode: string
	country: QryCountry & OneToMany<QryCountry> & Country
}
export let Countries: Queryable<QryCountry>
export let States: Queryable<QryState>
