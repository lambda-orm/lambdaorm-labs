import { Repository, IOrm } from 'lambdaorm'
import { DeviceStatus, QryDeviceStatus } from './model'
export class DeviceStatusRepository extends Repository<DeviceStatus, QryDeviceStatus> {
	constructor (stage?: string, Orm?:IOrm) {
		super('DeviceStatuses', stage, Orm)
	}
	// Add your code here
}
