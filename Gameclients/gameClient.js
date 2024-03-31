let DOM = {
    msgArea : document.getElementById('msgArea'),
    bodymsg: document.getElementById('bodymsg'),
    send: document.getElementById('send'),
}
console.log("HERE")
let currentGame = {}

async function beginListeningToEvents(){
    console.log(user.id, user.password)
    let chatEvents = new EventSource(`${ip}/beginlisteningtoevents?userID=${user.id}&encodedPass=${user.password}`);
    chatEvents.addEventListener("open",function(msg){
        console.log("open", msg)
    })
    chatEvents.addEventListener("message",function(msg){
        console.log(user, msg.data)
        msg = JSON.parse(msg.data)
        if (msg.eventType == "GAME:CHAT"){
            DOM.msgArea.insertAdjacentHTML("beforeend",`
                <div class='message'>
                <h4>${msg.author}</h4>
                <p>${msg.text}</p>
                </div>
            `)
        }

    })
}

DOM.send.onclick = async function(){
    let stuff = await fetch(`${ip}/sendGameChat?userID=${user.id}&encodedPass=${user.password}&gameID=${currentGame.GID}`,
    {method:"POST",
    headers: {'Content-Type': 'application/json'},

    body: JSON.stringify({
        author: user.profile.username,
        text: DOM.bodymsg.value
    })
})
    
}

async function coolStuff(){
    let x = 0
    while (!user && x < 100){
        await new Promise(x => setTimeout(x, 100))
        if (x>100){
            return console.log("CONNECTION ERROR")
        }
    }
    console.log(user)
    let current = await fetch(`${ip}/currentGame?encodedPass=${user.password}&userID=${user.id}`)
    let bozo = await getInfo(current)
    currentGame = bozo.thisgame
    console.log(currentGame,bozo)
    beginListeningToEvents()
}

coolStuff()
