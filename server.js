let express = require("express")
let Deck = require("./decks.js").Deck
let APP = express();
let dk = require("base64-arraybuffer")
let Bridges = require('./bridges.js').Bridges
var cors = require('cors');
var soupa = require('@supabase/supabase-js')
const { time } = require("console")
const { serialize } = require("v8");

let activeGames = []
let Supakey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjem1tdG9lb3hpYmR0aWt6a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMTE1MTUxMywiZXhwIjoyMDI2NzI3NTEzfQ.PaBnn4tD8nRkYZH0jE32VyL5sSp5oSuT9PHc7SFaqf4"

function r(res, info){
    res.send(JSON.stringify(info))
    //console.log(info)
    return info
}

const supabase = soupa.createClient("https://cczmmtoeoxibdtikzkjf.supabase.co", Supakey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  })
  

  let APC = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890!@$^&*()`~-_=+[{]}|'\";:/?.>,< "

  let NAPC = "w-R't=Fv<j5VG?8gD,.9B\"/N&KlOq^U)(I:ue[>]*CY3~A1zx!M{a0Zo4bWncSQ@s}XHih6d_ `my+pT7Lk;r$P|fEJ2"
  
  function encode(str){
      if (!str){return ''}
      let newSTR = ""
      for (let i = 0; i<str.length; i++){
          let c = str.charAt(i)
          let spot = NAPC.indexOf(c)
          newSTR = newSTR.concat(NAPC.charAt(NAPC.length -spot - 1))
      }
      return newSTR
  }



APP.use(cors());
APP.use(express.json({limit:"200mb"}))
APP.get("/", async (req, res) => {
    res.sendFile("./Client/index.html", {root: __dirname});
}) 

APP.get("/", async (req, res) => {
    res.sendFile("./Client/index.html", {root: __dirname});
}) 
APP.get("/gamePage",async (req, res) => {
    res.sendFile("./Gameclients/gamepage.html", {root: __dirname});
})
APP.get('/gm', async (req, res) => {
    res.sendFile(`./Gameclients/GameModule/${req.query.name}.js`, {root: __dirname});
}) 
APP.get('/gameClient', async (req, res) => {
    res.sendFile(`./Gameclients/gameClient.js`, {root: __dirname});
}) 



APP.get("/main", async (req, res) => {
    res.sendFile("./Client/main.js", {root: __dirname});
}) 
APP.get("/styles", async (req, res) => {
    res.sendFile("./Client/styles.css", {root: __dirname});
}) 

APP.get("/loginPage",async (req, res) => {
    res.sendFile("./Client/loginpage.html", {root: __dirname});
})
APP.get("/homePage",async (req, res) => {
    res.sendFile("./Client/homepage.html", {root: __dirname});
})

APP.get("/loginmain",async (req, res) => {
    res.sendFile("./Client/loginmain.js", {root: __dirname});
})
APP.get("/chatPage",async (req, res) => {
    res.sendFile("./Client/chatpage.html", {root: __dirname});
})

APP.get("/menuManager", async (req, res)=>{
    res.sendFile("./Client/menumanager.js", {root: __dirname});
})
APP.get("/chatManager", async (req, res)=>{
    res.sendFile("./Client/chatmanager.js", {root: __dirname});
})


APP.get("/login",async (req,res)=>{
    let email = req.query.email
    let pass = req.query.password
    console.log("LOGIN",email,pass, encode(pass))
    let {data, error} = await supabase.from('PlayerInfo').select().eq('email', email).maybeSingle()
    let user = data
    if (user && !error){
        if (pass== encode(user.password)){
            return r(res, {status:3,details:user})
        }else{
            return r(res, {status:2,details: "Incorrect email or password. <a href='someResetPage'>Reset?</a>"})
        }
    }else {
        return r(res, {status:4,details:"Email not found or an unknown error occured!"})
    }
})

APP.get("/getTimestampOfMostRecentMessage",async (req,res)=>{
    let chatIDs = req.query.chatIDs
    let userID = req.query.userID
    let {data, error} = await supabase.from('Chats').select().filter('id', 'in', chatIDs)
    let chats = data
    let sf = []
    //console.log(chatIDs, userID, chats)
    chats.forEach((chat)=>{
        if (chat && !error){
            let userdata = chat.participants.writers.find(w => w[0] == userID) 
            sf.push([chat.chatlog[chat.chatlog.length - 1].timestamp, userdata[1]])
        }else {
        }
    })
    return r(res,sf);
})
APP.get("/getPublicProfile", async (req, res)=>{
    let id = req.query.id
    let {data, error} = await supabase.from('PlayerInfo').select().eq('id', id).maybeSingle()    
    let user = data
    if (user && !error){
        
        return r(res,
                {
                    status:3,
                    details: {
                        pfp: user.profile.pfp,
                        username: user.profile.username
                    }
                }
            )
    }else {
        return r(res, {status:4,details:`Id not found, provided: ${id}`})
    }  
})


APP.get('/loginANDgetchatsfor',async (req,res)=>{
    let email = req.query.email
    let pass = req.query.password
    let {data, error} = await supabase.from('PlayerInfo').select().eq('email', email).maybeSingle()
    let user = data
    if (user && !error){
        if ( pass == encode(user.password)){
            let chats = await supabase.from('Chats').select().filter('id','in', `(${user.chats.active.join()})`)
            return r(res, {status:3,details:{user,chats}})
        }else{
            return r(res, {status:2,details: "Incorrect email or password. <a href='someResetPage'>Reset?</a>"})
        }
    }else {
        return r(res, {status:4,details:"Email not found or an unknown error occured!"})
    }  
})


let clients = {

}

APP.get("/beginlisteningtoevents", async (req, res)=>{
    res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
      });
    res.flushHeaders();
    let userID = req.query.userID;
    let password = req.query.encodedPass;
    //console.log(userID,password)
    let {data, error} = await supabase.from('PlayerInfo').select().eq('id', userID).eq('password',password).maybeSingle()
    let user = data
    if (data && !error){

        console.log(`User with id=${userID} started connection to server`)
        clients[`U${userID}`] = clients[`U${userID}`] || []

        let jt = `${userID}${Date.now()}`
        clients[`U${userID}`].push({
            jointime: jt,
            user: userID,
            response: res,
            closer: req
        })
        req.on("close", ()=>{
            console.log(`User with id=${userID} closed connection to server`)
            clients[`U${userID}`] = clients[`U${userID}`] .filter(a=> a.jointime !=jt)
        })
   }else{     
        console.log({status: 4, details:`No user found with id=${userID} and pass =${password}`})
    }
})

APP.post("/sendMessage",async (req, res) => {
    let chatID = req.query.chatID;
    let userID = req.query.userID;
    let password = req.query.encodedPass;

    let message = req.body.message

    if (!chatID || !userID || !password || !message){
        return r(res, {status:2, details: 'POOR REQUEST'})
    }

    message.timestamp = Date.now()
    //console.log(chatID,userID,password)
    let {data, error} = await supabase.from('PlayerInfo').select().eq('id', userID).eq('password',password).maybeSingle()
    let user = data
    if (data && !error){
        let {data, error} = await supabase.from('Chats').select().eq('id',chatID).maybeSingle()
        let chat = data
        if (chat.participants.writers.findIndex(a=>a[0]==userID)>= 0) {
            chat.participants.writers.forEach(w=>{
                if (clients[`U${w[0]}`] && clients[`U${w[0]}`].length >0){
                    w[1] = Date.now() + 100
                }
            })
            message.id = chat.chatlog[chat.chatlog.length - 1].id + 1
            message.author = Number(userID)
            chat.chatlog.push(message)
            if (chat.chatlog.length >=500){
                chat.chatlog.shift()
            }
            
            let embeds = message.embeds
            for (let i = 0; i < embeds.length; i++){
                let e = embeds[i]
                if (e.type == 'IMAGE' && !e.link){
                    let {data,error} = await supabase.storage.from('Embeds')
                    .upload(`image${Date.now()}`, dk.decode(e.meta.blob), {
                      contentType: e.meta.type
                    })
                    if (data) {
                     e.link = ('https://cczmmtoeoxibdtikzkjf.supabase.co/storage/v1/object/public/' + data.fullPath)
                     e.meta = {}
                    }
                }
            }
            let cool = await supabase.from('Chats').update({participants: chat.participants,chatlog: chat.chatlog}).eq('id',chatID).maybeSingle().select().maybeSingle()

            message.chatID = Number(chatID)
            message.eventType = "CHAT"
            chat.participants.writers.forEach(w=>{
                if (clients[`U${w[0]}`]){
                    clients[`U${w[0]}`].forEach(sub => {sub.response.write(
                        `data: ${JSON.stringify(message)}\n\n`
                    )})
                }
            })
            return r(res, {status: 3, details:`Message Sent Cool!`})
       
        }else{
            return r(res, {status: 4, details:`No user found with id=${userID} in  chat id=${chatID}`})
        }
    }else{

       return r(res, {status: 4, details:`No user found with id=${userID} and pass =${password}`})
    }
})
function randInt(min,max){ //includes lower bound, does not include upper bound
    if (!max) { max = min; min  = 0}

    return Math.floor( Math.random() * (max - min) ) + min
}

let activeChallenges = []
APP.post("/challengeChat", async (req, res) =>{
    let chatID = req.query.chatID;
    let userID = Number(req.query.userID);
    let password = req.query.encodedPass;
    let game = req.body.gameName

    let {data, error} = await supabase.from('PlayerInfo').update({status:40001}).eq('id', userID).eq('password',password).eq('status',0).select().maybeSingle()
    let user = data
    if (data && !error){
        let {data, error} = await supabase.from('Chats').select().eq('id',chatID).maybeSingle()
        let chat = data
        let cid = randInt(9999,99999999999).toString(36).concat(Date.now().toString(36)).toUpperCase()
        if (chat.participants.writers.findIndex(a=>a[0]==userID)>= 0) {
            message = {
                message: `Engaurd! Challenge for ${game}!`,
                embeds: [{
                    type: "CHALLENGE REQUEST",
                    challengeID: cid,
                    timestamp: Date.now(),   
                    playersInvolved: [userID],
                    gameName: game,
                }],
            }
            message.timestamp = Date.now()
            message.id = chat.chatlog[chat.chatlog.length - 1].id + 1
            message.author = Number(userID)

            chat.participants.writers.forEach(w=>{
                if (clients[`U${w[0]}`] && clients[`U${w[0]}`].length >0){
                    w[1] = Date.now() + 100
                }
            })
            chat.chatlog.push(message)
            if (chat.chatlog.length >=500){
                chat.chatlog.shift()
            }
            let cool = await supabase.from('Chats').update({participants: chat.participants,chatlog: chat.chatlog}).eq('id',chatID).maybeSingle().select().maybeSingle()
            message.chatID = Number(chatID)
            message.eventType = "CHAT"
            chat.participants.writers.forEach(w=>{
                if (clients[`U${w[0]}`]){
                    clients[`U${w[0]}`].forEach(sub => {sub.response.write(
                        `data: ${JSON.stringify(message)}\n\n`
                    )})
                }
            })
            activeChallenges.push(message);
        }else{
            return r(res, {status: 4, details:`No user found with id=${userID} in  chat id=${chatID}`})
        }
    } else{
        return r(res, {status: 4, details:`No user found with id=${userID} and  pass id=${password} and status==0 (sts=${user && user.status || 'NOUSER'})`})
    }
} )

APP.get("/cancelChallenge", async function(req,res){
    let chatID = Number(req.query.chatID);
    let userID = Number(req.query.userID);
    let password = req.query.encodedPass;
    let challengeID = req.query.challengeID

    
    let {data, error} = await supabase.from('PlayerInfo').select().eq('status',40001).eq('id', userID).eq('password',password).maybeSingle()
    let user = data
    if (data && !error){
        let i = 0;
        let l = activeChallenges.length;
        for (i; i < l; i++) {
            let chal = activeChallenges[i]
            if (chal.author == userID && chal.embeds[0].challengeID == challengeID) {
                activeChallenges[i] = activeChallenges[l - 1]
                activeChallenges.length = l - 1
                await supabase.from('PlayerInfo').update({status:0}).filter('id', 'in',`(${chal.embeds[0].playersInvolved.join()})`)

                let oldChatLog = await supabase.from('Chats').select().eq('id',chatID).maybeSingle()
                if (oldChatLog.data) {
                    oldChatLog = oldChatLog.data.chatlog
                }

                let index = chal.id - oldChatLog[0].id
                if (index >= 0 ){
                    oldChatLog[index].embeds = [
                        {
                            type: "CHALLENGE RESULTS",
                            text: "Challenge Aborted"
                        }
                    ]
                    let chat = await supabase.from('Chats').update({chatlog: oldChatLog}).eq('id',chatID).maybeSingle().select().maybeSingle()
                    if (chat) { chat = chat.data} else{
                        return r(res, {status:6, details:'Challenge revoked but chat not updated'})
                    }
                    oldChatLog[index].eventType = "CHAT:UPDATEMESSAGE"
                    oldChatLog[index].chatID = Number(chatID)
                    chat.participants.writers.forEach(w=>{
                        if (clients[`U${w[0]}`]){
                            clients[`U${w[0]}`].forEach(sub => {sub.response.write(
                                `data: ${JSON.stringify(oldChatLog[index])}\n\n`
                            )})
                        }
                    })
                }
                return r(res, {status: 3, details:`Successfully Removed challenge!`})

            }else if (chal.embeds[0].playersInvolved.includes(userID)) {

                return r(res, {status: 8, details:`Considered removal, nothing happened`})

            }
        }
        return r(res, {status: 4, details:`No user found with id=${userID} in challenge id=${challengeID}`})

    } else{
        return r(res, {status: 4, details:`No user found with id=${userID} and  pass ${password} and status==40001 (sts=${user && user.status || 'NOUSER'})`})
    }    
})

function generateGameInstance(chal){
    if (chal.embeds[0].gameName == "Bridges"){
        console.log("CREATING BRIDGES")
        return new Bridges(chal)
    }
}

APP.get("/acceptChallenge", async (req, res) =>{
    let chatID = Number(req.query.chatID);
    let userID = Number(req.query.userID);
    let password = req.query.encodedPass;
    let challengeID = req.query.challengeID;
    console.log("ACCEPT INFO " ,chatID, userID, password, challengeID)
    let {data, error} = await supabase.from('PlayerInfo').select().eq('id', userID).eq('password',password).eq('status',0).select().maybeSingle()
    let user = data
    if (data && !error){
        for (let i = 0; i < activeChallenges.length; i++){
            let chal = activeChallenges[i]
            let imp = chal.embeds[0]
            if (chal.author == userID){
                return r(res, {status: 2, details:`Cannot accept own challenge`})
            }
            if (imp.challengeID == challengeID && chal.chatID == chatID && user.chats.active.includes(chatID)){
                activeChallenges[i] = activeChallenges[activeChallenges.length - 1]
                activeChallenges.length = activeChallenges.length - 1
                imp.playersInvolved.push(userID)
                console.log("PLAYERS INVOLVED" , imp.playersInvolved)
                if (imp.playersInvolved.length == 2){
                    activeGames.push({
                        mid: chal.id,
                        chatID: chatID,
                        timestamp: Date.now(),
                        GID: Number(`${Date.now()}${chatID}`),
                        instance: generateGameInstance(chal)
                    })
                    await supabase.from('PlayerInfo').update({status: 40002}).filter('id','in',`(${imp.playersInvolved.join()})`).select()
                    await supabase.from('PlayerInfo').update({current: {  
                        mid: chal.id,
                        chatID: chatID,
                        timestamp: Date.now(),
                        GID: Number(`${Date.now()}${chatID}`)
                    }}).filter('id','in',`(${imp.playersInvolved.join()})`).select()

                    imp.playersInvolved.forEach(pid=>{
                        if (clients[`U${pid}`]){
                            clients[`U${pid}`].forEach(sub => {sub.response.write(
                                `data: {"eventType":"GAMESTART"}\n\n`
                            )})
                        }
                    })
                    let oldChatLog = await supabase.from('Chats').select().eq('id',chatID).maybeSingle()
                    if (oldChatLog.data) {
                        oldChatLog = oldChatLog.data.chatlog
                    }
                    let index = chal.id - oldChatLog[0].id
                    if (index >= 0 ){
                        oldChatLog[index].embeds = [
                            {
                                type: "CHALLENGE RESULTS",
                                text: "Challenge in progress..."
                            }
                        ]
                        let chat = await supabase.from('Chats').update({chatlog: oldChatLog}).eq('id',chatID).maybeSingle().select().maybeSingle()
                        if (chat) { chat = chat.data} else{
                            return r(res, {status:6, details:'Challenge accepted but chat not updated'})
                        }
                        oldChatLog[index].eventType = "CHAT:UPDATEMESSAGE"
                        oldChatLog[index].chatID = Number(chatID)
                        chat.participants.writers.forEach(w=>{
                            if (clients[`U${w[0]}`]){
                                clients[`U${w[0]}`].forEach(sub => {sub.response.write(
                                    `data: ${JSON.stringify(oldChatLog[index])}\n\n`
                                )})
                            }
                        })
                    }
                    return r(res, {status: 3, details:`Challenge accepted successfully! If needed, sending involved users to game!`})
                }
            }else{
                return r(res, {status: 4, details:`User found but no challenge found with id==${challengeID} in a valid chat`})
              
            }
        }
    }else{
        return r(res, {status: 4, details:`No user found with id=${userID} and  pass=${password} and status==0 (sts=${user && user.status || 'NOUSER'})`})
   
    }
})
APP.get("/currentGame",async (req, res)=>{
    let userID = Number(req.query.userID)
    let password = req.query.encodedPass
    let {data, error} = await supabase.from('PlayerInfo').select().eq('id',userID).eq('password',password).maybeSingle()
    if (data && !error){
        let user = data
        let current = (user.current || {id:"_"}).id
        let index = activeGames.findIndex(game=>game.id == current)
        if (index >= 0){
            let thisgame  = activeGames[index]
            return r(res, {statis:3, thisgame})
        }else{
            return r(res, {status: 4, details:`User not in any known game!`})           
        }
    }else{
        return r(res, {status: 4, details:`No user found with id=${userID} and  pass ${password}`})
    }   
})


APP.listen(80, ()=>{
    console.log("HERE AT PORT 80!!!");
});


