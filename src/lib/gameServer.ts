import Client from './client'

export default class GameServer {
  balls: Client[]
  ballMap: Object

  prevUpdateTime: number
  stateNum: number

  constructor() {
    this.balls = []
    this.ballMap = {}

    this.prevUpdateTime = new Date().getTime()
    this.stateNum = 0

    // temp user list check
    setInterval(() => {
      console.log('balls', this.balls)
    }, 5000)
  }


  joinGame(socket) {
    let ball = new Client(socket)
    
    this.balls.push(ball)
    this.ballMap[socket.id] = ball

    return ball
  }
  
  leaveGame(socket) {
    for (let i = 0; i < this.balls.length; i += 1) {
      if(this.balls[i].id === socket.id) {
        this.balls.splice(i, 1)
      }
    }

    delete this.ballMap[socket.id]
  }


  updateGame() {
    const currUpdateTime = new Date().getTime()
    const deltaTime = currUpdateTime - this.prevUpdateTime
    this.prevUpdateTime = currUpdateTime

    const timeRate = deltaTime / (1000 / 60)

    for (const ball of this.balls) {
      ball.updatePos(timeRate)
    }
  }

  broadcastState(io) {
    this.stateNum += 1

    const data = {}
    Object.assign(data, { stateNum: this.stateNum })

    for (const ball of this.balls) {
      data[ball.id] = {
        posX: ball.posX,
        posY: ball.posY,
        velX: ball.velX,
        velY: ball.velY,
      }
    }
    io.sockets.emit('stateUpdate', data)
  }

  startup(io) {
    // update balls movement
    setInterval(() => this.updateGame(), 16)

    // broadcast balls state
    setInterval(() => this.broadcastState(io), 33)
  }
}