# XBlog App

Task #1 

To read/write user’s data we create separate function named readUserData()/writeUserData

```jsx

const userFile = process.env.DATA_FILE;
const blogFile = process.env.BLOG_FILE;

const readBlogData = ()=>{
    try{
        return JSON.parse(fs.readFileSync(blogFile,'utf-8'))
   }catch(err)
   {
       console.log(`Error in Reading Data ${err}`);
       return []
   }
}

const writeBlogData = (data)=>{
    
    try{
        fs.writeFileSync(blogFile,JSON.stringify(data,null,2),"utf-8",)
        return true;
    }catch(err)
    {
        console.log(`Error in Writing Data ${err}`);
        return false;
    }
}
```

# Create /registration route

- the app.get()  hits when  user is redirected to registration page page
- the [app.post](http://app.post)() hits when user is trying to register in registeration page page
- inside app.post()

### **Flow of Execution**

1. User submits the registration form.
2. The server:
    - Reads the current list of users.
    - Checks if the user already exists.
3. Depending on the authentication result:
    - If the user is new, adds their details, saves them, and shows a welcome page.
    - If the user exists, informs them and provides a login option.

### Step-by-Step Instructions for `/registration`

**1. Read Existing User Data**

- Retrieve the current list of registered users from a data source (e.g., file, database) using the `readUserData()` function.
    
    ```jsx
    const users = readUserData();
    
    ```
    

### **2. Generate a Unique User ID**

- Use the current timestamp (`Date.now()`) to create a unique identifier for the new user.
    
    ```jsx
    const id = Date.now();
    
    ```
    

### **3. Extract Form Data**

- Extract the submitted data (name, email, password, and phone number) from the request body (`req.body`).
    
    ```jsx
    const { name, email, password, phoneNo } = req.body;
    
    ```
    

### **4. Authenticate User**

- Check if the provided email or phone number is already associated with an existing user using the `authenticate` function.
    
    ```jsx
    const isAuth = authenticate({ email: email, phoneNo: phoneNo }, users);
    
    ```
    
    Authenticate Function 
    
    ```jsx
    const authenticate = (user,users)=>{
       const res = users.filter((element)=>(element.email===user.email || element.phoneNo == user.phoneNo));
       if (res.length===0)
       {
        return true;
       }
       return false
       
    }
    ```
    

### **5. If User is New (Not Authenticated)**

- If `isAuth` is `true`, the user does not already exist:
    - Add the new user’s data to the `users` list with `isLogin` initially set to `false`.
        
        ```jsx
        users.push({ id: id, name: name, email: email, password: password, phoneNo: phoneNo, isLogin: false });
        
        ```
        
    - Write the updated `users` list back to the data source using the `writeUserData()` function.
        
        ```jsx
        const success = writeUserData(users);
        
        ```
        
    - **If the data is saved successfully**:
        - Render a `welcome` page, passing the user's name for a personalized experience.
            
            ```jsx
            res.render("welcome", { name: name });
            
            ```
            
    - **If data saving fails**:
        - Render a `reregister` page prompting the user to try again.
            
            ```jsx
            res.render("reregister");
            
            ```
            

### **6. If User Already Exists**

- If `isAuth` is `false`, the user is already registered:
    - Respond with an HTML message informing the user that they exist.
    - Provide a link to the login page with a button for redirection.
        
        ```jsx
        res.send(`<h1>This User Already Exist<h1><br><a href="/login"><button>Login</button></a>`);
        
        ```
        

---

```jsx
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
        users.push({id:id,name:name,email:email,password:password,phoneNo:phoneNo,isLogin:false});
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
```

# Create /login route

the app.get()  hits when  user is redirected to login page

the [app.post](http://app.post)() hits when user is trying to login in login page 

inside [app.post](http://app.post)( ) route 

---

### **Flow of Execution**

1. User submits the login form.
2. The server:
    - Reads the user data.
    - Searches for the user by email.
    - Verifies the password.
3. Based on the result:
    - **Success**: Marks the user as logged in and renders the home page with user, blogs, and users data.
    - **Failure**: Displays an error message and redirects back to the login page.

---

### **Key Points**

1. **Password Check**:
    - Compares the submitted password (`req.body.password`) with the stored password (`user[0].password`).
2. **Session Management** (missing in the code):
    - To keep the user logged in across requests, use sessions (e.g., `req.session.user = user[0]`).
3. **Potential Issues**:
    - **Empty Filter Result**: If no user matches the email, accessing `user[0]` can cause an error. A safeguard should be added.
        
        ```jsx
        if (user.length && user[0].password === password) { ... }
        else { ... }
        
        ```
        
4. **Security Enhancements**:
    - **Password Hashing**: Store passwords securely using a hashing algorithm (e.g., bcrypt).
    - **Input Validation**: Sanitize and validate user input to prevent SQL injection or other attacks.

### **1. Extract Login Credentials**

- Retrieve the `email` and `password` submitted in the login form from `req.body`.

### **2. Read Existing User Data**

- Retrieve the list of registered users from a data source (e.g., file, database) using the `readUserData()` function.
    
    ```jsx
    const users = readUserData();
    
    ```
    

### **3. Find the User in the List**

- Use the `filter` method to search for a user whose email matches the provided email.
    - This returns an array (`user`) with the matching user object (if found).
    
    ```jsx
    const user = users.filter((element) => (element.email === email));
    
    ```
    

### **4. Debugging Information**

- Log the `req.body` (submitted form data) and the result of the `filter` operation (`user`) to the console for debugging purposes.
    
    ```jsx
    console.log(req.body);
    console.log(user);
    
    ```
    

### **5. Check Credentials**

- Verify if:
    1. The `user` array contains a matching user (`user.length > 0`).
    2. The password provided matches the password stored for the user (`user[0].password === password`).
    
    ```jsx
    if (user[0].password === password && user.length) {
    
    ```
    

### **6. Successful Login**

- If the credentials match:
    1. Set the `isLogin` property of the user object to `true`.
        
        ```jsx
        user[0].isLogin = true;
        
        ```
        
    2. Read the list of existing blogs using `readBlogData()` to include in the rendered page.
        
        ```jsx
        const blogs = readBlogData();
        
        ```
        
    3. Log the updated `user` object for debugging.
        
        ```jsx
        console.log(user);
        
        ```
        
    4. Render the `index.ejs` page, passing:
        - `user[0]`: The logged-in user object.
        - `blogs`: The list of all blogs.
        - `users`: The list of all registered users.
        
        ```jsx
        res.render('index.ejs', { user: user[0], blogs: blogs, users: users });
        
        ```
        

### **7. Failed Login**

- If the credentials don’t match:
    - Send an alert to the client using a `<script>` tag with `alert()` to notify the user of the error.
    - Redirect them back to the login page using `window.location.replace()`.
    
    ```jsx
    res.send('<script>alert("Wrong Email Id or Password");window.location.replace("/login");</script>');
    
    ```
    

---

```jsx
app.get("/login",(req,res)=>{
    res.render("login")
})

app.post('/login',(req,res)=>{
    const {email,password} = req.body;
    const users = readUserData()
    const user = users.filter((element)=>(element.email === email));
    console.log(req.body);
    console.log(user);

    if(user[0].password === password && user.length)
    {
        
        user[0].isLogin = true;
        const blogs = readBlogData()
        console.log(user);
        res.render('index.ejs',{user:user[0],blogs:blogs,users:users})
    }
    else
    res.send('<script>alert("Wrong Email Id or Password");window.location.replace("/login");</script>')

})
    
})

```

## Now create view folder

|—-view

|—index.ejs

|—login.ejs

|—registration.ejs

|—register.ejs

# Create login.ejs

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog App Login</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="left_side">
            <h1>Welcome to XBlog</h1>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia optio culpa illo rerum amet delectus perferendis, molestias blanditiis quibusdam. Earum, quae magni inventore quidem illum repudiandae dolores itaque modi laborum. Blanditiis perspiciatis neque libero ducimus.</p>
        </div>

        <div class="right_side">
            <h2>Login Here</h2>
            <form action="/login" method="POST">
                <input type="text" id="username" placeholder="E-mail" name="email" required>
                <input type="password" id="password" placeholder="Password" name="password" required>
                <a href="#">Forgot Password?</a>
                <div class="btn_container">
                    <button type="submit" class="btn btn_login">Login</button>
                    <button type="button" class="btn btn_register" onClick="window.location.replace('/registration')">Register</button>
                </div>
                <button type="button" class="btn btn_admin" style="margin-top: 10px;">Admin Login</button>
            </form>
        </div>
    </div>
</body>
</html>

```

Here we divided main page into 2 section 

1. left side contain app name & some description
2. right side contain actual login form with 3 buttons 
    - login button submit login form and redirect to /login using post method
    - register button redirect to /registration route
    - admin login button redirect to /adminLogin route

That’s all about login page 

# Create Registration.ejs

```jsx
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Form</title>
    <link rel="stylesheet" href="registration.css"> <!-- Add your CSS here -->
    <script>
        // JavaScript to check if passwords match
        function validatePassword() {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorMessage = document.getElementById('password-error');

            if (password !== confirmPassword) {
                errorMessage.textContent = "Passwords do not match!";
                document.getElementById('submit-btn').disabled = true;
            } else {
                errorMessage.textContent = "";
                document.getElementById('submit-btn').disabled = false;
            }
        }
    </script>
</head>
<body>
    <div class="container">
        <!-- Left Section -->
        <div class="left-section">
            <h1>Welcome to Our Website</h1>
            <p>Explore our platform and enjoy amazing services. Join us now!</p>
        </div>

        <!-- Right Section (Registration Form) -->
        <div class="right-section">
            <div class="form-container">
                <h2>Register</h2>
                <form action="/registration" method="POST" onsubmit="return validatePassword()">
                    <div class="form-group">
                        <label for="userName">Username</label>
                        <input type="text" id="userName" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required oninput="validatePassword()">
                        <span id="password-error" style="color: red;"></span> <!-- Error message for passwords mismatch -->
                    </div>
                    <div class="form-group">
                        <label for="phoneNo">Phone No</label>
                        <input type="tel" id="phoneNo" name="phoneNo" required>
                    </div>
                    <div class="form-group">
                        <label for="terms">
                            <input type="checkbox" id="terms" name="terms" required>
                            I agree to the <a href="/terms">Terms and Conditions</a>
                        </label>
                    </div>
                    <div class="form-buttons">
                        <button type="submit" id="submit-btn" class="register-btn">Register</button>
                        <button type="button" class="login-btn" onclick="window.location.href='/login'">Login</button>
                        <button type="button" class="admin-login-btn" onclick="window.location.href='/admin-login'">Admin Login</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</body>
</html>

```

Similar to login page registration page contain 2 sections 

the left section contain registration form  with fields like name, email , phone no, password , confirm password etc

then there is 3 buttons 

1. Register button submit form
2. login button redirect to /login route
3. Admin login button redirects to /adminLogin Route 

---

# Index.ejs

### **Flow/Summary of the Code**

1. **Check User Authentication**:
    - When the page is loaded, it verifies if the user is logged in (`user` exists and `user.isLogin` is `true`).
    - If the user is not authenticated, they are redirected to the login page (`/login`).
2. **Structure of the Page**:
    - The page is divided into **three main sections**:
        1. **Header**: Contains the app title, a search bar, and user-related options (e.g., "New Blog" button and username).
        2. **Blogs Section (Middle)**: Displays all blogs in a scrollable format.
            - Each blog shows:
                - Title
                - A snippet of the content
                - Author's name
                - "Edit" option (only if the logged-in user is the author of that blog)
            - If no blogs are available, a message is shown instead.
        3. **Sidebar (Right)**: Displays a list of follow suggestions (other users who are not the logged-in user).
3. **Conditional Features**:
    - **Edit Button**: Visible only for blogs authored by the logged-in user.
    - **Follow Suggestions**: Displays users who are not the logged-in user.
4. **Dynamic Rendering**:
    - Uses data passed to the EJS template (e.g., `blogs`, `users`, `user`) to dynamically generate the content:
        - Blogs and their details are iterated through.
        - Follow suggestions are filtered to exclude the logged-in user.
5. **Fallback Scenarios**:
    - If no blogs exist, a friendly message ("We Have No blogs Posted yet") is displayed.
6. **Interaction**:
    - The user can:
        - Search blogs using the search bar.
        - Click "New Blog" to navigate to the blog creation page.
        - Edit their own blogs.
        - Follow other users via the sidebar.

---

This flow ensures that:

1. Only authenticated users can access the content.
2. Content is personalized (e.g., shows "Edit" for the user's blogs and suggests other users to follow).
3. The interface dynamically adjusts based on the data (blogs and users).

---

# Step by Step Guide

### **1. Redirect if User is Not Logged In**

- **Check User Login Status**: The `<%if(!(user && user.isLogin)){%>` block ensures the user is logged in.
- **Redirect to Login Page**: If `user` does not exist or `user.isLogin` is `false`, the script redirects to the `/login` page using `window.location.replace("/login")`.

```html
<%if(!(user && user.isLogin)){%>
    <script>
        window.location.replace("/login")
    </script>
<% }%>

```

---

### **2. Create a Container**

- A `<div>` element wraps the entire page for structured styling and layout.

```html
<div class="container">

```

---

### **3. Header Section**

- **Header Components**:
    1. **Left Section**: Displays the app title ("Blogging Platform").
        
        ```html
        <div class="header-left">
            <h1>Blogging Platform</h1>
        </div>
        
        ```
        
    2. **Middle Section**: Contains a search bar for searching blogs.
        
        ```html
        <div class="header-middle">
            <input type="text" placeholder="Search blogs..." id="search-bar">
        </div>
        
        ```
        
    3. **Right Section**:
        - A form for creating a new blog (`/create-blog`).
        - Displays the logged-in user's username.
        
        ```html
        <div class="header-right">
            <form class="btn" action="/create-blog" method="post">New Blog +</form>
            <span class="user-name"><%= user.username %></span>
        </div>
        
        ```
        

---

### **4. Main Content**

The main content is divided into two parts:

- **Blogs Section**: Displays all blogs.
- **Right Sidebar**: Displays follow suggestions.

```html
<main>
    <!-- Middle Section -->
    <section class="blogs-section">
        ...
    </section>

    <!-- Right Sidebar -->
    <aside class="sidebar">
        ...
    </aside>
</main>

```

---

### **4.1 Blogs Section**

- **Loop Through Blogs**:
    - Uses `<% blogs.forEach(blog => { %>` to loop through the list of blogs.
    - For each blog:
        - Display the blog title (`blog.title`).
        - Show the first 200 characters of the blog content (`blog.content.substring(0, 200)`).
        - Display the author's name (`blog.author`).
        
        ```html
        <div class="blog-card">
            <h2><%= blog.title %></h2>
            <p><%= blog.content.substring(0, 200) %>...</p>
            <p><strong>Author:</strong> <%= blog.author %></p>
        
        ```
        
    - **Edit Option**:
        - If the logged-in user (`user.id`) matches the blog author's ID (`blog.authorId`), an "Edit" button is displayed.
        - Clicking the button redirects to the `/edit-blog/<blog.id>` route.
        
        ```html
        <% if (blog.authorId === user.id) { %>
            <a href="/edit-blog/<%= blog.id %>" class="edit-btn">Edit</a>
        <% } %>
        
        ```
        
- **No Blogs Case**:
    - If no blogs are available (`blogs.length` is 0), display a message.
    
    ```html
    <% } else { %>
        <h1>We Have No blogs Posted yet</h1>
    <% } %>
    
    ```
    

### **4.2 Right Sidebar**

- **Follow Suggestions**:
    - Loops through the list of users (`users.forEach`).
    - For each user:
        - If the user's ID (`u.id`) does not match the logged-in user's ID (`user.id`), display their name and a "Follow" button.
        
        ```html
        <% if (u.id !== user.id) { %>
            <li>
                <span><%= u.name %></span>
                <button class="follow-btn">Follow</button>
            </li>
        <% } %>
        
        ```
        

### **5. Closing Tags**

- The `</div>` container closes the main `<div>`.
- The `<body>` tag closes the entire body content.

# code

```jsx

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blogging Platform</title>
    <link rel="stylesheet" href="index.css">
    <link rel="stylesheet" href="style.css">
</head>
<body> 
    <%if(!(user && user.isLogin)){%>
   
        <script>
             //redirect to login page  
             window.location.replace("/login")
        </script>
       
    <% }%>
    <div class="container">
        <!-- Header -->
        <header>
            <div class="header-left">
                <h1>Blogging Platform</h1>
            </div>
            <div class="header-middle">
                <input type="text" placeholder="Search blogs..." id="search-bar">
            </div>
            <div class="header-right">
                <form class="btn" action="/create-blog" method="post">New Blog +</form>
                <span class="user-name"><%= user.username %></span>
            </div>
        </header>

        <!-- Main Content -->
        <main>
            <!-- Middle Section -->
            <section class="blogs-section">
                <div class="blogs">
                    <%if(blogs.length){
                         blogs.forEach(blog => { %>
                        <div class="blog-card">
                            <h2><%= blog.title %></h2>
                            <p><%= blog.content.substring(0, 200) %>...</p>
                            <p><strong>Author:</strong> <%= blog.author %></p>
                            <% if (blog.authorId === user.id) { %>
                                <a href="/edit-blog/<%= blog.id %>" class="edit-btn">Edit</a>
                            <% } %>
                        </div>
                    <% })} else { %>
                        <h1>We Have No blogs Posted yet</h1>
                        <% } %>
                </div>
            </section>

            <!-- Right Sidebar -->
            <aside class="sidebar">
                <h3>Follow Suggestions</h3>
                <ul>
                    <% users.forEach(u => { %>
                        <% if (u.id !== user.id) { %>
                            <li>
                                <span><%= u.name %></span>
                                <button class="follow-btn">Follow</button>
                            </li>
                        <% } %>
                    <% }) %>
                </ul>
            </aside>
        </main>
    </div>
</body>
</html>

```

---

---

# Add Sessions

Up until now we are using  boolean system “isLogin” but with this traveling One rout to another while user is logged in become difficult as we know http requests are stateless. and for every route we need to extract user data from our file which is not right 

We have to pass email or user Id and then extract every time from the file like:

 

```
 	  const {email} = req.query;
    const users = readUserData()
    const user = users.filter((element)=>(element.email === email));
```

### About Session

### **What is a Session?**

A session is a mechanism to store and maintain user-specific data during their interaction with a web application. Unlike cookies, which are stored on the client-side, session data is typically stored on the server-side, and a session ID is sent to the client to identify the session.

---

### **Why Do We Need Sessions?**

1. **User Authentication**:
    - Sessions allow web applications to identify users and maintain their login state.
2. **Temporary Data Storage**:
    - Enables storing temporary data (e.g., shopping cart contents, form data) without requiring a database write for every action.
3. **Personalized User Experience**:
    - Sessions help tailor content or actions for individual users.
4. **Secure State Management**:
    - Because session data is stored server-side, it is more secure compared to client-stored cookies.

---

### **Example: Implementing Sessions for Multiple Users**

### **Use Case**:

A blogging platform where multiple users can log in and have personalized experiences (e.g., viewing their profile or blogs).

### **Setup**:

Using `express-session` middleware in a Node.js application.

1. **Install `express-session`**:
    
    ```bash
    npm install express-session
    
    ```
    
2. **Setup Session Middleware**:
    
    ```jsx
    const session = require('express-session');
    const express = require('express');
    const app = express();
    
    app.use(
        session({
            secret: 'your-secret-key', // Used to sign the session ID
            resave: false, // Avoid resaving session if it hasn't changed
            saveUninitialized: true, // Save uninitialized sessions
            cookie: { maxAge: 60000 } // Session timeout in milliseconds
        })
    );
    
    ```
    
    ### Secret key
    
    ### **What is the `secret` Field in `express-session`?**
    
    The `secret` field in the `express-session` configuration is a key used to sign and verify the session ID cookie. This signing process ensures the integrity and security of the session, preventing tampering or unauthorized access.
    
    ---
    
    ### **Purpose of the `secret` Field**
    
    1. **Signing the Session ID**:
        - The `secret` is used to create a cryptographic hash of the session ID.
        - The hash is sent along with the session ID to the client in the cookie.
    2. **Verifying the Session ID**:
        - When a request is received, the server uses the `secret` to verify that the session ID hasn't been altered by comparing the hash.
    3. **Security**:
        - Prevents session fixation and tampering attacks, as any modification to the session ID would invalidate the hash.
    
    ---
    
    ### **Example: How the `secret` Works**
    
    1. **Session Initialization**:
        - Server generates a session ID (e.g., `123abc`) and signs it with the secret (e.g., `your-secret-key`).
        - Produces a signed value (e.g., `123abc.hash`).
    2. **Sending to the Client**:
        - The session ID (`123abc`) and its signature (`123abc.hash`) are sent as a cookie.
    3. **Client Request**:
        - When the client sends the session ID back, the server verifies the signature using the same secret.
        - If the signature is valid, the session is trusted; otherwise, it's rejected.
    
    ---
    
    ### **Best Practices for the `secret` Field**
    
    1. **Use a Strong, Random Value**:
        - The `secret` should be a long, randomly generated string to make it difficult for attackers to guess.
        - Example:
            
            ```jsx
            const crypto = require('crypto');
            const secret = crypto.randomBytes(32).toString('hex');
            
            ```
            
    2. **Avoid Hardcoding**:
        - Store the secret in an environment variable or configuration file instead of directly in the code.
        - Example:
            
            ```jsx
            const session = require('express-session');
            app.use(
                session({
                    secret: process.env.SESSION_SECRET, // Load from environment variables
                    resave: false,
                    saveUninitialized: true,
                    cookie: { maxAge: 60000 }
                })
            );
            
            ```
            
    3. **Regular Rotation**:
        - Periodically update the secret to enhance security.
    4. **Avoid Sharing Secrets Across Applications**:
        - Use a unique secret for each application to minimize risk.
    
    ---
    
    ### **Why Is the Secret Important?**
    
    If an attacker guesses or accesses the `secret`, they can forge valid session IDs or tamper with session data. This can lead to security vulnerabilities, including session hijacking or impersonation. Hence, securing the `secret` is critical for the safe functioning of sessions.
    
    ### resave property
    
    The `resave` option in **`express-session`** determines whether the session should be saved back to the session store on every request, even if it hasn’t been modified.
    
    - **`resave: true`**: Ensures the session is always saved to the store, regardless of changes. This can increase storage writes, making it suitable for scenarios where maintaining session expiry is crucial, but it may lead to unnecessary overhead in high-traffic applications.
    - **`resave: false`**: Saves the session only if it has been modified. This reduces overhead and improves performance, especially for modern session stores that handle modifications efficiently. However, it may not extend the session's expiration time in stores with TTL.
    
    ### Best Practice:
    
    Use **`resave: false`** unless required otherwise, as it strikes a balance between performance and functionality. Pair it with a session store that supports rolling expiration to ensure a good user experience.
    
3. **Login Route**:
On successful login, save user data in the session.
    
    ```jsx
    app.post('/login', (req, res) => {
        const { email, password } = req.body;
        const users = readUserData(); // Function to fetch users from a database/file
        const user = users.find(u => u.email === email && u.password === password);
    
        if (user) {
            req.session.user = { id: user.id, name: user.name, email: user.email };
            res.redirect('/dashboard');
        } else {
            res.send('<h1>Invalid email or password</h1>');
        }
    });
    
    ```
    
4. **Protect Routes**:
Middleware to ensure a user is logged in before accessing certain routes.
    
    ```jsx
    const isAuthenticated = (req, res, next) => {
        if (req.session.user) {
            next(); // User is authenticated, proceed to the next middleware
        } else {
            res.redirect('/login');
        }
    };
    
    app.get('/dashboard', isAuthenticated, (req, res) => {
        res.send(`<h1>Welcome ${req.session.user.name}!</h1>`);
    });
    
    ```
    
5. **Logout Route**:
Destroy the session on logout.
    
    ```jsx
    app.post('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Unable to logout');
            }
            res.redirect('/login');
        });
    });
    
    ```
    

---

### **Types of Sessions**

1. **Client-Side Sessions**:
    - Stored entirely in the browser, often using cookies or local storage.
    - Example: JWT (JSON Web Tokens) used for authentication.
        
        ```jsx
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user.id, name: user.name }, 'secret-key');
        
        ```
        
2. **Server-Side Sessions**:
    - Session data is stored on the server, and the client receives a session ID in a cookie.
    - Example: `express-session` as shown above.
3. **Persistent Sessions**:
    - Sessions that persist across browser closures, often stored in a database.
    - Example: Storing session data in Redis.
        
        ```jsx
        const RedisStore = require('connect-redis')(session);
        app.use(
            session({
                store: new RedisStore({ client: redisClient }),
                secret: 'your-secret-key',
                resave: false,
                saveUninitialized: true
            })
        );
        
        ```
        

---

### **Session vs Cookie vs Token**

| **Feature** | **Session** | **Cookie** | **Token** |
| --- | --- | --- | --- |
| **Storage** | Server-side | Client-side | Client-side |
| **Security** | More secure (data is server-side) | Less secure (data is on the client) | Secure with proper encryption |
| **Use Case** | Persistent login, shopping carts | Remember user preferences | Stateless authentication (e.g., APIs) |
| **Scalability** | Server-dependent | Highly scalable | Highly scalable |

---

### **Changes Made**

1. **Session Setup**:
    - Configured `express-session` to handle user sessions securely.
    - Session duration set to 10 minutes (`600000 ms`).
2. **Login Flow**:
    - After successful login, user data is saved in the session (`req.session.user`).
    - Redirects to the `/user` route after login.
3. **Session-based Access Control**:
    - Protected `/user` and `/create-blog` routes. If a user is not logged in, they are redirected to the login page.
4. **Global Access to User Data**:
    - User session data is passed to EJS templates for rendering personalized content.

---

### Install express-session package

```powershell
npm install express-session
```

### **Importing `express-session`**

```jsx
const session = require('express-session'); // Import session library

```

- This line imports the `express-session` package to enable session management in your app.

---

### **Session Configuration**

```jsx
app.use(session({
    secret: 'your-secret-key', // Replace with a strong, random string
    resave: false, // Avoid resaving session if unchanged
    saveUninitialized: false, // Don't save empty sessions
    cookie: { maxAge: 600000 } // Set session lifetime (10 minutes in ms)
}));

```

- **`secret`**: A random string used to sign the session ID. It ensures the session data is tamper-proof.
- **`resave`**: Avoids resaving session data to the store if it hasn't changed.
- **`saveUninitialized`**: Prevents saving uninitialized sessions, useful for avoiding storing empty sessions.
- **`cookie.maxAge`**: Sets the duration (10 minutes) for which the session cookie will remain valid.

---

### **Rendering the Homepage**

```jsx
const user = req.session.user || { isLogin: false };

```

- Checks if the session contains a logged-in user. If not, it defaults to `{ isLogin: false }` for anonymous users.

```jsx
res.render("index.ejs", { user, blogs, users });

```

- Passes the `user` object (either from the session or the default) along with `blogs` and `users` data to the `index.ejs` view.

---

### **Handling `/login` Route**

```jsx
req.session.user = { ...user, isLogin: true };

```

- Saves the logged-in user data in the session, marking `isLogin: true`.

```jsx
res.redirect('/user');

```

- Redirects the user to the `/user` route after successfully logging in.

---

### **Protecting the `/user` Route**

```jsx
const user = req.session.user;

```

- Retrieves the user data from the session.

```jsx
if (user && user.isLogin) {
    // Render the user-specific dashboard
    const blogs = readBlogData();
    const users = readUserData();
    res.render("index.ejs", { user, blogs, users });
} else {
    res.redirect('/login'); // Redirects to login if the user is not authenticated
}

```

- If the user is logged in (`isLogin: true`), it renders the dashboard. Otherwise, it redirects to the login page.

---

### **Protecting the `/create-blog` Route**

```jsx
const user = req.session.user;
if (user && user.isLogin) {
    res.render('newBlog', { user });
} else {
    res.redirect('/login');
}

```

- Only allows logged-in users to access the blog creation page. If the user isn't logged in, they are redirected to the login page.

---

### **Redirecting to Homepage After Login**

```jsx
res.render("index.ejs", { user, blogs, users });

```

- After logging in, the user is redirected to the homepage with their session data available to display personalized content.

---

### **Session Expiry**

```jsx
cookie: { maxAge: 600000 }

```

- The session will expire after 10 minutes of inactivity. Users will be logged out automatically after the timeout.

---

# Updated index.js file

```jsx
const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session'); // Import session library
require('dotenv').config({ path: "./process.env" });

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: 'your-secret-key', // Replace with a strong, random string
    resave: false, // Avoid resaving session if unchanged
    saveUninitialized: false, // Don't save empty sessions
    cookie: { maxAge: 600000 } // Set session lifetime (10 minutes in ms)
}));

const userFile = process.env.DATA_FILE;
const blogFile = process.env.BLOG_FILE;

// Utility functions
const readUserData = () => {
    try {
        return JSON.parse(fs.readFileSync(userFile, 'utf-8'));
    } catch (err) {
        console.log(`Error in Reading Data: ${err}`);
        return [];
    }
};

const writeUserData = (data) => {
    try {
        fs.writeFileSync(userFile, JSON.stringify(data, null, 2), "utf-8");
        return true;
    } catch (err) {
        console.log(`Error in Writing Data: ${err}`);
        return false;
    }
};

const readBlogData = () => {
    try {
        return JSON.parse(fs.readFileSync(blogFile, 'utf-8'));
    } catch (err) {
        console.log(`Error in Reading Data: ${err}`);
        return [];
    }
};

const writeBlogData = (data) => {
    try {
        fs.writeFileSync(blogFile, JSON.stringify(data, null, 2), "utf-8");
        return true;
    } catch (err) {
        console.log(`Error in Writing Data: ${err}`);
        return false;
    }
};

const authenticate = (user, users) => {
    return users.every(element => element.email !== user.email && element.phoneNo !== user.phoneNo);
};

// Routes
app.get('/', (req, res) => {
    const user = req.session.user || { isLogin: false };
    const blogs = readBlogData();
    const users = readUserData();
    res.render("index.ejs", { user, blogs, users });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/registration", (req, res) => {
    res.render("registration");
});

app.post('/registration', (req, res) => {
    const users = readUserData();
    const id = Date.now();
    const { name, email, password, phoneNo } = req.body;
    const isAuth = authenticate({ email, phoneNo }, users);

    if (isAuth) {
        users.push({ id, name, email, password, phoneNo, isLogin: false });
        const success = writeUserData(users);

        if (success) {
            res.render("welcome", { name });
        } else {
            res.render("reregister");
        }
    } else {
        res.send(`<h1>This User Already Exists</h1><br><a href="/login"><button>Login</button></a>`);
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = readUserData();
    const user = users.find(element => element.email === email);

    if (user && user.password === password) {
        // Save user data in session
        req.session.user = { ...user, isLogin: true };

        // Redirect to user route
        res.redirect('/user');
    } else {
        res.send('<script>alert("Wrong Email Id or Password");window.location.replace("/login");</script>');
    }
});

app.get('/user', (req, res) => {
    const user = req.session.user;

    if (user && user.isLogin) {
        const blogs = readBlogData();
        const users = readUserData();
        res.render("index.ejs", { user, blogs, users });
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated
    }
});

app.get('/create-blog', (req, res) => {
    const user = req.session.user;

    if (user && user.isLogin) {
        res.render('newBlog', { user });
    } else {
        res.redirect('/login');
    }
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

```

### How it generate unique session Id for different user

### **How Sessions Work Internally**

1. **Unique Session ID**:
    - When a new user interacts with your application (e.g., by logging in), the `express-session` middleware generates a unique session ID for that user.
    - This session ID is stored in the browser as a **cookie** (typically named `connect.sid` by default).
2. **Server-Side Session Storage**:
    - The session data (e.g., `{ user: {...}, isLogin: true }`) is stored on the server, keyed by the session ID.
    - The session ID acts as a pointer to the server-stored session data.
3. **Per-User Isolation**:
    - Each user gets a **different session ID**. Even if two users log in simultaneously, their session IDs are unique, ensuring their session data is isolated.
    - The server uses the session ID sent in the user's cookie to retrieve and handle their specific session data.

### **Example of Unique Sessions**

- **User A Logs In**:
    - A session is created with ID `abcd1234`.
    - The server stores: `{ sessionID: 'abcd1234', data: { user: {...}, isLogin: true } }`.
- **User B Logs In**:
    - A session is created with ID `xyz5678`.
    - The server stores: `{ sessionID: 'xyz5678', data: { user: {...}, isLogin: true } }`.
- **Server Lookup**:
    - When User A sends a request, the browser sends `abcd1234` as the session ID. The server retrieves User A's data.
    - When User B sends a request, the browser sends `xyz5678`. The server retrieves User B's data.