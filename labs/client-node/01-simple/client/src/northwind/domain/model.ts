/* eslint-disable no-use-before-define */
// THIS FILE IS NOT EDITABLE, IS MANAGED BY LAMBDA ORM
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Queryable, OneToMany, ManyToOne, OneToOne } from 'lambdaorm-client-node'
export class Category {
	constructor () {
		this.products = []
	}

	id?: number
	name?: string
	products: Product[]
}
export interface QryCategory {
	id: number
	name: string
	products: ManyToOne<QryProduct> & Product[]
}
export class Customer {
	constructor () {
		this.orders = []
	}

	id?: string
	name?: string
	address?: string
	city?: string
	region?: string
	postalCode?: string
	country?: string
	orders: Order[]
}
export interface QryCustomer {
	id: string
	name: string
	address: string
	city: string
	region: string
	postalCode: string
	country: string
	orders: ManyToOne<QryOrder> & Order[]
}
export class Product {
	constructor () {
		this.orderDetails = []
	}

	id?: number
	name?: string
	categoryId?: number
	quantity?: string
	price?: number
	category?: Category
	orderDetails: OrdersDetail[]
}
export interface QryProduct {
	id: number
	name: string
	categoryId: number
	quantity: string
	price: number
	category: QryCategory & OneToMany<QryCategory> & Category
	orderDetails: ManyToOne<QryOrdersDetail> & OrdersDetail[]
}
export class Order {
	constructor () {
		this.details = []
	}

	id?: number
	customerId?: string
	orderDate?: Date
	customer?: Customer
	details: OrdersDetail[]
}
export interface QryOrder {
	id: number
	customerId: string
	orderDate: Date
	customer: QryCustomer & OneToMany<QryCustomer> & Customer
	details: ManyToOne<QryOrdersDetail> & OrdersDetail[]
}
export class OrdersDetail {
	orderId?: number
	productId?: number
	unitPrice?: number
	quantity?: number
	order?: Order
	product?: Product
}
export interface QryOrdersDetail {
	orderId: number
	productId: number
	unitPrice: number
	quantity: number
	order: QryOrder & OneToMany<QryOrder> & Order
	product: QryProduct & OneToMany<QryProduct> & Product
}
export let Categories: Queryable<QryCategory>
export let Customers: Queryable<QryCustomer>
export let Products: Queryable<QryProduct>
export let Orders: Queryable<QryOrder>
export let OrdersDetails: Queryable<QryOrdersDetail>
