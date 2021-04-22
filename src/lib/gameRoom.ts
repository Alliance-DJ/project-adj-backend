import _ from 'lodash'

import Client from './client'
import Player from './player'
import GameServer from './gameServer'

import { clientPacket, gamePacket, errorPacket, playPacket, resultPacket } from '../model/packet'
import { CLIENT_STATE } from './client'

enum ACTION_TYPE {
  BETTING = 'betting',
  DIE = 'die',
}

enum ROOM_STATE_CODE {
  READY = 'ready',
  PLAYING = 'playing',
  FINISH = 'finish',
}

enum ROUND_STATE_CODE {
  START = 'start',
  DRAW = 'draw',
  END = 'end',
}

enum SOCKET_CHANNEL {
  GAME = 'game',
  ROUND = 'round',
  ERROR = 'error',
}

export default class GameRoom {
  // GAMER SERVER SINGLETON
  gameServer: GameServer

  // PLAYERS
  clients: Client[]
  players: { [key: string]: Player }

  // ROOM INFO
  roomCode: string
  roomState: ROOM_STATE_CODE

  // FOR GAME PLAY
  cardPool: number[]
  prevBettingChips: number

  // FOR ROUND
  stateCode: number
  round: number
  bettingAmount: number

  turnIdx: number
  turnLeftTime: number
  timerUpdateTime: number
  isPacketRecieved: boolean
 
  // scheduler
  timerTick: any
  stateTick: any

  constructor(roomCode, clients) {
    this.gameServer = GameServer.getInstance()

    this.clients = clients
    this.players = {}
    this.initPlayers(this.clients)

    this.roomCode = roomCode
    this.roomState = ROOM_STATE_CODE.READY

    this.initCardPool()
    this.prevBettingChips = 0

    this.stateCode = 0
    this.round = 0
    this.bettingAmount = 0

    this.turnIdx = 0
    // 20 seconds
    this.turnLeftTime = 20000
    this.timerUpdateTime = new Date().getTime()
    this.isPacketRecieved = false

    // game ready state packet send
    const packet = new gamePacket(this, ROOM_STATE_CODE.PLAYING)
    for (const playerId of Object.keys(this.players)) {
      this.sendPacket(playerId, SOCKET_CHANNEL.GAME, packet)
    }

    this.stateTick = setInterval(() => this.stateHeartbeat(), 100)
  }


  startNextRound() {
    // initialize
    this.isPacketRecieved = false
    this.round += 1
    this.turnIdx = this.round % 2
    this.turnLeftTime = 20000

    // allot cards for players
    this.allotCards()

    // socket emit: round start and cards => both players
    const packet = new playPacket(this, ROUND_STATE_CODE.START)
    for (const playerId of Object.keys(this.players)) {
      this.sendPacket(playerId, SOCKET_CHANNEL.ROUND, packet)
      
      this.players[playerId].initPlayerForNextRound()
    }
    
    // turn timer start
    this.startTimer()
  }

  endGame(winnerId) {
    let loserId = ''
    const players = Object.keys(this.players)
    for (const id of players) {
      if (id !== winnerId) {
        loserId = id
        break
      }
    }

    // increase winner's chip amount
    this.players[winnerId].increaseChip(this.bettingAmount)
    this.bettingAmount = 0
    
    // send packet both and init for next round
    const packet = new resultPacket(this, winnerId)
    for (const playerId of players) {
      this.sendPacket(playerId, SOCKET_CHANNEL.ROUND, packet)
      
      this.players[playerId].initPlayerForNextRound()
    }

    // check game finish
    if (this.players[loserId].chip <= 0) {
      this.gameFinish(winnerId)
    }

    this.startNextRound()
  }

  playerReady(senderId) {
    // already started game
    if (this.roomState !== ROOM_STATE_CODE.READY) {
      const packet = new errorPacket(this, 'ERROR: already started game')

      this.sendPacket(senderId, SOCKET_CHANNEL.ERROR, packet)
      return
    }

    // player already ready
    if (this.players[senderId].isReady) {
      const packet = new errorPacket(this, 'ERROR: player already ready state')

      this.sendPacket(senderId, SOCKET_CHANNEL.ERROR, packet)
      return
    }

    // update player ready state
    this.players[senderId].updateReadyState()

    // check can round start
    const readyPlayers = _.filter(this.players, { 'isReady': false })
    if (readyPlayers.lenght === 2) {
      this.roomState = ROOM_STATE_CODE.PLAYING

      // game start packet send
      const packet = new gamePacket(this, ROOM_STATE_CODE.PLAYING)
      for (const playerId of Object.keys(this.players)) {
        this.sendPacket(playerId, SOCKET_CHANNEL.GAME, packet)
      }

      this.startNextRound()
    }
  }

  gameFinish(winnerId) {
    // calculate player coin
    for (const player of this.clients) {
      if (player.id === winnerId) {
        player.increseCoin(100)
      } else {
        player.decraseCoin(100)
      }
      
      player.state = CLIENT_STATE.IDLE
    }

    // finish packet send
    const packet = new gamePacket(this, ROOM_STATE_CODE.FINISH)
    for (const playerId of Object.keys(this.players)) {
      this.sendPacket(playerId, SOCKET_CHANNEL.GAME, packet)
    }

    // stop state heartbeat
    clearInterval(this.stateTick)

    // remove this room
    this.gameServer.removeRoom(this.roomCode)
  }

  // PLAYER ACTIONS //
  betting(sender, params) {
    // turn check
    if (this.clients[this.turnIdx].id !== sender) {
      this.isPacketRecieved = false
      const packet = new errorPacket(this, 'ERROR: not your turn')
      this.sendPacket(sender, SOCKET_CHANNEL.ERROR, packet)
    }

    // betting set
    this.players[sender].decreaseChip(params.value)
    this.players[sender].increaseBett(params.value)

    // chip decreace
    this.bettingAmount += params.value

    // check is end game
    const playerList = Object.keys(this.players)
    if (this.players[playerList[0]].betting !== this.players[playerList[1]].betting) {
      this.isPacketRecieved = false
      this.nextTurn()
    }

    // draw game
    if (this.players[playerList[0]].card === this.players[playerList[1]].card) {
      // start next round with new betting amounts
      const packet = new playPacket(this, ROUND_STATE_CODE.DRAW)
      for (const playerId of playerList) {
        this.sendPacket(playerId, SOCKET_CHANNEL.ROUND, packet)

        this.players[playerId].initPlayerForNextRound()
      }

      this.isPacketRecieved = false
      this.startNextRound()
      return
    }

    // end game
    this.isPacketRecieved = false
    const winnerId = this.getWinnerId()
    this.endGame(winnerId)
  }

  die(sender) {
    // turn check
    if (this.clients[this.turnIdx].id !== sender) {
      this.isPacketRecieved = false
      const packet = new errorPacket(this, 'ERROR: not your turn')
      this.sendPacket(sender, SOCKET_CHANNEL.ERROR, packet)
    }

    // card 10 check
    if (this.players[sender].card === 10) {
      this.players[sender].decreaseChip(10)
      this.bettingAmount += 10
    }

    // end game
    let winnerId = ''
    for (const id of Object.keys(this.players)) {
      if (id !== sender) {
        winnerId = id
        break
      }
    }

    this.isPacketRecieved = false
    this.endGame(winnerId)
  }


  // PACKET //
  packetParser(socket, packet: clientPacket) {
    // client not included in this room
    const senderIdx = _.findIndex(this.clients, ['id', socket.id])
    if (senderIdx === -1) {
      const packet = new errorPacket(this, 'ERROR: client not inclueded in this room')
      socket.emit(packet)
      return
    }
    const senderId = this.clients[senderIdx].id

    // old packet exception
    if (packet.stateCode <= this.stateCode) {
      const packet = new errorPacket(this, 'ERROR: old packet exception, please confirm the stateCode')
      this.sendPacket(socket.id, SOCKET_CHANNEL.ERROR , packet)
      return
    }

    // increase packet state code
    this.stateCode += 1

    // ready for play game
    if (packet.type === 'ready') {
      this.playerReady(senderId)
      return
    }

    if (packet.type !== 'ready' && this.roomState !== ROOM_STATE_CODE.PLAYING) {
      const packet = new errorPacket(this, 'ERROR: game not started')
      this.sendPacket(socket.id, SOCKET_CHANNEL.ERROR , packet)
      return
    }

    this.isPacketRecieved = true
    // packet parser
    switch (packet.type) {
      case ACTION_TYPE.BETTING:
        this.betting(senderId, packet.params)
        break
      case ACTION_TYPE.DIE:
        this.die(senderId)
        break
    }
  }

  sendPacket(playerId, channel, packet) {
    this.players[playerId].client.socket.emit(channel, packet)
  }

  stateHeartbeat() {
    for (const client of this.clients) {
      client.socket.emit('stateHeartbeat', this.stateCode)
    }
  }


  // UTILS //
  initCardPool() {
    this.cardPool = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10]
  }

  initPlayers(clients) {
    for (const client of clients) {
      console.log(client)
      const player = new Player(client)

      this.players[client.socket.id] = player
    }
  }

  allotCards() {
    // card pool init
    if (this.cardPool.length < 2) {
      this.initCardPool()
    }

    const players = Object.keys(this.players)
    for (const player of players) {
      const randomIdx = Math.floor(Math.random() * (new Date().getTime())) % this.cardPool.length

      this.players[player].setCard(this.cardPool[randomIdx])
    }
  }

  nextTurn() {
    if (this.turnIdx === 0) {
      this.turnIdx += 1
    } else {
      this.turnIdx -= 1
    }
  }

  getWinnerId() {
    let winnerId = ''
    const players = Object.keys(this.players)
    if (this.players[players[0]].card > this.players[players[1]].card) {
      winnerId = this.players[players[0]].client.id
    } else {
      winnerId = this.players[players[1]].client.id
    }

    return winnerId
  }


  // TIMER UTILS //
  startTimer() {
    this.turnLeftTime = 20000
    this.timerUpdateTime = new Date().getTime()

    this.timerTick = setInterval(() => this.timerUpdate(), 100)
  }

  stopTimer() {
    clearInterval(this.timerTick)
  }

  timerUpdate() {
    // stop timer
    if (this.isPacketRecieved === true) {
      this.stopTimer()
      return
    }

    // time calculate
    const currUpdateTime = new Date().getTime()
    const deltaTime = currUpdateTime - this.timerUpdateTime
    this.timerUpdateTime = currUpdateTime

    this.turnLeftTime -= deltaTime

    // time over
    if (this.turnLeftTime <= 0) {
      this.stopTimer()

      const turnPlayer = this.clients[this.turnIdx].id
      this.die(turnPlayer)
    }
  }
}