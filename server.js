let express = require("express")
let APP = express();
var cors = require('cors');
var soupa = require('@supabase/supabase-js')
const { time } = require("console")
const { serialize } = require("v8");


let Supakey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjem1tdG9lb3hpYmR0aWt6a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMTE1MTUxMywiZXhwIjoyMDI2NzI3NTEzfQ.PaBnn4tD8nRkYZH0jE32VyL5sSp5oSuT9PHc7SFaqf4"

function r(res, info){
    res.send(JSON.stringify(info))
    console.log(info)
    return info
}

const supabase = soupa.createClient("https://cczmmtoeoxibdtikzkjf.supabase.co", Supakey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  })
  

  let APC = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890!@#$%^&*()`~-_=+[{]}|'\";:/?.>,< "

  let NAPC = "w-R't=Fv<j5VG?8gD,.9B\"/N&KlOq^U)(I:ue[>]*CY3~A1zx!M{a0Zo4bWncSQ@s}XHih6d_ `my+pT7Lk;r$#%P|fEJ2"
  
  function encode(str){
      let newSTR = ""
      for (let i = 0; i<str.length; i++){
          let c = str.charAt(i)
          let spot = NAPC.search(c)
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

APP.get("/main", async (req, res) => {
    res.sendFile("./Client/main.js", {root: __dirname});
}) 
APP.get("/styles", async (req, res) => {
    res.sendFile("./Client/styles.css", {root: __dirname});
}) 

APP.get("/loginPage",async (req, res) => {
    res.sendFile("./Client/loginpage.html", {root: __dirname});
})

APP.get("/loginmain",async (req, res) => {
    res.sendFile("./Client/loginmain.js", {root: __dirname});
})

APP.get("/login",async (req,res)=>{
    let email = req.query.email
    let pass = req.query.password
    console.log(email,pass)
    let {data, error} = await supabase.from('PlayerInfo').select().eq('email', email).maybeSingle()
    let user = data
    if (user && !error){
        if ( encode(pass) == user.password){
            return r(res, {status:3,details:user})
        }else{
            return r(res, {status:2,details: "Incorrect email or password. <a href='someResetPage'>Reset?</a>"})
        }
    }else {
        return r(res, {status:4,details:"Email not found or an unknown error occured!"})
    }
})

APP.listen(80, ()=>{
    console.log("HERE AT PORT 80!!!");
});


