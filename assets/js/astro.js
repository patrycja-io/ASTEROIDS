



// frames per seconds
const FPS = 30; 

// 0= no friction , 1= a lot of friction
const friction = 0.7;




// numbers of enemies at the beginning
const enemy_num = 5;

// size of enemies = asteroids in pixels

const enemy_size = 100;

// speed of enemies = asteroids pixels per seconds

const enemy_speed = 50; 

// vertices on each enemy

const enemy_vert = 10;

//jaggedness of asteroids (0=none 1=lots)

const enemy_jag = 0.4;


const show_bounding = true; // show or hide collision bounding





// ship size in pixels
const shipsize = 30;

//speed of the ship degrees per sec

const ship_speed = 360; 

// ship trust - pixel per seconds

const ship_thrust = 5;



/* Conected element from html - canvas*/

const canvas = document.getElementById("astroCanvas");

// Context from the canvas

const context = canvas.getContext("2d");




// SHIP


const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: shipsize / 2,
    //  direction of the ship conversion to radiance
    a: 90 / 180 * Math.PI,
    // rotation
    rot: 0,
    // thrusting of the ship parameter
    thrusting: false,
    thrust: {
        x:0,
        y:0
    }

}





// ASTEROIDS

const enemy = [];
createAsteroidBelt();

// Game loop set up
setInterval(update, 1000 / FPS);



function createAsteroidBelt() {
  enemy = [];
  var x, y;
  for (var i = 0; i < enemy_num; i++) { // astreoids location
     
    do {
      x = Math.floor(Math.random() * canvas.width);
      y = Math.floor(Math.random() * canvas.height);
     
    } while (distBetweenPoints(ship.x, ship.y, x, y) < enemy_size * 2 + ship.r)
      enemy.push(newAsteroid(x, y));
  }
}



function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2)+ Math.pow ( y2 - y1, 2 ));
}


// keys set up

document.addEventListener("keydown", keyDown); // pressed key
document.addEventListener("keyup", keyUp); //released key


function keyDown (/** @type {KeyboardEvent} */ event) {

    switch(event.keyCode) {

        //arrow left
        case 37: 
            ship.rot = ship_speed / 180 * Math.PI /FPS;
        break;

        //arrow up
        case 38:
            ship.thrusting = true;
        break;

        //arrow right
        case 39:
            ship.rot = - ship_speed / 180 * Math.PI / FPS;
        break;

    }
}

function keyUp (/** @type {KeyboardEvent} */ event) {
    switch(event.keyCode) {

        //arrow left - stop 
        case 37: 
        ship.rot = 0;
        break;

        //arrow up - stop
        case 38:
        ship.thrusting = false;
        break;

        //arrow right - stop
        case 39:
            ship.rot = 0;
        break;

    }
}


// function - taking all parameters of asteroids together

 function newEnemy ( x, y) {
     const enemy = {
        a: Math.random() * Math.PI * 2, // in radians
        offs: [],
        r: enemy_size / 2,
        vert: Math.floor(Math.random() * (enemy_vert + 1) + enemy_vert / 2 )

         x: x, 
         y: y,
         xv: Math.random() * enemy_speed / FPS * (Math.random() <0.5 ? 1: -1),
         yv: Math.random() * enemy_speed / FPS * (Math.random() <0.5 ? 1: -1)
        
         
     };

     //vertex offset 

     for (var i = 0; i < enemy.vert; i++){
         enemy.offs.push(Math.random() * enemy_jag * 2 + 1 - enemy_jag)
     }
     return enemy;
 }





// game function to draw the space, the ship and move 

function update() {

    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height)

// trusting the ship

if (ship.thrusting) {
  ship.thrust.x += ship_thrust * Math.cos(ship.a) / FPS;
  ship.thrust.y -= ship_thrust * Math.sin(ship.a) / FPS;
}else {
    ship.thrust.x -= friction * ship.thrust.x / FPS;
    ship.thrust.y -= friction * ship.thrust.y / FPS;
}
    





 // Drawing the ship 
 context.strokeStyle = "white" ;
 context.lineWidth = shipsize / 20;

 // drawing triangle
 context.beginPath();
 context.moveTo(

 //nose of the ship
     ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
     ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
 );

 context.lineTo(

 //rear left of the ship
    ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
    ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
     
 );
 context.lineTo(

 // rear right of the ship
   ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
   ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
     
 );

 // line closing the ship
 context.closePath();

// draw the path
context.stroke();

if (show_bounding) {
    context.strokeStyle = "lime";
    context.beginPath();
    context.arc(ship.x, ship.y, ship.r, 0, math.Pi * 2, false);
    context.stroke();
}


// drawing the enemies

context.strokeStyle = "#240090";  // color of the enemies
context.lineWidth = shipsize / 20;
var x, y, r, a, vert, offs;
for  (var i = 0; i < enemy.length; i++) {

   //enemies properites

   x = enemy[i].x;
   y = enemy[i].y;
   r = enemy[i].r;
   a = enemy[i].a;
   vert = enemy[i].vert;
   offs = enemy[i].offs;

   // draw a path

   context.beginPath();
   context.moveTo (
       x + r * offs [0] * Math.cos(a),
       y + r * offs [0] * Math.sin(a)
   );


 // draw the enemies = asteroids = polygons

 for ( var j = 1; j < vert; j++) {
     context.lineTo(
         x + r * offs [j] * Math.cos(a + j * Math.PI * 2 / vert),
         y + r * offs [j] * Math.sin(a + j * Math.PI * 2 / vert)
     );
 }
context.closePath();
context.stroke();

// move the asteroids

enemy[i].x += enemy[i].xv;
enemy[i].y += enemy[i].yv;

//backstop on the borders

if (enemy[i].x < 0 - enemy [i].r){
    enemy[i].x = canvas.width = enemy[i].r;
} else if (roids[i].x > canvas.width + roids[i].r) {
    enemy[i].x = 0 - roids[i].r
}

if (enemy[i].y < 0 - enemy [i].r){
    enemy[i].y = canvas.height = enemy[i].r;
} else if (roids[i].y > canvas.height + roids[i].r) {
    enemy[i].y = 0 - roids[i].r
}




// rotating the ship
ship.a += ship.rot;


// move the ship
ship.x += ship.thrust.x;
ship.y += ship.thrust.y;

// dot centerizing ship

context.fillStyle ="indigo";
context.fillRect(ship.x -1 , ship.y -1, 2, 2);

// handle edge of screen
if (ship.x < 0 - ship.r) {
    ship.x = canv.width + ship.r;
} else if (ship.x > canv.width + ship.r) {
    ship.x = 0 - ship.r;
}
if (ship.y < 0 - ship.r) {
    ship.y = canv.height + ship.r;
} else if (ship.y > canv.height + ship.r) {
    ship.y = 0 - ship.r;
}









}





// "if loop to move ship back on the other side of the screen

 if (ship.x < 0 - ship.r) {
     ship.x = canvas.width + ship.r;
} else if ( ship.x > canvas.width + ship.r){
    ship.x = 0 - ship.r;
}

if (ship.y < 0 - ship.r) {
    ship.y = canvas.height + ship.r;
} else if ( ship.y > canvas.height + ship.r){
   ship.y = 0 - ship.r;
}









}
  