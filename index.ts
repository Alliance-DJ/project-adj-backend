import _ from 'lodash'

// const socket = client.io('ws://localhost:4001')

// socket.emit('join', {})

// // let cnt = 0
// // setInterval(() => {
// //   socket.emit('chat', cnt)
// //   cnt++
// // }, 3000)

// // socket.on('chat', (data) => {
// //   // if(socket.id !== data.sender) {
// //   //   console.log(data)
// //   // }
// //   console.log(data)
// // })
// socket.on('stateUpdate', (data) => {
//   console.log(data)
// })
let leftTime = 20000
let updateTime = new Date().getTime()

const timer = setInterval(() => {
  const currUpdateTime = new Date().getTime()
  const deltaTime = currUpdateTime - updateTime
  updateTime = currUpdateTime

  leftTime -= deltaTime

  console.log(leftTime)

  if (leftTime <= 0) {
    console.log('TIME OVER!!!!')
    clearInterval(timer)
  }
}, 100)

