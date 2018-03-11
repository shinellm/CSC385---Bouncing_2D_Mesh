// Author: Matthew Anderson
// CSC 385 Computer Graphics
// Version: Winter 2018

// This is the main JS file.
window.onload = init;

// Constants for primary colors.
const COLOR_WHITE = vec3(1.0,1.0,1.0);
const COLOR_BLACK = vec3(0.0,0.0,0.0);
const COLOR_CYAN = vec3(0.0,1.0,1.0);
const COLOR_MAGENTA = vec3(1.0,0.0,1.0);
const COLOR_YELLOW = vec3(1.0,1.0,0.0);
const COLOR_RED = vec3(1.0,0.0,0.0);
const COLOR_GREEN = vec3(0.0,1.0,0.0);
const COLOR_BLUE = vec3(0.0,0.0,1.0);

// Remember current drawing mode.
const WIREFRAME = 0;
const FILLED = 1;

var drawing_mode = WIREFRAME;

const CUBE_MESH = 0;
const PYRAMID_MESH = 1;
const TRIANGLE_MESH = 2;
var mesh_mode = CUBE_MESH;
var mesh = null;

var num_vertices = 0;
var num_lines = 0;

var theta_x = 0;
var theta_y = 0;
var theta_z = 0;


function rotateX(theta){
    return rotate(theta, vec3(1.0,0.0,0.0));
}

function rotateY(theta){
    return rotate(theta, vec3(0.0,1.0,0.0));
}

function rotateZ(theta){
    return rotate(theta, vec3(0.0,0.0,1.0));
}


// Renders the frame.
function render(){
    setTimeout(function() {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute new angles for this frame
        theta_x += dtheta_x / 10.0;
        theta_y += dtheta_y / 10.0;
        theta_z += dtheta_z / 10.0;
        // Make sure we stay in bounds.
        theta_x = theta_x % 360;
        theta_y = theta_y % 360;
        theta_z = theta_z % 360;

        // Construct a rotation matrix to describe how
        // rotates by the three angles about the three
        // axes affect a point.  (We'll discuss this in
        // much more detail later!)
        var fov = 90;
        var MV = perspective(fov, gl.canvas.clientWidth/gl.canvas.clientHeight,0.1,10);
        MV = mult(MV, translate(x,y,z));
        MV = mult(MV, rotateX(theta_x));
        MV = mult(MV, rotateY(theta_y));
        MV = mult(MV, rotateZ(theta_z));

        gl.uniformMatrix4fv(mMV, false, flatten(MV));

        if (drawing_mode == FILLED) {
            enable_attribute_buffer(vPosition, pos_buffer, 4);
            enable_attribute_buffer(vColor, color_buffer, 4);
            //enable_attribute_buffer(vNormal, normal_buffer, 4);

            gl.drawArrays(gl.TRIANGLES, 0, num_vertices);
        } else if (drawing_mode == WIREFRAME) {

            enable_attribute_buffer(vPosition, line_buffer, 4);
            enable_attribute_buffer(vColor, line_color_buffer, 4);
            gl.drawArrays(gl.LINES, 0, num_lines);

        }

        requestAnimFrame(render);
    }, 10);

}


//////////////////////////////////////////////////////////////////////////
//
// You don't need to look below here.
//
// Disclaimer: The code below is poorly designed and documented.
//             Examine or modify it at your own risk.
//
//////////////////////////////////////////////////////////////////////////


function enable_attribute_buffer(attrib, buffer, stride){

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attrib, stride, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attrib);

}

function fill_buffer(buffer, array){

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(array), gl.STATIC_DRAW);

}


// Handles mouse clicks.
//
// Depending on current drawing mode this function
// will either save the click to draw an object in
// future, or if sufficient clicks have been made
// to draw the object, it calls the appropriate
// rasterization function.
function mouse_click_listener() {

    // Get the click's position in canvas coordinates.
    // Origin upper left corner of canvas
    // x increases to the right
    // y increases down

    var x = event.clientX - 10; // -10 accounts for padding around canvas.
    var y = event.clientY - 10;

}

// Handles click on drawing mode menu.
// Resets object points if mode changes.
function view_mode_listener(){

    if (drawing_mode != this.selectedIndex){
        // Reset the points clicked for
        // drawing the current object.
        clicks_to_draw = [];
    }

    // Sets edit mode based on selection.
    drawing_mode = this.selectedIndex;

}

function init_mesh(){

    var poses = mesh.get_pos();
    var colors = mesh.get_color();

    var line_poses = [];
    var line_colors = [];

    var j = 0;
    while (j < poses.length) {
        for (var i = 0; i < 3; i++) {
            line_poses.push(poses[j + i]);
            line_poses.push(poses[j + (i + 1) % 3]);
            line_colors.push(colors[j + i]);
            line_colors.push(colors[j + (i + 1) % 3]);
        }
        j+=3;
    }
    fill_buffer(line_buffer,line_poses);
    fill_buffer(line_color_buffer, line_colors);
    num_lines = line_poses.length;

    fill_buffer(pos_buffer,poses);
    fill_buffer(color_buffer,colors);
    num_vertices = poses.length;

}

function set_mesh(mode){

    mesh_mode = mode;

    if (mesh_mode == CUBE_MESH) {
        mesh = new Mesh(
            [[vec4(-0.5, -0.5, -0.5, 1), vec4(0, 0, 0, 1)],
                [vec4(0.5, -0.5, -0.5, 1), vec4(1, 0, 0, 1)],
                [vec4(0.5, 0.5, -0.5, 1), vec4(1, 1, 0, 1)],
                [vec4(-0.5, 0.5, -0.5, 1), vec4(0, 1, 0, 1)],
                [vec4(-0.5, -0.5, 0.5, 1), vec4(0, 0, 1, 1)],
                [vec4(0.5, -0.5, 0.5, 1), vec4(1, 0, 1, 1)],
                [vec4(0.5, 0.5, 0.5, 1), vec4(1, 1, 1, 1)],
                [vec4(-0.5, 0.5, 0.5, 1), vec4(0, 1, 1, 1)]
                ],
            [[0, 2, 1], [0, 3, 2], [1, 2, 5], [6, 5, 2], [3, 6, 2], [3, 7, 6], [3, 0, 4], [3, 4, 7], [0, 1, 5], [0, 5, 4], [4, 5, 6], [4, 6, 7]]);

    } else if (mesh_mode == PYRAMID_MESH) {
        mesh = new Mesh(
            [[vec4(0, 0, 0, 1), vec4(1, 1, 1, 1)],
                [vec4(1, 0, 0, 1), vec4(1, 0, 0, 1)],
                [vec4(0, 1, 0, 1), vec4(0, 1, 0, 1)],
                [vec4(0, 0, 1, 1), vec4(0, 0, 1, 1)]
                ],
            [[0, 2, 1], [0, 3, 2], [0, 1, 3], [1, 2, 3]]
        );
    } else if (mesh_mode == TRIANGLE_MESH) {
        mesh = new Mesh(
            [
                [vec4(2, 0, 0, 1), vec4(1, 0, 0, 1)],
                [vec4(0, 2, 0, 1), vec4(0, 1, 0, 1)],
                [vec4(0, 0, 2, 1), vec4(0, 0, 1, 1)]
            ],
            [[0,1,2]]
        );
    }



    init_mesh();

}

// Handles click on drawing mode menu.
// Resets object points if mode changes.
function mesh_mode_listener(){

    if (mesh_mode == this.selectedIndex){
        return;
    }

    // Sets edit mode based on selection.
    set_mesh(this.selectedIndex);


}

function subdivide_listener(){

    mesh.subdivide();

    init_mesh();

}

function init_copy() {

    var poses = deep_copy.get_pos();
    var colors = deep_copy.get_color();

    var line_poses = [];
    var line_colors = [];
    var j = 0;
    while (j < poses.length) {
        for (var i = 0; i < 3; i++) {
            line_poses.push(poses[j + i]);
            line_poses.push(poses[j + (i + 1) % 3]);
            line_colors.push(colors[j + i]);
            line_colors.push(colors[j + (i + 1) % 3]);
        }
        j+=3;
    }
    fill_buffer(line_buffer,line_poses);
    fill_buffer(line_color_buffer, line_colors);
    num_lines = line_poses.length;

    fill_buffer(pos_buffer,poses);
    fill_buffer(color_buffer,colors);
    num_vertices = poses.length;

}

function deep_copy_listener() {
    deep_copy = mesh.clone();

    init_copy();
}

// Install event listeners for UI elements.
function init_listeners(){

    // Listen for mouse clicks.
    canvas.addEventListener("click",mouse_click_listener);
    // Listen for clicks on the drawing mode menu.
    var view_menu = document.getElementById("ViewMode");
    view_menu.addEventListener("click", view_mode_listener);
    var mesh_menu = document.getElementById("MeshMode");
    mesh_menu.addEventListener("click", mesh_mode_listener);
    var subdivide_button = document.getElementById("SubdivideButton");
    subdivide_button.addEventListener("click", subdivide_listener);
    var deep_copy_button = document.getElementById("DeepCopyButton");
    deep_copy_button.addEventListener("click", deep_copy_listener);

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
    mMV = gl.getUniformLocation(program, "mMV");

    // Initialize event listeners for UI changes.
    init_listeners();

    pos_buffer = gl.createBuffer();
    color_buffer = gl.createBuffer();

    line_buffer = gl.createBuffer();
    line_color_buffer = gl.createBuffer();

    set_mesh(CUBE_MESH);

    // Start rendering.
    render();
}
