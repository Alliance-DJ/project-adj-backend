import GameRoom from "../lib/gameRoom"

export interface clientPacket {
  roomCode: string
  stateCode: number
  type: string
  params: Object
}

export class gamePacket {
  result: boolean
  roomCode: string
  stateCode: number
  type: string
  params: Object

  constructor(room, type) {
    const playersInfo: Object = {}
    for(const player of Object.keys(room.players)) {
      const value = room.players[player].getRoundInfo()
      playersInfo[player] = value
    }

    this.result = true
    this.roomCode = room.roomCode
    this.stateCode = room.stateCode
    this.type = type
    this.params = {
      players: playersInfo,
    }
  }
}

export class playPacket {
  result: boolean
  roomCode: string
  stateCode: number
  type: string
  params: {
    round: number
    turnPlayer: string
    turnLeftTime: number
    bettingAmount: number
    players: Object
  }

  constructor(room: GameRoom, type: string) {
    const playersInfo: Object = {}
    for(const player of Object.keys(room.players)) {
      const value = room.players[player].getRoundInfo()
      playersInfo[player] = value
    }

    this.result = true
    this.roomCode = room.roomCode
    this.stateCode = room.stateCode
    this.type = type
    this.params = {
      round: room.round,
      turnPlayer: room.clients[room.turnIdx].id,
      turnLeftTime: room.turnLeftTime,
      bettingAmount: room.bettingAmount,
      players: playersInfo,
    }
  }
}

export class resultPacket {
  result: boolean
  roomCode: string
  stateCode: number
  type: string
  params: {
    round: number
    winner: string
    players: Object
  }

  constructor(room, winnerId) {
    const playersInfo: Object = {}
    for(const player of Object.keys(room.players)) {
      const value = room.players[player].getRoundInfo()
      playersInfo[player] = value
    }

    this.result = true
    this.roomCode = room.roomCode
    this.stateCode = room.stateCode
    this.type = 'end'
    this.params = {
      round: room.round,
      winner: winnerId,
      players: playersInfo,
    }
  }
}

export class errorPacket {
  result: boolean
  roomCode: string
  stateCode: number
  message: string

  constructor(room, message) {
    this.result = false
    this.roomCode = room.roomCode
    this.stateCode = room.stateCode
    this.message = message
  }
}
