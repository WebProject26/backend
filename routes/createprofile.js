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

router.post('/',async(req,res)=>{
    console.log(req.body);
    var data = req.body;
    var saltedPass = "INSERT_SALT_AND_CRYPT_"+data.password
    var reply = await db.query('INSERT INTO public.users("firstName", "lastName", address, email, city, zip, ismanager, password) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8);',[data.firstName,data.lastName, data.address,data.email, data.city,data.zip,data.ismanager,saltedPass])
    res.send(reply);
})