let allAnimations = []
function ManageAnimations(dt){
    allAnimations.filter(AN=>AN.playing).forEach(AN=>AN.update(dt))
}
class Animation{
    constructor(drawnimg,sw,sh,f=9999,sy=0,curve = "t",looped=false,sf=0){
        let image = drawnimg.image
        this.drawnImage = drawnimg
        this.frames = []
        this.looped = looped
        this.curve = curve
        let columns =  Math.floor( image.naturalWidth / sw)
        let rows = Math.floor((image.naturalHeight-sy)/sh)
        let y = Math.floor(sf/columns)
        let x = sf % columns
        do {
            do {
                this.frames.push({
                    sx: x*sw,
                    sy: y*sw + sy
                })
                x+= 1
            } while (x< columns && this.frames.length < f)
            y+=1
            x = 0
        }while (y< rows && this.frames.length < f)
        this.frameCount = this.frames.length
        this.frame = 0
        this.sw = sw
        this.sh = sh
        allAnimations.push(this)
    }
    play(length){
        this.mostRecentPlay = Date.now()
        this.playing = true
        this.localTimePlaying = 0
        this.length = length
        this.drawnImage.sw = this.sw
        this.drawnImage.sh = this.sh
        this.lastFrameChange = this.mostRecentPlay
    }
    update(dt){
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
        this.setFrame( Math.floor(t * this.frameCount) )
        
    }
    setFrame(num){
        let change = false
        if (num != this.frame){
            change = this.frame
            this.frameDeltaTime = Date.now() - this.lastFrameChange
            this.lastFrameChange = this.lastFrameChange + this.frameDeltaTime
        }
        this.frame = num
        let FRAME = this.frames[num]
        this.drawnImage.sx = FRAME.sx
        this.drawnImage.sy = FRAME.sy
        if ((change || change+1 == 1) && this.onFrameChange){
            this.onFrameChange(this.frameDeltaTime,change)
        }
    }
    stop(good){
        if (good){
            this.setFrame(this.frameCount-1)
        }
        if (this.onStop){
            this.onStop()
        }
        this.playing = false
        this.localTimePlaying = 0
    }
    pause() {
        this.playing = false
    }
    resume(){
        this.playing = true
        this.lastFrameChange = Date.now()
    }
    tempo(rate){
        this.localTimePlaying = this.localTimePlaying/rate
        this.length = this.length/rate
    }
}

let animStuff= {Animation, ManageAnimations}