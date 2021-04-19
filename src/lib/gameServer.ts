import _ from 'lodash'
import uuid from 'uuid'

import Client from './client'
import GameRoom from './gameRoom'

import { CLIENT_STATE } from './client'


export default class GameServer {
  private static singleton: GameServer

  clients: Object

  rooms: Object
  matchQueue: Client[]


  private constructor() {
    this.clients = {}

    this.rooms = {}
    this.matchQueue = []
  }

  static getInstance() {
    if (!this.singleton) {
      this.singleton = new GameServer()
    }
    return this.singleton
  }

  // login on game
  login(socket, nickname) {
    const client = new Client(socket, nickname)
    
    this.clients[socket.id] = client

    return client
  }

  // leave the game
  leave(socket) {
    // matching cancle
    for (let i = 0; i < this.matchQueue.length; i += 1) {
      if (this.matchQueue[i].socket.id === socket.id) {
        this.matchQueue.splice(i, 1)
      }
    }

    delete this.clients[socket.id]
  }

  // matching join
  joinMatchQueue(socket) {
    if (this.clients[socket.id].state !== CLIENT_STATE.IDLE) {
      socket.emit('serverError', 'ERROR: already started game')
      return
    }

    this.clients[socket.id].state = CLIENT_STATE.MATCHING
    const user = this.clients[socket.id]

    this.matchQueue.push(user)
  }

  // update matching
  updateMatchMaking() {
    const matchedGroupCnt = this.matchQueue.length / 2
    for (let i = 0; i < matchedGroupCnt; i += 1) {
      const matchedGroup = this.matchQueue.splice(0, 2)
      const roomCode = uuid.v4().substring(0, 8)
      const room = new GameRoom(roomCode, matchedGroup)

      this.rooms[roomCode] = room

      const data = {
        roomCode,
        clients: matchedGroup,
      }
      for (const client of matchedGroup) {
        client.state = CLIENT_STATE.PLAYING

        client.socket.emit('matched', data)
      }
    }
  }

  removeRoom(roomCode) {
    delete this.rooms[roomCode]
  }

  gamePlay(socket, packet) {
    if (!_.hasIn(this.rooms, packet.roomCode)) {
      return
    }
    this.rooms[packet.roomCode].packetParser(socket, packet)
  }

  getUser(socket) {
    socket.emit('user', this.clients[socket.id].getUser())
  }

  startup(io) {
    // broadcast balls state
    setInterval(() => this.updateMatchMaking(), 100)
  }
  
}