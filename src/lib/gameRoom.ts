import Client from './client'
import GameServer from './gameServer'

enum ACTION {
  BETTING = 'betting',
  DIE = 'die',
}

export default class GameRoom {
  gameServer: GameServer

  roomCode: string
  stateCode: number
  turnNum: number

  clients: Client[]

  cardPool: number[]
  bettingArr: number[]


  constructor(roomCode, clients) {
    this.gameServer = GameServer.getInstance()

    this.roomCode = roomCode

    this.stateCode = 0
    this.turnNum = 0

    this.clients = clients
    this.initCardPool()
    this.bettingArr = [0, 0]
  }

  set setUsers(users: Client[]) {
    this.clients = users
  }

  packetParser(packet) {
    // old packet exception
    if (packet.stateCode <= this.stateCode) {
      return
    }

    // packet parser
    switch (packet.type) {
      case ACTION.BETTING:
        console.log('betting')
      case ACTION.DIE:
        console.log('die')
    }
  }

  
  initCardPool() {
    this.cardPool = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10]
  }

  endGame() {
    this.gameServer.removeRoom(this.roomCode)
  }

  betting() {
    
  }
}