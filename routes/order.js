const Router = require('express-promise-router')
const router = new Router()
const db = require('../db')
const auth = require('../auth')

module.exports = router

router.get('/',auth,async(req,res)=>{ //Customer orders
    var { rows } = await db.query('select * from public.orders WHERE userid = $1',[req.user.id])
    res.status(200).send(rows);
})

router.get('/:id',auth,async(req,res)=>{ //Restaurant
    if(!req.user.manager) return res.status(403).send("You are not a manager.");
    const { id } = req.params;

    //Get restaurant orders
    var { rows } = await db.query('select * from public.orders WHERE restaurantid = $1',[id])
    res.status(200).send(rows);
})

//Update order status by user
router.put('/',auth,async(req,res)=>{
    const {orderid, status}=req.body;
    if(!(orderid && status)){

    }
    const { rowCount } = await db.query('UPDATE public.orders SET status = $3 WHERE userid = $1 AND id = $2;',[req.user.id,orderid,status])
    return rowCount == 1 ? res.status(200).send("Success"):res.status(500).send("Something went wrong");
})

router.put('/:id',auth,async(req,res)=>{
    const {id}=req.params;
    const {orderid, status}=req.body;
    console.log(id+" "+orderid+" "+status)
    const reply = await db.query('UPDATE public.orders SET status = $3 WHERE restaurantid = $1 AND id = $2;',[id,orderid,status])
    // console.log(reply);
    return reply.rowCount == 1 ? res.status(200).send("Success"):res.status(500).send("Something went wrong");
})

router.post('/:id',auth,async(req,res)=>{
    const {id}=req.params;
    const {foodids}=req.body;
    //Check if all foodids are owned by this restaurant
    const { rowCount } = await db.query("INSERT INTO public.orders(restaurantid, userid, foodid, status)VALUES ( $1, $2, $3, 0);",[id,req.user.id,foodids])
    return rowCount == 1 ? res.status(201).send("Success"):res.status(500).send("Something went wrong");
})