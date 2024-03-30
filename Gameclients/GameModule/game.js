 //shapes: drawn after camera transformations
 //gui: drawn without respect to the camera (drawn second)
let gctx
import {ColorRGB} from "./color.js"
let Mice = [], Keybinds = []

class Game {
    constructor(htmlParent,w,h,c) {
        this.html = document.createElement("canvas")
        this.html.width = w
        this.html.height = h
        htmlParent.appendChild(this.html)
        this.ambience = c
        this.ctx = this.html.getContext("2d")
        this.shapes = []
        this.gui = []
        this.isA = "Game"
    }
    nextFrame(){
        this.ctx.setTransform(1,0,0,1,0,0)
        this.ctx.fillStyle = this.ambience.rgba()
        this.ctx.clearRect(0,0,this.html.width,this.html.height)
        this.ctx.fillRect(0,0,this.html.width,this.html.height)
        if (this.camera){
            this.camera.transformContext(this.ctx)
        }else {
            throw new Error("You need a camera!")
        }
        this.shapes.forEach(s=>{s.draw(this.ctx,this.mouse)})

    }
    nextPhysics(){
        this.ctx.setTransform(1,0,0,1,0,0)
        this.ctx.fillStyle = this.ambience.rgba()
        this.ctx.clearRect(0,0,this.html.width,this.html.height)
        this.ctx.fillRect(0,0,this.html.width,this.html.height)
        this.shapes.forEach(s=>{s.draw(this.ctx,this.mouse)})

    }
    run(FPS){
        this.startTime = Date.now()
        let now = this.startTime
        if (this.onStart){
            this.onStart()
        }
        this.engine = setInterval(function(eta){
            let newNow = Date.now()
            let dt = newNow-now
            now = newNow
            eta.nextPhysics()
            if (eta.onUpdate){
                eta.onUpdate(dt)
            }
            eta.nextFrame()
            if (eta.after){
                eta.after()
            }
        },(FPS && 1/FPS)*1000 || 32,this)
    }
    pause(){
        if (this.engine){
            clearInterval(this.engine)
            this.engine = false
            this.pauseTime = Date.now()
            if (this.onPause){
                this.onPause()
            }
        }
    }
    resume(FPS){
        if (this.onResume){
            this.onResume()
        }
        if (!this.engine){
            now = Date.now()
            this.engine = setInterval(function(){
                let newNow = Date.now()
                let dt = newNow-now
                now = newNow
                if (eta.onUpdate){
                    eta.onUpdate(dt)
                }
                eta.nextFrame()
                if (eta.after){
                    eta.after()
                }
            },(FPS && 1/FPS) || 32,this)          
        }
    }
    setCamera(cam){
        this.camera = cam
        this.ctx.camera = cam
    }
    append(...shapes){
        this.shapes.push(...shapes)
        this.shapes.forEach(s=>{
            s.parent = this
        })
    }
}

class Camera {
    constructor(top,left,rotation,zoomX,zoomY){
        this.top=top
        this.left=left
        this.rotation = rotation
        this.zoomX = zoomX
        this.zoomY = zoomY
    }
    transformContext(gctx){
        gctx.scale(this.zoomX,this.zoomY)
        gctx.translate(-this.left,-this.top)
        gctx.rotate(-this.rotation)
        if (this.skew){
            gctx.transform(1,this.skew.X,this.skew.Y,1,0,0)
        }
    }
}
class Shape {
    constructor(left,top){
        this.left = left,
        this.top = top,
        this.rotation = 0,
        this.mouseEvents = false
        this.game = false
        this.isA = "Shape"
    }
    draw(gctx,mouse){
        gctx.save()
        gctx.translate(this.left,this.top)
        gctx.rotate(this.rotation)
        this._d(gctx,mouse)
        gctx.restore()
    }
    getGame(){
        return (this.parent.isA=="Game" && this.parent) || this.parent.getGame()
    }
    setBorder(color,width,dash){
        this.border = {
            color: color,
            width: width,
            dash:dash
        }
    }
    setHoverTransform(ox=0,oy=0,sx=0,sy=0,newColor=this.color){
        this.hoverTransform = {
            ox: ox,
            oy: oy,
            sx: sx,
            sy: sy,
            newColor:newColor
        }
    }   
    setHoverBorder(color=this.border.color,width=this.border.width,dash=this.border.dash){  //note border must be set first
        this.hoverBorder = {
            color: color,
            width: width,
            dash: dash,
        }      
    }   

}
class Group extends Shape{
    constructor(left=0,top=0){
        super(left,top)
        this.rotation = 0
        this.shapes = []
    }
    _d(gctx){
        this.shapes.forEach(shape=> shape.draw(gctx))
    }
    append(...shapes){
        this.shapes.push(...shapes)
        this.shapes.forEach(s=>{
            s.parent = this
        })
    }

}
class Polygon extends Shape{
    constructor(left,top,width,height,corners=[[0,0],[0,1],[1,1],[1,0]]){
        super(left,top)
        this.width = width
        this.height = height
        this.corners = corners
        this.color = new ColorRGB(0,0,0)
    }

    _d(gctx,mouse){
        this.path = new Path2D()
        let curHover = (this.hover && this.hoverTransform) || {ox: 0,   oy: 0,     sx: 0,     sy: 0,     newColor:this.color}
        let width = this.width + curHover.sx
        let height = this.height + curHover.sy
        let ox = curHover.ox
        let oy = curHover.oy
        let color = curHover.newColor
        this.path.moveTo(this.corners[0][0]*width + ox , this.corners[0][1]*height + oy)
        this.corners.forEach(c=>{
            this.path.lineTo(c[0]*width + ox, c[1]*height + oy)
        })
        this.path.lineTo(this.corners[0][0]*width + ox,this.corners[0][1]*height + oy)
        gctx.fillStyle = color.rgba()
       
        if (this.mouseEvents && mouse){
            if (gctx.isPointInPath(this.path,mouse.x,mouse.y)) {
                if (!this.hover){
                    this.hover=true
                    
                    if (this.onHoverStart){
                        this.onHoverStart()
                    }
                }
            }else if (this.hover){
                this.hover=false
                if (this.onHoverEnd){
                    this.onHoverEnd()
                }
            }
        }
        this.transform = gctx.getTransform()
        gctx.fill(this.path)
        if (this.border){
            gctx.strokeStyle = this.border.color.rgba()
            gctx.lineWidth = this.border.width
            gctx.setLineDash (this.border.dash)
            if (this.hover && this.hoverBorder){
                gctx.strokeStyle = this.hoverBorder.color.rgba()
                gctx.lineWidth = this.hoverBorder.width
                gctx.setLineDash(this.hoverBorder.dash)
            }
            gctx.stroke(this.path)
        }
    }
    setAnchorPoijnt(x,y){
        this.corners = this.corners.map(c1=> [c1[0]-x,c1[1]-y])
    }
    isPointInShape(x,y,gctx){
        if (!gctx){
            let game = this.getGame()
            gctx = game.ctx
        }
        let t = gctx.getTransform()
        gctx.setTransform(this.transform)
        let a  = gctx.isPointInPath(this.path,x,y)
        gctx.setTransform(t)
        return a
    }
    getUnCameradTransform(){
        let x = this.transform.e/this.transform.a - this.transform.e
        let y = this.transform.f/this.transform.a - this.transform.f
        let C = Math.cos(this.rotation)
        let S = Math.sin(this.rotation)
        let m = this.transform.scale(1/this.transform.a).translate(C*x-S*y,C*y-S*x)
        return m
    }
    computeCorners(midRender){
        let curHover = (this.hover && this.hoverTransform) || {ox: 0,   oy: 0,     sx: 0,     sy: 0,     newColor:this.color}
        let width = this.width + curHover.sx
        let height = this.height + curHover.sy
        let ox = curHover.ox
        let oy = curHover.oy
        let m = this.transform//this.getUnCameradTransform()
        if (midRender){m=this.getUnCameradTransform()}
        let c1 = this.corners.map(c=>[c[0]*width+ox, c[1]*height+oy])
        let c2 = c1.map(c=>m.transformPoint({x:c[0],y:c[1]}))
        let TL = m.transformPoint({x:this.left,y:this.top})
        return {
            computed: c2,
            preTransform: c1,
            TL:TL
        }
    }
    getBorder(){
        let thisCorners = this.computeCorners().computed
        let points = []
        thisCorners.forEach((c,i)=>{
            let i1 = (i + 1) % thisCorners.length
            let c1 = thisCorners[i1]
            let t=0
            let length = ((c1.x - c.x)**2 + (c1.y-c.y)**2)**(1/2)
            let dX = (c1.x - c.x)/length
            let dY = (c1.y-c.y)/length
            do {
                points.push([c.x + dX*t, c.y+dY*t])
                t +=1
            }while (t<=length)
        })
        return points
    }
    collidesWith(shape,tolerance = 1){
        let b0 = this.getBorder()
        let b1 = shape.getBorder()
        let ret = b0.filter(p=> b1.find(p1=> (((p1[0]-p[0])**2+(p1[1]-p[1])**2) < tolerance) ) )
        if (ret.length == 0){
            if (this.isPointInShape(b1[0][0],b1[0][1])){
                return b0 //argument shape is fully enclosed by this
            }
            if (shape.isPointInShape(b0[0][0],b0[0][1])){
                return b1 //this is fully enclosed by argument shape
            }
        }
        return ret  
    }   

}
class Rectangle extends Shape{ //deprecated 
    constructor(left,top,width,height,color= new ColorRGB(0,0,0)){
        super(left,top)
        this.width = width
        this.height = height
        this.color = color
        this.anchorPoint = [0,0]
    }
    _d(gctx){
        gctx.beginPath()
        gctx.fillStyle =this.color.rgba()
        this.transform = gctx.getTransform()
        gctx.fillRect(-this.anchorPoint[0] * this.width,-this.anchorPoint[1] * this.height,this.width,this.height)
        if (this.border){
            gctx.strokeStyle = this.border.color.rgba()
            gctx.lineWidth = this.border.width
            gctx.setLineDash = this.border.dash
            gctx.strokeRect(0,0,this.width,this.height)
        }
    }
}
class Line extends Shape{
    constructor(left,top,width,height){
        super(left,top)
        this.width = width
        this.height = height
        this.color = "#000000"
        this.thickness = 5
        this.dash = []
    }
    _d(){
        gctx.beginPath()
        gctx.moveTo(0,0)
        gctx.lineTo(this.width,this.height)
        gctx.strokeStyle = this.color.rgba()
        gctx.lineWidth = this.thickness
        gctx.setLineDash(this.dash)
        gctx.stroke()
    }
    isPointOnLine(x,y,gctx){
        if (!gctx){
            let game = this.getGame()
            gctx = game.ctx
        }
        let t = gctx.getTransform()
        let lw = gctx.lineWidth
        gctx.lineWidth = this.thickness
        gctx.setTransform(this.transform)
        let a = gctx.isPointInStroke(this.path,x,y)
        gctx.setTransform(t)
        gctx.lineWidth =  lw 
        return a
    }
}
class DrawnImage extends Shape{
    constructor(image,left,top,width,height,sx=0,sy=0,sw=image.naturalWidth,sh=image.naturalHeight){
        super(left,top)
        this.image = image
        this.rotation = 0
        this.anchorPoint =[0,0]
        this.width = width
        this.height = height
        this.sx = sx
        this.sy = sy
        this.sw = sw
        this.sh = sh
    }
    _d(gctx){
        gctx.drawImage(this.image,this.sx,this.sy,this.sw,this.sh,
            -this.anchorPoint[0]*this.width,-this.anchorPoint[1]*this.height,this.width,this.height)
    }
}


class KeyboardManager {
    constructor(game){    
        this.game = game
        Keybinds.push(this)
        this.isDown ={}
        this.onDown = false
        this.onUp = false
        this.keybinds = []
        game.keyboard = this 
    }
    bindKeysToAction(keys,action,upAction=(function(){})){
        this.keybinds.push([keys,action,upAction])
    }
}

class MouseManager{
    constructor(game){
        this.game = game
        this.x = 0
        this.y = 0
        this.dX = 0
        this.dY=0
        this.onMove = false
        Mice.push(this)
        this.isDown =[false,false,false,false]
        this.onDown = false
        this.onUp = false
        game.mouse = this
    }
} 


function poo(m,s){
    if (s.mouseEvents){
        if (s.shapes){
            return s.shapes.filter(s=>{
                poo(s)
            })
        }
        if (s.isPointInShape){
            return s.isPointInShape(m.x,m.y,m.game.gctx)
        }else if (s.isPointOnLine){
            return s.isPointOnLine(m.x,m.y,m.game.gctx)
        }
    }   
    return false
}
function topLevel(ar){
    if (ar.length==0){
        return []
    }
    if (typeof(ar[0])=="object" && ar[0][0]){
        return (topLevel(ar[0])).concat(
            topLevel(ar.slice(1))
        )
    }
    return [ar[0]].concat(
            topLevel(ar.slice(1))
            )
}
window.addEventListener("mousedown",function(event){
    let button  = event.button
    Mice.forEach(m=>{
        m.isDown[button] = Date.now()
        if (m.onDown){
            m.onDown(button)
        }
        let matches = m.game.shapes.filter(s=>{
            return poo(m,s)
         })
        let cools = topLevel(matches)
        cools.forEach((s,i)=>{
           if (s.onMouseDown){
                s.onMouseDown(button, cools.length - i - 1)
           }
        })
    })
})
window.addEventListener("mouseup",function(event){
    let button  = event.button
    Mice.forEach(m=>{
        m.isDown[button] = false
        if (m.onUp){
            m.onUp(button)
        }
        let matches = m.game.shapes.filter(s=>{
            return poo(m,s)
         })
        let cools = topLevel(matches)
        cools.forEach((s,i)=>{
           if (s.onMouseUp){
                s.onMouseUp(button, cools.length - i - 1)
           }
        })
    })
})

window.addEventListener("keydown",function(event){
    let code = event.code
    let key = event.key
    Keybinds.forEach(kb=>{
        if (!kb.isDown[code]){
            if (kb.onDown){
                kb.onDown(code,key)
            }
            kb.isDown[code] = Date.now()
            kb.keybinds.forEach(_kb=>{
                if (_kb[0].includes(code) || _kb[0].includes(key)){
                    _kb[1](code,key)
                }
            })
        }
    })
})
window.addEventListener("keyup",function(event){
    let code = event.code
    let key = event.key
    Keybinds.forEach(kb=>{
        if (kb.onUp){
            kb.onUp(code, key, Date.now()-kb.isDown[code])
        }
        kb.keybinds.forEach(_kb=>{
            if (_kb[0].includes(code) || _kb[0].includes(key)){
                _kb[2](code,key, Date.now()-kb.isDown[code])
            }
        })
        kb.isDown[code] = false
    })
})
window.addEventListener("mousemove",function(event){
    let X = event.clientX, Y = event.clientY
    Mice.forEach(m=>{
        let cdata = m.game.html.getBoundingClientRect()
        let X1 = X - cdata.left
        let Y1 = Y - cdata.top
        m.dX = X1 - m.x
        m.dY = Y1 - m.y
        m.x = X1
        m.y = Y1
        if (m.onMove){
            m.onMove()
        }
    })
})


export {Game, Camera, Rectangle,Line,DrawnImage,Group,Polygon, MouseManager, KeyboardManager}