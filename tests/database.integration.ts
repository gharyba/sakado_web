import assert from "node:assert/strict";import{randomUUID}from"node:crypto";
import setup from "./browser/setup";import{testDb}from"./test-database";import{createBooking,updateBooking}from"../src/lib/bookings";import{mutate}from"../src/lib/admin-mutations";import{occupied,lifecycle,registrationAllowed}from"../src/lib/event-policy";
async function main(){await setup();const db=testDb();let assertions=0;
function check(value:unknown,message:string){assert.ok(value,message);assertions++}
try{
 const owner=await db.adminUser.findFirstOrThrow({where:{role:"OWNER"}});
 const event=await db.event.create({data:{slug:"capacity-race",title:"Capacity integration fixture",shortDescription:"Test fixture.",description:"Isolated concurrency test.",status:"UPCOMING",registrationStatus:"OPEN",published:true,capacity:3,price:17.125,startsAt:new Date(Date.now()+86400000)}});
 const input=(n:number)=>({eventId:event.id,firstName:"Test",lastName:"Participant",email:"race"+n+"@example.invalid",phone:"+21620000000",participantCount:1,idempotencyKey:randomUUID()});
 const requests=Array.from({length:10},(_,n)=>input(n));const results=await Promise.allSettled(requests.map(i=>createBooking(db,i)));
 const rows=await db.booking.findMany({where:{eventId:event.id}});check(rows.length===3,"Concurrent requests fill exactly capacity");check(occupied(rows)===3,"Pending registrations consume capacity");check(results.filter(r=>r.status==="fulfilled").length===3,"All excess concurrent requests are rejected");
 const first=rows[0];check(first.totalAmount.toString()==="17.125","Totals retain three-decimal TND precision");
 const original=requests.find(i=>i.idempotencyKey===first.idempotencyKey)!;const replay=await createBooking(db,original);check(replay.reference===first.reference,"Idempotent retries return original reference");check(await db.booking.count({where:{eventId:event.id}})===3,"Retries create no duplicate");
 await assert.rejects(()=>createBooking(db,{...original,participantCount:2}));assertions++;
 const edit={id:first.id,firstName:first.firstName,lastName:first.lastName,email:first.email,phone:first.phone,participantCount:1,status:"CONFIRMED",paymentStatus:"PAID",internalNote:"staff only"};
 await updateBooking(db,edit,owner.id);check((await db.booking.findUniqueOrThrow({where:{id:first.id}})).status==="CONFIRMED","Confirmation succeeds at full capacity");
 await assert.rejects(()=>updateBooking(db,{...edit,participantCount:2},owner.id));assertions++;
 await updateBooking(db,{...edit,status:"CANCELLED"},owner.id);check((await db.event.findUniqueOrThrow({where:{id:event.id}})).registrationStatus==="OPEN","Cancellation releases capacity and reopens full event");
 await db.event.update({where:{id:event.id},data:{price:99}});
 await updateBooking(db,{...edit,status:"CONFIRMED"},owner.id);check((await db.booking.findUniqueOrThrow({where:{id:first.id}})).totalAmount.toString()==="17.125","Original unit price is preserved");
 await db.event.update({where:{id:event.id},data:{registrationStatus:"WAITLIST_ONLY"}});
 const wait=await createBooking(db,{...input(100),participantCount:5});check((await db.booking.findUniqueOrThrow({where:{reference:wait.reference}})).status==="WAITLIST","Waitlist does not consume capacity");check(occupied(await db.booking.findMany({where:{eventId:event.id}}))===3,"Waitlist cannot oversubscribe reserved capacity");
 await assert.rejects(()=>mutate(db,"users",{id:owner.id,name:owner.name,email:owner.email,role:"ADMIN",active:true,password:""},{id:owner.id,role:"OWNER"}));assertions++;
 check((await db.adminUser.findUniqueOrThrow({where:{id:owner.id}})).role==="OWNER","Last active owner remains protected");
 const expired={...event,startsAt:new Date(Date.now()-1000),endsAt:null};check(lifecycle(expired)==="COMPLETED","Past outings derive completed lifecycle");check(!registrationAllowed(expired),"Past outings reject registration");
 const race=await db.event.findUniqueOrThrow({where:{id:event.id}});await mutate(db,"events",{id:race.id,intent:"duplicate"},{id:owner.id,role:"OWNER"});check(await db.event.count({where:{title:race.title+" (copie)",status:"DRAFT",published:false}})===1,"Duplicate produces private closed draft");
 console.log("PostgreSQL integration passed: "+assertions+" assertions (capacity race, retries, waitlist, owner protection, lifecycle).");
}finally{await db.$disconnect()}}
main().catch(error=>{console.error(error);process.exitCode=1});
