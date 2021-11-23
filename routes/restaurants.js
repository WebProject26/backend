const Router = require('express-promise-router')
const router = new Router()
const db = require('../db')
const auth = require('../auth')

module.exports = router

//Return all restaurants
router.get('/', async (req, res) => {
  const {managerid} = req.params;
  if(managerid==undefined){
    const { rows } = await db.query('select * from public.restaurants')
    res.status(200).json(rows);
  }else{
    const { rows } = await db.query('select * from public.restaurants where managerid=$1',[managerid])
    res.status(200).json(rows);
  }
})

//Returns details about specific restaurant by its id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query('select * from public.restaurants WHERE id = $1',[id])
  if(rows.length == 0)
    return res.status(404).send("That restaurant does not exist.");
  res.status(200).json(rows[0]);
})

//Creating new restaurant
router.post('/',auth,async(req,res)=>{
  if(!req.user.manager) return res.status(403).send("You are not a manager.");
  
  var { restaurantName, rating, costlevel, tags, imageURL, deliveryFee } = req.body;

  if (!(restaurantName && rating && costlevel && tags && imageURL &&deliveryFee)) {
      return res.status(400).send("All input is required");
  }

  //duplicate check
  var { rowCount}  = await db.query('SELECT * from public.restaurants where name = $1',[restaurantName])
  // console.log("RowCount: "+rowCount)
  if(rowCount != 0)
    return res.status(400).send("That restaurant name is already taken.")
  
  
  var { rowCount} = await db.query('INSERT INTO public.restaurants(name, managerid, review, costlevel, tags, "imageURL", deliveryfee) VALUES ($1, $2, $3, $4, $5, $6, $7);',[restaurantName,req.user.id,rating,costlevel,tags,imageURL,deliveryFee]);
  var restaurantData = await db.query('SELECT * from public.restaurants where managerid = $1 AND name = $2',[req.user.id,restaurantName])
  // await db.query('SELECT id from public.restaurants where name = $1')
  // console.log(query)

  return rowCount == 1 ? res.status(201).send(restaurantData.rows):res.status(500).send("Something went wrong");
})

//Edit restaurant
router.put('/:id',auth,async(req,res)=>{
  const { id } = req.params;
  if(!req.user.manager)
    return res.status(403).send("You are not a manager.");
    
  //Auth check
  const { rows } = await db.query('select * from public.restaurants WHERE id = $1',[id])
  if(rows.length == 0)
    return res.status(404).send("That restaurant does not exist.");
  if(rows[0].managerid != req.user.id)
    return res.status(403).send("You do not have permissions to edit this restaurant.");

  var { restaurantName, rating, costlevel, tags, imageURL, deliveryFee } = req.body;
  if (!(restaurantName && rating && costlevel && tags && imageURL &&deliveryFee)) {
    res.status(400).send("All input is required");
  }

  var { rowCount}  = await db.query('SELECT * from public.restaurants where name = $1',[restaurantName])
  // console.log("Edit RowCount: "+rowCount)
  if(rowCount != 0)
    return res.status(400).send("That restaurant name is already taken.")
  
  // console.log("User ID: $1 RestID: $2",[req.user.id,id]);
  var { rowCount} = await db.query('UPDATE public.restaurants	SET name=$3, review=$4, costlevel=$5, tags=$6, "imageURL"=$7, deliveryfee=$8 WHERE managerid = $2 AND id = $1;',
  [id,req.user.id,restaurantName,rating,costlevel,tags,imageURL,deliveryFee]);

  return rowCount == 1 ? res.status(200).send("Success"):res.status(500).send("Something went wrong");

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

  // console.log("Trying final deletion...")
  const result = await db.query('DELETE FROM public.restaurants WHERE id = $1 AND managerid = $2',[id,req.user.id])
  res.status(200).json(result);
})
