const express = require('express');
const path = require('path')
const fs = require('fs');
const session = require('express-session');
require('dotenv').config({path:"./process.env"});
const app = express();

//middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: 'your-secret-key', // Replace with a strong, random string
    resave: false, // Avoid resaving session if unchanged
    saveUninitialized: false, // Don't save empty sessions
    cookie: { maxAge: 3600000 } // Set session lifetime (10 minutes in ms)
}));



const userFile = process.env.DATA_FILE;
const blogFile = process.env.BLOG_FILE;

const readUserData = ()=>{
    try{
         return JSON.parse(fs.readFileSync(userFile,'utf-8'))
    }catch(err)
    {
        console.log(`Error in Reading user Data ${err}`);
        return []
    }
}

const writeUserData = (data)=>{
    
    try{
        fs.writeFileSync(userFile,JSON.stringify(data,null,2),"utf-8",)
        return true;
    }catch(err)
    {
        console.log(`Error in Writing user Data ${err}`);
        return false;
    }
}

const readBlogData = ()=>{
    try{
        return JSON.parse(fs.readFileSync(blogFile,'utf-8'))
   }catch(err)
   {
       console.log(`Error in Reading Blog Data ${err}`);
       return []
   }
}

const writeBlogData = (data)=>{
    
    try{
        fs.writeFileSync(blogFile,JSON.stringify(data,null,2),"utf-8",)
        return true;
    }catch(err)
    {
        console.log(`Error in Writing Blog Data ${err}`);
        return false;
    }
}

const authenticate = (user,users)=>{
   const res = users.filter((element)=>(element.email===user.email || element.phoneNo == user.phoneNo));
   if (res.length===0)
   {
    return true;
   }
   return false;
   
}
 
app.get('/',(req,res)=>{
    const user = req.session.user || false;
    if(user){    
        const blogs = readBlogData();
        const users = readUserData();
        res.render("index.ejs",{user:user,blogs:blogs,users:users});
    }
    else{
        res.render('login')
    }
    

});

app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/registration",(req,res)=>{
    res.render("registration")
})

app.post('/registration',(req,res)=>{

    const users = readUserData()
    const id = Date.now()
    const {name,email,password,phoneNo} = req.body;
    const isAuth = authenticate({email:email,phoneNo:phoneNo},users)
    if(isAuth)
    {
        users.push({id:id,name:name,email:email,password:password,phoneNo:phoneNo});
        const success = writeUserData(users);
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
    const users = readUserData()
    const user = users.filter((element)=>(element.email === email));
    // console.log(req.body);
    // console.log(user);

    if(user.length && user[0].password === password)
    {
        req.session.user = {...user};
        res.redirect('/user')
    }
    else
    res.send('<script>alert("Wrong Email Id or Password");window.location.replace("/login");</script>');

})

app.get(`/user`,(req,res)=>{
    const user = req.session.user||false;
    if( user )
    {
        const blogs = readBlogData();
        const users = readUserData();
        res.render("index.ejs", { user, blogs, users });
    } else {
        res.render('login'); // Redirect to login if not authenticated
    }
})

app.get('/create-blog',(req,res)=>{
    const user = req.session.user
    console.log(user);
    if(user)
    res.render('newBlog', {user});
    else
    res.render('login')
})

app.post('/create-blog',()=>{

})

app.get('/logout',(req,res)=>{
    req.session.destroy((err)=>{
        if(err)
        res.session(500).send('Error Destroying Session');
        // clearing cookie
        res.clearCookie('connect.sid'); // 'connect.sid' is default cookie name for Express Session
        res.render('login');
    });
});
const port = process.env.PORT
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})