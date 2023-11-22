import { Repository, IOrm } from 'lambdaorm'
import { Employee, QryEmployee } from './model'
export class EmployeeRepository extends Repository<Employee, QryEmployee> {
	constructor (stage?: string, Orm?:IOrm) {
		super('Employees', stage, Orm)
	}
	// Add your code here
}
