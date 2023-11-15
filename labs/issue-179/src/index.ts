import { avg, orm  } from 'lambdaorm'
import { Orders } from './northwind/domain'
( async ()=> {
	try {		
		await orm.init('lambdaORM.yaml')
		const query = (ordNo: number) => Orders.details
											.filter( o => o.orderId === ordNo)
											.map( o => ({ ordNo:o.orderId, total: avg(o.unitPrice * o.quantity )}))
		const result = await orm.execute(query, { ordNo: 5 }, {stage:'MySQL'});
        console.log(JSON.stringify(result))		
	} catch (error:any) {
		console.error(error.stack)
	} finally {
		await orm.end()
	}
})()