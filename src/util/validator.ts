import Crypto from 'crypto'

import config from '../config'

const iv = Buffer.alloc(16, 0)

const encrypt = async (data) => {
  const keySign = Crypto.createHash('md5').update(config.apiSecret).digest('hex').toUpperCase()
  const enc = Crypto.createCipheriv('aes-256-cbc', keySign, iv)
  let ciphertext = enc.update(JSON.stringify(data), 'utf8', 'base64')
  ciphertext += enc.final('base64')
  return ciphertext.toString()
}


const decrypt = async (data) => {
  const keySign = Crypto.createHash('md5').update(config.apiSecret).digest('hex').toUpperCase()
  const dec = Crypto.createDecipheriv('aes-256-cbc', keySign, iv)
  let decrypted = dec.update(data, 'base64', 'utf8');
  decrypted += dec.final('utf8');
  return JSON.parse(decrypted)
}


const validateSignature = async (body) => {
  try {
    const temp = Object.assign({}, body);
    delete temp.nonce
    delete temp.signature


    const signature = await decrypt(body.signature)
    const data = JSON.parse(signature.substr(16))


    if (JSON.stringify(temp) !== JSON.stringify(data)) {
      throw new Error('Signature error')
    }


    return true
  } catch (error) {
    console.log(error)
    return false
  }
}


const check = async (req, res, next) => {
  try {
    // isDev
    if (process.env.STAGE === 'dev' && config.apiTestAgent.includes(req.headers['user-agent'])) {
      return next()
    }


    // decrypt body
    if (req.body.plain !== undefined) {
      const body = await decrypt(encodeURI(req.body.plain))


      // check signature
      const resultValidSig = await validateSignature(body)
      if (resultValidSig !== true) {
        throw new Error('Invalid data')
      }
    }

    return next()
  } catch (error) {
    console.log(error)

    await req.db.release(true)
    await req.db.end()

    const result = { result: false, msg: error.toString() }
    res.json(result)
  }
}


const result = async (req, data) => {
  // isDev
  if (process.env.STAGE === 'dev' && config.apiTestAgent.includes(req.headers['user-agent'])) {
    return data
  }

  const encryptData = await encrypt(data)

  return encryptData
}

export default {
  encrypt,
  decrypt,
  check,
  result,
}
