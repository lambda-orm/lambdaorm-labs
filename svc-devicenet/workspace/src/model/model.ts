/* eslint-disable no-use-before-define */
// THIS FILE IS NOT EDITABLE, IS MANAGED BY LAMBDA ORM
import { Queryable } from 'lambdaorm'
export enum DeviceType{
	phone = 'phone',
	computer = 'computer',
	robot = 'robot'
}
export enum ComponentType{
	camera = 'camera',
	microphone = 'microphone',
	speaker = 'speaker',
	gps = 'gps'
}
export enum FileType{
	video = 'video',
	audio = 'audio'
}
export enum Role{
	admin = 'admin',
	member = 'member',
	guest = 'guest'
}
export abstract class Basic {
	created?: Date
}
export interface QryBasic {
	created: Date
}
export abstract class Position {
	latitude?: number
	longitude?: number
	altitude?: number
}
export interface QryPosition {
	latitude: number
	longitude: number
	altitude: number
}
export abstract class Product extends Basic {
	brand?: string
	model?: string
	serialNumber?: string
}
export interface QryProduct extends QryBasic {
	brand: string
	model: string
	serialNumber: string
}
export class Device extends Product {
	constructor () {
		super()
		this.components = []
		this.journeys = []
		this.files = []
	}

	id?: string
	type?: DeviceType
	name?: string
	groupId?: string
	so?: string
	imei?: string
	imei2?: string
	mac?: string
	macBluetooth?: string
	ip?: string
	group?: Group
	components: Component[]
	journeys: Journey[]
	files: File[]
}
export interface QryDevice extends QryProduct {
	id: string
	type: DeviceType
	name: string
	groupId: string
	so: string
	imei: string
	imei2: string
	mac: string
	macBluetooth: string
	ip: string
	group: Group & OneToMany<Group> & Group
	components: ManyToOne<Component> & Component[]
	journeys: ManyToOne<Journey> & Journey[]
	files: ManyToOne<File> & File[]
}
export class Component extends Product {
	constructor () {
		super()
		this.files = []
	}

	id?: string
	deviceId?: string
	name?: string
	type?: ComponentType
	device?: Device
	files: File[]
}
export interface QryComponent extends QryProduct {
	id: string
	deviceId: string
	name: string
	type: ComponentType
	device: Device & OneToMany<Device> & Device
	files: ManyToOne<File> & File[]
}
export class DeviceStatus extends Position {
	id?: number
	deviceId?: string
	journeyId?: number
	cpu?: number
	cpuTemperature?: number
	batery?: number
	wifiSignal?: number
	time?: Date
	registred?: Date
	device?: Device
	journey?: Journey
}
export interface QryDeviceStatus extends QryPosition {
	id: number
	deviceId: string
	journeyId: number
	cpu: number
	cpuTemperature: number
	batery: number
	wifiSignal: number
	time: Date
	registred: Date
	device: Device & OneToMany<Device> & Device
	journey: Journey & OneToMany<Journey> & Journey
}
export class Journey extends Basic {
	constructor () {
		super()
		this.statuses = []
	}

	id?: number
	deviceId?: string
	startId?: number
	endId?: number
	device?: Device
	start?: DeviceStatus
	end?: DeviceStatus
	statuses: DeviceStatus[]
}
export interface QryJourney extends QryBasic {
	id: number
	deviceId: string
	startId: number
	endId: number
	device: Device & OneToMany<Device> & Device
	start: DeviceStatus & OneToMany<DeviceStatus> & DeviceStatus
	end: DeviceStatus & OneToMany<DeviceStatus> & DeviceStatus
	statuses: ManyToOne<DeviceStatus> & DeviceStatus[]
}
export class File extends Basic {
	id?: string
	type?: FileType
	deviceId?: string
	componentId?: string
	startDate?: Date
	endDate?: Date
	device?: Device
	component?: Component
}
export interface QryFile extends QryBasic {
	id: string
	type: FileType
	deviceId: string
	componentId: string
	startDate: Date
	endDate: Date
	device: Device & OneToMany<Device> & Device
	component: Component & OneToMany<Component> & Component
}
export class User extends Basic {
	constructor () {
		super()
		this.members = []
	}

	username?: string
	firstname?: string
	lastname?: string
	email?: string
	members: GroupUser[]
}
export interface QryUser extends QryBasic {
	username: string
	firstname: string
	lastname: string
	email: string
	members: ManyToOne<GroupUser> & GroupUser[]
}
export class Group extends Basic {
	constructor () {
		super()
		this.members = []
		this.devices = []
	}

	id?: string
	name?: string
	members: GroupUser[]
	devices: Device[]
}
export interface QryGroup extends QryBasic {
	id: string
	name: string
	members: ManyToOne<GroupUser> & GroupUser[]
	devices: ManyToOne<Device> & Device[]
}
export class GroupUser {
	id?: string
	username?: string
	groupId?: string
	role?: Role
	group?: Group
	user?: User
}
export interface QryGroupUser {
	id: string
	username: string
	groupId: string
	role: Role
	group: Group & OneToMany<Group> & Group
	user: User & OneToMany<User> & User
}
export let Devices: Queryable<QryDevice>
export let Components: Queryable<QryComponent>
export let DeviceStatuses: Queryable<QryDeviceStatus>
export let Journeys: Queryable<QryJourney>
export let Files: Queryable<QryFile>
export let Users: Queryable<QryUser>
export let Groups: Queryable<QryGroup>
export let GroupUsers: Queryable<QryGroupUser>
