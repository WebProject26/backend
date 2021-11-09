const restaurants = require('./restaurants')
const register = require('./register');
const login = require('./login');
const debug = require('./debug')
const order = require('./order')
const menu = require('./menu')
const cart = require('./cart')
const cors = require('cors');
const {json}= require('body-parser');



module.exports = app => {
  app.use(json());
  app.use(cors());
  app.use('/restaurants', restaurants)
  app.use('/register', register);
  app.use('/login',login);
  app.use('/',debug);
  app.use('/orders',order);
  app.use('/menu',menu);
  app.use('/cart',cart);
}