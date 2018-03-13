// This is the main JS file.
window.onload = init;

const WIDTH = 964; //Current canvas width
const HEIGHT = 546; //Current canvas height

var frameRate = 1/40; //seconds
var frameDelay = frameRate * 1000; //ms
var loopTimer;
var mouse = {x:0, y:0};
var gravity = 1;
var bounce_factor = 0.8;

var k = -20;
var spring_length = 10;

var b = -0.5;

// A test blob
var center = {
    pos: {x: 450, y: 250},
    velocity: {x: 0, y: 0},
    mass: 1, //kg
    rad: 5 // 1px = 1cm
};

var blob = {
    pos: {x: 450, y: 200},
    velocity: {x: 0, y: 0},
    mass: 1, //kg
    rad: 5 // 1px = 1cm
};

var blob2 = {
    pos: {x: 485, y: 215},
    velocity: {x: 0, y: 0},
    mass: 1, //kg
    rad: 5 // 1px = 1cm
};

var blob3 = {
    pos:  {x: 500 , y: 250},
    velocity: {x: 0, y: 0},
    mass: 1, //kg
    rad: 5 // 1px = 1cm
};

var blob4 = {
    pos:  {x: 485 , y: 285},
    velocity: {x: 0, y: 0},
    mass: 1, //kg
    rad: 5 // 1px = 1cm
};
var blob5 = {
    pos:  {x: 450, y: 300},
    velocity: {x: 0, y: 0},
    mass: 1, //kg
    rad: 5 // 1px = 1cm
};
var blob6 = {
    pos:  {x: 415, y: 285},
    velocity: {x: 0, y: 0},
    mass: 1, //kg
    rad: 5 // 1px = 1cm
};
var blob7 = {
    pos:  {x: 400, y: 250},
    velocity: {x: 0, y: 0},
    mass: 1, //kg
    rad: 5 // 1px = 1cm
};
var blob8 = {
    pos:  {x: 415, y: 215},
    velocity: {x: 0, y: 0},
    mass: 1, //kg
    rad: 5 // 1px = 1cm
};
//var Cd = 0.47;  // Dimensionless
//var rho = 1.22; // kg / m^3
//var A = Math.PI * blob.rad * blob.rad / (10000); // m^2
//var ag = 9.81;  // m / s^2

var mouse = {x: 0, y: 0, isDown: false};

var getMousePosition = function(e) {
    mouse.x = e.pageX - canvas.offsetLeft;
    if (mouse.isDown)
    {
        block.x = mouse.x;
    }
};

function init(){

    // Initialize WebGL.
    canvas = document.getElementById("gl-canvas");
    ctx = canvas.getContext("2d"); //Rendering in 2D

    canvas.onmousemove = getMousePosition;

    canvas.onmousedown = function(e) {
        if (e.which == 1) {
            getMousePosition(e);
            mouse.isDown = true;
            blob.x = mouse.x;
        }
    };

    canvas.onmouseup = function(e) {
        if (e.which == 1) {
            mouse.isDown = false;
        }
    };
    ctx.fillStyle = 'blue'; //Sets the filled color for the blob
    ctx.strokeStyle = '#000000'; //Sets the outline color for the blob
    loopTimer = setInterval(loop, frameDelay);
}

/*
function getMousePosition(event) {
    mouse.x = event.clientX - canvas.offsetLeft; //Get the x-coordinate of the mouse
    mouse.y = event.clientY - canvas.offsetTop; //Get the y-coordinate of the mouse



        blob.pos.x = mouse.x; //Set mouse.x as the blob's x-coordinate
        blob.pos.y = mouse.y; //Set mouse.y as the blob's y-coordinate
        blob.velocity.x = 0; //Reset the blob's velocity.x
        blob.velocity.y = 0; //Reset the blob's velocity.y

    /*
    else if (mouse.x < blob2.pos.x + 15 && mouse.x < blob2.pos.x - 15
        && mouse.y < blob2.pos.y + 15 && mouse.x < blob2.pos.y - 15) {
        blob2.pos.x = mouse.x; //Set mouse.x as the blob's x-coordinate
        blob2.pos.y = mouse.y; //Set mouse.y as the blob's y-coordinate
        blob2.velocity.x = 0; //Reset the blob's velocity.x
        blob2.velocity.y = 0; //Reset the blob's velocity.y
    }

    //For testing purposes
    var coords = "X coords: " + mouse.x + ", Y coords: " + mouse.y;
    console.log(coords); //Print the coordinates to the console
}
*/

var loop = function() {

    /*
    blob.velocity.y += gravity; //Set the blob's new velocity.y

    blob.pos.x += blob.velocity.x; //Set the blob's new x-coordinate
    blob.pos.y += blob.velocity.y; //Set the blob's new y-coordinate

    blob2.velocity.y += gravity; //Set the blob's new velocity.y

    blob2.pos.x += blob.velocity.x; //Set the blob's new x-coordinate
    blob2.pos.y += blob.velocity.y; //Set the blob's new y-coordinate
    //Example code I found
    /*if ( ! mouse.isDown) {
        // Do physics
        // Drag force: Fd = -1/2 * Cd * A * rho * v * v
        var Fx = -0.5 * Cd * A * rho * ball.velocity.x * ball.velocity.x * ball.velocity.x / Math.abs(ball.velocity.x);
        var Fy = -0.5 * Cd * A * rho * ball.velocity.y * ball.velocity.y * ball.velocity.y / Math.abs(ball.velocity.y);
        Fx = (isNaN(Fx) ? 0 : Fx);
        Fy = (isNaN(Fy) ? 0 : Fy);
        // Calculate acceleration ( F = ma )
        var ax = Fx / ball.mass;
        var ay = ag + (Fy / ball.mass);
        // Integrate to get velocity
        ball.velocity.x += ax*frameRate;
        ball.velocity.y += ay*frameRate;
        // Integrate to get position
        ball.position.x += ball.velocity.x*frameRate*100;
        ball.position.y += ball.velocity.y*frameRate*100;
    }*/

    /*
        // Handle collisions with the perimeter of the canvas
        if (blob.pos.y > HEIGHT - blob.rad || blob.pos.x > WIDTH - blob.rad || blob.pos.x < blob.rad) {
            blob.pos.y = HEIGHT - blob.rad;
            //blob.pos.x = WIDTH/2;

            blob.velocity.x = 0; //Set the blob's velocity x
            blob.velocity.y *= -bounce_factor; //Set the blob's velocity y
        }

        if (blob2.pos.y > HEIGHT - blob2.rad || blob2.pos.x > WIDTH - blob2.rad || blob2.pos.x < blob2.rad) {
            blob2.pos.y = HEIGHT - blob2.rad;
            //blob.pos.x = WIDTH/2;

            blob2.velocity.x = 0; //Set the blob's velocity x
            blob2.velocity.y *= -bounce_factor; //Set the blob's velocity y
        }
        */

    if ( mouse.isDown )
    {
        var F_spring = k * ( (blob.pos.y - center.pos.y) - spring_length );
        var F_damper = b * ( blob.velocity.y - center.velocity.y );

        var a = ( F_spring + F_damper ) / center.mass;
        blob.velocity.y += a * frameRate;
        blob.pos.y += blob.velocity.y * frameRate;
    }

    // Draw the blob
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    ctx.save();

    //ctx.translate(center.pos.x, center.pos.y);
    ctx.beginPath();
    ctx.arc(center.pos.x, center.pos.y, center.rad, 0, Math.PI*2, true); //Create the blob using arcs
    ctx.fill(); //Fill the blob

    ctx.beginPath();
    ctx.arc(blob.pos.x, blob.pos.y, blob.rad, 0, Math.PI*2, true); //Create the blob using arcs
    ctx.fill(); //Fill the blobb

    ctx.beginPath();
    ctx.arc(blob2.pos.x, blob2.pos.y, blob2.rad, 0, Math.PI*2, true); //Create the blob using arcs
    ctx.fill(); //Fill the blob

    ctx.beginPath();
    ctx.arc(blob3.pos.x, blob3.pos.y, blob3.rad, 0, Math.PI*2, true); //Create the blob using arcs
    ctx.fill(); //Fill the blob

    ctx.beginPath();
    ctx.arc(blob4.pos.x, blob4.pos.y, blob4.rad, 0, Math.PI*2, true); //Create the blob using arcs
    ctx.fill(); //Fill the blob

    ctx.beginPath();
    ctx.arc(blob5.pos.x, blob5.pos.y, blob5.rad, 0, Math.PI*2, true); //Create the blob using arcs
    ctx.fill(); //Fill the blob

    ctx.beginPath();
    ctx.arc(blob6.pos.x, blob6.pos.y, blob6.rad, 0, Math.PI*2, true); //Create the blob using arcs
    ctx.fill(); //Fill the blob

    ctx.beginPath();
    ctx.arc(blob7.pos.x, blob7.pos.y, blob7.rad, 0, Math.PI*2, true); //Create the blob using arcs
    ctx.fill(); //Fill the blob

    ctx.beginPath();
    ctx.arc(blob8.pos.x, blob8.pos.y, blob8.rad, 0, Math.PI*2, true); //Create the blob using arcs
    ctx.fill(); //Fill the blob




    ctx.beginPath();
    ctx.moveTo(center.pos.x, center.pos.y);
    ctx.lineTo(blob.pos.x, blob.pos.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(center.pos.x, center.pos.y);
    ctx.lineTo(blob2.pos.x, blob2.pos.y);
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(center.pos.x, center.pos.y);
    ctx.lineTo(blob3.pos.x, blob3.pos.y);
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(center.pos.x, center.pos.y);
    ctx.lineTo(blob4.pos.x, blob4.pos.y);
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(center.pos.x, center.pos.y);
    ctx.lineTo(blob5.pos.x, blob5.pos.y);
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(center.pos.x, center.pos.y);
    ctx.lineTo(blob6.pos.x, blob6.pos.y);
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(center.pos.x, center.pos.y);
    ctx.lineTo(blob7.pos.x, blob7.pos.y);
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(center.pos.x, center.pos.y);
    ctx.lineTo(blob8.pos.x, blob8.pos.y);
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(blob.pos.x, blob.pos.y);
    ctx.lineTo(blob2.pos.x, blob2.pos.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(blob2.pos.x, blob2.pos.y);
    ctx.lineTo(blob3.pos.x, blob3.pos.y);
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(blob3.pos.x, blob3.pos.y);
    ctx.lineTo(blob4.pos.x, blob4.pos.y);
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(blob4.pos.x, blob4.pos.y);
    ctx.lineTo(blob5.pos.x, blob5.pos.y);
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(blob5.pos.x, blob5.pos.y);
    ctx.lineTo(blob6.pos.x, blob6.pos.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(blob6.pos.x, blob6.pos.y);
    ctx.lineTo(blob7.pos.x, blob7.pos.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(blob7.pos.x, blob7.pos.y);
    ctx.lineTo(blob8.pos.x, blob8.pos.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(blob8.pos.x, blob8.pos.y);
    ctx.lineTo(blob.pos.x, blob.pos.y);
    ctx.stroke();

    ctx.closePath();




    ctx.restore();

}