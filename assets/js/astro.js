//game settings

const FPS = 30; // frames per seconds
const friction = 0.7; // 0= no friction , 1= a lot of friction
const gameLives = 3;// number of given lives
const laserDistance = 0.6; // max distance laser can travel as fraction of screen width
const laserDuration = 0.1; // duration of the lasers' explosion in seconds
const laserMax = 10; // maximum number of lasers on screen at once
const laserSpeed= 500; // speed of lasers in pixels per second
const pointsForLargeAsteroids = 20; // points scored for a large asteroid
const pointsForMediumAsteroids = 50; // points scored for a medium asteroid
const pointForSmallAsteroids = 100; // points scored for a medium asteroid
const saveScore = "highscore"; // save key for local storage of high score
const enemyNum = 5;// numbers of enemies at the beginning
const enemySize = 100;// size of enemies = asteroids in pixels
const enemySpeed = 50; // speed of enemies = asteroids pixels per seconds
const enemyVert = 10; // vertices on each enemy
const enemyJag = 0.4;//jaggedness of asteroids (0=none 1=lots)
const showBunding = true; // show or hide collision bounding
const shipSize = 30;// ship size in pixels
const shipSpeed = 360; //speed of the ship degrees per sec
const shipThrust = 5; // ship trust - pixel per seconds
const shipExplode = 0.3; // explosion in seconds 
const shipBlinkDuration = 0.1; //duration in seconds of one blink
const explodeDuration = 0.3; // duration of the ship explosion
const shipInvisible = 3; //ship invisibility in sec
const timeText = 2.5 ;// fading time in seconds
const textSize = 40; //text font height in pixels

/* html- canvas*/
let canvas = document.getElementById("astroCanvas");
let context = canvas.getContext("2d");


let level, lives, roids, score, scoreHigh, ship, text, textAlpha; // set up the game parameters
newGame();


// Game loop set up
setInterval(update, 1000 / FPS);

// SHIP

  // Spaceship object- set up

let ship = newShip();

function newShip () {
    return{
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: shipSize / 2,
    //  direction of the ship conversion to radiance
    a: 90 / 180 * Math.PI,
    // rotation
    blinkNum: Math.ceil(shipInvisible / shipBlinkDuration),
    blinkTime: Math.ceil(shipBlinkDuration * FPS),
    canShoot: true,
    dead: false,
    explodeTime: 0,
    lasers: [],
    rot: 0,
    // thrusting of the ship parameter
    thrusting: false,
    thrust: {
        x:0,
        y:0
    }
}
}

// ASTEROIDS set up

let enemies = [];
createAsteroidBelt();

function createAsteroidBelt() {
  enemies = [];
  let x, y;
  for (let i = 0; i < enemyNum; i++) { // asteroids location
     
    do {
      x = Math.floor(Math.random() * canvas.width);
      y = Math.floor(Math.random() * canvas.height);
     
    } while (distBetweenPoints(ship.x, ship.y, x, y) < enemySize * 2 + ship.r)
      enemies.push(newEnemy(x, y, Math.ceil(enemySize / 2)));
}
}

function destroyAsteroid(index) {
    var x = enemies[index].x;
    var y = enemies[index].y;
    var r = enemies[index].r;

    // split the asteroid in two if necessary
    if (r == Math.ceil(enemySize / 2)) { // large asteroid
        enemies.push(newEnemy(x, y, Math.ceil(enemySize / 4)));
        enemies.push(newEnemy(x, y, Math.ceil(enemySize / 4)));
        score += pointsForLargeAsteroids;
    } else if (r == Math.ceil(enemySize / 4)) { // medium asteroid
        enemies.push(newEnemy(x, y, Math.ceil(enemySize / 8)));
        enemies.push(newEnemy(x, y, Math.ceil(enemySize / 8)));
        score += pointsForMediumAsteroids;
    } else {
        score += pointForSmallAsteroids;

    } if (score > scoreHigh) { // check high score
       scoreHigh = score;
       localStorage.setItem(saveScore, scoreHigh);
    } 
     enemies.splice(index, 1); // destroy the asteroid
   
      if (enemies.length == 0) { // new level when no more asteroids
                level++;
                newLevel();
      }
    
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow ( y2 - y1, 2 ));
}

function explodeShip() {
    ship.explodeTime = Math.ceil(shipExplode * FPS);
}

function drawShip(x, y, a, colour = "magenta") {
    context.strokeStyle = colour;
    context.lineWidth = shipSize / 20;
    context.beginPath();
    context.moveTo( // nose of the ship
        x + 4 / 3 * ship.r * Math.cos(a),
        y - 4 / 3 * ship.r * Math.sin(a)
    );
    context.lineTo( // rear left
        x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
    );
    context.lineTo( // rear right
        x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
    );
    context.closePath();
    context.stroke();
}

function explodeShip() {
    ship.explodeTime = Math.ceil(shipExplode * FPS);
}

function gameOver() {
    ship.dead = true;
    text = "Game Over";
    textAlpha = 1.0;
}


// keys set up
document.addEventListener("keydown", keyDown); // pressed key
document.addEventListener("keyup", keyUp); //released key


function keyDown (event) {
   
    if (ship.dead) {
        return;
    }
    switch(event.keyCode) {
      case 32: // space bar key (shoot laser)
        shootLaser();
        break;
      case 37: //arrow left
        ship.rot = shipSpeed / 180 * Math.PI /FPS;
        break;
      case 38:  //arrow up
        ship.thrusting = true;
        break;
      case 39:  //arrow right
        ship.rot = - shipSpeed / 180 * Math.PI / FPS;
        break;
    }
}

function keyUp ( event) {

    switch(event.keyCode) {

         case 32: //space bar 
         ship.canShoot = true;
         break;
        
        case 37: //arrow left - stop 
        ship.rot = 0;
        break;

        case 38: //arrow up - stop
        ship.thrusting = false;
        break;

        case 39:  //arrow right - stop
            ship.rot = 0;
        break;

    }
}


// function - taking all parameters of asteroids together

 function newEnemy ( x, y, r) {
     let enemy = {
        x: x, 
        y: y,
        xv: Math.random() * enemySpeed / FPS * (Math.random() <0.5 ? 1: -1),
        yv: Math.random() * enemySpeed / FPS * (Math.random() <0.5 ? 1: -1),
        a: Math.random() * Math.PI * 2, // in radians
        r: r,
        offs: [],
        vert: Math.floor(Math.random() * (enemyVert + 1) + enemyVert / 2 ),    
     };

     //vertex offset 

     for (let i = 0; i < enemy.vert; i++) {
         enemy.offs.push(Math.random() * enemyJag * 2 + 1 - enemyJag)
     }

     return enemy;
 }


 // shooting function
 function shootLaser(){
     if(ship.canShoot && ship.lasers.length <laserMax){
         ship.laser.push({ // from the nose of the ship
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: laserSpeed * Math.cos(ship.a) / FPS,
            yv: -laserSpeed * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime:0

        });
     }
     ship.canShoot = false; //prevent further shooting
 }

function update() {
    let blinkOn = ship.blinkNum % 2 == 0;
    let exploding = ship.explodeTime > 0;

// game function to draw the space, the ship and move 

    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

let x, y, r, a, vert, offs;
for  (let i = 0; i < enemies.length; i++) {
 context.strokeStyle = "purple" ;   // Drawing the ship 
 context.lineWidth = shipSize / 20;
    
   //enemies properites
   x = enemies[i].x;
   y = enemies[i].y;
   r = enemies[i].r;
   a = enemies[i].a;
   vert = enemies[i].vert;
   offs = enemies[i].offs;

   // draw a path

   context.beginPath();
   context.moveTo (
       x + r * offs [0] * Math.cos(a),
       y + r * offs [0] * Math.sin(a)
   );

 // draw the enemies = asteroids = polygons

 for ( let j = 1; j < vert; j++) {
     context.lineTo(
         x + r * offs [j] * Math.cos(a + j * Math.PI * 2 / vert),
         y + r * offs [j] * Math.sin(a + j * Math.PI * 2 / vert)
     );
 }
 
 context.closePath(); //line closing the ship
 context.stroke(); // draw the path

 // show asteroid's collision circle
 if (showBunding) {
    context.strokeStyle = "lime";
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.stroke();

}
}


// trusting the ship

if (ship.thrusting) {
  ship.thrust.x += shipThrust * Math.cos(ship.a) / FPS;
  ship.thrust.y -= shipThrust * Math.sin(ship.a) / FPS;

  if (!exploding && blinkOn) { // drawing thruster
    context.fillStyle = "red";
    context.strokeStyle = "yellow";
    context.lineWidth = shipSize / 10;

    context.beginPath();
    context.moveTo( // rear left
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
    );
    context.lineTo( // rear centre (behind the ship)
        ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
        ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
    );
    context.lineTo( // rear right
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
    );
    context.closePath();
    context.fill();
    context.stroke();
}
  
}
else {
    ship.thrust.x -= friction * ship.thrust.x / FPS;
    ship.thrust.y -= friction * ship.thrust.y / FPS;
}

 // drawing triangle ship
 if (!exploding) {
    if (blinkOn) {
        context.strokeStyle = "white";
        context.lineWidth = shipSize/ 20;

 context.beginPath();
 context.moveTo(  //nose of the ship
     ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
     ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
 );

 context.lineTo(//rear left of the ship
    ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
    ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
     
 );
 context.lineTo( // rear right of the ship
   ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
   ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
     
 );

if (showBounding) {
    context.strokeStyle = "lime";
    context.beginPath();
    context.arc(ship.x, ship.y, ship.r, 0, Math.Pi * 2, false);
    context.stroke();
}


// drawing the enemies

context.strokeStyle = "#240090";  // color of the enemies
context.lineWidth = shipSize / 20;


context.closePath();
context.stroke();

// draw the lasers
for (let i = 0; i < ship.lasers.length; i++) {
    if (ship.lasers[i].explodeTime == 0) {
        context.fillStyle = "salmon";
        context.beginPath();
        context.arc(ship.lasers[i].x, ship.lasers[i].y, shipSize / 15, 0, Math.PI * 2, false);
        context.fill();
    } else {
        // draw the eplosion
        context.fillStyle = "orangered";
        context.beginPath();
        context.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
        context.fill();
        context.fillStyle = "salmon";
        context.beginPath();
        context.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
        context.fill();
        context.fillStyle = "pink";
        context.beginPath();
        context.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
        context.fill();
    }
}

// detect laser hits on asteroids
let ax, ay, ar, lx, ly;
for (let i = enemies.length - 1; i >= 0; i--) {

    // grab the asteroid properties
    ax = enemies[i].x;
    ay = enemies[i].y;
    ar = enemies[i].r;

    // loop over the lasers
    for (let j = ship.lasers.length - 1; j >= 0; j--) {

        // grab the laser properties
        lx = ship.lasers[j].x;
        ly = ship.lasers[j].y;

        // detect hits
        if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {

            // destroy the asteroid and activate the laser explosion
            destroyAsteroid(i);
            ship.lasers[j].explodeTime = Math.ceil(laserExplodeDuration * FPS);
            break;
        }
    }
}

// check for asteroid collisions (when not exploding)
if (!exploding) {

    // only check when not blinking
    if (ship.blinkNum == 0) {
        for (var i = 0; i < enemies.length; i++) {
            if (distBetweenPoints(ship.x, ship.y, enemies[i].x, enemies[i].y) < ship.r + enemies[i].r) {
                explodeShip();
                destroyAsteroid(i);
                break;
            }
        }
    }

// rotate the ship
ship.a += ship.rot;

// move the ship
ship.x += ship.thrust.x;
ship.y += ship.thrust.y;
} else {
// reduce the explode time
ship.explodeTime--;

// reset the ship after the explosion has finished
if (ship.explodeTime == 0) {
    ship = newShip();
}
}
// handle edge of screen
if (ship.x < 0 - ship.r) {
    ship.x = canvas.width + ship.r;
} else if (ship.x > canvas.width + ship.r) {
    ship.x = 0 - ship.r;
}
if (ship.y < 0 - ship.r) {
    ship.y = canvas.height + ship.r;
} else if (ship.y > canvas.height + ship.r) {
    ship.y = 0 - ship.r;
}


// move the lasers
for (let i = ship.lasers.length - 1; i >= 0; i--) {
                
    // check distance travelled
    if (ship.lasers[i].dist > laserDistance* canvas.width) {
        ship.lasers.splice(i, 1);
        continue;
    }

    // handle the explosion
    if (ship.lasers[i].explodeTime > 0) {
        ship.lasers[i].explodeTime--;

        // destroy the laser after the duration is up
        if (ship.lasers[i].explodeTime == 0) {
            ship.lasers.splice(i, 1);
            continue;
        }
    } else {
        // move the laser
        ship.lasers[i].x += ship.lasers[i].xv;
        ship.lasers[i].y += ship.lasers[i].yv;

        // calculate the distance travelled
        ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
    }


// dot centerizing ship

context.fillStyle ="indigo";
context.fillRect(ship.x -1 , ship.y -1, 2, 2);

// handle edge of screen
if (ship.x < 0 - ship.r) {
    ship.x = canvas.width + ship.r;
} else if (ship.x > canvas.width + ship.r) {
    ship.x = 0 - ship.r;
}
if (ship.y < 0 - ship.r) {
    ship.y = canvas.height + ship.r;
} else if (ship.y > canvas.height + ship.r) {
    ship.y = 0 - ship.r;
}


}
    // move the asteroids
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].x += enemies[i].xv;
        enemies[i].y += enemies[i].yv;

        // handle asteroid edge of screen
        if (enemies[i].x < 0 - enemies[i].r) {
            enemies[i].x = canv.width + enemies[i].r;
        } else if (enemies[i].x > canv.width + enemies[i].r) {
            enemies[i].x = 0 - enemies[i].r
        }
        if (enemies[i].y < 0 - enemies[i].r) {
            enemies[i].y = canv.height + enemies[i].r;
        } else if (enemies[i].y > canv.height + enemies[i].r) {
            enemies[i].y = 0 - enemies[i].r
 
 
        }
 
    }

    
}


 }
}