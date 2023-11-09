import { Repository, IOrm } from 'lambdaorm'
import { Device, QryDevice } from './model'
export class DeviceRepository extends Repository<Device, QryDevice> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Devices', stage, Orm)
	}
	// Add your code here
}
