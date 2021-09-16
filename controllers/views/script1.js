function allposts(token){
    var xhttp = new XMLHttpRequest()
    xhttp.open('POST','http://localhost:5000/allposts')
    xhttp.setRequestHeader('Content-Type':'application/json')
    xhttp.send(JSON.stringify({
        'token':token
    }))
    xhttp.onreadystatechange=()=>{
        if(xhttp.readyState=== XMLHttpRequest.DONE && xhttp.status===200){
            console.log(xhttp.responseText)
        }
    }                        

}
function login(){
    console.log('Reached Login ajax from jade')
    var username = document.getElementById('username').value
    var password = document.getElementById('password').value

    console.log(username+password)
    var xhttp = new XMLHttpRequest()
     xhttp.onreadystatechange=function(){
         if(xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200){
            console.log(xhttp.responseText)
            var token =JSON.parse(xhttp.responseText).token
            allposts(token)
        }
        
    }
    xhttp.open('POST','http://localhost:5000/login')
    xhttp.setRequestHeader('Content-Type','application/json')
    xhttp.send(JSON.stringify({
            "username":username,
            "password":password
        })
    )
}