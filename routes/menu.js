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
    if(!req.user.manager) return res.status(403).send("You are not a manager.");

    const { id } = req.params;
    //name, description, cost, "imageURL", foodcategory, restaurantid)
    var { itemName, description, cost, imageURL, foodcategory } = req.body;

    if (!(itemName && description && cost && tags && imageURL &&foodcategory)) {
        return res.status(400).send("All input is required");
    }
    
    //Manager auth check
    const { rows } = await db.query('select * from public.restaurants WHERE id = $1',[id])
    if(rows.length == 0)
        return res.status(404).send("That restaurant does not exist.");
    if(rows[0].managerid != req.user.id)
        return res.status(403).send("You do not have permissions to edit this restaurant.");

    //Insert new item to menu
    var { rowCount} = await db.query('INSERT INTO public.fooditem(name, description, cost, "imageURL", foodcategory, restaurantid) VALUES ($1, $2, $3, $4, $5, $6);',[itemName,description,cost,imageURL,foodcategory,id]);
  
    return rowCount == 1 ? res.status(201).send("Success"):res.status(500).send("Something went wrong");
  
  })