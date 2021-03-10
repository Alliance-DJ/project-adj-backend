import serverless from 'serverless-http'
import bodyParser from 'body-parser'
import express from 'express'
import cors from 'cors'

import routesV1 from './src/router/router.v1'

const appV1 = express()
appV1.use(cors());
appV1.use(bodyParser.json({ strict: true }))
appV1.use(bodyParser.urlencoded({ extended: true }))
appV1.use('/v1', routesV1)
module.exports.pinball = serverless(appV1)
