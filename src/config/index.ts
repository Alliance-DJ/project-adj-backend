import lodash from 'lodash'
import dev from './dev'
import prod from './prod'

const all = {
  env: process.env.STAGE,
  sample: {
    sample: '',
  },
}

let config: any = {}

if (process.env.STAGE === 'local' || process.env.STAGE === 'dev') {
  config = lodash.merge(
    all,
    dev,
  )
}

if (process.env.STAGE === 'prod') {
  config = lodash.merge(
    all,
    prod,
  )
}

process.setMaxListeners(100);


// module.exports = config
// export default { config }
export = config
