import { Socket } from "socket.io"

export default class Client {
  socket: Socket
  // player position
  posX: number
  posY: number
  // player color
  color: string
  // velocity for move
  velX: number
  velY: number

  constructor(socket) {
    this.socket = socket
    this.posX = 0
    this.posY = 0
    this.color = '#000000'
    this.velX = 1
    this.velY = 1
  }


  get id() {
    return this.socket.id
  }

  updateVelocity(params) {
    this.velX = 0
    this.velY = 0
  }

  updatePos(timeRate) {
    this.posX += this.velX * timeRate
    this.posY += this.velY * timeRate
  }
}