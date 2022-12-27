const GitHubStrategy = require('passport-github').Strategy;
require('dotenv').config();

module.exports = (
    app, 
    DB, 
    session, 
    passport, 
    ObjectID, 
    LocalStrategy, 
    bcrypt) => {

    /**
    * Then, set up your Express app to use the session by defining the following options:

    app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
    }));

    */

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: { secure: false}
    }));
    /**
     * After you do all that, tell your express app to use passport.initialize() and passport.session().
     * Be sure to add SESSION_SECRET to your .env file, and give it a random value. This is used to compute the hash used to encrypt your cookie!
     */
    passport.initialize();
    passport.session();

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

    // Tell passport to use the instance of LocalStrategy
    passport.use( new LocalStrategy( (username, password, callback) => {
        DB.findOne( {
        username: username
        }, (err, user) => {
        console.log(`User ${username} attemped to log in`);
        if(err) return callback(err);
        if(!user) return callback(null, false);
        // if(password !== user.password) return callback(null, false);
        if(!bcrypt.compareSync(password, user.password)) return callback(null, false);
        return callback(null, false);
        });
    }));

    /**
     * To set up the GitHub strategy, you have to tell Passport to use an instantiated GitHubStrategy, which accepts 2 arguments: an object (containing clientID, clientSecret, and callbackURL) and a function to be called when a user is successfully authenticated, which will determine if the user is new and what fields to save initially in the user's database object. This is common across many strategies, but some may require more information as outlined in that specific strategy's GitHub README. For example, Google requires a scope as well which determines what kind of information your request is asking to be returned and asks the user to approve such access.

     * The current strategy you are implementing authenticates users using a GitHub account and OAuth 2.0 tokens. The client ID and secret obtained when creating an application are supplied as options when creating the strategy. The strategy also requires a verify callback, which receives the access token and optional refresh token, as well as profile which contains the authenticated user's GitHub profile. The verify callback must call cb providing a user to complete authentication.
     */

    const githubClient = {
        clientID : process.env.GITHUB_CLIENT_ID,
        clientServer: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'https://sepia-dandy-yogurt.glitch.me'
    }

    passport.use(
        new GitHubStrategy(
            githubClient, (accessToken, refreshToken, profile, callback) => {
                console.log(profile);
            }
        )
    )

}