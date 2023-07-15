/* eslint-disable no-use-before-define */
// THIS FILE IS NOT EDITABLE, IS MANAGED BY LAMBDA ORM
import { Queryable } from 'lambdaorm'
export class Category {
	constructor () {
		this.products = []
	}

	id?: number
	name?: string
	description?: string
	products: Product[]
}
export interface QryCategory {
	id: number
	name: string
	description: string
	products: ManyToOne<QryProduct> & Product[]
}
export class Customer {
	constructor () {
		this.orders = []
	}

	id?: string
	name?: string
	contact?: string
	phone?: string
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
	contact: string
	phone: string
	address: string
	city: string
	region: string
	postalCode: string
	country: string
	orders: ManyToOne<QryOrder> & Order[]
}
export class Employee {
	constructor () {
		this.orders = []
	}

	id?: number
	lastName?: string
	firstName?: string
	title?: string
	titleOfCourtesy?: string
	birthDate?: Date
	hireDate?: Date
	phone?: string
	reportsToId?: number
	address?: string
	city?: string
	region?: string
	postalCode?: string
	country?: string
	reportsTo?: Employee
	orders: Order[]
}
export interface QryEmployee {
	id: number
	lastName: string
	firstName: string
	title: string
	titleOfCourtesy: string
	birthDate: Date
	hireDate: Date
	phone: string
	reportsToId: number
	address: string
	city: string
	region: string
	postalCode: string
	country: string
	reportsTo: QryEmployee & OneToMany<QryEmployee> & Employee
	orders: ManyToOne<QryOrder> & Order[]
}
export class Shipper {
	id?: number
	name?: string
	phone?: string
}
export interface QryShipper {
	id: number
	name: string
	phone: string
}
export class Supplier {
	constructor () {
		this.products = []
	}

	id?: number
	name?: string
	contact?: string
	phone?: string
	homepage?: string
	address?: string
	city?: string
	region?: string
	postalCode?: string
	country?: string
	products: Product[]
}
export interface QrySupplier {
	id: number
	name: string
	contact: string
	phone: string
	homepage: string
	address: string
	city: string
	region: string
	postalCode: string
	country: string
	products: ManyToOne<QryProduct> & Product[]
}
export class Product {
	constructor () {
		this.orderDetails = []
	}

	id?: number
	name?: string
	supplierId?: number
	categoryId?: number
	quantity?: string
	price?: number
	inStock?: number
	onOrder?: number
	reorderLevel?: number
	discontinued?: boolean
	supplier?: Supplier
	category?: Category
	orderDetails: Orders.detail[]
}
export interface QryProduct {
	id: number
	name: string
	supplierId: number
	categoryId: number
	quantity: string
	price: number
	inStock: number
	onOrder: number
	reorderLevel: number
	discontinued: boolean
	supplier: QrySupplier & OneToMany<QrySupplier> & Supplier
	category: QryCategory & OneToMany<QryCategory> & Category
	orderDetails: ManyToOne<QryOrders.detail> & Orders.detail[]
}
export class Order {
	constructor () {
		this.details = []
	}

	id?: number
	customerId?: string
	employeeId?: number
	orderDate?: Date
	requiredDate?: Date
	shippedDate?: Date
	shipViaId?: number
	freight?: number
	name?: string
	address?: string
	city?: string
	region?: string
	postalCode?: string
	country?: string
	customer?: Customer
	employee?: Employee
	details: Orders.detail[]
}
export interface QryOrder {
	id: number
	customerId: string
	employeeId: number
	orderDate: Date
	requiredDate: Date
	shippedDate: Date
	shipViaId: number
	freight: number
	name: string
	address: string
	city: string
	region: string
	postalCode: string
	country: string
	customer: QryCustomer & OneToMany<QryCustomer> & Customer
	employee: QryEmployee & OneToMany<QryEmployee> & Employee
	details: ManyToOne<QryOrders.detail> & Orders.detail[]
}
export class Orders.detail {
	orderId?: number
	productId?: number
	unitPrice?: number
	quantity?: number
	discount?: number
	order?: Order
	product?: Product
}
export interface QryOrders.detail {
	orderId: number
	productId: number
	unitPrice: number
	quantity: number
	discount: number
	order: QryOrder & OneToMany<QryOrder> & Order
	product: QryProduct & OneToMany<QryProduct> & Product
}
export let Categories: Queryable<QryCategory>
export let Customers: Queryable<QryCustomer>
export let Employees: Queryable<QryEmployee>
export let Shippers: Queryable<QryShipper>
export let Suppliers: Queryable<QrySupplier>
export let Products: Queryable<QryProduct>
export let Orders: Queryable<QryOrder>
export let Orders.details: Queryable<QryOrders.detail>
