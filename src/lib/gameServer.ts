import _ from 'lodash'
import uuid from 'uuid'

import Client from './client'
import GameRoom from './gameRoom'

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
  public login(socket, nickname) {
    const client = new Client(socket, nickname)
    
    this.clients[socket.id] = client

    return client
  }

  // leave the game
  public leave(socket) {
    // matching cancle
    for (let i = 0; i < this.matchQueue.length; i += 1) {
      if (this.matchQueue[i].socket.id === socket.id) {
        this.matchQueue.splice(i, 1)
      }
    }

    delete this.clients[socket.id]
  }

  // matching join
  public joinMatchQueue(socket) {
    const user = this.clients[socket.id]

    this.matchQueue.push(user)
  }

  // update matching
  public updateMatchMaking() {
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
        client.socket.emit('matched', data)
      }
    }
  }

  public removeRoom(roomCode) {
    delete this.rooms[roomCode]
  }

  public gamePlay(packet) {
    if (!_.hasIn(this.rooms, packet.roomCode)) {
      return
    }
    this.rooms[packet.roomCode].packetParser(packet)
  }

  public startup(io) {
    // broadcast balls state
    setInterval(() => this.updateMatchMaking(), 100)
  }
}