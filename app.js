var express = require("express"),
    app = express(),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User = require("./models/user"),
    Donar = require("./models/donar"),
    Receiver = require("./models/receiver"),
    port=process.env.PORT||8000,
    dotenv=require('dotenv'),
    mongoose = require("mongoose");

app.use(require("express-session")({
    secret: "Rusty is Cool Dog",
    resave: false,
    saveUninitialized: false

}));

app.use(function(req,res,next){
    res.locals.currentUser =req.user;
    next();
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

dotenv.config();
mongoose.connect("mongodb+srv://"+process.env.MLAB_USER+":"+process.env.MLAB_PASS+"@cluster0-kw5s2.mongodb.net/bDonation?retryWrites=true&w=majority");
app.use(function(req,res,next){
    res.locals.currentUser =req.user;
    next();
});


//=======
//ROUTES
//=======




app.get("/", function (req, res) {
    res.render("index");
});
//SECRET ROUTE
//middleware to check if user is logged in or not
app.get("/blood/:userid", isLoggedIn, function (req, res) {
    Receiver.find({},(err,receivers)=>{
        if(err){
            console.log(err);
        }
        else{
            res.render("blood",{userid:req.params.userid,receivers:receivers});
        }
    })
    
});

//AUTH ROUTES
app.get("/register", function (req, res) {
    res.render("register");
});
//handling user signup
app.post("/register", function (req, res) {
    User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render(err);
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/blood/"+req.user._id);
        });
    });
});

//LOGIN ROUTES
//render login form
app.get("/login", function (req, res) {
    res.render("login");
});
//login logic
//middleware to check if user is signed up
app.post("/login", passport.authenticate("local", {

    failureRedirect: "/login"
}), function (req, res) {
    res.redirect("/blood/"+req.user._id)
});

app.get("/logout", function (req, res) {
    req.logOut();
    res.redirect("/");
});

//@routes For Donation and receiveing blood
app.get("/donar/:userid",isLoggedIn,(req,res)=>{
    Donar.findOne({user:{id:mongoose.Types.ObjectId(req.user._id),
          username:req.user.username}},(err,donar)=>{
        if(err){
            res.send(err);
        }
        else{
            // console.log(donar.bgp);
            if(donar.bgp!=null){
                
                res.redirect('/blood/'+req.user._id);
            }
            else{
                res.render("newdonar",{userid:req.user._id});
            }
        }
    })
 
});
app.post("/donar/:userid",(req,res)=>{
    var user={
        id:req.user._id,
        username:req.user.username
    }
    var donar={
        user:user,
        bgp:req.body.Bgp
    }
    Donar.create(donar,(err,donar)=>{
        if(err){
            res.send(err);
        }
        else{
            donar.save();
            res.redirect('/blood/'+req.user._id);
        }
    })
})


app.get("/receiver/:userid",isLoggedIn,(req,res)=>{
    res.render('newReceiver',{userid:req.user._id});
})
app.post("/receiver/:userid",(req,res)=>{
    var user={
        id:req.user._id,
        username:req.user.username
    }
    var receiver= {
        user :user,
        rbgp : req.body.Bgp,
        mobile:req.body.cd,
        start:Date.now(),
        valid:req.body.valid,
        description:req.body.desc

    }
    Receiver.create(receiver,(err,receiver)=>{
        if(err){
            res.send(err);
        }
        else{
            receiver.save();
            res.redirect('/blood/'+req.user._id);
        }
    })
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(port, function () {
    console.log("server started at:"+port);
});