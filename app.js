var  express        = require("express");
     app            = express();
     port           = 3000;
     bodyParser     = require("body-parser");
     mongoose       = require ("mongoose");
     flash          = require("connect-flash");
     passport       = require ("passport");
     LocalStrategy  = require("passport-local");
     methodOverride = require("method-override");
     sell           = require("./models/sell");
     User           = require("./models/user");
    // seedDB         = require("./seeds")
     




//seedDB();
mongoose.connect('mongodb://localhost/lensale', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended : false}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));
app.use(flash());


// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Cameras are beautiful!!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");

    next();
});



// sell.create(
//     {
//         id: 1,
//         model: 'Olympus',
//         image: "https://cdn.pixabay.com/photo/2014/11/22/00/51/camera-541213__340.jpg",
//         price: 180000,
//         description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed."
//     }, function(err, sell){
//      if(err){
//         console.log(err);
//     } else{
//         console.log("New Ad posted!!!");
//         console.log(sell);
//     }
// });


// var cameras = [{
//     id: 1,
//     model: 'Fujifilm',
//     image: "https://cdn.pixabay.com/photo/2016/04/30/05/04/camera-1362419__340.jpg",
//     price: 150000,
// },
// {
//     id: 1,
//     model: 'Olympus',
//     image: "https://cdn.pixabay.com/photo/2014/11/22/00/51/camera-541213__340.jpg",
//     price: 180000,
// },
// {
//     id: 1,
//     model: 'Canon',
//     image: "https://cdn.pixabay.com/photo/2019/11/09/14/28/camera-4613669__340.jpg",
//     price: 260000,
// },
// {
//         id: 1,
//         model: 'Fujifilm',
//         image: "https://cdn.pixabay.com/photo/2016/04/30/05/04/camera-1362419__340.jpg",
//         price: 150000,
// },
// {
//         id: 1,
//         model: 'Olympus',
//         image: "https://cdn.pixabay.com/photo/2014/11/22/00/51/camera-541213__340.jpg",
//         price: 180000,
//  },
//     {
//     id: 1,
//         model: 'Canon',
//         image: "https://cdn.pixabay.com/photo/2019/11/09/14/28/camera-4613669__340.jpg",
//         price: 260000,
// }
// ];


//HOMEPAGE
app.get("/", function (req, res) {
    res. render("index");
});


//INDEX --- SHOW CAMERAS FOR SALE
app.get("/sell", function (req, res) {
   

    //get camera ads from DB
    sell.find({}, function(err, postedCameras){
        if(err){
            console.log(err);
        } else{
             res.render('sell',  { cameras: postedCameras }); 
        }
    });

  
});


//NEW - SHOW FORM TO CREATE AD
app.get("/sell/new", isLoggedIn, function (req, res) {
    res.render('new.ejs');
});



//CREATE- POST NEW CAMERA AD TO DB
app.post("/sell/new", isLoggedIn, function (req, res) {
    
   var name = req.body.name;
   var price = req.body.price;
   var image = req.body.image;
   var desc  = req.body.description;
   var poster = {
       id: req.user._id,
       username: req.user.username
   }
      var newAd = {name: name, image: image, price: price, description: desc, poster: poster};

   //Post a new camera for sale and save to db
   sell.create(newAd, function (err, newlyCreated){
         if(err){
             console.log(err);
         } else{
             //console.log(newlyCreated);
             res.redirect("/sell");
         }
   });
    
  // res.redirect("/sell");

});



//SHOW - SHOWS MORE INFO ON ADS
app.get("/sell/:id", function (req, res){

    sell.findById(req.params.id, function(err, foundAd){
        if(err){
            console.log(err);
        } else {
            res.render("show", {sell: foundAd});
        }

    });
    
})

// EDIT AD ROUTE
app.get("/sell/:id/edit", isLoggedIn, checkAdOwnership, function(req, res){
        sell.findById(req.params.id, function(err, foundUpdate){
                res.render("edit", { camera: foundUpdate });
    });
    
});


//UPDATE SELL ROUTE
app.put("/sell/:id", isLoggedIn, checkAdOwnership, function (req, res) {
    sell.findByIdAndUpdate(req.params.id, req.body.sell, function (err, updatedAd) {
        if (err) {
            res.redirect("/sell");
        } else {
            res.redirect("/sell/");
        }
    });
});

// DESTROY ADD

app.delete("/sell/:id", isLoggedIn, checkAdOwnership,  function(req, res){
    sell.findByIdAndRemove(req.params.id, function(err) {
        if(err){
            res.redirect("/sell");
        } else {
            res.redirect("/sell");
        }
    })
});


//======================
//AUTH ROUTES
//====================

//SHOW SIGN UP FORM
app.get("/signup", function(req, res){
    res.render("signup");
});

//HANDLING SIGN UP LOGIC
app.post("/signup", function(req, res){
    var newUser = new User({username: req.body.username });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("signup")
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Lensale" +  user.username);
            res.redirect("/sell");
        });
    });
});

//SHOW LOGIN FORM
app.get("/login", function(req, res){
    res.render("login");
});

//HANDLING LOGIN LOGIC
app.post("/login", passport.authenticate("local",
 {
     successRedirect: "/sell",
     failureRedirect: "/login"
}), function(req, res){
});

//LOGOUT ROUTE
app.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("back");
});

function isLoggedIn(req, res, next ){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login");
    res.redirect("/login");
}


function checkAdOwnership(req, res, next){
    if (req.isAuthenticated()) { 
    sell.findById(req.params.id, function (err, foundUpdate) {
        if (err) {
            res.redirect("back");
        } else {
            //does user own ad?
            if (foundUpdate.poster.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
        }
        });
    } else{
        res.redirect("back");
    }
};


app.listen(port,  function() {
    console.log(`Lensale server has started!!!`);
});