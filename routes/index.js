const restaurants = require('./restaurants')
const register = require('./register');
const login = require('./login');
const debug = require('./debug')
const cors = require('cors');
const {json}= require('body-parser');



module.exports = app => {
  app.use(json());
  app.use(cors());
  app.use('/restaurants', restaurants)
  app.use('/register', register);
  app.use('/login',login);
  app.use('/',debug);

}