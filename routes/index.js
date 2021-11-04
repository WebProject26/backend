const restaurants = require('./restaurants')
const createprofile = require('./createprofile');
const {json}= require('body-parser');
module.exports = app => {
  app.use(json());
  app.use('/cart', restaurants)
  app.use('/c', createprofile);
}