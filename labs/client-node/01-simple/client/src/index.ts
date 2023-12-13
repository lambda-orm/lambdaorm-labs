import { orm } from 'lambdaorm-client-node'
import { Orders } from './northwind/domain/model'
( async () => {
 try { 
  orm.init('http://localhost:9291')
  console.log(await orm.general.ping())
  console.log(await orm.general.health())
  const query = (customerId:string)=> Orders.filter(p =>p.customerId==customerId)
                   .include(p=>[p.customer.map(p=>p.name),p.details
                    .include(p=>p.product
                     .include(p=>p.category.map(p=>p.name))
                    .map(p=>p.name))
                   .map(p=>[p.quantity,p.unitPrice])])
  const data = {customerId: 'CENTC' }
  const plan = await orm.plan(query, { stage: 'default'})
  console.log(JSON.stringify(plan,null,2))
  const result = await orm.execute(query, data,{ stage: 'default'})
  console.log(JSON.stringify(result,null,2))
 } catch (error: any) {
  console.error(error)
 }
})()