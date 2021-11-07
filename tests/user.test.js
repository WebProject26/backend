const request = require('supertest')
const app = require('../index')


describe("User Endpoints",()=>{
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

    afterAll(()=>{
        //Cleanup DB
        const db = require('../db')
        db.query('delete from public.users where zip = 94025');

    })



})


describe("Restaurant Test", ()=>{
    it.todo("Add restaurant");
    it.todo("Edit restaurant");
    it.todo("Get restaurant data");
    it.todo("Remove restaurant");
})