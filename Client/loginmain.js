
let ip = "http://localhost" //"http://partyfreebirds.com"


let decoder = new TextDecoder("utf-8")
let deb = false
let DOM = {
    errorDisplay: document.getElementById("error"),
    loginBu: document.getElementById("login"),
    emailInput: document.querySelectorAll('input[type="email"]')[0],
    passInput: document.querySelectorAll('input[type="password"]')[0],
}
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


function error(msg){
    DOM.errorDisplay.innerHTML = msg
    DOM.errorDisplay.style.visibility = "visible"
    DOM.errorDisplay.style.transition = "none";
    DOM.errorDisplay.style.backgroundColor = `rgba(255,0,0,0.375)`
    setTimeout(function(){
        DOM.errorDisplay.style.transition = `all 0.4s`
        DOM.errorDisplay.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--errorBG")
    },15)
}


DOM.loginBu.addEventListener("click",async function(){
    if (deb == true) {return false}
    deb = true
    let email = DOM.emailInput.value
    let pass = DOM.passInput.value
    let stuff = await fetch(`${ip}/login?email=${email}&password=${pass}`)
    stuff = await getInfo(stuff)
    console.log(stuff)

    if (stuff.status != 3){
        error(stuff.details)
    }else {
        window.localStorage.setItem("em",email)
        window.localStorage.setItem("ps",pass)
        window.location.replace("/homePage")
    }
    deb = false
})