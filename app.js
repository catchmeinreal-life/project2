import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';

const app = express();
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// In-memory user store for demonstration purposes
const users = [
    { 
        id: 1,
        username: 'user1',
        password: bcrypt.hashSync('password1', 8)
    },
    { 
        id: 2,
        username: 'user2',
        password: bcrypt.hashSync('password2', 8)
    },
]

app.post('/login', (req, res) => {
    const {username, password} = req.body;

    const user = users.find(u => u.username === username);
    // if (!user) {
    //     return res.status(401).send('Invalid username or password');
    // }
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.userId = user.id;
        return res.status(200).send('Login successful');
    } else {
        return res.status(401).send('Invalid username or password');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out');
        }
        res.status(200).send('Logout successful');
    });
});

app.get('/protected', (req, res) => {
    // Check if user is authenticated
    // In a real application, you would check the session store or a database
    // to verify the user's session and permissions
    // For demonstration, we will just check if userId is set in the session
    const user = users.find(u => u.id === req.session.userId);
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized'); //redirect to login
        
    } else {
        res.send(`Hello ${user.username}, welcome to the protected route!`);
    }
    res.status(200).send('Protected content');
});