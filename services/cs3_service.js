var express = require('express')
var app = express()
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.set('view-engine','jade')
app.use(cors())

var jwt = require('jsonwebtoken')

var request = require('request')

var server=app.listen(8089,()=>{
    console.log('Server Started')
})

var MongoClient = require('mongodb').MongoClient
var url = 'mongod://127.0.0.1:27017'
var mydb='forum'
//var col1 = 'disc_posts'
var col = 'users'

MongoClient.connect(url,(err,db)=>{
    if(err)
        throw err
    dbo=db.db(mydb)
    
    //create collection

    app.post('/login',(req,res)=>{

        dbo.collection(col).find(req.body).toArray((err,result)=>{

            var ans = result[0]
            var token = ans.token

            request.post({
                headers:{
                    'content-type':'application/json',
                    'x-access-token':token.toString()
                },
                url:'http://localhost:5000',
                body : req.body
            },(err,response,body)=>{
                console.log(body)
                res.send('Logged In')
            })
        })


    })
})

