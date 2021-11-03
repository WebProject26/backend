const restaurants = require('./restaurants')
const createprofile = require('./createprofile');
module.exports = app => {
  app.use('/cart', restaurants)
  app.use('/c', createprofile);
}