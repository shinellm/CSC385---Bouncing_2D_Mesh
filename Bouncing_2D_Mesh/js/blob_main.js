// This is the main JS file.
window.onload = init;

const WIDTH = 256;
const HEIGHT = 256;

var pixel_colors = []

function pixel_to_ix(x, y){
    return (y*WIDTH + x);
}

// Takes an integer x, 0 <= x < WIDTH, an integer y, 0 <= y < HEIGHT.
// Returns the color of that pixel in RGB as a vec3.  Returns black if
// inputs are out of range.  You're not allowed to use this function
// for Project 1.
function read_pixel(x, y){

    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT)
        return pixel_colors[6 * pixel_to_ix(x, y)];
    else
        return vec3(0.0,0.0,0.0);

}

// Takes an integer x, 0 <= x < WIDTH, an integer y, 0 <= y < HEIGHT,
// and a color given in RGB as a vec3.  Changes the pixel to that color
// in the paint program. Returns 0 if successful, -1 otherwise.
function write_pixel(x, y, color){

    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {

        // Update color in our model.
        for (var i = 0; i < 6; i++)
            color_buffer[6 * pixel_to_ix(x,y) + i] = color;

        // Update color in buffer.
        // Use bufferSubData to only make a partial update.
        // Should perform better then update the entire buffer.
        // Have to compute offset into buffer.
        // 6 vertices per square,
        // 3 color channels per vertex, and
        // 4 bytes per color channel.
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 6 * 3 * 4 * pixel_to_ix(x, y), flatten([color, color, color, color, color, color]));
        return 0;
    }
    return -1;

}



function enable_attribute_buffer(attrib, buffer, stride){

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attrib, stride, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attrib);

}


function init_blob() {
    var poses = blob.get_pos();
    var colors = blob.get_color();

    fill_buffer(pos_buffer,poses);
    fill_buffer(color_buffer,colors);
    num_vertices = poses.length;
}

// Renders the frame.
function render(){
    setTimeout(function() {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Construct a rotation matrix to describe how
        // rotates by the three angles about the three
        // axes affect a point.  (We'll discuss this in
        // much more detail later!)
        var mMV = mat3();
        mMV[2][0] = blob.center.pos[0];
        mMV[2][1] = blob.center[1];

        gl.uniformMatrix3fv(mM, false, flatten(mMV));

        enable_attribute_buffer(vPosition, pos_buffer, 4);
        enable_attribute_buffer(vColor, color_buffer, 4);
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

    // Initialize shaders and attribute pointers.
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);
    vPosition = gl.getAttribLocation(program, "vPosition");
    vColor = gl.getAttribLocation(program, "vColor");
    mM = gl.getUniformLocation(program, "mM");

    // Initialize event listeners for UI changes.
    //init_listeners();

    pos_buffer = gl.createBuffer();
    color_buffer = gl.createBuffer();

    blob = new Blob(vec3(2,1,1), 3, 8);

    init_blob();

    // Start rendering.
    render();
}