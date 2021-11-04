const Router = require('express-promise-router')
const db = require('../db')
const router = new Router()

module.exports = router

router.get('/', async(req, res) => {
    const { rows } = await db.query('select * from public.users')
    res.send(rows);
    //Test comment
})

router.get('/:email', async (req, res) => {
    const { email } = req.params
    const { rows } = await db.query('select * from public.users WHERE "email" = $1',[email])
    res.send(rows.length == 0);
})