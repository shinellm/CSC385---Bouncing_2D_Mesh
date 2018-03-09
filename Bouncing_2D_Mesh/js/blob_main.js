// This is the main JS file.
window.onload = init;

const WIDTH = 20;
const HEIGHT = 20;

// Constants for primary colors.
const COLOR_WHITE = vec3(1.0,1.0,1.0);
const COLOR_BLACK = vec3(0.0,0.0,0.0);
const COLOR_CYAN = vec3(0.0,1.0,1.0);
const COLOR_MAGENTA = vec3(1.0,0.0,1.0);
const COLOR_YELLOW = vec3(1.0,1.0,0.0);
const COLOR_RED = vec3(1.0,0.0,0.0);
const COLOR_GREEN = vec3(0.0,1.0,0.0);
const COLOR_BLUE = vec3(0.0,0.0,1.0);

function pixel_to_ix(x, y){
    return (y*WIDTH + x);
}


function enable_attribute_buffer(attrib, buffer, stride){

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attrib, stride, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attrib);

}

function fill_buffer(buffer, array){

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(array), gl.STATIC_DRAW);

}

function init_blob() {
    
}

// Renders the frame.
function render(){
    setTimeout(function() {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Construct a rotation matrix to describe how
        // rotates by the three angles about the three
        // axes affect a point.  (We'll discuss this in
        // much more detail later!)
        var fov = 90;
        var mMV = mat3();
        mMV[2][0] = blob.center[0];
        mMV[2][1] = blob.center[1];

        gl.uniformMatrix4fv(MV, false, flatten(mMV));

        enable_attribute_buffer(vPosition, line_buffer, 4);
        enable_attribute_buffer(vColor, line_color_buffer, 4);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, num_lines);

        requestAnimFrame(render);
    }, 10);

}

function init(){

    // Initialize WebGL.
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl){
        alert("WebGL isn't available");
    }
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);

    // Initialize shaders and attribute pointers.
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);
    vPosition = gl.getAttribLocation(program, "vPosition");
    vColor = gl.getAttribLocation(program, "vColor");
    mMV = gl.getUniformLocation(program, "mM");

    // Initialize event listeners for UI changes.
    init_listeners();

    pos_buffer = gl.createBuffer();
    color_buffer = gl.createBuffer();

    line_buffer = gl.createBuffer();
    line_color_buffer = gl.createBuffer();

    blob = new Blob(vec3(2,1,1), 3, 8);

    init_blob();

    // Start rendering.
    render();
}