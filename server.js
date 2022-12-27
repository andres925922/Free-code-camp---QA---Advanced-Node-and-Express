'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
/**
* First, create the variables session and passport to require express-session and passport respectively.
*/
const session = require('express-session');
const passport = require('passport');
// The ObjectID class comes from the mongodb package. mongodb@~3.6.0 has already been added as a dependency
const {ObjectID} = require('mongodb');
// Add it to your server as follows:
const LocalStrategy = require('passport-local');
// Add BCrypt
const bcrypt = require('bcrypt');
// BodyParser
const bodyParser = require('body-parser');
// Import routes file
const routes = require('./routes');
// Import auth file
const auth = require('./auth');


const app = express();

/**
* Express needs to know which template engine you are using. 
* 1) Use the set method to assign pug as the view engine property's value
* 2) After that, add another set method that sets the views property of your app to point to the ./views/pug directory. 
* This tells Express to render all views relative to that directory.
* 3) After that, add another set method that sets the views property of your app to point to the ./views/pug directory. 
* This tells Express to render all views relative to that directory.
*/
app.set('view engine', 'pug');
app.set('views', './views/pug');

// Middlewares

/**
* The challenge here is creating the middleware function ensureAuthenticated(req, res, next), which will check if a user is authenticated by calling Passport's isAuthenticated method on the request which checks if req.user is defined. 
* If it is, then next() should be called. 
* Otherwise, you can just respond to the request with a redirect to your homepage to login.
*/
const ensureAuthenticated = (req, res, callback) => {
  /**
  * Middleware that ensures that the user is authenticated when making request to the server
  * If so, the function will excecute the callback, if not, the user will be redirected to /
  */
  if (req.isAuthenticated()){
    return callback();
  }
  res.redirect('/');
  
}

/**
* Then, set up your Express app to use the session by defining the following options:

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

*/

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

myDB(async client => {
  
  const DB = await client.db('Cluster1').collection('users');
  auth(app, DB, session, passport, ObjectID, LocalStrategy, bcrypt);
  routes(app, DB, passport, bcrypt, bodyParser, ensureAuthenticated);
   

}).catch( err => {
  app.route('/').get((req, res) => {
    res.render('index', 
      {
      title: err,
      message: 'Unable to connect'
      }
    );
  });  
})
// app.route('/').get((req, res) => {
//   res.render('index', 
//     {
//     title: 'Hello',
//     message: 'Please log in'
//     }
//   );
// });

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
// passport.serializeUser( (user, done) => { //id, cb
//   done(null, user._id); // err, userId
// });

// passport.deserializeUser( (id, done) => { // id, cb
//   done(null, null);
// })



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
