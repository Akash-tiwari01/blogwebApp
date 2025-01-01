const express = require('express')
const path = require('path')
const fs = require('fs')
require('dotenv').config({path:"./process.env"})

const app = express();
app.set("view engine", "ejs")
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(express.static('public'))

const file = process.env.DATA_FILE

const readData = ()=>{
    try{
         return JSON.parse(fs.readFileSync(file,'utf-8'))
    }catch(err)
    {
        console.log(`Error in Reading Data ${err}`);
        return []
    }
}

const writeData = (data)=>{
    
    try{
        fs.writeFileSync(file,JSON.stringify(data,null,2),"utf-8",)
        return true;
    }catch(err)
    {
        console.log(`Error in Writing Data ${err}`);
        return false;
    }
}

const authenticate = (user,users)=>{
   const res = users.filter((element)=>(element.email===user.email || element.phoneNo == user.phoneNo));
   if (res.length===0)
   {
    return true;
   }
   return false
   
}

app.get('/',(req,res)=>{
    const user = {islogin:false}
    res.render("index",{user:user||{}})
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/registration",(req,res)=>{
    res.render("registration")
})

app.post('/registration',(req,res)=>{

    const users = readData()
    const id = Date.now()
    const {name,email,password,phoneNo} = req.body;
    const isAuth = authenticate({email:email,phoneNo:phoneNo},users)
    if(isAuth)
    {
        users.push({id:id,name:name,email:email,password:password,phoneNo:phoneNo,isLogin:false});
        const success = writeData(users);
        if(success)
        {
            res.render("welcome",{name:name});
        }
        else{
            res.render("reregister")
        }
    }
    else{
        res.send(`<h1>This User Already Exist<h1><br><a href="/login"><button>Login</button></a>`);
    }
      
})

app.post('/login',(req,res)=>{
    const {email,password} = req.body;
    const user  = readData().filter((element)=>(element.email === email));
    console.log(req.body);
    console.log(user);

    if(user[0].password === password && user.length)
    {
        
        user[0].isLogin = true;
        console.log(user);
        res.render(`index`,{user:user[0]});
    }
    else
    res.send('<script>alert("Wrong Email Id or Password");window.location.replace("/login");</script>')

})


const port = process.env.PORT
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})