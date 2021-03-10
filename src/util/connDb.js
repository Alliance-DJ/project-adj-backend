
const { Pool } = require('pg')
const config = require('../config')

const connectToDatabase = async () => {
  const pool = new Pool({
    host: config.dbHost,
    port: config.dbPort,
    max: config.dbMax,

    database: config.database,
    user: config.dbUser,
    password: config.dbPassword,

    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  const client = await pool.connect()
  return client
}


exports.db = async (req, res, next) => {
  const dbconn = await connectToDatabase()
  req.db = dbconn
  return next()
}

exports.setdb = async () => {
  const dbconn = await connectToDatabase()
  return dbconn
}
