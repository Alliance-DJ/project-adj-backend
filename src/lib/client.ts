import { Socket } from "socket.io"

export default class Client {
  socket: Socket
  // player position
  nickname: string
  coin: number

  constructor(socket, nickname) {
    this.socket = socket
    this.nickname = nickname
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