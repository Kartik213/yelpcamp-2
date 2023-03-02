if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}
// require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methdOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");  
const expressMongooseSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// const dbUrl = "mongodb://localhost:27017/yelp-camp";

const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");

const campgroundRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const usersRoutes = require("./routes/users");

mongoose.set('strictQuery', false);
mongoose.connect(dbUrl, {  
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on PORT ${port}`);
})

app.engine("ejs", ejsMate);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methdOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const secret = process.env.SECRET || "randomstrongsecret";
const store = MongoStore.create({
    mongoUrl:dbUrl,
    secret:secret,
    touchAfter:24 * 60 * 60
})

store.on("error",function(err){
    console.log("Session Store Error",err);
})

const sessionConfig = { 
    store:store,
    name:"session",
    secret: secret, 
    resave: false, 
    saveUninitialized: true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
 }
app.use(session(sessionConfig)); 
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(expressMongooseSanitize({
    replaceWith:"_"
}));

app.use(helmet({
    contentSecurityPolicy:false,
}));

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{ //middleware for flash
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.get("/", (req, res) => {
    res.render("home.ejs");
})

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);
app.use("/",usersRoutes);

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) message = "Somenthing Went Wrong";
    res.status(statusCode);
    res.render("error.ejs", { err });
})

