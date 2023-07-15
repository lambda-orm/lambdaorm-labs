/* eslint-disable no-use-before-define */
// THIS FILE IS NOT EDITABLE, IS MANAGED BY LAMBDA ORM
import { Queryable } from 'lambdaorm'
export class Country {
	constructor () {
		this.states = []
	}

	name?: string
	iso3?: string
	iso2?: string
	capital?: string
	currency?: string
	region?: string
	subregion?: string
	latitude?: string
	longitude?: string
	states: State[]
}
export interface QryCountry {
	name: string
	iso3: string
	iso2: string
	capital: string
	currency: string
	region: string
	subregion: string
	latitude: string
	longitude: string
	states: ManyToOne<QryState> & State[]
}
export class State {
	id?: number
	name?: string
	countryCode?: string
	latitude?: string
	longitude?: string
	country?: Country
}
export interface QryState {
	id: number
	name: string
	countryCode: string
	latitude: string
	longitude: string
	country: QryCountry & OneToMany<QryCountry> & Country
}
export let Countries: Queryable<QryCountry>
export let States: Queryable<QryState>
