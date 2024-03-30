import {ColorRGB} from "./color.js"

let allTransitions = []
function ManageTransitions(dt){
    allTransitions.filter(TR=>TR.playing).forEach(TR=>TR.frame(dt))
}
class Transition{
    constructor(shape, data, curve,looped){
        this.shape = shape
        this.data = data
        this.curve = curve || "t" //make sure curve starts at 0 and ends at 1
        this.looped = looped
        allTransitions.push(this)
    }
    calc(prop,lastKF,thisKF,t){
        let perc = (t-lastKF[0]) / (thisKF[0]-lastKF[0])
        if (prop == "color"){
            return (lastKF[1].duplicate(lastKF[1].a * (1-perc)).average(thisKF[1].duplicate(thisKF[1].a * perc))).duplicate((lastKF[1].a + thisKF[1].a)/2)
        }
        return  (thisKF[1] - lastKF[1])*perc  + lastKF[1]
    }
    calcKF(t){
        let props = Object.keys(this.data)
        props.forEach(p=>{
            let index = this.data[p].findIndex(kf => kf[0]>=t)
            if (index==0){
                index = 1
            }
            let oldIndex = index - 1
            index = this.data[p][index]
            oldIndex = this.data[p][oldIndex]
            if (p== "opacity"){
                this.shape.color.a = this.calc(this.data[p],oldIndex,index,t)
                return "SUKA BLYAT"
            }
            this.shape[p] = this.calc(p,oldIndex,index,t)
        })
    }
    frame(dt){
        this.localTimePlaying += dt
        let t = (this.localTimePlaying / (this.length*1000))
        if (t>=0.999){
            if (this.looped){
                t = t % 1
            }else{
                return this.stop(true)
            }
        }
        t = eval(this.curve)
        this.calcKF(t)
    }
    play(length){
        this.mostRecentPlay = Date.now()
        this.playing = true
        this.localTimePlaying = 0
        this.length = length
    }
    stop(good){
        if (good){
            this.calcKF(1)
        }
        this.playing = false
        this.localTimePlaying = 0
    }
}
/*sample data:
    {
        top: [[0,0],[0.75,50],[1,100]],  //transitions top
        color: [[0,ColorRGB],[1,ColorRGB]],
        opacity: ...
    }
*/

export {Transition, ManageTransitions}