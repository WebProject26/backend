const Router = require('express-promise-router')
const router = new Router()
const auth = require('../auth')

module.exports = router

router.get('/',auth, async (req, res) => {
  res.send(req.user);
})
