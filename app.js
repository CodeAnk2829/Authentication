import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import bcrypt from "bcrypt";


const app = express();
const PORT = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.set("strictQuery", false);
await mongoose.connect("mongodb://127.0.0.1:27017/userDB");

/**********************CREATE USER'S DATABASE **********************************/

// create a user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        min: 1,
        max: 16
    }
});



// create model for user
const User = mongoose.model("User", userSchema);


app.get("/", async (req, res) => {
    res.render("home");
});

app.get("/login", async (req, res) => {
    res.render("login");
});

app.get("/register", async (req, res) => {
    res.render("register");
});

// registration
app.post("/register", async (req, res) => {
    // encrypt the user's password using bcrypt hashing
    // security level - 4
    bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
        if(err) {
            console.log(err.message);
        } else {
            const userEmail = req.body.username;
            // use hashing to hash password
            const userPassword = hash;
            
            const isUserFound = await User.findOne({email: userEmail});
            
            // if user is not found
            if(!isUserFound) {
                // create a new user model
                const user = new User ({
                    email: userEmail,
                    password: userPassword
                });
                
                await user.save();
                res.render("secrets");
            } else {
                console.log("User already exists.");
                const alreadyRegistered = "<p>*This email has already been registered. Please login</p>"
                res.render("login", {message: alreadyRegistered});
            }
        }
    });
});

// login
app.post("/login", async(req, res) => {
    const userEmail = req.body.username;
    const userPassword = req.body.password;

    const isUserFound = await User.findOne({email: userEmail});

    // if user exists
    if(isUserFound) {
        // compare the password (which user has typed in) with the 
        // password that has been stored corresponding to the same user
        bcrypt.compare(userPassword, isUserFound.password, (err, result) => {
            if(err) {
                console.log(err);
            } else {
                if(result === true) {
                    // if password matched
                    res.render("secrets");
                } else {
                    // if password didn't match
                    console.log("We don't have any account associated with this email.");
                    const wrongCredential = "<p>*Invalid email or password.</p>"
                    res.render("login",{onWrongCredential: wrongCredential});
                }
            }
        });
    } else {
        // if user doesn't exist
        const userNotRegisteredMessage = "<p>*Email doesn't exist. Please register</p>";
        res.render("register", {message: userNotRegisteredMessage});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});