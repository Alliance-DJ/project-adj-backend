import Client from "./client"

export default class Player {
  client: Client
  
  chip: number
  card: number
  betting: number
  isReady: boolean

  constructor(client: Client) {
    this.client = client

    this.chip = 50
    this.card = 0
    this.betting = 0
    this.isReady = false
  }

  // INIT FOR NEXT ROUND
  initPlayerForNextRound() {
    this.card = 0
    this.betting = 0
  }

  // FOR PACKET
  getRoundInfo() {
    return {
      card: this.card,
      chip: this.chip,
      betting: this.betting,
    }
  }

  // READY
  updateReadyState() {
    this.isReady = true
  }

  // CARDS //
  setCard(card) {
    this.card = card
  }

  // CHIPS
  increaseChip(amount) {
    this.chip += amount
  }

  decreaseChip(amount) {
    this.chip += amount
  }
  
  // BETTS
  increaseBett(amount) {
    this.betting += amount
  }

}