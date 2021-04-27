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

  matchTimer: any

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

    return client.getUser()
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
      socket.emit('serverError', 'ERROR: already joined user')
      return
    }

    this.clients[socket.id].state = CLIENT_STATE.MATCHING
    const user = this.clients[socket.id]

    this.matchQueue.push(user)
  }

  // update matching
  updateMatchMaking() {
    const matchedGroupCnt = Math.floor(this.matchQueue.length / 2)
    for (let i = 0; i < matchedGroupCnt; i += 1) {
      // room info
      const matchedGroup = this.matchQueue.splice(0, 2)
      const roomCode = uuid.v4().substring(0, 8)

      // create room
      const room = new GameRoom(roomCode, matchedGroup)
      this.rooms[roomCode] = room
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

  startup() {
    // matching scheduler
    this.matchTimer = setInterval(() => this.updateMatchMaking(), 3000)
  }
  
}