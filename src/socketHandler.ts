import express from 'express'
import socketio from 'socket.io'
import http from 'http'

import GameServer from './lib/gameServer'

const app = express()
const httpServer = http.createServer(app)
const io = new socketio.Server(httpServer, {
  cors: {
    origin: '*',
  }
})

httpServer.listen(4001, () => {
  console.log('listen on 4001')
})

const gameServer = GameServer.getInstance()
gameServer.startup(io)

io.on('connection', (socket) => {
  connectionHandler(socket)
})


const connectionHandler = (socket: socketio.Socket) => {
  console.log('new connection from ', socket.conn.remoteAddress)

  // disconnect
  socket.on('disconnect', (reason) => {
    console.log(`${socket.id} has leaved: (${reason})`)

    // TODO: game room check

    gameServer.leave(socket)
  })

  // login
  socket.on('login', (nickname) => {
    console.log('login / ', socket.id)
    const client = gameServer.login(socket, nickname)
    socket.emit('login', client)
  })

  // leave game
  socket.on('leave', () => {
    console.log(`${socket.id} has leaved: (logout)`)
    gameServer.leave(socket)
  })


  // join matching queue
  socket.on('matchMaking', () => {
    gameServer.joinMatchQueue(socket)
  })

  socket.on('getUser', () => {
    gameServer.getUser(socket)
  })


  // game play packet send
  socket.on('gamePlay', (packet) => {
    gameServer.gamePlay(socket, packet)
  })
  
}
