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
// PassportSocketIo
const passportSocketIo = require('passport.socketio');
// MongoStore
const MongoStore = require('connect-mongo')(session);
// cookieParser
const cookieParser = require('cookie-parser');
// Import routes file
const routes = require('./routes');
// Import auth file
const auth = require('./auth');



const app = express();

// Http
const http = require('http').createServer(app);
// Socket
const io = require('socket.io')(http);
// Mongo URI
const URI = process.env.MONGO_URI;
const store = new MongoStore({url: URI})

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
  console.log(req);
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

/** 
 * Now we just have to tell Socket.IO to use it and set the options. Be sure this is added before the existing socket code and not in the existing connection listener.
 */

const onAuthorizeFail = (data, message, error, accept) => {
  if (error) throw new Error(message);
  console.log('failed connection to socket.io', message);
  accept(null, false);
}


const onAuthorizeSuccess = (data, accept) => {
  console.log('successtul connection to socket io');
  accept(null, true);

}

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    ket: 'express.sid',
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  })
);

myDB(async client => {
  
  const DB = await client.db('Cluster1').collection('users');
  let currentUsers = 0;
  auth(app, DB, session, passport, ObjectID, LocalStrategy, bcrypt, store);
  routes(app, DB, passport, bcrypt, bodyParser, ensureAuthenticated);

  /**
   * To listen for connections to your server, 
   * add the following within your database connection:

    io.on('connection', socket => {
      console.log('A user has connected');
    });
   */

    io.on('connection', (socket) => {
      ++currentUsers;
      io.emit('user count', currentUsers);
      console.log('A user has connected');

      /**
      * You may notice that up to now you have only been increasing the user count. Handling a user disconnecting is just as easy as handling the initial connect, except you have to listen for it on each socket instead of on the whole server.

      * To do this, add another listener inside the existing 'connect' listener that listens for 'disconnect' on the socket with no data passed through. You can test this functionality by just logging that a user has disconnected to the console.

      * To make sure clients continuously have the updated count of current users, you should decrease currentUsers by 1 when the disconnect happens then emit the 'user count' event with the updated count.

      * Note: Just like 'disconnect', all other events that a socket can emit to the server should be handled within the connecting listener where we have 'socket' defined.
       */

      socket.on('disconnect', () => {
        --currentUsers;
        io.emit('user count', currentUsers);
      });

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
http.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
