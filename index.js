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
        return {}
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

const authenticate = (user)=>true

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
    const isAuth = authenticate([name,email,password,phoneNo])
    if(isAuth)
    {
        users[id]={id:id,name:name,email:email,password:password,phoneNo:phoneNo,isLogin:false};
        const success = writeData(users);
        if(success)
        {
            res.render("welcome",{user:users[id]});
        }
        else{
            res.render("reregister")
        }
    }
      
})


const port = process.env.PORT
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})