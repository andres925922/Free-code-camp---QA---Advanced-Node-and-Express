'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');

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
app.set('views', )

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.route('/').get((req, res) => {

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
