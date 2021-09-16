function comment(ele_post,token,com_data){
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange=function(){
        console.log(xhttp.responseText)
    }
    xhttp.open('POST','http://localhost:5000/comment')
    xhttp.send(JSON.stringify({
        'token':token,
        'pname':ele_post.children[0].innerHTML,
        'com_data': com_data
    }))
}
function login(username,password){
    console.log('Reached Login ajax from jade')
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange=function(){
        console.log(xhttp.responseText)
    }
    xhttp.open('POST','http://localhost:5000/login')
    xhttp.send(JSON.stringify({
        'username':username,
        'password':password
    }))
}