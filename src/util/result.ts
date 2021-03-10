import validator from './validator'

const Err = [
  {
    code: '1',
    msg: 'auth',
  },
]


const getErrorCode = async (msg) => {
  console.log(msg)

  let obj
  for (let i = 0; i < Err.length; i += 1) {
    // console.log('Error: ${Err[i].msg}')

    if (Err[i].msg === msg) {
      obj = Err[i]
    }
  }

  if (obj === undefined) {
    const no = {}
    Object.assign(no, { code: '10' })
    Object.assign(no, { msg: 'unknown error' })

    obj = no
  }

  return obj
}

const fnResult = async (req: any, res: any) => {
  const { data } = req

  let result = {}
  // const result = { result: true, data }

  if (data.err) {
    const code = await getErrorCode(data.err.toString())
    result = { result: false, err: code.code, msg: data.err.toString() }
  } else {
    result = { result: true }
    Object.assign(result, { data: await validator.result(req, data) })
  }


  // await req.db.release(true)
  // await req.db.end()

  res.json(result)
}


export default {
  fnResult,
}
