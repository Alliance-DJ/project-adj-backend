import express from 'express'
import cors from 'cors'

import config from '../config'
import db from '../util/connDb'

import result from '../util/result'
import v1Exam from '../controllers/v1.exam'


const router = express.Router()
const whitelist = [
  '',
]

let corsOpt = {};
if (config.env === 'dev' || config.env === 'prod') {
  corsOpt = { origin: true }
} else {
  corsOpt = {
    origin: (origin, callback) => {
      if (origin === undefined || config.whitelist.indexOf(origin) !== -1) {
        callback(null, { origin: true })
      } else {
        console.log('origin', origin)
        callback(new Error('Not allowed by CORS'))
      }
    },
  }
}

router.route('/exam')
  .get(cors(corsOpt), v1Exam.exam, result.fnResult)

export = router;
