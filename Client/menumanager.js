let ip = "http://localhost" //'http://partyfreebirds.com'
let decoder = new TextDecoder("utf-8")
let user = false

document.body.insertAdjacentHTML("afterbegin",
`&nbsp;&nbsp;<div id = "menu">&nbsp;  <button id = "home">Home</button>  <button id = "help">Help</button><button id = "settings">Settings</button><button id = "profile">Profile</button><button id = "chats">Chats (<span>0</span>)</button></div>
`)

let menu = document.getElementById("menu")
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
async function loadMenu() {
    let email = window.localStorage.getItem("em")
    let pass = window.localStorage.getItem("ps")
    let stuff = await fetch(`${ip}/login?email=${email}&password=${pass}`)
    let _user = await getInfo(stuff)

    let chatDisp = document.getElementById('chats')
    let profDisp = document.getElementById('profile')
    let unrdDisp = chatDisp.querySelectorAll("span")[0]
    console.log(_user.details)
    if (_user.status != 3){
       console.log(_user.details)
       window.location.replace("loginPage")
    }else {
        user = _user.details
        let unreads = await fetch(`${ip}/getTimestampOfMostRecentMessage?userID=${user.id}&chatIDs=(${user.chats.active.join()})`)
        unreads =  (await getInfo(unreads)).filter(c => c[0] > c[1])
        unrdDisp.innerText = unreads.length

        profDisp.insertAdjacentHTML('AFTERBEGIN',`
         <span style = "background-image: url('${user.profile.pfp}'); background-size:contain; background-repeat:no-repeat">&nbsp;&nbsp;&nbsp;&nbsp;</span>
        `)
    }
    chatDisp.onclick = function(){
        window.location.replace("/chatPage")
    }
}
let home = document.getElementById("home")
home.onclick = function(){window.location.replace("homePage")}
loadMenu()

