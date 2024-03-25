
let scrollmax = 0
let DOM = {
    chatLeft: document.getElementById('left'),
    msgArea: document.getElementById('msgArea'),
    bodymsg: document.getElementById('bodymsg'),
    send: document.getElementById('send'),
    challengeBu: document.getElementById("challenge"),
    dropholder: document.getElementById('dropholder')
}
let user = {}

async function getInfo(response){
    let chunks = []
    let reader = await response.body.getReader()
    let done = false
    while (!done){
        let v = await reader.read()
        done = v.done
        if (v.value){chunks.push(decoder.decode(v.value))}
    }
    return await JSON.parse(chunks.join(""))
}
let cis = []
let big_chat, big_other
let currentDropdown

DOM.challengeBu.onclick = function(){
    if (currentDropdown){
        let id = currentDropdown.id
        currentDropdown.remove()
        currentDropdown = false;
        if (id == 'challengeDropdown'){
            return false;
        }
    }
    currentDropdown = document.createElement("div")
    currentDropdown.id = 'challengeDropdown'
    currentDropdown.innerHTML = `
        <div class="dropdown">
            <h4>Challenge User</h4>
            <div  style="overflow-y: auto; max-height: 150px;">
                <p>Bridges</p>
                <p>Minigame2</p>
                <p>Minigame3</p>
                <p>Minigame4</p>
            </div>
        </div>
    `
    DOM.dropholder.appendChild(currentDropdown)
    let options = currentDropdown.querySelectorAll('p')
    options.forEach(thing=>{
        thing.onclick = async function(){
            let stuff = await fetch(`${ip}/challengeChat?userID=${user.id}&chatID=${big_chat}&encodedPass=${user.password}`,{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({gameName:thing.innerText })
            })
            console.log(await getInfo(stuff))
        }
    })
}
function loadEmbeds(chat){
    let sf = ""
     chat.embeds.forEach(embed=>{
        if (embed.type == "CHALLENGE REQUEST"){
            if (chat.author==user.id){
                console.log("CHILLIN")
                sf  = sf.concat(`<button class='inactivebu'>Accept</button> <button class='CANCELBU'>Cancel</button>`, "\n")
            }else{
                sf  = sf.concat(`<button class='CANCELBU'>Decline</button> <button class='ACCEPTBU'>Accept</button>`, "\n")
            }

        }
     })
    return sf
}
async function loadSingleChatLeft(chat, isNew){
    let other = await fetch(`${ip}/getPublicProfile?id=${chat.participants.writers.find(w => w[0] != user.id)[0]}`) ;
    other = (await getInfo(other)).details;
    console.log(other)
    DOM.chatLeft.insertAdjacentHTML("beforeend",
    `<div class="chaticon ${isNew && 'new' || ' '}">
        <div class = "fornewstuff"></div>
        <div class="icon" style="background-image: url('${other.pfp}')"></div>

        <div class="preview"> 
            <h3>${other.username}</h3>
            <p>${chat.chatlog[chat.chatlog.length - 1].message.slice(0,20)}...</p>
        </div>
    <div>
    `
    )
    let chaticon = DOM.chatLeft.querySelectorAll('.chaticon')
    chaticon = chaticon[chaticon.length - 1]
    cis.push(chaticon)
    chaticon.chat= chat
    chaticon.addEventListener("click", function(){
        big_chat = chat.id
        big_other = other
        DOM.msgArea.innerHTML = '' 
        cis.forEach(ci => ci.classList.remove('active'))
        chaticon.className = 'chaticon active'
        chat.chatlog.forEach(chat=>{
            if (chat.author == "__SERVER"){
                DOM.msgArea.insertAdjacentHTML('beforeend', `
                    <div class="sm">
                        <h3> Server </h3>
                        <p>${chat.message}</p>
                        ${loadEmbeds(chat)}
                    </div>`)
            }else if (chat.author == user.id){
                DOM.msgArea.insertAdjacentHTML('beforeend', `
                    <div class="m">
                        <h3> You </h3>
                        <p><span>${chat.message}</span></p>
                        ${loadEmbeds(chat)}
                    </div>`)
            }else {
                DOM.msgArea.insertAdjacentHTML('beforeend', `
                    <div class="em">
                        <h3> ${other.username} </h3>
                        <p>${chat.message}</p>
                        ${loadEmbeds(chat)}
                    </div>`)
            }
        })
        DOM.msgArea.scrollTop = 9999999999999999
        scrollmax = DOM.msgArea.scrollTop
    })


}


async function loadChats() {
    let email = window.localStorage.getItem("em")
    let pass = window.localStorage.getItem("ps")
    let stuff = await fetch(`${ip}/loginANDgetchatsfor?email=${email}&password=${pass}`)
    stuff = await getInfo(stuff);
    console.log(stuff)
    user = stuff.details.user;
    let chats = stuff.details.chats.data;
    chats.map(chat => {
        chat.lastTime=chat.chatlog[chat.chatlog.length - 1].timestamp
    });
    chats.sort((a,b) => b.lastTime - a.lastTime).forEach((chat,i) => {
        setTimeout(function(){
            chat.lastseen = chat.participants.writers.find(w => w[0] == user.id)[1] 
            if (chat.lastTime >  chat.lastseen) {
                loadSingleChatLeft(chat,true)
            }else {
                loadSingleChatLeft(chat)
            }
        },100 * i)
    });
    beginListeningToEvents()

}


async function beginListeningToEvents(){
    console.log(user.id, user.password)
    let chatEvents = new EventSource(`${ip}/beginlisteningtoevents?userID=${user.id}&encodedPass=${user.password}`);
    chatEvents.addEventListener("open",function(msg){
        console.log("open", msg)
    })
    chatEvents.addEventListener("message",function(msg){
        console.log(user, msg.data)
        let chat = JSON.parse(msg.data)
        if (chat.eventType == "CHAT") {

            if (chat.chatID == big_chat){
                if (chat.author == "__SERVER"){
                    DOM.msgArea.insertAdjacentHTML('beforeend', `
                        <div class="sm">
                            <h3> Server </h3>
                            <p>${chat.message}</p>
                            ${loadEmbeds(chat)}

                        </div>`)
                }else if (chat.author == user.id){
                    DOM.msgArea.insertAdjacentHTML('beforeend', `
                        <div class="m">
                            <h3> You </h3>
                            <p><span>${chat.message}</span></p>
                            ${loadEmbeds(chat)}

                        </div>`)
                }else {
                    DOM.msgArea.insertAdjacentHTML('beforeend', `
                        <div class="em">
                            <h3> ${big_other.username} </h3>
                            <p>${chat.message}</p>
                            ${loadEmbeds(chat)}
                        </div>`)
                }                
            }
            cis.forEach(chatIcon =>{
                if (Number(chatIcon.chat.id) == Number(chat.chatID)) {
                    if (chat.chatID != big_chat){
                        chatIcon.classList.add("new")
                    }
                    chatIcon.querySelectorAll("p")[0].innerHTML = `${chat.message.slice(0,20)}...`
                    chatIcon.chat.chatlog.push(chat)
                }
                let currentScroll = DOM.msgArea.scrollTop
                let oldmax = scrollmax
                DOM.msgArea.scrollTop = 9999999999999999
                scrollmax = DOM.msgArea.scrollTop  
                if (oldmax - currentScroll  < 125){
    
                }else{
                    DOM.msgArea.scrollTop = currentScroll
                }
            })
        }

    })
}

async function sendMessage(bodymessage, chatID) {
    let body = {
        message: {
            "embeds": [],
            "message": bodymessage
        }
    }
    console.log(chatID)
    console.log(user.password)
    let stuff = await fetch(`${ip}/sendMessage?chatID=${chatID}&userID=${user.id}&encodedPass=${user.password}`,{
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body:  JSON.stringify(body)     
    })
}

DOM.send.addEventListener("click", async function(){
    let msg = DOM.bodymsg.value
    console.log(msg)
    if (big_chat && msg.length >0){
        sendMessage(msg, big_chat)
        DOM.bodymsg.value = ""
    }    
})


loadChats()

