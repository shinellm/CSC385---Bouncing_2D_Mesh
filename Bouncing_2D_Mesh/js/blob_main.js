// This is the main JS file.
window.onload = init;

const WIDTH = 964; //Current canvas width
const HEIGHT = 546; //Current canvas height

// Renders the frame.
function render(){
    setTimeout(function() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        loop();

        blob_world.render();

        requestAnimFrame(render);
    }, 10);
}

var mouse = {x:0, y:0};
var gravity = 0.5;
var bounce_factor = 0.8;
var dx;
var dy;

function init(){

    // Initialize WebGL.
    canvas = document.getElementById("gl-canvas");
    canvas.onclick = getMousePosition;

    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl){
        alert("WebGL isn't available");
    }
    gl.viewport(0,0,canvas.width, canvas.width);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Initialize shaders and attribute pointers.
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var blob = new Blob(vec4(0,0,0,1), 0.25, 8);
    blob_world = new BlobWorld(blob, gl, program);

    blob_world.init_blob_world();

    // Start rendering.
    render();

}

function getMousePosition(event) {
    var blob = blob_world.get_blob();
    mouse.x = event.clientX - canvas.offsetLeft; //Get the x-coordinate of the mouse
    mouse.y = event.clientY - canvas.offsetTop; //Get the y-coordinate of the mouse

    dx = blob.center.pos.x - mouse.x;
    dy = blob.center.pos.y - mouse.y;

    for (var i = 0; i < blob.num_points; i++) {
        blob.points[i].pos.x -= dx; //Set mouse.x as the blob's x-coordinate
        blob.points[i].pos.y -= dy; //Set mouse.y as the blob's y-coordinate
        blob.points[i].velocity.x = 0 //Reset the blob's velocity.x
        blob.points[i].velocity.y = 0 //Reset the blob's velocity.y
    }

    //For testing purposes
    var coords = "X coords: " + mouse.x + ", Y coords: " + mouse.y;
    console.log(coords); //Print the coordinates to the console
}


function loop() {
    var blob = blob_world.get_blob();

    for (var j = 0; j < blob.num_points; j++) {
        blob.points[j].velocity.y += gravity; //Set the blob's new velocity.y

        blob.points[j].pos.x += blob.points[j].velocity.x; //Set the blob's new x-coordinate
        blob.points[j].pos.y += blob.points[j].velocity.y; //Set the blob's new y-coordinate
    }

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

    // Handle collisions with the perimeter of the canvas
    for (var k = 0; k < blob.num_points; k++) {
        if (blob.points[k].pos.y > HEIGHT - blob.rad || blob.points[k].pos.x > WIDTH - blob.rad || blob.points[k].pos.x < blob.rad) {
            blob.points[k].pos.y = HEIGHT - blob.rad;
            //blob.pos.x = WIDTH/2;

            blob.points[k].velocity.x = 0; //Set the blob's velocity x
            blob.points[k].velocity.y *= -bounce_factor; //Set the blob's velocity y
        }
    }


}