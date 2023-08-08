import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";


const app = express();
const PORT = 3000;

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


// encrypt the password with environment variable
const secret = "Thisisourlittlesecret."
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

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
    const userEmail = req.body.username;
    const userPassword = req.body.password;
    
    const isUserFound = await User.findOne({email: userEmail});
    
    // if user is not found
    if(!isUserFound) {
        // create a new user model
        const user = new User ({
            email: userEmail,
            password: userPassword
        });
        
        await user.save();
    } else {
        console.log("User already exists.");
        res.render("secrets");
    }
});

// login
app.post("/login", async(req, res) => {
    const userEmail = req.body.username;
    const userPassword = req.body.password;

    const isUserFound = await User.findOne({email: userEmail});


    if(isUserFound && (isUserFound.password === userPassword)) {
        res.render("secrets");
    } else {
        console.log("We don't have any account associated with this email.");
        const wrongCredential = "<p>*Invalid email or password.</p>"
        res.render("login",{onWrongCredential: wrongCredential});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});