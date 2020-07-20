require("dotenv").config();

// Express
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const methodOverride = require("method-override");
// MongoDB
const mongoose = require("mongoose");
// Passport
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User");
// Session
const oldInput = require("old-input");
const session = require("express-session");
const sess = {
    secret: "secret",
    resave: false,
    saveUninitialized: true
};
// Path
const path = require("path");

// MongoDB
mongoose.connect("mongodb://localhost/synced_drawing", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database [synced_drawing] connected");
});

// Passport - for authentication
passport.use(new LocalStrategy(function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!user.verifyPassword(password)) { return done(null, false); }
            return done(null, user);
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findOne({ _id: mongoose.Types.ObjectId(id) }, function (err, user) {
        done(err, user);
    });
});

// Express app
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Use public dir for static resources (js, css, images, ...)
app.use(express.static(path.join(__dirname, "public")));
app.locals.basedir = app.get("views");

// Basic express / methodOverride setup
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}))
app.use(express.json());
app.use(require('cookie-parser')('keyboard cat'));
app.use(session(sess));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(require("connect-flash")());
app.use((req, res, next) => {
    res.locals.errors = req.flash("error");
    res.locals.successes = req.flash("success");
    res.locals.inputErrors = req.flash("inputErrors");
    next();
});
app.use((req, res, next) => {
    if(req.user){
        res.locals.user = req.user; // always have user in pug views
    }
    next();
});
app.use(oldInput);

// My routes
app.use(require("./app/controllers/PagesController"));
app.use("/auth", require("./app/controllers/AuthController"));
app.use("/users", require("./app/controllers/UsersController"));
app.use("/rooms", require("./app/controllers/RoomsController")(io));

// Start the app
const port = process.env.port || 8000;
server.listen(port, () => {
    console.log(`App started on http://localhost:${port}`);
});
