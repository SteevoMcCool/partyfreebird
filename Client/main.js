

document.body.insertAdjacentHTML("beforeend",`<a href="loginPage">Visit Login Page</p>`)

document.body.insertAdjacentHTML("beforeend",`<a href="homePage">Visit Home Page</p>`)

function randInt(min,max){ //includes lower bound, does not include upper bound
    if (!max) { max = min; min  = 0}

    return Math.floor( Math.random() * max - min ) + min
}


