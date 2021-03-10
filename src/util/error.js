exports.dbError = (res, err, next) => {
  console.info(err)
  return res.status(500).json({ result: false, err })
}

exports.dbNotfound = (res, next) => res.status(200).json({ result: false, err: 'not found' })

exports.apiError = (res, err, next) => {
  console.info(err)
  return res.status(500).json({ result: false, err })
}
