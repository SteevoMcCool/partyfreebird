
let scrollmax = 0
let deb = false
let DOM = {
    chatLeft: document.getElementById('left'),
    msgArea: document.getElementById('msgArea'),
    bodymsg: document.getElementById('bodymsg'),
    send: document.getElementById('send'),
    challengeBu: document.getElementById("challenge"),
    dropholder: document.getElementById('dropholder'),
    fileHolder: document.getElementById('fileHolder'),
    cradle: document.getElementById('cradle')
}
function error(msg){
    DOM.msgArea.insertAdjacentHTML('beforeend', `
    <div class="error">
        <h3> Error </h3>
        <p>${msg}</p>
    </div>`)
    DOM.msgArea.scrollTop = 9999999999999999
    scrollmax = DOM.msgArea.scrollTop  
}              
let cradle = []
function getFileBlobPromise(file){
    return new Promise((resolve, reject) => {
        var fr = new FileReader();
        fr.onload = (e) => {
            resolve(fr.result)
        };
        fr.onerror = reject;
        fr.readAsDataURL(file);
    });
}

async function displayImages(){
    DOM.cradle.innerHTML = ''
    if (cradle.length == 0) {
        DOM.cradle.style.visibility = 'collapse'
        DOM.msgArea.style.height = '85%'
        return false
    }
    DOM.cradle.style.visibility = 'visible'
    DOM.msgArea.style.height = '65%'

    for (let i = 0; i < cradle.length; i++){
        let img = cradle[i]
        let imgLink = img.link || img.meta.image
        DOM.cradle.insertAdjacentHTML('beforeend',`
        <div style="height: 100%; width: 25%;  background-size: contain; background-repeat: no-repeat; background-image: url('${imgLink}')">
            <button class='ax1x1' style='font-size:0.4em'>X</button>
        </div>
        `)
        let bu = document.querySelectorAll('.ax1x1')
        bu = bu[bu.length - 1]
        bu.onclick = function() {
            cradle = cradle.filter(embed => (embed.link || embed.meta.image) != imgLink)
            displayImages()
        }
    }
}
async function processImageInput(){
    if (cradle.length ==3){
        error("You already have too many attachments! (max: 3)")
        return false
    }
    let files = DOM.fileHolder.files
    for (const file of files) {
        const blob = await getFileBlobPromise(file)
        const blobStr = blob.split('base64,')[1]
        cradle.push({
            type: "IMAGE",
            timestamp: Date.now(),   
            link: false,
            meta: {
                blob: blobStr,
                type: file.type,
                image:URL.createObjectURL(file),
            }
        })
    }
    if (cradle.length >3){
        cradle.length = 3
        error("You can only upload 3 attachments each message! Excess have been removed.")
    }

    displayImages()
}

DOM.fileHolder.oninput = processImageInput


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
            let stuff = await fetch(`${ip}/challengeChat?userID=${user.id}&chatID=${big_chat.id}&encodedPass=${user.password}`,{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({gameName:thing.innerText })
            })
            console.log(await getInfo(stuff))
        }
    })
}
function loadEmbeds(chat){
    let sf = `<div style="display:flex;flex-direction:${(chat.author==user.id && 'row-reverse') ||'row'};width:80%; margin-left:${(chat.author==user.id && '20%') ||'0%'}">`
     chat.embeds.forEach(embed=>{
        if (embed.type == "CHALLENGE REQUEST"){
            if (chat.author==user.id){
                sf  = sf.concat(`<button class='CANCELBU' onclick=cancel(${chat.id}) >Cancel</button>`, "\n")
            }else{
                sf  = sf.concat(`<button class='ACCEPTBU' onclick=accept(${chat.id})>Accept</button>`, "\n")
            }
        }else if (embed.type == "CHALLENGE RESULTS"){
            sf  = sf.concat(`<button class='none'>${embed.text}</button>`, "\n")
        }else if (embed.type == "IMAGE"){
                sf = sf.concat(`       
                <div class="imageEmbed">
                    <div class="bimage" style="background-image: url('${embed.link}');">
                    </div>
                    <div class="emage" style="background-image: url('${embed.link}')" onclick=magnify('${embed.link}')>
                    </div>
                </div>
                `)

        }
     })
    sf = sf.concat("</div>")
    return sf
}
function magnify(link){
    let div = document.createElement("div");
    div.innerHTML = `<img style="height: 65%; position: absolute; top: 17.5%; left: 50%; transform: translate(-50%, 0%)" src='${link}'>`
    div.style.backgroundColor = `rgba(0,0,0,0.3)`
    div.style.position = 'absolute'
    div.style.top= '0';
    div.style.height = '100vh'
    div.style.width = '100vw'
    div.onclick= function(){div.remove()}
    document.body.appendChild(div)
}
async function cancel(id){
    let cl = big_chat.chatlog
    let index = id - cl[0].id
    if (index > 0){
        let chal = cl[index]
        let info = await fetch(`${ip}/cancelChallenge?userID=${user.id}&chatID=${big_chat.id}&encodedPass=${user.password}&challengeID=${chal.embeds[0].challengeID}`)
        console.log(await getInfo(info))
 }
}

async function accept(id){
    let cl = big_chat.chatlog
    let index = id - cl[0].id
    if (index > 0){
        let chal = cl[index]
        console.log(chal)
        let info = await fetch(`${ip}/acceptChallenge?userID=${user.id}&chatID=${big_chat.id}&encodedPass=${user.password}&challengeID=${chal.embeds[0].challengeID}`)
        console.log(await getInfo(info))
 }
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
        big_chat = chat
        big_other = other
        DOM.msgArea.innerHTML = '' 
        cis.forEach(ci => ci.classList.remove('active'))
        chaticon.className = 'chaticon active'
        chat.chatlog.forEach(chat=>{
            if (chat.author == "__SERVER"){
                DOM.msgArea.insertAdjacentHTML('beforeend', `
                    <div class="sm" id="__chat__${chat.id}">
                        <h3> Server </h3>
                        <p>${chat.message}</p>
                        ${loadEmbeds(chat)}
                    </div>`)
            }else if (chat.author == user.id){
                DOM.msgArea.insertAdjacentHTML('beforeend', `
                    <div class="m" id="__chat__${chat.id}">
                        <h3> You </h3>
                        <p><span>${chat.message}</span></p>
                        ${loadEmbeds(chat)}
                    </div>`)
            }else {
                DOM.msgArea.insertAdjacentHTML('beforeend', `
                    <div class="em" id="__chat__${chat.id}">
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
            if (chat.chatID == big_chat.id){
                if (chat.author == "__SERVER"){
                    DOM.msgArea.insertAdjacentHTML('beforeend', `
                        <div class="sm" id="__chat__${chat.id}">
                            <h3> Server </h3>
                            <p>${chat.message}</p>
                            ${loadEmbeds(chat)}

                        </div>`)
                }else if (chat.author == user.id){
                    DOM.msgArea.insertAdjacentHTML('beforeend', `
                        <div class="m" id="__chat__${chat.id}">
                            <h3> You </h3>
                            <p><span>${chat.message}</span></p>
                            ${loadEmbeds(chat)}

                        </div>`)
                }else {
                    DOM.msgArea.insertAdjacentHTML('beforeend', `
                        <div class="em" id="__chat__${chat.id}">
                            <h3> ${big_other.username} </h3>
                            <p>${chat.message}</p>
                            ${loadEmbeds(chat)}
                        </div>`)
                }                
            }
            cis.forEach(chatIcon =>{
                if (Number(chatIcon.chat.id) == Number(chat.chatID)) {
                    if (chat.chatID != big_chat.id){
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
        }else if(chat.eventType == "CHAT:UPDATEMESSAGE"){
            console.log(chat, big_chat.id)
            if (chat.chatID == big_chat.id){
                let currentNODE = document.getElementById(`__chat__${chat.id}`)
                console.log(currentNODE)
                currentNODE.innerHTML = `
                    <h3> ${(chat.author == user.id && 'You') || big_other.username} </h3>
                    <p><span>${chat.message}</span></p>
                    ${loadEmbeds(chat)}
                ` 
            }
        }else if (chat.eventType=="GAMESTART"){
            window.open(`${ip}/gamePage`, '_blank');

        }

    })
}

async function sendMessage(bodymessage, chatID) {
    if (deb) { error("You already have a mesage that's sending..."); return false;}
    deb = true
    let body = {
        message: {
            "embeds": cradle,
            "message": bodymessage
        }
    }

    let stuff = await fetch(`${ip}/sendMessage?chatID=${chatID}&userID=${user.id}&encodedPass=${user.password}`,{
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body:  JSON.stringify(body)     
    })
    deb = false
    console.log("DEB: ", deb)
}

DOM.send.addEventListener("click", async function(){
    let msg = DOM.bodymsg.value
    console.log(msg)
    if (big_chat.id && (msg.length >0 || cradle.length > 0) ){
        sendMessage(msg, big_chat.id)
        DOM.bodymsg.value = ""
        cradle = []
        displayImages()
    }    
})


loadChats()

