let express = require("express")
let APP = express();


function r(res, info){
    res.send(JSON.stringify(info))
    console.log(info)
    return info
}

APP.get("/", async (req, res) => {
    console.log("ATTEMPT");
    res.sendFile("./Client/index.html", {root: __dirname});
    
}) 


APP.listen(80, ()=>{
    console.log("HERE AT PORT 80!!!");
});