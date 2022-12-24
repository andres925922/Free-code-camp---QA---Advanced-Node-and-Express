'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
/**
* First, create the variables session and passport to require express-session and passport respectively.
**/
const session = require('express-session');
const passport = require('passport');
// The ObjectID class comes from the mongodb package. mongodb@~3.6.0 has already been added as a dependency
const {ObjectID} = require('mongodb');

const app = express();

/**
* Express needs to know which template engine you are using. 
* 1) Use the set method to assign pug as the view engine property's value
* 2) After that, add another set method that sets the views property of your app to point to the ./views/pug directory. 
* This tells Express to render all views relative to that directory.
* 3) After that, add another set method that sets the views property of your app to point to the ./views/pug directory. 
* This tells Express to render all views relative to that directory.
**/
app.set('view engine', 'pug');
app.set('views', './views/pug');

/**
* Then, set up your Express app to use the session by defining the following options:

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

* After you do all that, tell your express app to use passport.initialize() and passport.session().
* Be sure to add SESSION_SECRET to your .env file, and give it a random value. This is used to compute the hash used to encrypt your cookie!

**/

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false}
}));

passport.initialize()
passport.session()

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.route('/').get((req, res) => {

  res.render('index', 
    {
    title: 'Hello',
    message: 'Please log in'
    }
  );
});

/**
* To get the full user object, make a query search for a Mongo _id, as shown below:

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
    done(null, null);
  });
});

* Add the two functions above to your server.

const { ObjectID } = require('mongodb');
* The deserializeUser will throw an error until you set up the database connection. So, for now, comment out the myDatabase.findOne call, and just call done(null, null) in the deserializeUser callback function.
**/
passport.serializeUser( (user, done) => { //id, cb
  done(null, user._id); // err, userId
});

passport.deserializeUser( (id, done) => { // id, cb
  done(null, null);
})



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
