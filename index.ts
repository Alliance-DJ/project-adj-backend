import client from 'socket.io-client'

const socket = client.io('ws://localhost:4001')

socket.emit('join', {})

// let cnt = 0
// setInterval(() => {
//   socket.emit('chat', cnt)
//   cnt++
// }, 3000)

// socket.on('chat', (data) => {
//   // if(socket.id !== data.sender) {
//   //   console.log(data)
//   // }
//   console.log(data)
// })
socket.on('stateUpdate', (data) => {
  console.log(data)
})