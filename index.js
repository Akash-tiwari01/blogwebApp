const express = require('express');
// const path = require('path')
// const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config({path:"./process.env"});
const connectDB = require('./db.js');
const User = require('./models/User');
const Blog = require('./models/Blog');
con

const app = express();

// connect to db 
connectDB();

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
    cookie: { maxAge: 3600000 } // Set session lifetime (1 hr in ms)
}));



// const userFile = process.env.DATA_FILE;
// const blogFile = process.env.BLOG_FILE;

const readUserData = ()=>{
    try{
         return JSON.parse(fs.readFileSync(userFile,'utf-8'))
    }catch(err)
    {
        console.log(`Error in Reading user Data ${err}`);
        return []
    }
}

const writeUserData =  (data)=>{
    
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

const getUser = async (email, phoneNo)=>{
       const user = await User.findOne({$or:[{email},{phoneNo}]});
       return user;
}

const genRandomId=()=>{
    const letter=['a','q','e','d','r','c','s','e','b','g'];
    let id = Date.now().toString();
    for(let i=0;i<5;i++);
    {id += letter[Math.floor(Math.random() * 10)];}
    return id;

}
 
app.get('/',async (req,res)=>{
    const user = req.session.user || false;
    if(user){    
        const blogs = await Blog.find()
        const users = await user.find()
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

app.post('/registration',async (req,res)=>{

    // const users = readUserData()
    // const id = Date.now()
    const {name,email,password,phoneNo} = req.body;
    const isUser = await getUser(email,phoneNo)
    if(isUser)
    {   
        res.send(`<h1>This User Already Exist<h1><br><a href="/login"><button>Login</button></a>`);     
    }
    else{
            const user = new User({name,email,password,phoneNo});
            const hashedPassword = await bcrypt.hash(password,10);
            try{
                await user.save();
                res.render('welcome',{name});
            }catch(err){
                console.error(`Error saving user: ${err.message}`);
                res.render('reregister');
            }
        }
       
})

app.post('/login',async (req,res)=>{
    const {email,password} = req.body;
    // const users = readUserData()
    // const user = users.filter((element)=>(element.email === email));
    // console.log(req.body);
    // console.log(user);
    const user = await User.findOne({email});
    const isPasswordValid = await bcrypt.compare(password, user[0].password); // Compare password
    if(user && isPasswordValid)
    {
        req.session.user = user;
        res.redirect('/user')
    }
    else
    res.send('<script>alert("Wrong Email Id or Password");window.location.replace("/login");</script>');

})

app.get(`/user`,async (req,res)=>{
    const user = req.session.user||false;
    // const {message} = req.cookies || false;
    console.log(user);
    if( user )
    {   
        const blogs = await Blog.find()
        const users = await User.find()
        res.render("index.ejs", { user, blogs, users});
    } else {
       
        res.render('login'); // Redirect to login if not authenticated
    }
})

app.get('/create-blog',(req,res)=>{
    const user = req.session.user||false;
    console.log(user);
    if(user)
    res.render('newBlog', {user});
    else
    res.render('login')
})

app.post('/create-blog',async (req,res)=>{
    const user = req.session.user;
    
    if(user)
        {      
            const {title,content}=req.body;
            // const blogs = readBlogData();
            // const _id = genRandomId();
            // const {name,id} = user
            // const blog = {_id,title,content,Author:name,postedAt:Date(),postedBy:id};
            // blogs.push(blog);
            // const success = writeBlogData(blogs);
            const blog = new Blog({
                title,
                content,
                Author:user.name,
                postedBy:user._id,
            });

            try
            {   
                await blog.save();
                res.cookie('message', 'Your Blog is created Successfully', { httpOnly: true });
                res.redirect('/user');

            } catch (err){
                console.error(`Error Saving blogs: ${err.message}`);
            }

        } 
        else
            res.render('login');

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