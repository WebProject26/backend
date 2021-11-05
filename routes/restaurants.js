const Router = require('express-promise-router')
const router = new Router()
const db = require('../db')
const auth = require('../auth')

module.exports = router

//Return all restaurants
router.get('/', async (req, res) => {
  const { rows } = await db.query('select * from public.restaurants')
  res.send(rows);
})

//Returns details about specific restaurant by its id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query('select * from public.restaurants WHERE id = $1',[id])
  if(rows.length == 0)
    return res.status(404).send("That restaurant does not exist.");
  res.send(rows[0]);
})


router.post('/',auth,async(req,res)=>{
  if(!req.user.manager)
    return res.status(403).send("You are not a manager.");
  
  var { restaurantName, rating, costlevel, tags, imageURL, deliveryFee } = req.body;

  if (!(restaurantName && password && firstName && lastName)) {
      res.status(400).send("All input is required");
  }
  
  const query = await db.query('INSERT INTO public.restaurants(name, managerid, review, costlevel, tags, "imageURL", deliveryfee) VALUES ($1, $2, $3, $4, $5, $6, $7',
  [restaurantName,req.user.id,rating,costlevel,tags,imageURL,deliveryFee]);

  res.send(query);
})



//Delete restaurants
router.delete('/:id',auth, async (req, res) => {
  if(!req.user.manager)
    return res.status(403).send("You are not a manager.");
  
  const { id } = req.params;
  const { rows } = await db.query('select * from public.restaurants WHERE id = $1',[id])
  
  if(rows.length == 0)
    return res.status(404).send("That restaurant does not exist.");

  if(rows[0].managerid != req.user.id)
    return res.status(403).send("You do not have permissions to edit other restaurants.");

  const result = await db.query('DELETE FROM public.restaurants WHERE id = $1 AND managerid = $2',[id,req.user.id])
  res.send(result);
})