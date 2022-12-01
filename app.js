var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session=require('express-session')
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs=require('express-handlebars')
require('dotenv').config()
var app = express();
var fileupload=require('express-fileupload')
var db=require('./config/connection')
var handlebars=hbs.create({})
const MongoStore = require('connect-mongo')
handlebars.handlebars.registerHelper('if_eq', function(arg1,arg2,options) {
  return(arg1 == arg2)?options.fn(this) : options.inverse(this)
})
handlebars.handlebars.registerHelper('returnOnlyZeroindex', function (arg1) {
  const arr = arg1.split(/ (.*)/);
  return arr[0].charAt(0)
})
handlebars.handlebars.registerHelper('capitalize', function (arg1) {
  let str=""+arg1
  
  return str.toUpperCase()
})
handlebars.handlebars.registerHelper('priceComma', function (arg1) {
  let arr=[]
  arg1=""+arg1
  arr.push(arg1.split(""))
  let price
  let commas=arr[0]
  
  if(commas.length > 3){
    
    if(commas.length == 4){
      price=commas[0]+","+commas[1]+commas[2]+commas[3]
    }
    else if(commas.length == 5){
      price=commas[0]+commas[1]+","+commas[2]+commas[3]+commas[4]
    }
    else if(commas.length == 6){
      price=commas[0]+","+commas[1]+commas[2]+","+commas[3]+commas[4]+commas[5]
    }
    else if(commas.length == 7){
      price=commas[0]+commas[1]+","+commas[2]+commas[3]+","+commas[4]+commas[5]+commas[6]
    }
    else if(commas.length == 8){
      price=commas[0]+","+commas[1]+commas[2]+","+commas[3]+commas[4]+","+commas[5]+commas[6]+commas[7]
    }
    else if(commas.length == 9){
      price=commas[0]+commas[1]+","+commas[2]+commas[3]+","+commas[4]+commas[5]+","+commas[6]+commas[7]+commas[8]
    }
  }
  else{
    price=commas.join("")
  }
  
  
  return price
})
handlebars.handlebars.registerHelper('getKey', function (arg1) {
  let arr=[]
  console.log(arg1)
  
  Object.keys(arg1)
  .forEach(function eachKey(key) { 
    if(arg1[key].status){
      arr.push(key)

    }
     
     
  });
  
  let key=arr.slice(-1)[0]
  key=key[0].toUpperCase() + key.slice(1);
  return key
  
})
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials'}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
  secret:"Key",
  cookie:{maxAge:31*24*3600000},
  store: MongoStore.create({
    mongoUrl: "mongodb+srv://Rishal:806992@cluster0.ga6j7.mongodb.net/?retryWrites=true&w=majority" || 'mongodb://localhost/ustora',
    autoRemove: 'disabled'
  })
  
  
}))
app.use(fileupload())
db.connect((err)=>{
  if(err){
    console.log('Connnection Error '+ err)

  }else{
    console.log('Database connected succesfully')

  }
  
})

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
