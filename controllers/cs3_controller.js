var express = require('express')
var app = express()
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.set('view-engine','jade')
var cors = require('cors')
app.use(cors())

var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://127.0.0.1:27017'
var mydb='forum'
var col1 = 'disc_posts'
var col = 'users'

var jwt = require('jsonwebtoken')

var server=app.listen(5000,()=>{
    console.log('Server Started')
})

function get_token(obj){
    return jwt.sign(obj,'token')
}
function validate(token){
    return jwt.verify(token,'token')
}

var request = require('request')

MongoClient.connect(url,(err,db)=>{
    if(err)
        throw err
    dbo=db.db(mydb)
    
    //create collection
    dbo.createCollection(col,(err,result)=>{
        console.log('collection created')
    })
    dbo.createCollection(col1,(err,result)=>{
        console.log('collection created disc')
    })

    app.get('/enterreg',(req,res)=>{
        res.render('enter.jade')
    })
    app.get('/enterlog',(req,res)=>{
        res.render('enterlog.jade')
    })
    app.get('/forump',(req,res)=>{
        request.post({
            headers:{'content-type':'application/json'},
            url:'http://localhost:5000/allposts',
            body:JSON.stringify({
                'token':"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImthcnkiLCJwYXNzd29yZCI6Im1rIiwiaWF0IjoxNjI5NDIwNjE2fQ.5VFOxXUGzac5cv_rXhmA5ohqxwG9rmAUGEj76IbYXNE"
            })
        },(err,response,body)=>{
            console.log(body)
            console.log(JSON.stringify(body))


            // console.log(response.body)
            // console.log(JSON.stringify(response.body))
            console.log('Body is')
            console.log(body)
            var recs;
            if(body=='No Posts Found for this user')
            recs=JSON.stringify([])
            else
            recs=body
            res.render('forum.jade',{'postrec':recs,'token':"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImthcnkiLCJwYXNzd29yZCI6Im1rIiwiaWF0IjoxNjI5NDIwNjE2fQ.5VFOxXUGzac5cv_rXhmA5ohqxwG9rmAUGEj76IbYXNE"})
            // else
            // res.render('forum.jade',{'postrec':body,'token':"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFieCIsInBhc3N3b3JkIjoic2VuIiwiaWF0IjoxNjI5MzY5NzMzfQ.AJnzIi42X0O0B38Q4zj5LZAVtT7SJA1e-HQsq3NIHlU"})
        })
        
    })
    app.post('/login',(req,res)=>{
        var data =req.body
        console.log(data)
        dbo.collection(col).find(req.body).toArray((err,result)=>{
            
            
            if(result.length==0)
                res.send('Invalid User')
            else{
                console.log('In login')
                console.log(result[0])

                res.redirect('/forump')
                
                // request.post({
                //     headers:{'content-type':'application/json'},
                //     body:JSON.stringify({'username':req.body.username}),
                //     url:'http://localhost:5000/allposts'
                // },(err,response,body)=>{
                //     //console.log(response.body)
                //     console.log(body)
                //     //res.redirect('/forump')
                //     res.render('forum.jade',{'postrec':body,'token':result[0].token})
                // })
                
                //
                //res.send(result[0].token)
                //localStorage.setItem(data.username,result[0].token)
            }
        })

    })
    app.post('/reg',(req,res)=>{
        var t =get_token(req.body)

        var user_obj={
            'username':req.body.username,
            'password':req.body.password,
            'token':t,
            'posts':[]
        }

        dbo.collection(col).insertOne(user_obj,(err,result)=>{
            console.log('registered')
            res.redirect('/enterlog')
        })
    })
    app.post('/newpost',(req,res)=>{
        //var username = localStorage.key(0)
        //var token = localStorage.getItem(username)

        var token = req.headers['x-access-token']
        console.log('new post token: '+token)
        dbo.collection(col).find({'token':token}).toArray((err,result)=>{
            // console.log(token)
            // console.log(result)
            // console.log(validate(token))
            // console.log(result.length!=0)
            // console.log(result.username==validate(token).username)
            // console.log(result.username)
            // console.log(validate(token).username)


            // console.log(typeof result.username)
            // console.log(typeof validate(token).username)
            if(result.length!=0 && result[0].username==validate(token).username){

                var upd_sel={
                    "username":result[0].username
                }
                var upd={
                    $push:{
                        posts:{
                            $each:[req.body.pname]
                        }
                    }
                }
                dbo.collection(col).updateOne(upd_sel,upd,(err,result)=>{
                    console.log(result)
                })
                var post_obj={
                    'username':result[0].username,
                    'pname':req.body.pname,
                    'topic':req.body.topic,
                    'pcon':req.body.pcon,
                    'comments':[]
                }
                dbo.collection(col1).insertOne(post_obj,(err,result)=>{
                    console.log(result)
                })
                console.log('inserted post')
                
                // request.post({
                //     headers:{'content-type':'application/json'},
                //     body:JSON.stringify(
                //         {'username':result[0].username}
                //     ),
                //     url:'http://localhost:5000/allposts'
                // },(err,response,body)=>{
                //     //console.log(body)
                //     res.render('forum.jade',{'postrec':body,'token':token})
                // })
                res.redirect('/forump')
                //res.render('forum.jade')

            }
            else{
                console.log('nope')
            }
        })

        

    })
    app.post('/allposts',(req,res)=>{
        console.log('in allposts')
        console.log(req.body)
        dbo.collection(col).find({"token":req.body.token}).toArray((err,result)=>{
            if(result.length!=0 && result[0].username==validate(req.body.token).username){
                
                dbo.collection(col1).find({'username':result[0].username}).toArray((err,result2)=>{
                    if(result2.length!=0){
                        console.log('searched')
                        res.send(JSON.stringify(result2))
                    }
                    else
                    {
                        res.send('No Posts Found for this user')
                    }
                })
            }
            else{
                res.send('nope')
            }
            
        })
  
    })
    app.post('/comment',(req,res)=>{
        //recieves token,com_data,pname
        var data = req.body
        console.log('In Comment')
        console.log(data)
        var token=req.headers['x-access-token']
        dbo.collection(col).find({'token':token}).toArray((err,result)=>{
            console.log(result)
            if(result.length!=0 && result[0].username==validate(token).username){
                var username = result[0].username

                console.log(username+"  "+data.pname)

                dbo.collection(col1).find({'username':username,'pname':data.pname}).toArray((err,result2)=>{
                    console.log(result2)
                    if(result2.length!=0){
                        var upd_sel={
                            'username':username,
                            'pname':data.pname
                        }
                        var upd={
                            $push:{
                                comments:{
                                    $each:[data.com_data]
                                }
                            }
                        }
                        dbo.collection(col1).updateOne(upd_sel,upd,(err,result3)=>{
                            console.log(result3)
                            
                            res.redirect('/forump')
                            //res.send('Updated')
                        })
                    }
                    else{
                        console.log('nope2')
                        res.send('nop2')
                    }
                })


            }
            else{
                console.log('nope1')
                res.send('nop1')
            }
        })
    })
    app.post('/topicMsgs',(req,res)=>{
        //gets topic
        var topic = req.body.topic
        dbo.collection(col1).find(req.body).toArray((err,result)=>{
            console.log(result)
            res.send(JSON.stringify(result))
        })
    })
    
})