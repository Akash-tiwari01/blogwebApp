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
         return fs.readFileSync(file,'utf8')
    }catch(err)
    {
        console.log(`Error in Reading Data ${err}`);
        return {}
    }
}

const writeData = (data)=>{
    console.log(data);
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

    const user = readData()
    const id = Date.now().toString
    console.log(req.body);
    res.send(req.body)
})


const port = process.env.PORT
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})