const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/productHelpers')
var userHelpers=require('../helpers/userHelpers')
var fs=require('fs')
var path=require('path')
var resizeImg=require('resize-img')
var url = require('url')
/* GET home page. */
const verifyLogin=function (req,res, next){
  let user=req.session.user
  if(user){
    next()
    
  }else{
    let path=url.parse(req.url).pathname
    res.redirect('/login?ref='+path)

  }
}

router.get('/',async function(req, res, next) {
  let user=req.session.user 
  
  let count=0
  let userJson=null
  let wishlistCount=0
  let wishlistitem
  let wishlistItemJson=null
  if(user){
    count=await userHelpers.getCartCount(req.session.user._id)
    wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)
    userJson=JSON.stringify(user)
    
    wishlistitem=await userHelpers.getWishlistProExist(req.session.user._id)
    wishlistItemJson=JSON.stringify(wishlistitem.product)
  }
 
  let mostRatedProduct=await productHelpers.getMostRatedProduct()
  let mostPricedProduct=await productHelpers.getMostPricedProduct()
  
  let categories=await productHelpers.getAllCategories()
  categories=categories.categories
  let newProducts=await productHelpers.getNewProducts()
  let bestDeals=await productHelpers.getBestDealProducts()
  let topDeals=await productHelpers.getTopDealProducts()
  let ratings=await productHelpers.getAllProductRatings()
  let offers=await productHelpers.getAllOffers()
  let activeOffers
  console.log("🚀 ~ file: user.js ~ line 50 ~ router.get ~ offers", offers)
  if(offers[0]){
  activeOffers= await productHelpers.getActiveOffers(offers)
  }
  
  let ratingsJson
  if(ratings){
    ratingsJson=JSON.stringify(ratings)
  }
  let mostOfferProducts=await productHelpers.getMostOfferProducts()
  
  
  productHelpers.getAllProducts().then(async(products)=>{

    let initialPriceStatus=await productHelpers.checkForInitialPrice(products)
  
  
  
    
    console.log(user)
  
    res.render('index', { products,user,count,userJson,productJson:JSON.stringify(products),wishlistCount,wishlistItemJson,categories,newProducts,bestDeals,topDeals,topDealsJson:JSON.stringify(topDeals),ratings,ratingsJson,mostRatedProduct,mostPricedProduct,activeOffers,mostOfferProducts});
    

})



});

router.get('/s',async(req,res)=>{
  let user=req.session.user
  let count=0
  let userJson=null
  let wishlistCount=0
  let wishlistitem
  let wishlistItemJson=null
  if(user){
    count=await userHelpers.getCartCount(req.session.user._id)
    wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)
    userJson=JSON.stringify(user)
    
    wishlistitem=await userHelpers.getWishlistProExist(req.session.user._id)
    wishlistItemJson=JSON.stringify(wishlistitem.product)
  }
  let proName=req.query.proName
  let proNameJson=JSON.stringify(req.query.proName)
  let product=await productHelpers.getAllProducts()
  let moreResults=await productHelpers.getMoreProducts(proName)
  
  productHelpers.getSearchResults(proName).then(async(results)=>{
    
    
    let resultsLength=results.length
    
    
    res.render('user/search-page',{wishlistCount,user,count,userJson,wishlistItemJson,proNameJson,productJson:JSON.stringify(product),proName,results,resultsLength,moreResults})
  })
  
  

})
router.get('/single-product/:id',async (req,res)=>{
  let user=req.session.user 
  
  let count=0
  let userJson=null

  let product=await productHelpers.getProductDetails(req.params.id)
  let recomendedProducts=await productHelpers.getRecommendedProduct(product.category,product._id)
  
  let specifications=await productHelpers.getSpecifications(req.params.id)
  let reviews=await productHelpers.getReviews(req.params.id)
  let reviewDetails=null
  let wishlistitem
  let wishlistItemJson=null
  if(reviews){
  
  reviewDetails=reviews.reviewDetails
}
  let rating=await productHelpers.getRating(req.params.id)
  let wishlistCount=0
  let userReview
  if(user){
    userReview=await userHelpers.getUserReview(req.session.user._id,req.params.id)
    wishlistitem=await userHelpers.getWishlistProExist(req.session.user._id)
    wishlistItemJson=JSON.stringify(wishlistitem.product)
    
}
 
  
 

  if(user){
    count=await userHelpers.getCartCount(req.session.user._id)
    wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)
    userJson=JSON.stringify(user)
    
   
  }

  res.render('user/single-product', { productJson:JSON.stringify(product),wishlistitem,wishlistItemJson,singleProduct:true,user,count,userJson,wishlistCount,product,specifications,rating,ratingJson:JSON.stringify(rating),reviews,reviewJson:JSON.stringify(reviewDetails),reviewDetails,userReview,userReviewJson:JSON.stringify(userReview),recomendedProducts});
})

router.post('/addReview',(req,res)=>{
  console.log(req.body);
  productHelpers.addReviews(req.body).then((response)=>{
    console.log(response);
    res.redirect('/single-product/'+req.body.proId)

  })
  

  





})
router.post('/editReview',(req,res)=>{
  console.log(req.body);
   productHelpers.editProductRating(req.body).then((response)=>{
   
     
    res.redirect('/single-product/'+req.body.proId)

   })
    

  
  

  





})

router.get('/login',(req,res,next)=>{
  
  if(req.session.user){
    
    
    res.redirect('/');

  }
  else{
    let query =req.query.ref
    
    res.render("user/login",{loginPage:true,loginErr:req.session.loginErr,query})
    req.session.loginErr=false
   

  }
  
  
})
router.get('/signup',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else{
    res.render('user/signup',{loginPage:true,signupErr:req.session.signupErr})
    req.session.signupErr=false
  }
  
})
router.post('/signup',(req,res)=>{
  console.log(req.body);
  userHelpers.dosignup(req.body).then((response)=>{
    if(response.status){
      
      req.session.user=response.user
      
      req.session.user.loggedIn=true
      res.redirect('/')
    }else{
      if(response.signupErr){
        req.session.signupErr=response.signupErr

      }
      res.redirect('/signup')
    }



    
    

  })

  
})

router.post('/login',(req,res)=>{
  
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      
      req.session.user=response.user
      
      req.session.user.loggedIn=true
      if(req.body.query){
        res.redirect(req.body.query)

      }else{
        res.redirect('/')

      }
      
    }else{
      if(response.usrErr){
        req.session.loginErr='User not found'

      }else if(response.passErr){
        req.session.loginErr='Invalid password'

      }
      
      res.redirect('/login')
    }
  })

})
router.get('/profile',verifyLogin,async (req,res)=>{
  let user=req.session.user
  let count=null
  let wishlistCount=null
  if(user){
    wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)
    count=await userHelpers.getCartCount(req.session.user._id)
  }
  
 
  let products= await userHelpers.getLatestOrders(req.session.user._id)
  
  

  
  
  res.render('user/profile',{user,profilePage:true,products,productJson:JSON.stringify(null),count,wishlistCount})
})



router.post('/changeUserPassword',verifyLogin,async(req,res)=>{
  console.log(req.body)
  userHelpers.changeUserPassword(req.body,req.session.user._id).then((response)=>{
      res.redirect('/profile')
  })
})
router.post('/changeUserDetails',verifyLogin,async(req,res)=>{
  
  
  userHelpers.changeUserDetails(req.body,req.session.user._id).then((response)=>{
        req.session.user=response
        res.redirect('/profile')

      
    
      
  })
      
})
router.get('/forget-password',async(req,res)=>{
  let userId=req.query.userId
  res.render('user/forget-password',({loginPage:true,userId,Err:req.session.forgetPassErr}))
})
router.post('/forget-password',async(req,res)=>{
  userHelpers.forgetPassword(req.body).then((response)=>{
    if(response.status){
      res.redirect('/login')
      req.session.forgetPassErr=false

    }else{
        if(response.emailErr){
          req.session.forgetPassErr="User not found"

        }else if(response.confirmPassErr){
          req.session.forgetPassErr="The Password does not matches"

        }
        
        
        res.redirect('/forget-password')
      
    }

  })
})

router.get('/logout',(req,res)=>{
  req.session.user=null
  res.redirect('/')

  
})

router.get('/wishlist',verifyLogin,async(req,res)=>{
  let userJson= JSON.stringify(req.session.user)
  let count
  let products
  let wishlistCount
  if(req.session.user){
    count=await userHelpers.getCartCount(req.session.user._id)
    products=await userHelpers.getWishlistProducts(req.session.user._id)
    wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)

  }
  
  let recomendedProducts=await productHelpers.getRecommendedProduct(null,null,products)
  
  
  res.render('user/wishlist',{wishlistCount,user:req.session.user,dontShowList:true,userJson,products,productJson:JSON.stringify(products),count,recomendedProducts})
})
router.get('/add-to-wishlist/:id',(req,res)=>{
  if(req.session.user){

  }else{
    res.json({status:false})
  }
  userHelpers.addToWishlist(req.params.id,req.session.user._id).then((response)=>{
    
    res.json(response)

  })

})
router.get('/remove-wishlist-item/:id',(req,res)=>{
  userHelpers.removeWishlistItem(req.params.id).then((response)=>{
    
    res.json({status:true})
        

  })
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let userJson
  let wishlistCount
  let products
  let recomendedProducts
  let total
  let count
  if(req.session.user){
     userJson= JSON.stringify(req.session.user)
     wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)
       products=await userHelpers.getCartProducts(req.session.user._id)
     recomendedProducts=await productHelpers.getRecommendedProduct(null,null,products)
      
      total = await userHelpers.getTotalAmount(req.session.user._id)
      count=await userHelpers.getCartCount(req.session.user._id)

  }
  
 
    if(total){
      total=total.total

    }else{
      total=0
    }
  
         res.render('user/cart',{count,dontShowCart:true,user:req.session.user,products,total,productJson:JSON.stringify(products),userJson,wishlistCount,recomendedProducts})

  
  
  

  
})

router.get('/add-to-cart/:id',(req,res)=>{
  console.log('api call')
  if(req.session.user){
    
    userHelpers.addToCart(req.params.id,req.session.user._id).then((response)=>{
     
      res.json({status:true})
      
    })

    

  }else{
    res.json({status:false})
  }

  





})
router.post('/changeProductQuantity',(req,res)=>{
  
   
   userHelpers.changeProductQuantity(req.body).then((response)=>{

    
     
     res.json(response)

   })
})
router.get('/removeCartProduct/:id',(req,res)=>{
 console.log(req.params.id)
  userHelpers.removeCartProduct(req.params.id).then((response)=>{
    res.json({status:true})
       
          
  })
})

router.get('/checkout',verifyLogin,async(req,res)=>{
  let userJson= JSON.stringify(req.session.user)
  let products=[]
  let total 
  let query
  let queryId
  let wishlistCount
  let count
  if(req.session.user){
    wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)
    count=await userHelpers.getCartCount(req.session.user._id)

  }
  if(req.query.id){
    let product=await productHelpers.getProductDetails(req.query.id)
    let proObj={
      product,
      quantity:1

    }
    products.push(proObj)
    total = product.price
    query='id'
    queryId=product._id
  
  }else if(req.query.cart){
    products=await userHelpers.getCartProducts(req.session.user._id)
    total = await userHelpers.getTotalAmount(req.session.user._id)
    query='cart'
  if(total){
    total=total.total

  }else{
    total=0
  }

  }
  
  res.render('user/checkout',{orderPage:true,user:req.session.user,total,products,userJson,query,queryId,count,wishlistCount,productJson:JSON.stringify(null)})
})

router.post('/checkout',async(req,res)=>{
  
  let products
  let total 
  if(req.body.id){
    let product=await productHelpers.getProductDetails(req.body.id)
    products=[
        {
        item:product._id,
        quantity:1
        }
      ]
      

    
    
    total = product.price
  
  }else if(req.body.cart){
    products=await userHelpers.getProductDetails(req.session.user._id)
    total = await userHelpers.getTotalAmount(req.session.user._id)
  if(total){
    total=total.total

  }else{
    total=0
  }

  }
  
     userHelpers.placeOrder(req.body,products,total).then((orderId)=>{
      
      if(req.body.payment_method==='COD'){
       
       res.json({cod_success:true})
      }
      else {
        console.log(total)
        userHelpers.generateRazorpay(orderId,total).then((response)=>{
          
          res.json(response)

        })

      }

     })
    
    
  
  
})
router.get('/orderPlaced',verifyLogin,async(req,res)=>{
  let userJson= JSON.stringify(req.session.user)
  let wishlistCount
  let count
  if(req.session.user){
    wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)
    count=await userHelpers.getCartCount(req.session.user._id)

  }
  
  res.render('user/orderPlaced',{user:req.session.user,userJson,count,wishlistCount,orderPage:true,productJson:JSON.stringify(null)})
})
router.get('/view-orders',verifyLogin,async(req,res)=>{
  let userJson= JSON.stringify(req.session.user)
  let orders=await userHelpers.viewOrders(req.session.user._id)
  let wishlistCount
  let count
  if(req.session.user){
    wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)
    count=await userHelpers.getCartCount(req.session.user._id)

  }
  res.render('user/view-orders',{orders,orderPage:true,user:req.session.user,userJson,count,wishlistCount,productJson:JSON.stringify(null)})
})
router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  let userJson= JSON.stringify(req.session.user)
  let products= await userHelpers.viewOrderProducts(req.params.id,req.session.user._id)
  let wishlistCount
  let count
  if(req.session.user){
    wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)
    count=await userHelpers.getCartCount(req.session.user._id)

  }
  
  res.render('user/view-order-products',{products,orderPage:true,user:req.session.user,userJson,count,wishlistCount,productJson:JSON.stringify(null)}) 
})

router.post('/verifyPayment',(req,res)=>{
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
    
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('Payment Successfull')

      res.json({status:true})
    })

  }).catch((err)=>{
    console.log(err)
    res.json({status:false,errMsg:"Payment Failed"})
  })

})
router.get('/track-order/:id',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let country
  let wishlistCount
  if(user){
    wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)
    count=await userHelpers.getCartCount(req.session.user._id)

  }
  let orderStatus=await userHelpers.getOrderStatus(req.params.id)
  console.log("🚀 ~ file: user.js ~ line 582 ~ router.get ~ orderStatus", orderStatus)
  res.render('user/track-order',{user,count,wishlistCount,orderStatus,orderPage:true,productJson:JSON.stringify(null)})
  

})
router.get('/connect-us',async(req,res)=>{
  let user=req.session.user
  let count=null
  let wishlistCount=null
  if(user){
    wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)
    count=await userHelpers.getCartCount(req.session.user._id)
  }
  res.render('user/feedback',{user,count,wishlistCount,productJson:JSON.stringify(null),contactPage:true,err:req.session.feedbackErr})
})
router.get('/feedback-submitted',async(req,res)=>{
  let user=req.session.user
  let count=null
  let wishlistCount=null
  if(user){
    wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)
    count=await userHelpers.getCartCount(req.session.user._id)
  }
  res.render('user/feedback-submited',{count,wishlistCount,productJson:JSON.stringify(null),contactPage:true,err:req.session.feedbackErr})


})
router.post('/feedback',async(req,res)=>{
  console.log(req.body)
  productHelpers.sendFeedBack(req.body).then((response)=>{
    if(response.status){
      res.json({status:true})
    }else{
      console.log('err')
    }
  })
})

module.exports = router;
