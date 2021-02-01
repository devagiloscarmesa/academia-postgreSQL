const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  user: 'omesa',
  password : 'Colombia2021', 
  database : 'academia', 
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('remove', client => {
    //console.log("===============")
    //console.log(client)
    //console.log("===============")
})


module.exports = {pool}