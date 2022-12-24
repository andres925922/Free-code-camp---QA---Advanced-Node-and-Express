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
// Add it to your server as follows:
const LocalStrategy = require('passport-local');

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

**/

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false}
}));
/**
* After you do all that, tell your express app to use passport.initialize() and passport.session().
* Be sure to add SESSION_SECRET to your .env file, and give it a random value. This is used to compute the hash used to encrypt your cookie!
**/
passport.initialize()
passport.session()

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

myDB(async cliente => {
  
  const DB = await cliente.db('Cluster1').collection('users');
  
  app.route('/').get((req, res) => {
    /**
    * In the res.render for that page, add a new variable to the object, 
    showLogin: true. When you refresh your page, you should then see the form! This form is set up to POST on /login. 
    So, this is where you should set up to accept the POST request and authenticate the user.
    **/
    res.render('index', 
      {
      title: 'Connected to Database',
      message: 'Please log in',
      showLogin: true
      }
    );
  });
  
  // Tell passport to use the instance of LocalStrategy
  passport.use( new LocalStrategy( (username, password, callback) => {
    DB.findOne( {
      username: username
    }, (err, user) => {
      console.log(`User ${username} attemped to log in`);
      if(err) return callback(err);
      if(!user) return callback(null, false);
      if(password !== user.password) return callback(null, false);
      return callback(null, false);
    });
  }));
  
  /**
  * For this challenge, you should add the route /login to accept a POST request. 
  To authenticate on this route, you need to add a middleware to do so before then sending a response. 
  This is done by just passing another argument with the middleware before with your response. 
  The middleware to use is passport.authenticate('local').
  **/
  app
    .route('/login')
    .post( 
      passport.authenticate('local', {failureRedirect: '/'}), //middleware
      (req, res) => { // endpoint callback
        res.redirect('/profile');
      }
    );
  
  /**
  * passport.authenticate can also take some options as an argument such as { failureRedirect: '/' } which is incredibly useful, so be sure to add that in as well. 
  Add a response after using the middleware (which will only be called if the authentication middleware passes) that redirects the user to /profile. 
  Add that route, as well, and make it render the view profile.pug.
  **/
  app
    .route('/profile')
    .get( (req, res) => {
      res.render('profile');
    });
  
  // Serialization methods.
  passport.serializeUser( (user, done) => { //id, cb
    done(null, user._id); // err, userId
  });

  passport.deserializeUser( (id, done) => { // id, cb
    DB.findOne({
      _id: new ObjectID(id)
    }, (err, doc) => {
      done(null, doc);
    });
    // done(null, null);
  });
  
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
