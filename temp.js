const express = require('express');
const session = require('express-session');
require('dotenv').config({ path: './.env' });
const connectDB = require('./routes/db');
const User = require('./models/User');
const Blog = require('./models/Blog');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }, // 1 hour
}));

const authenticate = async (email, phoneNo) => {
    const user = await User.findOne({ $or: [{ email }, { phoneNo }] });
    return !user;
};

// Routes
app.get('/', async (req, res) => {
    const user = req.session.user || false;
    if (user) {
        const blogs = await Blog.find();
        const users = await User.find();
        res.render('index.ejs', { user, blogs, users });
    } else {
        res.render('login');
    }
});

app.get('/login', (req, res) => res.render('login'));

app.get('/registration', (req, res) => res.render('registration'));

app.post('/registration', async (req, res) => {
    const { name, email, password, phoneNo } = req.body;
    const isAuth = await authenticate(email, phoneNo);
    if (isAuth) {
        const user = new User({ name, email, password, phoneNo });
        try {
            await user.save();
            res.render('welcome', { name });
        } catch (err) {
            console.error(`Error saving user: ${err.message}`);
            res.render('reregister');
        }
    } else {
        res.send('<h1>This User Already Exists<h1><br><a href="/login"><button>Login</button></a>');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && user.password === password) {
        req.session.user = user;
        res.redirect('/user');
    } else {
        res.send('<script>alert("Wrong Email or Password");window.location.replace("/login");</script>');
    }
});

app.get('/user', async (req, res) => {
    const user = req.session.user || false;
    if (user) {
        const blogs = await Blog.find();
        const users = await User.find();
        res.render('index.ejs', { user, blogs, users });
    } else {
        res.render('login');
    }
});

app.get('/create-blog', (req, res) => {
    const user = req.session.user || false;
    if (user) res.render('newBlog', { user });
    else res.render('login');
});

app.post('/create-blog', async (req, res) => {
    const user = req.session.user;
    if (user) {
        const { title, content } = req.body;
        const blog = new Blog({
            title,
            content,
            Author: user.name,
            postedBy: user._id,
        });
        try {
            await blog.save();
            res.cookie('message', 'Your Blog is created Successfully', { httpOnly: true });
            res.redirect('/user');
        } catch (err) {
            console.error(`Error saving blog: ${err.message}`);
        }
    } else {
        res.render('login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) res.status(500).send('Error Destroying Session');
        res.clearCookie('connect.sid');
        res.render('login');
    });
});

const port = process.env.PORT;
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
