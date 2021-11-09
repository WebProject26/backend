const Router = require('express-promise-router')
const router = new Router()
const db = require('../db')
const auth = require('../auth')

module.exports = router

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { rows } = await db.query('select * from public.fooditem WHERE restaurantid = $1',[id])
    if(rows.length == 0)
      return res.status(404).send("That restaurant does not exist.");
    res.status(200).json(rows);
  })

  router.post('/:id',auth, async (req, res) => {
    const { id } = req.params;
    //TODO auth check

    const { rows } = await db.query('select * from public.fooditem WHERE restaurantid = $1',[id])
    if(rows.length == 0)
      return res.status(404).send("That restaurant does not exist.");
    res.status(200).json(rows);
  })