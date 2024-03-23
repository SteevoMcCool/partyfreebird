let express = require("express")
let APP = express();


function r(res, info){
    res.send(JSON.stringify(info))
    console.log(info)
    return info
}

APP.get("/", async (req, res) => {
    res.sendFile("./Client/index.html", {root: __dirname});
    
}) 


APP.listen(3000, ()=>{
    console.log("http://localhost:3000");
});