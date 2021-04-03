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

const gameServer = new GameServer()
gameServer.startup(io)

io.on('connection', (socket) => {
  connectionHandler(socket)
})


const connectionHandler = (socket: socketio.Socket) => {
  console.log('new connection from ', socket.conn.remoteAddress)

  // disconnect
  socket.on('disconnect', (reason) => {
    console.log(`${socket.id} has leaved: (${reason})`)

    gameServer.leaveGame(socket)

    socket.broadcast.emit('leaveUser', socket.id)
  })

  // join game
  socket.on('join', () => {
    const ball = gameServer.joinGame(socket)

    socket.emit('joinUser', {
      id: ball.id,
      x: ball.posX,
      y: ball.posY,
      color: ball.color
    })

    socket.broadcast.emit('joinUser', {
      id: socket.id,
      x: ball.posX,
      y: ball.posY,
      color: ball.color
    })
  })

  // leave game
  socket.on('leave', () => {
    gameServer.leaveGame(socket)

    socket.broadcast.emit('leaveUser', socket.id)
  })

  // update ball velocity
  socket.on('move', () => {
    
  })
  
}


// gameServer.broadcaseVelocity()
