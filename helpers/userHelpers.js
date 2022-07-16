var db=require('../config/connection')
var collection=require('../config/collections')
var bcrypt=require('bcryptjs')
const { response } = require('express')

var objectId=require('mongodb').ObjectId
const Razorpay=require('razorpay')
const { resolve } = require('path')
var instance = new Razorpay(
    { 
        key_id: 'rzp_test_KW9K3y7TfKJ04E',
        key_secret: 'xKa8EI1AQ8MuW4XZhMSWOtmm' 
    })

module.exports={

    dosignup:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:data.email})
            if(user){
                resolve({signupErr:'Email already in use'})
            }else{
            data.password=await bcrypt.hash(data.password,10)
            let response={}
            db.get().collection(collection.USER_COLLECTION).insertOne(data).then(()=>{
                response.user=data
                response.status=true
                resolve(response)
                
            })
        }

        })
       
        

    },
    doLogin:(data)=>{

        return new Promise(async(resolve,reject)=>{
            
            
            
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:data.email})
            if(user){
                
                bcrypt.compare(data.password,user.password).then((status)=>{
                    if(status){
                        
                        response.user=user
                        response.status=true
                    }else{
                        
                        
                        resolve({status:false,passErr:true})
                        
                    }
                    resolve(response)

                })
            }else{
                
                resolve({usrErr:true})
            }
        
            

        })

    },
    
    addProfilePhoto:(userId,thumbImage,proPic)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
            {
                $set:{
                    img:proPic,
                    thumbImg:thumbImage
                }
            }
            ).then((res)=>{
                resolve(res)
            })
        })
    },
    removeProfilePhoto:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
            {
                $set:{
                    img:null,
                    thumbImg:null
                }
            }
            ).then((res)=>{
                resolve(res)
            })
        })
    },

    addToCart:(proId,userId)=>{

        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
             let proObj={
                 item:objectId(proId),
                 quantity:1
             }
            if(userCart){
                let proExist=userCart.product.findIndex(product=> product.item==proId)
                console.log(proExist)
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({'product.item':objectId(proId)},
                    {
                        $inc:{'product.$.quantity':1}

                    }).then((response)=>{
                        resolve(response)
                    })
                    

                }else{
                    
                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                {
                    
                        $push:{
                            product:proObj
                        }
                    
                }).then((response)=>{
                    resolve(response)
                })


                }

            }else{
                let cartObj={
                    user:objectId(userId),
                    product:[proObj]
                }

                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve(response)

                })
            }
        })

    },
    addToWishlist:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let wishlist=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
             let proObj={
                 item:objectId(proId),
                 
                 
             }
            if(wishlist){
                let proExist=wishlist.product.findIndex(product=> product.item==proId)
                
                if(proExist!=-1){
                    resolve({proExist:true})
                    

                }else{
                    let product=proObj
                db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectId(userId)},
                {
                    
                        $push:{
                            product:proObj
                        }
                    
                }).then((response)=>{
                    resolve({status:true})
                }).catch((err)=>{
                    resolve(err)
                })

               
                }

            }else{
                let wishlist={
                    user:objectId(userId),
                    product:[proObj],
                    
                }
                let product=proObj

                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlist).then((response)=>{
                    resolve({status:true})

                })
            }
        })
    },
    removeWishlistItem:(proId)=>{
        return new Promise((resolve,reject)=>{

            db.get().collection(collection.WISHLIST_COLLECTION).updateMany({'product.item':objectId(proId)},
            {
                    $pull:{product:{item:objectId(proId)}}
            })
          .then((response)=>{
                resolve(response)
            })
          
      })


        

    },
    getUserReview:(userId,proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.RATING_COLLECTION).aggregate([
                {
                    $match:{proId:objectId(proId)}
                },
                {
                    $unwind:'$reviewDetails'
                },
                {
                    $project:{
                        userId:'$reviewDetails.userId',
                        proId:'$proId',
                        reviewDetails:'$reviewDetails',
                        
                        userName:'$reviewDetails.userName'
                    }
                },
                {
                    $match:{userId:objectId(userId)}
                },
                
            ]).toArray().then((response)=>{
                if(response){
                 
                resolve(response[0])
                }else{
                    resolve(null)
                }
            })
        })
    },
    getCartProducts:(userId)=>{

        return new Promise(async(resolve,reject)=>{
           
            
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:objectId(userId)}
            },
            
             {
             $unwind:'$product'
             },
             {
                $project:{
                    item:'$product.item',
                    quantity:"$product.quantity"
                }
            },
            
            {
                
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'item',
                    
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $project:{item:1,quantity:1,product:{$arrayElemAt:['$product',0]}}
            }
            
               
            
         
            ]).toArray() 
            
             
            resolve(cartItems)
        })

    },
    getWishlistProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           
            
            let wishlistItems=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
            {
                $match:{user:objectId(userId)}
            },
            
             {
             $unwind:'$product'
             },
             {
                $project:{
                    item:'$product.item',
                    
                }
            },
            
            {
                
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'item',
                    
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $project:{product:{$arrayElemAt:['$product',0]}}
            }
            
               
            
         
            ]).toArray() 
            
             
            resolve(wishlistItems)


        })

    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            let count=0
            if(cart){
                count=cart.product.length
               
            }
            resolve(count)
        })

    },
    getWishlistCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let wishlist=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
            let count=0
            if(wishlist){
                count=wishlist.product.length
               
            }
            resolve(count)
        })

    },
    getWishlistProExist:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let wishlist=await db.get().collection(collection.WISHLIST_COLLECTION).find({user:objectId(userId)}).toArray()
             
            if(wishlist[0]){
                resolve(wishlist[0])

                }else{
                    resolve({status:false})
                }

              
               
            
        })
    },
    changeProductQuantity:(data)=>{
        let cartId=data.cartId
        let proId=data.proId
        let count=data.count
        let quantity=data.quantity
        quantity=parseInt(quantity)
        count=parseInt(count)
        return new Promise(async(resolve,reject)=>{
             
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(cartId),'product.item':objectId(proId)},{
            

                
                    $inc:{'product.$.quantity':count}
                
            }).then(()=>{
               
                
                resolve({status:true})
            })

            

            
        })

    },
    removeCartProduct:(proId)=>{
            return new Promise((resolve,reject)=>{

                  db.get().collection(collection.CART_COLLECTION).updateMany({'product.item':objectId(proId)},
                  {
                          $pull:{product:{item:objectId(proId)}}
                  })
                .then((response)=>{
                      resolve(response)
                  })
                
            })

    },
    getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).find({user:objectId(userId)})
            if(userCart){
            let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                
                 {
                 $unwind:'$product'
                 },
                 {
                    $project:{
                        item:'$product.item',
                        quantity:"$product.quantity"
                    }
                },
                
                {
                    
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project:{item:1,quantity:1,product:{$arrayElemAt:['$product',0]}}
                },
                {
                    $group:{
                        _id:0,
                        total:{$sum:{$multiply:['$product.price','$quantity']}}
                    }
                }
             
                   
                
             
                ]).toArray() 
               
                resolve(total[0])
                
            }

        })
    },
    getProductDetails:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                resolve(cart.product)

            }
            else{
                resolve(false)
            }
        })
    },
    placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            let status=order.payment_method==='COD'?'Placed':'Pending'
            
            var date = new Date();
            var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
            var am_pm = date.getHours() >= 12 ? "PM" : "AM";
            hours = hours < 10 ? "0" + hours : hours;
            var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
            
            let time = hours + ":" + minutes  +" "+ am_pm;
           
            const month=["January","February","March","April","May","June","July","August","September","October","November","December"]
            
            let date1=date.getDate()+" "+month[date.getMonth()]+" "+date.getFullYear()
            let name
            if(order.sname){
                name=order.fname+"."+order.sname
            }else{
                name=order.fname

            }

            
            let deliveryStatus={
                ordered:{status:true,date:date1+" "+ time},
                packed:{status:false,date:null},
                shipped:{status:false,date:null},
                delivered:{status:false,date:null}
            }
            let orderObj={
                deliveryDetails:{
                    name:name,
                    address:order.address,
                    pincode:order.pincode,
                    mobile:order.mobile,
                    country:order.country,
                    state:order.state,
                    townOrcity:order['town/city'],
                    housenum:order.housenum
                },
                userId:objectId(order.userId),
                products:products,
                total:total,
                payment_status:status,
                delivery_status:deliveryStatus,
                    
                
                payment_method:order.payment_method,
                date:date1+" "+ time,
                
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})

                resolve(response.insertedId)
            })
        })
    },
    viewOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let orders= await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
           resolve(orders)
           
        })
    },

    viewOrderProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let products =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },
                {
                    $unwind:'$products'
                    },
                {
                    $project:{
                        item:"$products.item",
                        quantity:"$products.quantity"

                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{item:1,quantity:1,product:{$arrayElemAt:['$product',0]}}

                }
                

            ]).toArray()
            resolve(products)
        })
    },
    getSuccessfullOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders= await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId),payment_status:'Placed'}).toArray()
            resolve(orders)
            
         })

    },
    getLatestOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            
            let order=await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId),payment_status:"Placed"}).sort({_id:-1}).limit(1).toArray()
            console.log("🚀 ~ file: userHelpers.js ~ line 461 ~ returnnewPromise ~ order", order)
            
            
            if(order[0]){
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(order[0]._id)}
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        total: '$total'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1, quantity: 1,total:1, product: {$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()
            let orders={
                item:orderItems[0].item,
                
                total:orderItems[0].total,
                product:[]

                }
            for(i in orderItems){
                orderItems[i].product.quantity=orderItems[i].quantity
                orders.product.push(orderItems[i].product)

            }
            resolve(orders)
            
        }else{
            resolve(null)
        }
            
            
         })

    },
    
    
    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
            var options={
                amount: total*100,
                currency: "INR",
                receipt: ""+orderId,
            }
            instance.orders.create(options,function(err,order){
                if (err){
                    console.log(err)

                }else{
                console.log(order)
                resolve(order)
                }

            }
              )

        })
    },
    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto=require('crypto')
            let hmac= crypto.createHmac('sha256','xKa8EI1AQ8MuW4XZhMSWOtmm')
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            hmac=hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
                
              }else{
                  reject()
              }
        })

    },
    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            console.log(orderId)
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
            {
                $set:{status:'Placed'}
            }).then(()=>{
                resolve()
            })
        })
    },
    changeUserPassword:(data,userId)=>{
        return new Promise(async(resolve,reject)=>{
            
            data.confirm_password=await bcrypt.hash(data.confirm_password,10)
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
            {
                $set:{
                    password:data.confirm_password

                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    changeUserDetails:(data,userId)=>{
    
        return new Promise(async(resolve,reject)=>{
            
            console.log("🚀 ~ file: userHelpers.js ~ line 560 ~ data", data)
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
            {
                $set:{
                    name:data.name,
                    email:data.email

                }
            }).then(async(response)=>{
                let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
                resolve(user)
            })
        })
    },
    forgetPassword:(details)=>{
        return new Promise(async(resolve,reject)=>{
            let email=details.email
            let password=details.new_pass
            let confirm_password=details.confirm_pass
            if(confirm_password == password){
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:email})
            if(user){
                details.new_pass=await bcrypt.hash(password,10)
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(user._id)},
                {
                    $set:{
                        password:details.new_pass
                    }
                }).then((response)=>{
                    resolve({status:true})
                })

            }else{
                resolve({emailErr:true})
            }
        }else{
            resolve({confirmPassErr:true})
        }
        })

    },
    getOrderStatus:(orderId)=>{
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
    

}