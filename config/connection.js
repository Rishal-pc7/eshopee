const mongoClient=require('mongodb').MongoClient
 const state={
     db:null
 }

module.exports.connect=function (done){

    const url= "mongodb+srv://Rishal:806992@cluster0.ga6j7.mongodb.net/?retryWrites=true&w=majority" || 'mongodb://localhost/ustora'
    const dbname="ustora"

    mongoClient.connect(url,(err,data)=>{

        if(err) return done(err)
        state.db=data.db(dbname)
        
        done()
   
    })
    

}
module.exports.get= function (){
    return state.db
} 