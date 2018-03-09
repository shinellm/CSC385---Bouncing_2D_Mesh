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