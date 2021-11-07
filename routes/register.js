const Router = require('express-promise-router')
const router = new Router()
const db = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const auth = require('../auth')

module.exports = router

router.get('/', async(req, res) => {
    const { rows } = await db.query('select * from public.users')
    res.status(200).send(rows);
})


router.get('/:email', async (req, res) => {
    const { email } = req.params
    res.send(await UserExists(email));
})

router.post('/',async(req,res)=>{
    // console.log(req.body);
    var data = req.body;
        // Get user input
        var { firstName, lastName, email, password,zip} = req.body;
        email = email.toLowerCase();
        zip = parseInt(zip);
        // Validate user input
        if (!(email && password && firstName && lastName)) {
            return res.status(400).send("All input is required");
        }
        


        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await UserExists(email);
        
        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }
        
        //check if zip format is correct
        if((typeof zip !== "number")|| isNaN(zip)){
            return res.status(400).send("Invalid Zip code");
        }

        var encPass;
        const saltRounds = 10;
        //Encrypt user password
        await bcrypt.hash(password, saltRounds).then(function(hash) {
            // Store hash in your password DB.
            encPass = hash;
        });
        //We can combine these to single procedure on postgre.
        var reply = await db.query('INSERT INTO public.users("firstName", "lastName", address, email, city, zip, ismanager, password) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8);',
        [firstName,lastName, data.address,email, data.city,zip,data.ismanager,encPass])
        var id = await db.query('SELECT id FROM public.users WHERE email = $1',[email]);
        const isManager = data.ismanager;
        
        // Create token
        const token = jwt.sign(
            { id: id.rows[0].id, email, manager: isManager },
          "RANDOM_TOKEN_HERE",
          {
            expiresIn: "2h",
          }
        );
        // save user token
        db.query('UPDATE public.users SET token=($2) WHERE email=$1;',[email,token]); 
        
        //Lets package user details
        var reply =jwt.verify(token, "RANDOM_TOKEN_HERE");
        reply.token = token;
        
        // return new user
        res.status(201).json(reply);
})

router.delete('/',auth,async(req,res)=>{
    await db.query('delete from public.users where id = $1',[req.user.id]);
    res.status(200).send();
});

async function UserExists(email){
    const { rows } = await db.query('select * from public.users WHERE "email" = $1',[email])
    return (rows.length != 0);
}