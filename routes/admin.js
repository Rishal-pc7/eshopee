var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/productHelpers')
var adminHelpers=require('../helpers/adminHelpers')
var userHelpers=require('../helpers/userHelpers')
var fs=require('fs')
var path=require('path')

const {removeBackgroundFromImageUrl,removeBackgroundFromImageFile} = require("remove.bg")
var resizeImg=require('resize-img')
/* GET users listing. */
const verifyLogin=function (req,res, next){
  let admin=req.session.admin
  if(admin){
    next()
    
  }else{
    res.redirect('/admin/login')

  }
}

router.get('/',verifyLogin, function(req, res, next) {
 
  productHelpers.getAllProducts().then((products)=>{
    
    res.render('admin/view-products',{products,admin:true,adminData:req.session.admin,add:true})

  })
  
});
router.get('/login',(req,res,next)=>{
  
  if(req.session.admin){
    


    res.redirect('/admin');

  }
  else{
    res.render("admin/login",{admin:true,loginErr:req.session.adminloginErr,loginPage:true})
    req.session.loginErr=false
   

  }
  
  
})

router.post('/login',(req,res)=>{

 adminHelpers.doLogin(req.body).then((response)=>{
    
    if(response.status){
      
      req.session.admin=response.admin
      req.session.admin.loggedIn=true
      req.session.adminloginErr=false
      res.redirect('/admin')
    }else{
      if(response.usrErr){
        req.session.adminloginErr=response.usrErr

      }else if(response.passErr){
        req.session.adminloginErr=response.passErr

      }
      
      res.redirect('/admin/login')
    }
  })



})

router.get('/logout',(req,res)=>{
  req.session.admin=null
  res.redirect('/admin')
})
router.get('/add-product', verifyLogin,function(req, res, next){
  res.render('admin/add-product',{admin:true,adminData:req.session.admin})

})
 router.post('/add-product',(req,res)=>{
  
   
   
     let id=req.body.name
    let displayImage=req.files.displayImage
    
    fs.mkdirSync('./public/product-images/'+id,{recursive:true})
    
     displayImage.mv('./public/product-images/'+id+'/displayImage'+id+".jpg",async(err,done)=>{
      
        var file='./public/product-images/'+id+'/displayImage'+id+".jpg"
        const localFile = file;
      const outputFile = file;
      removeBackgroundFromImageFile({
        path:localFile,
        apiKey: "JuXYH84nWW9GU7qVHYvdNDD1",
        size: "auto",
        type: "auto",
        format:'jpg',
        outputFile:'./public/product-images/'+id+'/displayImage'+id+".jpg"

      }).then(async(result) => {
        
        fs.writeFileSync('./public/product-images/'+id+'/displayImage'+id+".jpg", result);
       
      
      }).catch((errors) => {
      console.log(JSON.stringify(errors));
      });
      
      const image = await resizeImg(fs.readFileSync('./public/product-images/'+id+'/displayImage'+id+'.jpg'), {
        width: 400,
        height: 400
    });
    fs.writeFileSync('./public/product-images/'+id+'/displayImage'+id+'.jpg', image)
 
    
       if(!err){

        
        req.body.img=fs.readFileSync('./public/product-images/'+id+'/displayImage'+id+".jpg", 'base64');
        productHelpers.addProducts(req.body,async (id)=>{

        res.redirect('/admin')
      })  

       }else{
         console.log(err)
       }

     })
     

   
   
 })
 router.get('/delete-product', function(req, res, next){
 productHelpers.deleteProduct(req.query.id).then((response)=>{
  
     
     res.redirect('/admin')
   

 })

})

router.get('/edit-product',verifyLogin, function(req, res, next){
  productHelpers.getProductDetails(req.query.id).then(async(product)=>{
    let specifications=await productHelpers.getSpecifications(req.query.id)
    
    res.render('admin/edit-product',{admin:true,product,adminData:req.session.admin,specifications})
  })
 
 })
 router.post('/edit-product',async function(req, res, next){
  let specifications=await productHelpers.getSpecifications(req.query.id)
  
  
    let img

    fs.mkdirSync('./public/product-images/'+req.query.id,{recursive:true})
    
    
    if(req.files){
      
    let displayImage=req.files.displayImage
    
   
    if(displayImage){
      
      
      displayImage.mv('./public/product-images/'+req.query.id+'/displayImage'+req.query.id+".jpg").then(async()=>{
        
        
        var file='./public/product-images/'+req.query.id+'/displayImage'+req.query.id+".jpg"
        const localFile = file
      
      removeBackgroundFromImageFile({
        path:localFile,
        apiKey: "JuXYH84nWW9GU7qVHYvdNDD1",
        size: "auto",
        type: "auto",
        
        
        outputFile:file

      }).then(async(result) => {
       
        
      
        const base64img = result.base64img;
        
        req.body.img=base64img
        productHelpers.updateDetails(req.query.id,req.body,specifications).then(async(response)=>{
  
    
          res.redirect('/admin')
        
        })
       
        
      
        
      }).catch((errors) => {
        
      console.log(JSON.stringify(errors));
      });
    
      })
        
        

     
    
     
 


    
      
        

    
            
 
   
     
    }
  
    
  }

  
  else{
    productHelpers.updateDetails(req.query.id,req.body,specifications).then(async(response)=>{
  
    
      res.redirect('/admin')
    
    })

  }
  

  
 
    
   
  
 
 })


 router.get('/all-users',verifyLogin,(req,res)=>{
   adminHelpers.getAllUsers().then((users)=>{
    res.render('admin/all-users',{users,admin:true,adminData:req.session.admin})

   })
  })
   router.get('/all-orders',verifyLogin,(req,res)=>{
    adminHelpers.getAllOrders().then((orders)=>{
      let orderLength=orders.length
      console.log(orders)
     res.render('admin/all-orders',{admin:true,adminData:req.session.admin,orders,orderLength})
     
 
    })
   

 })
  
 router.get("/view-order-products/:id",verifyLogin,async(req,res)=>{
  let products= await userHelpers.viewOrderProducts(req.params.id)
  let id=JSON.stringify(req.params.id)
  res.render('admin/view-order-products',{products,admin:true,adminData:req.session.admin,id}) 


 })
 router.get('/change-delivery-status/:id',verifyLogin,async(req,res)=>{
   
   let isStatus=await adminHelpers.IsOrderPlaced(req.params.id)
   let status
     
     
     if(isStatus.status == false){
       console.log('false')
        status=JSON.stringify(true)

     }
     let orderId=req.params.id
     let details=await adminHelpers.getDeliveryStatus(req.params.id)
     console.log("🚀 ~ file: admin.js ~ line 314 ~ router.get ~ details", details)
     res.render('admin/change-delivery-status',{admin:true,adminData:req.session.admin,status,details,orderId})
   })
   

 router.post('/change-delivery-status',async(req,res)=>{
   console.log(req.body)
   adminHelpers.changeDeliveryStatus(req.body).then((response)=>{
     console.log(response)
     res.json({status:true})
   })
 })
 router.get('/add-offer',verifyLogin,async(req,res)=>{
  let product=await productHelpers.getProductDetails(req.query.id)
  let day =[]
  let proExistTrue=false
  let proExist=await productHelpers.isProOfferExist(req.query.id)
  
  if(proExist == false){
    
    proExistTrue=false
   
  }else{
    proExistTrue=true
    
  }
  
  let dateNow=new Date()
  let yearNow=dateNow.getFullYear()
  for(i=1;i<=31;i++){
    day.push(''+i)
  }
  let month=[]
  for(i=1;i<=12;i++){
    month.push(''+i)
  }
  let year=[]
  for(i=yearNow;i<=yearNow+50;i++){
    year.push(''+i)
  }
  let hour=[]
  for(i=1;i<=12;i++){
    hour.push(''+i)
  }
  let minute=[]
  for(i=0;i<=60;i++){
    if(i<10){
      minute.push('0'+i)  
    }else{
      minute.push(''+i)

    }
   
  }
  
  
   res.render('admin/add-offer',{product,day,month,year,hour,minute,proExist,proExistTrue,admin:true,adminData:req.session.admin})
 })
 router.post('/add-offer',async(req,res)=>{
   console.log(req.body)
   adminHelpers.addProductOffer(req.body.proId,req.body).then((response)=>{
     res.redirect('/admin')

   })
 })
module.exports = router;
