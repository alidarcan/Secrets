//jshint esversion:6
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/secretsDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});

app
  .route("/register")
  .get(function (req, res) {
    res.render("register");
  })
  .post(function (req, res) {
    User.findOne({ email: req.body.username }).then(function (userFound) {
      if (userFound) {
        console.log("User " + userFound.email + " exists in the database.");
      } else {
        /// complete register post
        User.register(
          { username: req.body.username },
          req.body.password,
          function (err, user) {
            if (err) {
              console.log(err);
              res.redirect("/register");
            } else {
              passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
              });
            }
          }
        );
      }
    });
  });

app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const user = new User({
      username: req.body.username,
      passsword: req.body.password,
    });

    passport.authenticate("local")(req, res, function () {
      req.login(user, function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/secrets");
        }
      });
    });
  });

app
  .route("/submit")
  .get(function (req, res) {
    res.render("submit");
  })
  .post(function (req, res) {
    User.updateOne;
  });

app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
});
app.listen(3000, function (req, res) {
  console.log("Server is running on port 3000.");
});
