var db=require('../config/connection')
var collection=require('../config/collections')
var bcrypt=require('bcrypt')
const { response } = require('express')


var objectId=require('mongodb').ObjectID


module.exports={


doLogin:(data)=>{
    return new Promise(async(resolve,reject)=>{
        const defAdmin={
            name:'Rishal',
            email:'rishal01010@gmail.com',
            password:'$2b$10$xPJeQ2mWJ8anNJbSqhQsD.4veYurk1TIOXWM2Y/aN0vp42mHD2KKm'
        }
        let response={}
        
        
        
        let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({})
        let passErr='Password is incorrect'
        let usrErr='Admin not Found'
        if(admin){
            let adminData=await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:data.email})
           if(adminData){
            bcrypt.compare(data.password,adminData.password).then((status)=>{
                if(status){
                    response.admin=adminData
                    response.status=true

                }else{
                    resolve({passErr,status:false})

                }

                resolve(response)
            })
            
        }else{
            resolve({usrErr})

        }
    }else{
        db.get().collection(collection.ADMIN_COLLECTION).insertOne(defAdmin).then((response)=>{
            resolve(response)
        })
    }

    })
},
getAllUsers:()=>{
    return new Promise(async(resolve,reject)=>{
        let users=await db.get().collection(collection.USER_COLLECTION).find({}).toArray()
        console.log(users);
        resolve(users)
    })
},
getAllOrders:()=>{
    return new Promise(async(resolve,reject)=>{
        let orders=await db.get().collection(collection.ORDER_COLLECTION).find({}).toArray()
        
        resolve(orders)

    })
},
IsOrderPlaced:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        let orders = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId),payment_status:"Placed"})
            if(orders){
                resolve({status:true})

            }else{
                resolve({status:false})

            }
            

        
    })
},
getDeliveryStatus:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        let details = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{_id:objectId(orderId)}
            },
            {
               $project:{
                   delivery_status:1
               }
            }

        ]).toArray()
            resolve(details[0].delivery_status)
    })
},
changeDeliveryStatus:(details)=>{
    return new Promise(async(resolve,reject)=>{
        let name='delivery_status.'+details.name
         db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(details.orderId)},{
           $set:{
               [name]:{status:true,date:details.date}
               
           }
       }).then((response)=>{
        resolve(response)

       })
         
    })
},
addProductOffer:(proId,offerDetails)=>{
    return new Promise(async(resolve,reject)=>{
        let proOfferExist=await db.get().collection(collection.OFFER_COLLECTION).findOne({proId:objectId(proId)})
        if(proOfferExist){
            let offerStartDate=offerDetails.startYear+" "+offerDetails.startMonth+" "+offerDetails.startDay+" "+offerDetails.startHour+":"+offerDetails.startMinute+" "+offerDetails.startam_pm
            const arr = offerDetails.discount.split("%");
            let discount=arr[0]+"%"
            console.log("🚀 ~ file: adminHelpers.js ~ line 121 ~ returnnewPromise ~ discount", discount)
            
            let offerLastDate=offerDetails.lastYear+" "+offerDetails.lastMonth+" "+offerDetails.lastDay+" "+offerDetails.lastHour+":"+offerDetails.lastMinute+" "+offerDetails.lastam_pm
            let specialChars=','
            let priceSplit
        for(let i in specialChars){
            
              
              if(offerDetails['initial-price'].indexOf(specialChars[i]) > -1){
              
      
	  
                priceSplit=offerDetails['initial-price'].split(',')
                offerDetails['initial-price']=priceSplit.join("")
           
          
              }
              if(offerDetails['offer-price'].indexOf(specialChars[i]) > -1){
                
        
        
                  priceSplit=offerDetails['offer-price'].split(',')
                  offerDetails['offer-price']=priceSplit.join("")
             
            
                }

        }
        
            offerDetails['initial-price']=parseInt(offerDetails['initial-price'])
            offerDetails['offer-price']=parseInt(offerDetails['offer-price'])
            let offerObj={
                initialPrice:offerDetails['initial-price'],
                offerPrice:offerDetails['offer-price'],
                proId:objectId(proId),
                discountedPercentage:discount,
                offerStartDate,
                offerLastDate
            }
            
            db.get().collection(collection.OFFER_COLLECTION).updateOne({proId:objectId(proId)},
            {
                $set:{
                    initialPrice:offerObj.initialPrice,
                    offerPrice:offerObj.offerPrice,
                    proId:offerObj.proId,
                    discountedPercentage:offerObj.discountedPercentage,
                    offerStartDate:offerObj.offerStartDate,
                    offerLastDate:offerObj.offerLastDate
                }
            }).then((response)=>{
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
            {
                $set:{
                    initialPrice:offerObj.initialPrice,
                    price:offerObj.offerPrice,
                    
                }
            }).then((res)=>{
                resolve(res)
            })
                
            })  
        }else{
        let offerStartDate=offerDetails.startYear+" "+offerDetails.startMonth+" "+offerDetails.startDay+" "+offerDetails.startHour+":"+offerDetails.startMinute+" "+offerDetails.startam_pm
        const arr = offerDetails.discount.split("%");
        let discount=arr[0]+"%"
        let discountInt=parseInt(offerDetails.discount)
        
        let offerLastDate=offerDetails.lastYear+" "+offerDetails.lastMonth+" "+offerDetails.lastDay+" "+offerDetails.lastHour+":"+offerDetails.lastMinute+" "+offerDetails.lastam_pm
        let specialChars=','
            let priceSplit
        for(let i in specialChars){
            
              
              if(offerDetails['initial-price'].indexOf(specialChars[i]) > -1){
              
      
	  
                priceSplit=offerDetails['initial-price'].split(',')
                offerDetails['initial-price']=priceSplit.join("")
           
          
              }
              if(offerDetails['offer-price'].indexOf(specialChars[i]) > -1){
                
        
        
                  priceSplit=offerDetails['offer-price'].split(',')
                  offerDetails['offer-price']=priceSplit.join("")
             
            
                }

        }
        offerDetails['initial-price']=parseInt(offerDetails['initial-price'])
        offerDetails['offer-price']=parseInt(offerDetails['offer-price'])
        let offerObj={
            initialPrice:offerDetails['initial-price'],
            offerPrice:offerDetails['offer-price'],
            proId:objectId(proId),
            discountedPercentage:discount,
            offerStartDate,
            offerLastDate,
            discountInt
        }
        db.get().collection(collection.OFFER_COLLECTION).insertOne(offerObj).then((response)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
            {
                $set:{
                    initialPrice:offerObj.initialPrice,
                    price:offerObj.offerPrice,
                    
                }
            }).then((res)=>{
                resolve(res)
            })
        })
        
    }
    })
}


}