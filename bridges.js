let Deck= require("./decks.js").Deck
let cardScores = {
    CN2:  2,
    CN3:  3,
    CN4:  4,
    CN5:  5,
    CN6:  6,
    CN7:  7,
    CN8:  8,
    CN9:  9,
    CN10: 10,

    CNJ:  10.5,
    CNQ:  11,
    CNK:  11.5,
    CNA:  12.5
}
class Bridges {
    static maxPlayers = 2
    constructor(challenge){
        this.gameType= 'BRIDGES',
        this.players= challenge.playersInvolved,
        this.score = [0,0]
        this.decks = [
            Bridges.fullDeck(),
            Bridges.fullDeck()
        ]
        this.lanes = [
            [ [], [] ],
            [ [], [] ],
            [ [], [] ]
        ]
        this.hands = [
            [], []
        ]
        this.playerState = ['THINKING','THINKING']

        this.moves= {
            P1:[],
            P2:[]
        } 
        this.state = 'TURN'

    }
    static fullDeck(){
        let deck1 = new Deck('standard');
        deck1.topDeck(["JOKER", "Black"])
        deck1.topDeck(["JOKER", "Red"])
        deck1.shuffle()
        return deck1
    }
    static getSum(box){
        let sum = 0
        box.forEach(card =>{
            let face = card[0]
            if (face == 'JOKER'){
                return -1
            }
            sum += cardScores[`CN${face}`]
        })
        return sum
    }
    startTurn() {
        this.state = 'TURN'
        this.playerState = ['THINKING', 'THINKING']
        if (this.decks[0].size == 0){
            this.decks[0] = Bridges.fullDeck(),
            this.decks[1] = Bridges.fullDeck()
        }
        this.hands = [
            this.decks[0].drawCountFrom(0,6),
            this.decks[1].drawCountFrom(0,6)
        ]
        this.lanes = [
            [ [], [] ],
            [ [], [] ],
            [ [], [] ]
        ]
    }
    processCombat(){
        this.lanes.forEach(lane=>{
            let score1 = getSum(lane[0])
            let score2 = getSum(lane[1])
            if (score1 < 0 || score2 < 0){
                return 0;
            }
            if (score1 > score2 ){
                this.score[0] = this.score[0] + 1
            }else if (score2 > score1) {
                this.score[1] = this.score[1] + 1
            }else{
                if (lane[0].length > lane[1].length){
                    this.score[0] = this.score[0] + 1
                }
                if (lane[0].length < lane[1].length){
                    this.score[1] = this.score[1] + 1
                }
            }
        })
        this.state = "COMBAT"
    }
    playerUpdatesBridge(userID,data){ //data has structure: [ [CardData, CardData], [CardData...],[CardData...]]
        userID = Number(userID)
        if (userID != this.players[1] && userID != this.players[0]) {
            return `BAD ATTEMPT TO CHANGE DATA: USER with id ${userID} NOT IN GAME`
        }
        let spot = 0
        if (userID == this.players[1]){
            spot = 1
        }
        if (this.playerState[spot] == 'READY'){
            return `PLAYER with user id ${userID} ATTEMPTED TO ALTER DATA, GOT READY`
        }
        let expectedSize = 6
        if (this.hands[spot].length != expectedSize){
            return `USER with id ${userID} SENT INVALID NUMBER OF CARDS- expected 6, got: ${this.hands[spot].length}}`
        }
        data.forEach((lane,i)=>{
            lane.forEach(card=>{
                this.hands[spot].filter(c=> c[0] != card[0])
                expectedSize = expectedSize - 1
                if (this.hands[spot].length != expectedSize){
                    return `ABORT GAME: USER with id ${userID} SENT INVALID CARD- ${card[0]} of ${card[1]}`
                }
                lane[i][spot].push(card)
            })
        })
        this.playerState[spot] = "READY"
        this.moves[`P${spot+1}`].push()
        return "GOOD"
    }
    sendUpdateTo(client){
        if (client.user == this.players[1]){
            let _lanes =  [
                [this.lanes[0][1],[]],
                [this.lanes[1][1],[]],
                [this.lanes[2][1],[]]
            ]
            if (this.state=='COMBAT'){
                _lanes = [
                    [this.lanes[0][1],this.lanes[0][0]],
                    [this.lanes[1][1],this.lanes[1][0]],
                    [this.lanes[2][1],this.lanes[2][0]]
                ]
            }
            client.response.write(`data: ${JSON.stringify({
                type: this.state,
                score: [this.score[1],this.score[0]],
                hand: this.hands[1],
                deckSize: this.decks[1].size,
                state: this.playerState[1],
                opponent: {
                    id: this.players[0],
                    state: this.playerState[0],
                    handSize: this.hands[0].length,
                },
                lanes: _lanes
            })}\n\n`)
            return this.state
        }

        let _lanes =  [
            [this.lanes[0][0],[]],
            [this.lanes[1][0],[]],
            [this.lanes[2][0],[]]
        ]
        if (this.state=='COMBAT'){
            _lanes = this.lanes
        }
        client.response.write(`data: ${JSON.stringify({
            type: this.state,
            score: this.score,
            hand: this.hands[0],
            state: this.playerState[0],
            deckSize: this.decks[0].size,
            opponent: {
                id: this.players[1],
                state: this.playerState[1],
                handSize: this.hands[1].length   
            },
            lanes: _lanes
        })}\n\n`)
        return this.state
    }
    

}


exports.Bridges =  Bridges