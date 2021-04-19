import { Socket } from "socket.io"

enum CLIENT_STATE {
  IDLE = 'idle',
  MATCHING = 'matching',
  PLAYING = 'playing',
}

export default class Client {
  socket: Socket

  nickname: string
  coin: number

  state: CLIENT_STATE

  constructor(socket, nickname) {
    this.socket = socket
    this.nickname = nickname
    this.state = CLIENT_STATE.IDLE
  }

  getUser() {
    const response = {
      nickname: this.nickname,
      coin: this.coin,
    }
    return response
  }

  get id() {
    return this.socket.id
  }

  increseCoin(amount) {
    this.coin += amount
  }
  
  decraseCoin(amount) {
    this.coin -= amount
  }
}

export {
  CLIENT_STATE
}