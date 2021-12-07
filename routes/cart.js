const Router = require('express-promise-router')
const router = new Router()
const db = require('../db')
const auth = require('../auth')

module.exports = router

router.get('/',auth,async(req,res)=>{
    const { rows} =await db.query("SELECT cartitems from public.users where id = $1;",[req.user.id]);
    res.status(200).send(rows[0]);
})

router.post('/',auth,async(req,res)=>{
    const {menuitem} = req.body;
    var { rows} =await db.query("SELECT cartitems from public.users where id = $1;",[req.user.id]);
    // console.log(rows[0])
    var cart = rows[0].cartitems;

    //TODO
    //Check if menu item is owned by another restaurant
    
    if(cart ==null){
        cart = [menuitem];
    }else{
        cart.push(menuitem);
    }
    // console.log(cart);
    var query = await db.query("UPDATE public.users SET cartitems=($2) WHERE id = $1;",[req.user.id,cart]);
    // console.log(query);
    console.log("Added item "+menuitem)
    res.status(201).send(cart);
})

router.delete('/',auth,async(req,res)=>{
    var {menuitem} = req.body;
    if(req.body.wipe){
        await db.query("UPDATE public.users SET cartitems=($2) WHERE id = $1;",[req.user.id,null]);
        console.log("Cart is wiped");
        return res.status(200).send("Wiped the cart.");
    }

    var { rows} =await db.query("SELECT cartitems from public.users where id = $1;",[req.user.id]);
    // console.log(rows[0])
    var cart = rows[0].cartitems;

    //TODO
    //Check if menu item is owned by another restaurant

    if(!cart.includes(menuitem)){
        return res.status(404).send("Trying to delete item that doesnt exist on array")
    }
    var index = cart.indexOf(menuitem.toString());
    if(cart !=null){
        cart.splice(index,1);
    }else{
        res.status(404).send("Unknown item.");
    }
    // console.log(cart);
    var query = await db.query("UPDATE public.users SET cartitems=($2) WHERE id = $1;",[req.user.id,cart]);
    // console.log(query);
    res.status(200).send(cart);
})