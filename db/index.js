const { Pool } = require('pg')
const pool = new Pool(
  {
    connectionString: process.env.DATABASE_URL||"postgres://rlggbbvctzjbmk:9b4d3f3e2e54ef0d8c4fc7a3d5eeedfba3b607ba7d0e172ce380083fb74dac93@ec2-54-73-58-75.eu-west-1.compute.amazonaws.com:5432/d9q5tnf8so2pmf",
    ssl: {
          rejectUnauthorized: false
      }})
module.exports = {
  query: (text, params) => pool.query(text, params),
}