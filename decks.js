let nums = [1,2,3,4,5,6,7,8,9,10,'J','Q','K','A']
let suits = ['Hearts','Diamonds','Clubs','Spades']
function randInt(min,max){ //includes lower bound, does not include upper bound
    if (!max) { max = min; min  = 0}

    return Math.floor( Math.random() * (max - min) ) + min
}
class Card {
    constructor(data){
        this.data = data
        this.next = false
    }
}
class Deck {
    constructor(topCard){
        this.size = 0
        if (topCard == "standard") {
            this.fill()
        }else if (topCard) {
            this.top = topCard
            this.bottom = topCard
            this.size = 1
        }
    }
    static card(data){
        return Card(data)
    }   
    fill(){
        suits.forEach(suit=>{
            nums.forEach(num=>{
                this.bottomDeck([num,suit])
            })
        })
    }
    draw(){
        if (this.size == 0){
            return null;
        }
        let ret = this.top.data
        this.top = this.top.next
        this.size -=1
        return ret
    }
    drawFrom(spot){
        if (spot >= this.size){
            return null;
        }
        if (spot == 0){
            return this.draw();
          }else{
            let prev = this.get(spot - 1);
            let eta = prev.next;
            prev.next = eta.next;
            this.size -= 1;
            if (spot == (this.size-1)) {
              this.bottom = prev;
            }
            return eta.data;
        }
    }
    bottomDeck(data){
        let card = Card(data)
        if (this.size == 0){
            this.top = card
        }else{
            this.bottom.next = card
        }

        this.size+= 1
        this.bottom = card
    }
    topDeck(data){
        let card = Card(data)
        if (this.size == 0){
            this.bottom = card
        }
        card.next = this.head
        this.top = card
        this.size+= 1
    }

    peekFrom(cur,num){
        if (num == 0|| cur == null) {
            return []
        }
        return [cur.data].concat( this.peek(num -1, cur.next) )
    }

    peek(num){
        return this.peekFrom(this.front, num)
    }
    get(spot){
        let thisCard = this.top;
        for (let i = 0; i<spot; i++){
          thisCard = thisCard.next;
        }
        return thisCard
    }
    shuffle(){
        for (let i = 0; i<this.size; i++){
            let cardData = this.drawFrom(randInt(i,this.size))
            this.topDeck(cardData)
        }
    }
    append(deck2){
        this.size += deck2.size
        this.bottom.next = deck2.top
        this.bottom = deck2.bottom
    }
    drawCountFrom(spot,count){
        let ret = [];
        if (spot == 0){
            for (let i = 0; i < count; i++){
                ret.push(this.draw())
            }
        }else{
            let prev = this.get(spot - 1);
            for (let i = 0; i < count; i++){
                let eta = prev.next;
                if (!eta){ return ret}
                prev.next = eta.next;
                this.size -= 1;
                if (spot == (this.size-1)) {
                    this.bottom = prev;
                }
                ret.push(eta.data)
            }

        }
        return ret
    }
}



return Deck;