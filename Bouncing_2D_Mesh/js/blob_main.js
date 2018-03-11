// This is the main JS file.
window.onload = init;

const WIDTH = 964; //Current canvas width
const HEIGHT = 546; //Current canvas height
var mouse = {x:0, y:0};
var gravity = 0.001;
var bounce_factor = 0.8;
var dx = 0;
var dy = 0;


// Renders the frame.
function render(){
    setTimeout(function() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        blob_world.init_blob_world();
        blob_world.render();
        blob_world.free_fall(gravity);
        //blob_world.evolve(HEIGHT, WIDTH);
        //loop();
        requestAnimFrame(render);
    }, 100);
}


function init(){

    // Initialize WebGL.
    canvas = document.getElementById("gl-canvas");
    canvas.onclick = getMousePosition;

    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl){
        alert("WebGL isn't available");
    }
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Initialize shaders and attribute pointers.
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var blob = new Blob(vec4(0,0,0,1), 0.25, 8);
    blob_world = new BlobWorld(blob, gl, program);

    //blob_world.init_blob_world();

    // Start rendering.
    render();

}

function getMousePosition(event) {
    //var blob = blob_world.get_blob();
    mouse.x = event.clientX - canvas.offsetLeft; //Get the x-coordinate of the mouse
    mouse.y = event.clientY - canvas.offsetTop; //Get the y-coordinate of the mouse

    blob_world.new_position(mouse);

    //For testing purposes
    var coords = "X coords: " + mouse.x + ", Y coords: " + mouse.y;
    console.log(coords); //Print the coordinates to the console
}