let DOM = {
    msgArea : document.getElementById('msgArea')
}
while (!user){

}

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



async function coolStuff(){
    let current = await fetch(`${ip}/currentGame?encodedPass=${user.password}&userID=${user.id}`)
    console.log(await getInfo(current))
    beginListeningToEvents()
}


coolStuff()
