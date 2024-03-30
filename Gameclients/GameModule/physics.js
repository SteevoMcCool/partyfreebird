let Velocities = []
function ManageAccelerations(dt){
    Velocities.forEach(v=>{
        v.last.x = v.x
        v.last.y = v.y
        v.x += v.acceleration.x * dt/1000
        v.y += v.acceleration.y * dt/1000
        if (v.max){
            v.x = Math.min(v.max.x,Math.max(v.min.x,v.x))
            v.y = Math.min(v.max.y,Math.max(v.min.y,v.y))
        }
    })
}
function ManageVelocities(dt){
    Velocities.forEach(v=>{
        if (v.shape){
           v.shape.left += ((v.last.x + (v.x-v.last.x)/2) *dt/1000)
           v.shape.top += ((v.last.y + (v.y-v.last.y)/2 ) * dt/1000)
        }
    })
}

class Velocity{
    constructor(x,y){
        this.x = x
        this.y = y

        this.last = {x:0,y:0} 
        this.acceleration = {x:0,y:0}
        Velocities.push(this)
    }
    setAcceleration(x,y){
        this.acceleration.x = x
        this.acceleration.y = y
    }
    setVelocityBounds(min,max,curve){
        this.min  = {}
        this.max = {}
        this.min.x = min.x
        this.min.y = min.y
        this.max.x = max.x
        this.max.y = max.y
        if (curve){
            this.curve = {
                at: curve.at,
                str: 20
            }
        } 
    }
    attachTo(shape){
        this.shape = shape
        shape.velocities =  shape.velocities || []
        shape.velocities.push(this)
        shape.getNetVelocity = function(){
            return shape.velocities.reduce((a,b)=> {
                return {x:a.x+b.x, y:a.y+b.y}
            })
        }
        shape.getNetAcceleration = function(){
            return shape.velocities.reduce((a,b)=> {
                return {x:a.acceleration.x+b.acceleration.x, y:a.acceleration.y+b.acceleration.y}
            })
        }
    }
    end(){
        if (this.shape){
            let i = this.shape.velocities.findIndex(v=>v==this)
            this.shape.velocities = this.shape.velocities.slice(0,i).concat(this.shape.velocities.slice(i+1))
        }
        let i = Velocities.findIndex(v=>v==this)
        Velocities = Velocities.slice(0,i).concat(Velocities.slice(i+1))
    }

}
//manageAccelerations and ManageVelocities are meant to be called sequentially in your game.onUpdate() looop

export {Velocity,ManageAccelerations,ManageVelocities}