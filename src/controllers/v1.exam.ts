import fnExam from '../function/fn.exam'

// play start
const exam = async (req: any, res: any, next: any) => {
  const data = {}
  const params = {

  }

  try {
    const examVar = await fnExam.exam()

    Object.assign(data, { message: examVar })
  } catch (err) {
    console.log(err)
    Object.assign(data, { err: err.toString() });
  }
  req.data = data
  return next()
}

export default {
  exam,
}
