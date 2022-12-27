
module.exports  = (
    app, 
    DB, 
    passport, 
    bcrypt, 
    bodyParser, 
    ensureAuthenticated) => {

    app.route('/').get((req, res) => {
        /**
        * In the res.render for that page, add a new variable to the object, 
        showLogin: true. When you refresh your page, you should then see the form! This form is set up to POST on /login. 
        So, this is where you should set up to accept the POST request and authenticate the user.
        */
        /**
        * Now you need to allow a new user on your site to register an account. 
        In the res.render for the home page add a new variable to the object passed along - showRegistration: true.
        */
        res.render('index', 
          {
          title: 'Connected to Database',
          message: 'Please log in',
          showLogin: true,
          showRegistration: true,
          showSocialAuth: true
          }
        );
    });

    /**
     * For this challenge, you should add the route /login to accept a POST request. 
     To authenticate on this route, you need to add a middleware to do so before then sending a response. 
    This is done by just passing another argument with the middleware before with your response. 
    The middleware to use is passport.authenticate('local').
    */
    app
    .route('/login')
    .post(
        // bodyParser.urlencoded({extends: false}), 
        passport.authenticate('local', {failureRedirect: '/'}), //middleware
        (req, res) => { // endpoint callback
            res.redirect('/profile');
        }
    );

    // profile endpoint
    /**
    * passport.authenticate can also take some options as an argument such as { failureRedirect: '/' } which is incredibly useful, so be sure to add that in as well. 
    Add a response after using the middleware (which will only be called if the authentication middleware passes) that redirects the user to /profile. 
    Add that route, as well, and make it render the view profile.pug.
    */
    /**
    * pass ensureAuthenticated as middleware to requests for the profile page before the argument to the GET request
    */
    /**
    *Pass an object containing the property username and value of req.user.username as the second argument for the render method of the profile view.
    */
    app
    .route('/profile')
    .get(ensureAuthenticated, (req, res) => {
        res.render(
            'profile', 
            { username: req.user.username}
        );
    });
    /**
    In passport, unauthenticating a user is as easy as just calling req.logout() before redirecting. 
    Add this /logout route to do that:
    */
    app
    .route('/logout')
    .get((req, res) => {
        req.logout();
        res.redirect('/');
    });

    // Registration logic.
    /**
    The logic of step 1 should be as follows:

    * Query database with findOne
    * If there is an error, call next with the error
    * If a user is returned, redirect back to home
    * If a user is not found and no errors occur, then insertOne into the database with the username and password. As long as no errors occur there, call next to go to step 2, authenticating the new user, which you already wrote the logic for in your POST /login route.
    */
    app
    .route('/register')
    .post( (req, res, next) => {
        // Evaluamos si el usuario existe en la db
        DB.findOne(
        {username: req.body.username},
        (err, data) => {
            if (err) next(err); // Si error ejecutamos la siguiente función
            if (data) return res.redirect('/'); // Si el usuario existe redireccionamos a la página ppal
            // si el usuario no existe lo creamos
            /**
            Currently on your registration route, you insert a user's plaintext password into the database like so: password: req.body.password. 
            Hash the passwords instead 
            */
            const hashed_pwd = bcrypt.hashSync(req.body.password, 12);
            DB.insertOne(
            {
                username: req.body.username,
                password: hashed_pwd
            },
            (err, doc) => {
                if (err) res.redirect('/');
                next(null, doc.ops[0])
                
            }
            ); // !DB.insertOne
        }
        ); // !DB.findOne
    },
    passport.authenticate('local', {failureRedirect: '/'}),
        (req, res, next) => {
            res.redirect('/profile');
        }   
    ); // !.post

    /**
     * In your routes.js file, add showSocialAuth: true to the homepage route, after showRegistration: true. Now, create 2 routes accepting GET requests: /auth/github and /auth/github/callback. The first should only call passport to authenticate 'github'. The second should call passport to authenticate 'github' with a failure redirect to /, and then if that is successful redirect to /profile (similar to your last project).
     */
    app
    .route('/auth/github')
    .get(passport.authenticate('github'));

    app
    .route('/auth/github/callback')
    .get(
        passport.authenticate('github', {failureRedirect: '/'}),
        (req, res, next) => {
            req.redirect('/profile');
        }
    );

    /**
     You may have noticed that you are not handling missing pages (404). 
    The common way to handle this in Node is with the following middleware. 
    Go ahead and add this in after all your other routes
    */
    app.use( (req, res) => {
        res
        .status(404)
        .type('text')
        .send('Not found');
    });
    

}