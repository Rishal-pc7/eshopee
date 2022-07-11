var db=require('../config/connection')
var collection=require('../config/collections')
var objectId=require('mongodb').ObjectID
require('hostname-patcher')
var os=require('os')
var hbs=require('nodemailer-handlebars')
var nodemailer=require('nodemailer')
var path=require('path')
module.exports={
    addProducts:(product,callback)=>{
        let specialChars=','
        let priceSplit
        for(i in specialChars){
            if(product.price.indexOf(specialChars[i]) > -1){
      
	  
                priceSplit=product.price.split(',')
                product.price=priceSplit.join("")
           
          
              }

        }
        product.price=parseInt(product.price)
        let warranty
        if(product.warrantyYr==0 && product.warrantyMonth==0){
            warranty=null

        }else if(product.warrantyYr==1 ){
            warranty=product.warrantyYr+" year"
            
        }
        else if(product.warrantyYr>1 ){
            warranty=product.warrantyYr+" years"
            
        }
        if(product.warrantyMonth=0 ){
            warranty=warranty
            
        }else if(product.warrantyMonth==1 ){
            if(warrant != null){
                warranty+=" "+product.warrantyMonth+" month"

            }else{
                warranty=product.warrantyMonth+" month"
            }
            
            
        }
        else if(product.warrantyMonth>1 ){
            if(warrant != null){
                warranty+=" "+product.warrantyMonth+" months"

            }else{
                warranty=product.warrantyMonth+" months"
            }
            
            
        }
        
        let nameLength=product.name.length
        product.nameLength=nameLength
        product.warranty=warranty
        product.totalRating=0
        product.totalRatingPercentage='0%'
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            
            callback(data.insertedId)
        })

    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
             
            resolve(product)

        })
    },
    getAllCategories:()=>{
        return new Promise(async(resolve,reject)=>{
            
               let categories=await db.get().collection(collection.CATEGORY_COLLECTION).findOne()
               if(categories){
                   
                   resolve(categories)
               }else{
                 let categoriesArr=['Mobile','Laptop','Computer','Accessories','Speakers','Watches','Camera','TV','Smart Products']
                 let categoriesObj={
                     categories:categoriesArr
                 }
                 db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoriesObj).then((data)=>{
                     resolve(data)
                    
                 })
                }
            

        })

    },
    getNewProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let newProducts=await db.get().collection(collection.PRODUCT_COLLECTION).find({}).sort({_id:-1}).limit(4).toArray()
            
            resolve(newProducts)
        })
    },
    getBestDealProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let bestDeals=await db.get().collection(collection.PRODUCT_COLLECTION).find({}).limit(4).toArray()
            
            resolve(bestDeals)
        })
        

    },
    getTopDealProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collection.ORDER_COLLECTION).findOne({})
            
            let topDeals
            if(orders){
                topDeals=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {$unwind:"$products"},
                       {$group:{
                           _id:"$products.item",
                           count:{$sum:1},
                           
                       }},
                        
                        {$sort: {count:-1}},
                        {$limit:4},
                        {
                            $project:{
                                item:'$_id',
                                count:"$count"
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
                                item: 1, count: 1, product: { $arrayElemAt: ['$product', 0] }
                            }
                        },
                        
    
                    
                       
                     ]).toArray()
                     

            }else{
                topDeals=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([

                        
                    
                    
                    
                    {
                        $project:{
                            item:"$_id",
                            nameLength:"$nameLength"
                            
                        }
                    },
                    {$sort:{nameLength:1}},
                    {$limit:4},
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    }, {
                        $project: {
                            item: 1, count: 1,nameLength:1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }

                    ]).toArray()

            }
            

            
            
                 
                    
                    

                
              
                resolve(topDeals)
                

              
            
            

            
        })

    },
    getMostOfferProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.OFFER_COLLECTION).find().sort({discountInt:-1}).limit(2).toArray()
            let proId=[]
            let offerProducts=[]
            if(products[0]){
            for(let i in products){
                proId.push(products[i].proId)

            }
            for(let j in proId){
                let offers=await db.get().collection(collection.OFFER_COLLECTION).aggregate([
                    {
                      $match:{proId:proId[j]}
                    },
                    {
                        $project:{
                            _id:"$proId",
                            discountedPercentage:"$discountedPercentage"
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField:'_id',
                            foreignField:'_id',
                            as:'product'
                        }
                    },
                    {
                        $project:{discountedPercentage:1,product:{$arrayElemAt:["$product",0]}}
                    }
                ]).toArray()
                offers[0].product.discountedPercentage=offers[0].discountedPercentage
                offerProducts.push(offers[0].product)

            }
        } 
        else{
            let leastPrice=await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({"price":1}).limit(1).toArray()
            let mostRated=await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({"totalRating":-1}).limit(1).toArray()
            offerProducts.push(leastPrice[0])
            offerProducts.push(mostRated[0])

        }

        if(offerProducts.length == 1){
        console.log("🚀 ~ file: productHelpers.js ~ line 241 ~ returnnewPromise ~ offerProducts.length", offerProducts.length)
            
            let mostRated=await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({"totalRating":-1}).limit(1).toArray()
            
            offerProducts.push(mostRated[0])

        }
            resolve(offerProducts)
        
            
        })
    },
    checkForInitialPrice:(products)=>{
        return new Promise(async(resolve,reject)=>{
            let proId=[]
            let updatestatus
            for(let i in products){
            proId.push(products[i]._id)
            let status=await db.get().collection(collection.OFFER_COLLECTION).findOne({proId:proId[i]})
            
            if(status){
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:proId[i]},
                {
                    $set:{
                        initialPrice:status.initialPrice,
                        price:status.offerPrice

                    }
                }).then((response)=>{
                    updatestatus=true
                })
            }else{
                let products=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:proId[i]})
                let initialPrice
                if(products.initialPrice){
                    initialPrice=products.initialPrice
                }else{
                    initialPrice=products.price
                }
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:proId[i]},
                {
                    $set:{
                        initialPrice:null,
                        price:initialPrice

                    }
                }).then((response)=>{
                    updatestatus=false
                })

            }
        }
        
        resolve(updatestatus)
        })

    },
    deleteProduct:(proId)=>{

        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })

    },
    getProductDetails:(proId)=>{

        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
                
            })
        })



    },
    getRecommendedProduct:(proCategory,proId,proArr)=>{
        return new Promise(async(resolve,reject)=>{
            let products
            if(proArr){
                if(proArr[0]){
                let category=[]
                let proId=[]
                let _id=[]
                let index = []
                for(i in proArr){
                   
                    category.push(proArr[i].product.category)
                    proId.push(""+proArr[i].product._id)
                 
                 
                }
              
                products=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:{$in:[category[0],category[1],category[2], "Accessories", "Smart Products"]}}).limit(9).toArray()
                for(let j in products){
                    _id.push(""+products[j]._id)
                    
                   
                    if(proId.indexOf(_id[j])>-1){
                    console.log('Yes')
                        proId.
                        j=parseInt(j)
                        products.splice(j,1,[])
                        
                

                        
                    }
                }
            }else{
                products=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:{$in:["Mobile","Laptop","TV","Computer", "Accessories", "Smart Products"]}}).limit(9).toArray()

            }
                
            }else if(proCategory && proId){
                
                
            products=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:{$in:[proCategory, "Accessories", "Smart Products"]},_id:{$nin:[objectId(proId)]}}).limit(9).toArray()
            
        }else{
            products=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:{$in:["Mobile","Laptop","TV","Computer", "Accessories", "Smart Products"]}}).limit(9).toArray()

        }
        resolve(products)
        })

    },
    isProOfferExist:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.OFFER_COLLECTION).findOne({proId:objectId(proId)})
            if(product){
                resolve(product)
            }else{
                resolve(false)
            }

        })
    },
    getSpecifications:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then(async(response)=>{
                let specificationsJson=response.specifications
                let inputNamesJson=response.inputNames
                
                let specifications = JSON.parse(specificationsJson);
                let inputNames = JSON.parse(inputNamesJson);
               
                let arr=[]
                
                
                    for(j=0;j<inputNames.length;j++){
                        
                        for(i=0;i<specifications.length;i++){
                         if(specifications[i].position==j){
                             
                             

                             arr.push(specifications[i])
                             
                             
                            
                            
                            
                            
                         }
                            
                            

                        

                    }

                }
                for(k=0;k<arr.length;k++){
                    arr[k].value=response[arr[k].name]
                    arr[k].name=arr[k].name.split('specification')
                    
                    
                    arr[k].name=arr[k].name[1]
                    
                }
                
                resolve(arr)
                
            })
        })

    },
    updateDetails:(proId,product,specification)=>{

        return new Promise(async(resolve,reject)=>{
            let specialChars=','
        let priceSplit
        for(i in specialChars){
            if(product.price.indexOf(specialChars[i]) > -1){
      
	  
                priceSplit=product.price.split(',')
                product.price=priceSplit.join("")
           
          
              }

        }
            product.price=parseInt(product.price)
            let nameLength=product.name.length
            let warranty
        if(product.warrantyYr==0 && product.warrantyMonth==0){
            warranty=null

        }else if(product.warrantyYr==1 ){
            warranty=product.warrantyYr+" year"
            
        }
        else if(product.warrantyYr>1 ){
            warranty=product.warrantyYr+" years"
            
        } 
        if(product.warrantyMonth==0 ){
            warranty=warranty
            
        }else if(product.warrantyMonth==1 ){
            if(warranty != null){
                warranty +=" "+product.warrantyMonth+" month"

            }else{
                warranty=product.warrantyMonth+" month"
            }
            
            
        }
        else if(product.warrantyMonth>1 ){
            if(warranty != null){
                warranty +=" "+product.warrantyMonth+" months"

            }else{
                warranty=product.warrantyMonth+" months"
            }
            
            
        }
        
        product.warranty=warranty
        let name=[]
        for(i=0;i<specification.length;i++){
            specification[i].name='specification'+specification[i].name
            name.push(specification[i].name)
            
        }
        console.log(product[name[0]])
        for(i=0;i<name.length;i++){
                    

           let products=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    name:product.name,
                    category:product.category,
                    price:product.price,
                    warrantyyr:product.warrantyYr,
                    warrantyMonth:product.warrantyMonth,
                    warranty:warranty,
                    color:product.color,
                    brand:product.brand,
                    initialPrice:null,
                    [name[i]]:product[name[i]],
                    
                   
                    
                    

                    
                }
            })
            .then((response)=>{
                db.get().collection(collection.OFFER_COLLECTION).deleteOne({proId:objectId(proId)}).then((res)=>{
                    resolve(response)
                })
                
                    
                   
                
                

            })
        }

        })

    },
    
    addReviews:(review)=>{
        return new Promise(async(resolve,reject)=>{
            var date = new Date();
            var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
            var am_pm = date.getHours() >= 12 ? "PM" : "AM";
            hours = hours < 10 ? "0" + hours : hours;
            var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
            
            let time = hours + ":" + minutes  +" "+ am_pm;
           
            const month=["January","February","March","April","May","June","July","August","September","October","November","December"]
            
            let date1=date.getDate()+" "+month[date.getMonth()]+" "+date.getFullYear()
            let reviewDetails={
                userName:review.name,
                userId:objectId(review.userId),
                date:date1,
                time:time,
                review:review.review,
                ratedStars:review.stars,

                }
            let reviews={
                
                proId:objectId(review.proId),
                reviewDetails:[]
                
                
            }
            let proExist=await db.get().collection(collection.RATING_COLLECTION).findOne({proId:objectId(review.proId)})
            if(proExist){
                db.get().collection(collection.RATING_COLLECTION).updateOne({proId:objectId(review.proId)},
                {
                    
                        $push:{reviewDetails:reviewDetails}
                    
                }
                ).then((response)=>{

                    resolve(response)

                })
            }else{
                reviews.reviewDetails.push(reviewDetails)
                db.get().collection(collection.RATING_COLLECTION).insertOne(reviews).then((data)=>{
                    resolve(data)
                    
    
                })

            }
            
        })
    },
    
    getReviews:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            let rating= await db.get().collection(collection.RATING_COLLECTION).findOne({proId:objectId(proId)})
           
                

            resolve(rating)
        })
    },
    getRating:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            let rating= await db.get().collection(collection.RATING_COLLECTION).findOne( { proId:objectId(proId) } )
            
            
            if(rating){
            let ratings={
                length:rating.reviewDetails.length,
                oneStarRating:0,
                twoStarRating:0,
                threeStarRating:0,
                fourStarRating:0,
                fiveStarRating:0,
                rating:0,
                ratingPercentage:0

            }
            let ratingCount=0
            for(let i in rating.reviewDetails){
           
                
                rating.reviewDetails[i].ratedStars=parseInt(rating.reviewDetails[i].ratedStars)
                
                ratingCount+=rating.reviewDetails[i].ratedStars 
                 
                if(rating.reviewDetails[i].ratedStars==1){
                    ratings.oneStarRating = ratings.oneStarRating+1 


                }else if(rating.reviewDetails[i].ratedStars==2){
                    ratings.twoStarRating = ratings.twoStarRating+1 


                }else if(rating.reviewDetails[i].ratedStars==3){
                    ratings.threeStarRating = ratings.threeStarRating+1 


                }else if(rating.reviewDetails[i].ratedStars==4){
                    ratings.fourStarRating = ratings.fourStarRating+1 


                }else if(rating.reviewDetails[i].ratedStars==5){
                    ratings.fiveStarRating = ratings.fiveStarRating+1 


                }
                
                

            }
            
           
                ratings.rating=(5*ratings.fiveStarRating + 4*ratings.fourStarRating + 3*ratings.threeStarRating + 2*ratings.twoStarRating + 1*ratings.oneStarRating) / (ratings.fiveStarRating+ratings.fourStarRating+ratings.threeStarRating+ratings.twoStarRating+ratings.oneStarRating)
               let num=Number(ratings.rating).toFixed(1)
               ratings.rating=parseFloat(num)
               
               
            
            const starPercentage = (ratings.rating ) *100;

      // Round to nearest 10
      const starPercentageRounded = `${Math.round(starPercentage / 5)+2.5}%`;
            
            ratings.ratingPercentage=starPercentageRounded
            db.get().collection(collection.RATING_COLLECTION).updateOne({proId:objectId(proId)},
            {
                $set:{
                    totalRating:ratings.rating,
                    totalRatingPercentage:ratings.ratingPercentage
                }
            }).then(()=>{
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
            {
                $set:{
                    totalRating:ratings.rating,
                    totalRatingPercentage:ratings.ratingPercentage
                }
            }).then(()=>{
                resolve(ratings)
            })
                

            })
            
        }else{
            resolve(null)
        }

        })
            

    },
    getAllProductRatings:()=>{
        return new Promise(async(resolve,reject)=>{
            let rating= await db.get().collection(collection.RATING_COLLECTION).find().toArray()
            
            
            
        resolve(rating)

            
        })
    },
    editProductRating:(review)=>{
        return new Promise(async(resolve,reject)=>{
            var date = new Date();
            var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
            var am_pm = date.getHours() >= 12 ? "PM" : "AM";
            hours = hours < 10 ? "0" + hours : hours;
            var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
            
            let time = hours + ":" + minutes  +" "+ am_pm;
           
            const month=["January","February","March","April","May","June","July","August","September","October","November","December"]
            
            let date1=date.getDate()+" "+month[date.getMonth()]+" "+date.getFullYear()
            let reviewDetails={
                userName:review.name,
                userId:objectId(review.userId),
                date:date1,
                time:time,
                review:review.review,
                ratedStars:review.stars,

                }
                let aggregated=await db.get().collection(collection.RATING_COLLECTION).aggregate([
                    {
                        $match:{proId:objectId(review.proId)}
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
                        $match:{userId:objectId(review.userId)}
                    },
                    
                ]).toArray()
                aggregated.forEach(element => {
                    db.get().collection(collection.RATING_COLLECTION).updateOne({proId:element.proId,'reviewDetails.userId':objectId(element.userId)},{
                       
                            $set:{
                                'reviewDetails.$.userId':objectId(review.userId),
                                'reviewDetails.$.userName':review.name,
                                'reviewDetails.$.review':review.review,
                                'reviewDetails.$.date':date1,
                                'reviewDetails.$.time':time,
                                'reviewDetails.$.ratedStars':review.stars

                            }
                        
                    }).then((response)=>{
                        resolve(response)

                    })
                    
                    
                });
                
                
                
        })
    },
    getSearchResults:(proName)=>{
        return new Promise((resolve,reject)=>{
            
            var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
var checkForSpecialChar = function(string){
 for(i = 0; i < specialChars.length;i++){
   if(string.indexOf(specialChars[i]) > -1){
       return true
    }
 }
 return false;
}


if(checkForSpecialChar(proName)){
    proName=new RegExp('^' + proName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')
    
} else {
    proName=proName
    
}
            
           
            db.get().collection(collection.PRODUCT_COLLECTION).find({name: { '$regex': proName, '$options': 'i'}}).toArray().then((response)=>{
                resolve(response)


            })
        })

    },
    getMoreProducts:(proName)=>{
        return new Promise((resolve,reject)=>{
            var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
var checkForSpecialChar = function(string){
 for(i = 0; i < specialChars.length;i++){
   if(string.indexOf(specialChars[i]) > -1){
       return true
    }
 }
 return false;
}


if(checkForSpecialChar(proName)){
    proName=new RegExp('^' + proName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')
    
} else {
    proName=proName
    
}
        db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
            {
                $match:{name: { '$regex': proName, '$options': 'i'}}
            },
            {
                $project:{
                category:'$category'
                }
            },
            
            {
                $lookup:{
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'category',
                    
                    foreignField: 'category',
                    as: 'product'
                }
            },
            
            
    ]).toArray().then((response)=>{
    let arr=[]
       if(response[0]){
        resolve(response[0].product)
       }else{
           resolve(response)
       }
    })
        })
    },
    getMostRatedProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({"totalRating":-1}).limit(1).toArray()
               resolve(product[0])
            
        })

    },
    getMostPricedProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({"price":-1}).limit(1).toArray()
            
               resolve(product[0])
               
            
        })

    },
    getAllOffers:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.OFFER_COLLECTION).find().toArray().then((response)=>{
                
                resolve(response)
            })
        })
    },
    getActiveOffers:(offer)=>{
        return new Promise(async(resolve,reject)=>{
            let trueObj=[]
            let products=[]
            for(i in offer){
                var dateFuture = new Date(offer[i].offerStartDate)
            
            const isToday = (someDate) => {
                const today = new Date()
                
                var future_hours = someDate.getHours() > 12 ? someDate.getHours() - 12 : someDate.getHours();
                var today_hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
            
            
            
            
           
            
                return someDate.getDate() <= today.getDate() &&
                  someDate.getMonth() <= today.getMonth() &&
                  someDate.getFullYear() <= today.getFullYear()&&
                  future_hours <= today_hours

              }
    
    
                    
            if(isToday(dateFuture) ){
                trueObj.push({status:isToday(dateFuture),proId:offer[i].proId,lastDate:offer[i].offerLastDate})
                offer[i].offerPrice=parseInt(offer[i].offerPrice)
                offer[i].initialPrice=parseInt(offer[i].initialPrice)

                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:offer[i].proId},
                    {
                        $set:{
                            price:offer[i].offerPrice,
                            initialPrice:offer[i].initialPrice
                        }
                    })
            }else{
                
                
            }

            }
           


            for(j in trueObj){
            
                
                var dateFuture = new Date(trueObj[j].lastDate)
                
        
    
    
            var dateNow = new Date();
            
            var delta = Math.round(dateFuture - dateNow) / 1000;
            
            var  days = Math.floor(delta / 86400);
            
            
            delta -= days * 86400;
            
            var  hours = Math.floor(delta / 3600) % 24;
            delta -= hours * 3600;
            var  minutes = Math.floor(delta / 60) % 60;
            delta -= minutes * 60;
            
            if(days < 0){

            
                
               
                
                    
                    
                    let products=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(trueObj[j].proId)})
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(trueObj[j].proId)},
                        {
                            $set:{
                                price:products.initialPrice,
                                initialPrice:null
                            }
                        }).then((response)=>{
                            
                            db.get().collection(collection.OFFER_COLLECTION).deleteOne({proId:objectId(trueObj[j].proId)}).then((res)=>{
                                console.log(res)

                            })

                        })
            
                

            
            }else{
                db.get().collection(collection.OFFER_COLLECTION).updateOne({proId:objectId(trueObj[j].proId)},
            {
                $set:{
                    remainingDays:days,
                    remainingHours:hours,
                    remainingMinutes:minutes
                }
            }).then(async(response)=>{
            }) 
                let items=await db.get().collection(collection.OFFER_COLLECTION).aggregate([
                    {
                        $match:{proId:objectId(trueObj[j].proId)}
                    },
                    {
                        $project:{
                            item:"$proId",
                            discountedPercentage:"$discountedPercentage",
                            offerPrice:"$offerPrice",
                            remainingDays:"$remainingDays",
                            remainingHours:"$remainingHours",
                            remainingMinutes:"$remainingMinutes"
                        }
                    },
                    {
                        $lookup:{
                        from: collection.PRODUCT_COLLECTION,
                    localField: 'item',
                    
                    foreignField: '_id',
                    as: 'product'
                    }
                    },
                    {
                        $project:{discountedPercentage:1,offerPrice:1,remainingDays:1,remainingHours:1,remainingMinutes:1,product:{ $arrayElemAt: ['$product', 0] }}
                    }

                ]).toArray()
               
                
                    
                    products.push(items[0])
                

            }

            }
            
            resolve(products) 
            
        })
    },
    sendFeedBack:(feedback)=>{
        return new Promise(async(resolve,reject)=>{
            let testAccount = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  type: 'OAuth2',
                  user:"rishal01010@gmail.com",
                  pass: "Mangoapple23",
                  clientId: "606736413203-e7ck2uvdptvc7rop2a6p9tju265vra7b.apps.googleusercontent.com",
                  clientSecret: "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",
                  refreshToken: "1//04cEHUGh1-idgCgYIARAAGAQSNwF-L9Ir5MRBqN1sGD4ze6N1lL4Q0Q5fryLLAHuRJcgKE97U5wkha7VdhST1DEf-nhNdI_HJw_s"
                }
              
            
            });
            let options={
                viewEngine: {
                    extName: '.hbs',
                    partialsDir: './views/email/partials',//your path, views is a folder inside the source folder
                    layoutsDir: './views/email',
                    defaultLayout: ''//set this one empty and provide your template below,
                  },
                  viewPath: './views/email',
                  extName: '.hbs',
            }
            transporter.use('compile',hbs(options))
            let mailOptions={
                from:feedback.email,
                to:'rishal01010@gmail.com',
                template:'email',
                context:{
                    name:feedback.name,
                    phoneNum:feedback.phone_number,
                    message:feedback.message,
                    email:feedback.email
                }
    
            }
            transporter.sendMail(mailOptions,function (err,info){
                if(err){
                    console.log(err)
                    resolve({status:false})
                }else{
                    console.log('Email Sent successfully'+info.response)
                    resolve({status:true})
                }
            })
        })
        
    }
}