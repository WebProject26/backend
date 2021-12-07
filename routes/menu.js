const Router = require('express-promise-router')
const router = new Router()
const db = require('../db')
const auth = require('../auth')

module.exports = router

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { rows } = await db.query('select * from public.fooditem WHERE restaurantid = $1 and active = true',[id])
    if(rows.length == 0)
      return res.status(404).send("That restaurant does not exist.");
    res.status(200).json(rows);
  })

router.post('/:id',auth, async (req, res) => {
    if(!req.user.manager) return res.status(403).send("You are not a manager.");

    const { id } = req.params;
    //name, description, cost, "imageURL", foodcategory, restaurantid)
    var { itemName, description, cost, imageURL, foodcategory } = req.body;

    if (!(itemName && description && cost && imageURL &&foodcategory)) {
        return res.status(400).send("All input is required");
    }
    
    //Manager auth check
    const { rows } = await db.query('select * from public.restaurants WHERE id = $1',[id])
    if(rows.length == 0)
        return res.status(404).send("That restaurant does not exist.");
    if(rows[0].managerid != req.user.id)
        return res.status(403).send("You do not have permissions to edit this restaurant.");

    //Insert new item to menu
    var queryResult = await db.query('INSERT INTO public.fooditem(name, description, cost, "imageURL", foodcategory, restaurantid) VALUES ($1, $2, $3, $4, $5, $6);',[itemName,description,cost,imageURL,foodcategory,id]);
  
    return queryResult.rowCount == 1 ? res.status(201).send("Success"):res.status(500).send("Something went wrong");
})

router.put('/:id',auth, async (req, res) => {
    if(!req.user.manager) return res.status(403).send("You are not a manager.");

    const { id } = req.params;
    //name, description, cost, "imageURL", foodcategory, restaurantid)
    var { itemid, itemName, description,cost,imageURL,foodcategory} = req.body;

    if (!(itemName)) {
        return res.status(400).send("Item name is required");
    }
    
    //Manager auth check
    const { rows } = await db.query('select * from public.restaurants WHERE id = $1',[id])
    if(rows.length == 0)
        return res.status(404).send("That restaurant does not exist.");
    if(rows[0].managerid != req.user.id)
        return res.status(403).send("You do not have permissions to edit this restaurant.");

    //Insert new item to menu
    // var queryResult = await db.query('UPDATE public.fooditem SET name=$1, description=$2, cost=$3, "imageURL"=$4, foodcategory=$5 WHERE restaurantid = $6 AND id = $7;',[itemName,description,cost,imageURL,foodcategory,id,itemid]);
    var queryResult1 = await db.query('UPDATE public.fooditem SET active=false WHERE restaurantid = $1 AND id = $2 AND active=true;',[id,itemid]); //Deactivate item
    if(queryResult1.rowCount == 0)
        return res.status(400).send("You are trying to edit inactive item.")
    var queryResult2 = await db.query('INSERT INTO public.fooditem(name, description, cost, "imageURL", foodcategory, restaurantid) VALUES ($1, $2, $3, $4, $5, $6);',[itemName,description,cost,imageURL,foodcategory,id]);
    // console.log(queryResult)
    return queryResult2.rowCount == 1 ? res.status(200).send("Success"):res.status(500).send("Something went wrong");
  
})

router.delete('/:id',auth, async (req, res) => {
    if(!req.user.manager) return res.status(403).send("You are not a manager.");

    const { id } = req.params;
    //name, description, cost, "imageURL", foodcategory, restaurantid)
    var { itemid } = req.body;


    if (!(itemid )) {
        return res.status(400).send("All fields input is required");
    }
    
    //Manager auth check
    var { rows } = await db.query('select * from public.restaurants WHERE id = $1',[id])
    if(rows.length == 0)
        return res.status(404).send("That restaurant does not exist.");
    if(rows[0].managerid != req.user.id)
        return res.status(403).send("You do not have permissions to edit this restaurant.");
    
    var { rows } = await db.query('select * from public.fooditem WHERE id = $1',[itemid])
    if(rows.length == 0)
        return res.status(404).send("That fooditem does not exist.");
        
    var queryResult = await db.query('UPDATE public.fooditem SET active=false WHERE restaurantid = $1 AND id = $2;',[id,itemid]); //Deactivate item
    
    //Delete item from menu
    // var queryResult = await db.query('DELETE FROM public.fooditem where id = $1 AND restaurantid = $2;',[itemid,id]);
    // console.log(queryResult)
    return queryResult.rowCount == 1 ? res.status(200).send("Success"):res.status(500).send("Something went wrong");
  
})