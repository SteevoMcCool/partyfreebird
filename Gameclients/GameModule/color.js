class ColorRGB {
    constructor(r,g,b,a){
        this.r = r,
        this.g = g
        this.b = b
        this.a = a || 1
    }
    rgba(){
        return `rgba(${this.r},${this.g},${this.b},${this.a})`
    }
    multiply(c2){
        let  r =  (this.r * c2.r)/255
        let  g =  (this.g * c2.g)/255
        let  b =  (this.b * c2.b)/255
        let  a = (this.a)*(c2.a)
        return new ColorRGB(r,g,b,a)
    }
    average(c2){
        let  r = (this.r*this.a + c2.r*c2.a) / (this.a + c2.a)
        let  g = (this.g*this.a + c2.g*c2.a) / (this.a + c2.a)
        let  b = (this.b*this.a + c2.b*c2.a) / (this.a + c2.a)
        let  a = 1 - (1-this.a)*(1-c2.a)
        return new ColorRGB(r,g,b,a)
    }    
    grayscale(strength){ //0->1
        let avg = (this.r + this.g + this.b)/3
        let  r = (avg-this.r)*strength + this.r
        let  g = (avg-this.g)*strength + this.g
        let  b = (avg-this.b)*strength + this.b
        return new ColorRGB(r,g,b,this.a)
    }
    duplicate(a){
        return new ColorRGB(this.r,this.g,this.b, a|| this.a)
    }
}

let colorStuff =   {ColorRGB}