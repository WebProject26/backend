const Router = require('express-promise-router')
const router = new Router()
const db = require('../db')
const auth = require('../auth')

module.exports = router

router.get('/', async (req, res) => {
  const { rows } = await db.query('select * from public.restaurants')
  res.send(rows);
  // res.send(req.user);
})

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query('select * from public.restaurants WHERE id = $1',[id])
  res.send(rows);
})


router.delete('/:id',auth, async (req, res) => {
  const { id } = req.params;
  const result = await db.query('DELETE FROM public.restaurants WHERE id = $1 AND managerid = $2',[id,req.user.id])
  res.send(result);
})