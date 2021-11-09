const request = require('supertest')
const app = require('../app')
var userToken;
var managerToken;
const restaurantID = 24;

describe("Registeration System",()=>{
    it("Creating user without all required data",async()=>{
        const res = await request(app).post("/register").send({
            "email":"Jestmail",
            "firstName":"",
            "lastName":"",
            "password":"jest",
            "address":"Facebook Inc",
            "city":"Menlo Park",
            "zip":"94025",
            "ismanager":false
        });
        expect(res.statusCode).toEqual(400);
    })
    it("Create user",async()=>{
        const res = await request(app).post("/register").send({
            "email":"Jestmail",
            "firstName":"Jester",
            "lastName":"Meta",
            "password":"jest",
            "address":"Facebook Inc",
            "city":"Menlo Park",
            "zip":"94025",
            "ismanager":false
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("token");
        userToken = res.body.token;
    })
    it("Try create duplicate user",async()=>{
        const res = await request(app).post("/register").send({
            "email":"Jestmail",
            "firstName":"Jester",
            "lastName":"Meta",
            "password":"jest",
            "address":"Facebook Inc",
            "city":"Menlo Park",
            "zip":"94025",
            "ismanager":false
        });
        expect(res.statusCode).toEqual(409);
    })
    it("Try create user with invalid zip",async()=>{
        const res = await request(app).post("/register").send({
            "email":"ziptestmail",
            "firstName":"Jester",
            "lastName":"Meta",
            "password":"jest",
            "address":"Facebook Inc",
            "city":"Menlo Park",
            "zip":"NotAZip",
            "ismanager":false
        });
        expect(res.statusCode).toEqual(400);
    })

    it("Delete user",async()=>{
        const res = await request(app).delete("/register").send({"token":userToken});
        expect(res.statusCode).toEqual(200);
    })

    it("Create manager",async()=>{
        const res = await request(app).post("/register").send({
            email:"Jestmanager1",
            firstName:"Jester",
            lastName:"Mana",
            password:"jest",
            address:"Facebook Managers Inc",
            city:"Menlo Park",
            zip:"94025",
            ismanager:true
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("token");
    })
    

    it("Get all users",async()=>{
        const res = await request(app).get("/register").send();
        expect(res.statusCode).toEqual(200);
    })

    it("User exists",async()=>{
        const res = await request(app).get("/register/testmail1").send();
        expect(res.status).toEqual(200);
        expect(res.text).toEqual("true");
    })
    it("This email should be not in use",async()=>{
        const res = await request(app).get("/register/4873247892345y7923967147961349734hgidsghaids").send();
        expect(res.status).toEqual(200);
        expect(res.text).toEqual("false");
    })

    it("Try deleting user without token",async()=>{
        const res = await request(app).delete("/register/").send({userToken});
        expect(res.status).toEqual(403);
    })

    afterAll(()=>{
        //Cleanup DB
        const db = require('../db')
        db.query('delete from public.users where zip = 94025');
        
    })
})

describe("Login System",()=>{
    it("Login and check data",async()=>{
        const res = await request(app).put("/login").send({
            "email":"Testmail",
            "password":"Testmail",
        });
        const tokenRes = await request(app).get("/login").send({
            "token":res.body.token
        })
        expect(res.status).toEqual(200);
        expect(tokenRes.status).toEqual(200);
    })

    it("Login with wrong password",async()=>{
        const res = await request(app).put("/login").send({
            "email":"Testmail",
            "password":"nope",
        });
        expect(res.status).toEqual(400);
    })
    it("Login without data",async()=>{
        const res = await request(app).put("/login").send({
            "email":"Testmail",
            "password":"",
        });
        expect(res.status).toEqual(400);
    })

    it("Invalid token check",async()=>{
        const res = await request(app).get("/login").send({
            "token":"InvalidTokenForTest"
        })
        expect(res.status).toEqual(401);
    })
})



describe("Restaurant Management", ()=>{
    it("Manager login",async()=>{
        const res = await request(app).put("/login").send({
            "email":"Testmail",
            "password":"Testmail",
        });
        expect(res.status).toEqual(200);
        expect(res.body.ismanager).toEqual(true);
    });

    it("Non Manager login",async()=>{
        const res = await request(app).put("/login").send({
            "email":"user",
            "password":"user",
        });
        uToken = res.body.token;
        expect(res.status).toEqual(200);
        expect(res.body.ismanager).toEqual(false);
    });
    
    it("Add restaurant and remove it",async()=>{
        const loginres = await request(app).put("/login").send({
            "email":"Testmail",
            "password":"Testmail",
        });
        var mToken = loginres.body.token;
        const res = await request(app).post("/restaurants").send({
            "token":mToken,
            "restaurantName": "Add Testers Resta",
            "rating": 49,
            "costlevel": 1,
            "tags": [
                "Pizza",
                "Drinks"
            ],
            "imageURL": "https://i.redd.it/x1a1thbc8us71.jpg",
            "deliveryFee": "2.99"
        });
        expect(res.status).toEqual(201);
        var restaID = res.body[res.body.length-1];
        //Remove it
        const delres = await request(app).delete("/restaurants/"+restaID.id).send({"token":mToken})
        expect(delres.status).toEqual(200);
    });

    it("Add restaurant without name",async()=>{
        const loginres = await request(app).put("/login").send({
            "email":"Testmail",
            "password":"Testmail",
        });
        var mToken = loginres.body.token;
        const res = await request(app).post("/restaurants").send({
            "token":mToken,
            "restaurantName": "",
            "rating": 49,
            "costlevel": 1,
            "tags": [
                "Pizza",
                "Drinks"
            ],
            "imageURL": "https://i.redd.it/x1a1thbc8us71.jpg",
            "deliveryFee": "0.99"
        });
        expect(res.status).toEqual(400);
    });

    it("Try adding duplicate restaurant",async()=>{
        const loginres = await request(app).put("/login").send({
            "email":"Testmail",
            "password":"Testmail",
        });
        var mToken = loginres.body.token;
        const res = await request(app).post("/restaurants").send({
            "token":mToken,
            "restaurantName": "Testing Restaurant 2.0",
            "rating": 49,
            "costlevel": 1,
            "tags": [
                "Pizza",
                "Drinks"
            ],
            "imageURL": "https://i.redd.it/x1a1thbc8us71.jpg",
            "deliveryFee": "2.99"
        });
        expect(res.status).toEqual(400);
    })

    it("Try adding restaurant without being manager",async()=>{
        const loginres = await request(app).put("/login").send({
            "email":"user",
            "password":"user",
        });
        var uToken = loginres.body.token;
        const res = await request(app).post("/restaurants").send({
            "token":uToken,
            "restaurantName": "user resta",
            "rating": 49,
            "costlevel": 1,
            "tags": [
                "Pizza",
                "Drinks"
            ],
            "imageURL": "https://i.redd.it/x1a1thbc8us71.jpg",
            "deliveryFee": "2.05"
        });
        expect(res.status).toEqual(403);
    });

    it("Edit restaurant",async()=>{
        // const resta_res = await request(app).get("/restaurants").send({"managerid":1});
        const loginres = await request(app).put("/login").send({
            "email":"Testmail",
            "password":"Testmail",
        });
        var mToken = loginres.body.token;

        const res = await request(app).put("/restaurants/"+30).send({   
            "token": mToken,
            "restaurantName": "Edited resta "+Math.random()*10000,
            "rating": 31,
            "costlevel": 5,
            "tags": [
                "Kebab"
            ],
            "imageURL": "https://i.redd.it/x1a1thbc8us71.jpg",
            "deliveryFee": "3.99"
        });
        expect(res.status).toEqual(200);
    });
    it("Edit restaurant without all data",async()=>{
        // const resta_res = await request(app).get("/restaurants").send({"managerid":1});
        const loginres = await request(app).put("/login").send({
            "email":"Testmail",
            "password":"Testmail",
        });
        var mToken = loginres.body.token;

        const res = await request(app).put("/restaurants/"+30).send({   
            "token": mToken,
            "restaurantName": "",
            "rating": 31,
            "costlevel": 5,
            "tags": [
                "Kebab"
            ],
            "imageURL": "https://i.redd.it/x1a1thbc8us71.jpg",
            "deliveryFee": ""
        });
        expect(res.status).toEqual(400);
    });
    it("Another manager tries edit other restaurant",async()=>{
        // const resta_res = await request(app).get("/restaurants").send({"managerid":1});
        const loginres = await request(app).put("/login").send({
            "email":"admin",
            "password":"admin",
        });
        var mToken = loginres.body.token;

        const res = await request(app).put("/restaurants/"+30).send({   
            "token": mToken,
            "restaurantName": "Another manager edit "+Math.random()*10000,
            "rating": 31,
            "costlevel": 5,
            "tags": [
                "Kebab"
            ],
            "imageURL": "https://i.redd.it/x1a1thbc8us71.jpg",
            "deliveryFee": "3.99"
        });
        expect(res.status).toEqual(403);
    });
    it("Try editing restaurant as user",async()=>{
        // const resta_res = await request(app).get("/restaurants").send({"managerid":1});
        const loginres = await request(app).put("/login").send({
            "email":"user",
            "password":"user",
        });
        var uToken = loginres.body.token;

        const res = await request(app).put("/restaurants/"+30).send({   
            "token": uToken,
            "restaurantName": "User Edited resta "+Math.random()*10000,
            "rating": 36,
            "costlevel": 4,
            "tags": [
                "Kebab"
            ],
            "imageURL": "https://i.redd.it/x1a1thbc8us71.jpg",
            "deliveryFee": "3.99"
        });
        expect(res.status).toEqual(403);
    });

    it("Try removing non-existing restaurant",async()=>{
        const loginres = await request(app).put("/login").send({
            "email":"Testmail",
            "password":"Testmail",
        });
        var mToken = loginres.body.token;
        const res = await request(app).delete("/restaurants/-1").send({"token":mToken})
        expect(res.status).toEqual(404);
    });
    it("Try removing restaurant as user",async()=>{
        const loginres = await request(app).put("/login").send({
            "email":"user",
            "password":"user",
        });
        var uToken = loginres.body.token;
        const res = await request(app).delete("/restaurants/30").send({"token":uToken})
        expect(res.status).toEqual(403);
    });
    it("Try remove others restaurant",async()=>{
        const loginres = await request(app).put("/login").send({
            "email":"admin",
            "password":"admin",
        });
        var uToken = loginres.body.token;
        const res = await request(app).delete("/restaurants/30").send({"token":uToken})
        expect(res.status).toEqual(403);
    });

})

describe("Restaurants",()=>{
    it("Get restaurants",async()=>{
        const res = await request(app).get("/restaurants").send();
        expect(res.status).toEqual(200);
    })
    it("Get restaurants as manager",async()=>{
        const res = await request(app).get("/restaurants").send({"managerid":1});
        expect(res.status).toEqual(200);
    })

    it("Get specific restaurant data",async()=>{
        const res = await request(app).get("/restaurants/"+restaurantID).send();
        expect(res.status).toEqual(200);
    })
    it("Get invalid restaurant data",async()=>{
        const res = await request(app).get("/restaurants/-1").send();
        expect(res.status).toEqual(404);
    })

})