// This is the main JS file.
window.onload = init;

const FLATNESS = 0.001;
const MIN_VELOCITY = .01;
const MAX_HITS = 10;

var WIDTH; //Current canvas width
var HEIGHT; //Current canvas height
var mouse = {x:0, y:0};
var start = {x:0, y:0};
var drag_ok = false;
const gravity = 0.001;
const bounce_factor = -0.8;


// Renders the frame.
function render(){
    setTimeout(function() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        blob_world.init_blob_world();

        blob_world.free_fall();
        blob_world.render();
        blob_world.evolve();

        requestAnimFrame(render);
    }, 100);
}


function init(){

    // Initialize WebGL.
    canvas = document.getElementById("gl-canvas");
    HEIGHT = canvas.height;
    WIDTH = canvas.width;

    canvas.onclick = getMousePosition;
    canvas.onmousedown = mouseDown;
    canvas.onmouseup = mouseUp;
    canvas.onmousemove = mouseMove;

    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl){
        alert("WebGL isn't available");
    }
    gl.viewport(0, 0,WIDTH, HEIGHT);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Initialize shaders and attribute pointers.
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var blob = new Blob(vec4(0,0,0,1), 0.25, 8);
    blob_world = new BlobWorld(blob, gl, program);

    // Start rendering.
    render();

}

function mouseDown(event) {

    // tell the browser we're handling this mouse event
    event.preventDefault();
    event.stopPropagation();

    // get the current mouse position
    mouse.x = event.clientX - canvas.offsetLeft; //Get the x-coordinate of the mouse
    mouse.y = event.clientY - canvas.offsetTop; //Get the y-coordinate of the mouse

    drag_ok = false;
    var blob = blob_world.get_blob();

    var point_clicked = convertToWebGLCoords(mouse);

    //Set WebGL coordinates for mouse.x and mouse.y
    mouse.x = point_clicked[0];
    mouse.y = point_clicked[1];

    var dx = blob.center.pos[0] - mouse.x;
    var dy = blob.center.pos[1] - mouse.y;

    // test if the mouse is inside this circle
    if (dx * dx + dy * dy < blob.rad * blob.rad) {
        drag_ok = true;
    }

    // save the current mouse position
    start.x = mouse.x;
    start.y = mouse.y;

   // console.log("start x " + start.x);
   // console.log("start y " + start.y);
}

function mouseUp(event) {
    // tell the browser we're handling this mouse event
    event.preventDefault();
    event.stopPropagation();

    // clear all the dragging flags
    drag_ok = false;
}

function mouseMove(event) {
    // if we're dragging anything...
    var blob = blob_world.get_blob();

    if (drag_ok) {

        // tell the browser we're handling this mouse event
        event.preventDefault();
        event.stopPropagation();

        // get the current mouse position
        mouse.x = event.clientX - canvas.offsetLeft; //Get the x-coordinate of the mouse
        mouse.y = event.clientY - canvas.offsetTop; //Get the y-coordinate of the mouse

        var point_clicked = convertToWebGLCoords(mouse);

        //Set WebGL coordinates for mouse.x and mouse.y
        mouse.x = point_clicked[0];
        mouse.y = point_clicked[1];

        // redraw the scene with the new positions
        //Set the new positions of each vertex
        blob_world.new_position(mouse);

        // reset the starting mouse position for the next mousemove
        start.x = mouse.x;
        start.y = mouse.y;
    }
}

function getMousePosition(event) {
    //var blob = blob_world.get_blob();
    mouse.x = event.clientX - canvas.offsetLeft; //Get the x-coordinate of the mouse
    mouse.y = event.clientY - canvas.offsetTop; //Get the y-coordinate of the mouse

    //For testing purposes
    var coords = "Pixel X coords: " + mouse.x + ", Pixel Y coords: " + mouse.y;

    var point_clicked = convertToWebGLCoords(mouse);

    //Set WebGL coordinates for mouse.x and mouse.y
    mouse.x = point_clicked[0];
    mouse.y = point_clicked[1];

    //Set the new positions of each vertex
    blob_world.new_position(mouse);

    //For testing purposes
 //   console.log(coords); //Print the coordinates to the console
    //console.log("Transformed point clicked " + point_clicked);
}

function convertToWebGLCoords(mouse) {

    var mouseX = mouse.x;
    var mouseY = mouse.y;

    //Convert the pixel to WebGL coordinates
    var pixel_x = ((mouseX / canvas.width * canvas.width) - canvas.width / 2);
    var pixel_y = ((canvas.height - mouseY) / canvas.height * canvas.height) - canvas.height / 2;
    var point_clicked = vec2((Math.floor(pixel_x)) / (canvas.width / 2), (Math.floor(pixel_y)) / (canvas.height / 2));

    return point_clicked;
}