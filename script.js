let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
let movingSpeed = 60;
let secondsPassed = 0;
let oldTimeStamp = 0;

//sets canvas fullscreen
canvas.height = Math.floor(window.innerHeight)
canvas.width = Math.floor(window.innerWidth)

//setting variables
let handWidth = 100
let handHeight = 50
let dispenserY = 30
let soapHeight = 25
let soapWidth = 15
let dispenserWidth = 120
let dispenserHeight = 120

let handSpeed = 15
let soapSpeed = 5
let gameDifficulty = canvas.height/2
let difficulty = gameDifficulty
let timer = 0
let playing = false
let startTime = 0
let elapsedTime = 0
let score = 0
let gameLength = 30
let highscore = 0
let played = false

//getting highscore from local Storage
if (localStorage.getItem("highscore") === null){
    highscore = 0
}
else{
    highscore = parseFloat(localStorage.getItem("highscore"))
}

//creates key object (kind of array)
let toggledKeys = {};

let hand = {
    x: canvas.width/2-handWidth/2,
    y: canvas.height-handHeight-50
}

let gameWidth = canvas.width-60
let numOfDispensers = Math.floor(gameWidth / dispenserWidth)

//setting first soap drop pos
let soap = [Math.floor(Math.random()*numOfDispensers)*gameWidth/numOfDispensers+30+dispenserWidth/2-soapWidth/2, dispenserY+soapHeight]

//when key is pressed down, log the key
document.addEventListener("keydown", event => {
    toggledKeys[event.code] = true;
    event.preventDefault();
});
//when key comes back up, log the key
document.addEventListener("keyup", event => {
    toggledKeys[event.code] = false;
    event.preventDefault();
});


function update() {
    //start game
    if(!playing && toggledKeys["Space"]){
        score = 0
        playing = true
        officialTime = 0
        startTime = Date.now();
        played = true
    }
    if(playing){
        //moving hands
        if(toggledKeys["ArrowLeft"] && hand.x - handSpeed*movingSpeed*secondsPassed > 0){
            hand.x -= handSpeed*movingSpeed*secondsPassed
        }
        else if(toggledKeys["ArrowLeft"]){
            hand.x = 0
        }
        if(toggledKeys["ArrowRight"] && hand.x + handSpeed*movingSpeed*secondsPassed < canvas.width-handWidth){
            hand.x += handSpeed*movingSpeed*secondsPassed
        }
        else if(toggledKeys["ArrowRight"]){
            hand.x = canvas.width-handWidth
        }
        //moving soap down
        for (let i = 1; i < soap.length; i+=2) {
            soap[i] += soapSpeed*movingSpeed*secondsPassed
            //checking if soap hit hands
            if (soap[i]+soapHeight >= hand.y && soap[i]+soapHeight <= hand.y+handHeight && soap[i-1]+soapWidth >= hand.x && soap[i-1] <= hand.x+handWidth){
                score+=1
                soap.splice(i-1, 2)
            }
        }
        //adding another soap to screen
        if(soap[soap.length-1] > difficulty){
            soap.push(Math.floor(Math.random()*numOfDispensers)*gameWidth/numOfDispensers+30+dispenserWidth/2-soapWidth/2, dispenserY+soapHeight)
        }
        //setting up the timer
        setInterval(function() {
            elapsedTime = Date.now() - startTime;
        }, 100);
    }

    timer += movingSpeed*secondsPassed
    //increasing amount of soap on screen
    if(timer >= 100){
        timer = 0
        difficulty = difficulty / 1.1
    }
    //time limit
    if(elapsedTime/1000 >= gameLength){
        gameOver()
    }

}
//self explanatory
function gameOver(){
    playing = false
    difficulty = gameDifficulty
    soap = [Math.random()*(canvas.width-60-soapWidth)+30, dispenserY]
    hand.x = canvas.width/2-handWidth/2
    if (score > highscore){
        highscore = score
        localStorage.setItem("highscore", highscore)
    }
}



function draw(timeStamp) {
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);    
    update();
    
    ctx.drawImage(hands, hand.x, hand.y, handWidth, handHeight);

    ctx.textAlign = "center"
    ctx.font = "30px Arial";
    ctx.fillStyle="grey"
    if(playing && played){
        ctx.fillText(Math.round((gameLength-elapsedTime/1000)*1000)/1000, canvas.width/2, 300);
        ctx.fillText(score, canvas.width/2, 340);
        for (let i = 0; i < soap.length; i+=2) {
            ctx.drawImage(soapDrop, soap[i], soap[i+1], soapWidth, soapHeight);
        }
    }

    for (let i = 0; i < numOfDispensers; i++){
        ctx.drawImage(soapDispenser, i*gameWidth/numOfDispensers+30, dispenserY, dispenserWidth, dispenserHeight);
    }
    
    if(!playing && played){
        ctx.fillText("Score: " + score, canvas.width/2, 300);
        ctx.fillText("Highscore: " + highscore, canvas.width/2, 340);
    }

    if(!playing && !played){
        ctx.fillText("Catch As Many Soap Drops As Possible", canvas.width/2, 300);
        ctx.fillText("Use Arrow Keys To Control Hands", canvas.width/2, 340);
        ctx.fillText("Press Space To Start", canvas.width/2, 380);
    }

    ctx.drawImage(hands, hand.x, hand.y, handWidth, handHeight);

    window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw); 