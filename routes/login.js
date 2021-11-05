const Router = require('express-promise-router')
const router = new Router()
const db = require('../db')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const auth = require('../auth')

module.exports = router

//Actual login and tokin generation.
router.post("/", async (req, res) => {

    try {
      var { email, password } = req.body;
      email = email.toLowerCase();
  
      if (!(email && password)) {
        res.status(400).send("All input is required");
      }

      var userquery = await db.query('SELECT * FROM public.users WHERE email = $1',[email]);
      var user = userquery.rows[0];
      const isManager = user.ismanager;
  
      if (user && (await bcrypt.compare(password,  user.password))) {
        const token = jwt.sign(
          { id: user.id, email, manager: isManager },
          "RANDOM_TOKEN_HERE",
          {
            expiresIn: "2h",
          }
        );
        user.token = token;

        // Token is saved to DB
        db.query('UPDATE public.users SET token=($2) WHERE email=$1;',[email,token]); 
  
        res.status(200).json(user);
      }else{
          res.status(400).send("Invalid Credentials");
      }
    } catch (err) {
      console.log(err);
    }
  });

//Get user data
  router.get('/',auth,async(req,res)=>{
    var userquery = await db.query('SELECT * FROM public.users WHERE email = $1',[req.user.email]);
    res.send(userquery.rows[0]);
  })