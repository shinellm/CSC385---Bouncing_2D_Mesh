// This is the main JS file.
window.onload = init;

const WIDTH = 256;
const HEIGHT = 256;


// Renders the frame.
function render(){
    setTimeout(function() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var mM = mat4();
        var blob = blob_world.get_blob();
        mM = mult(translate(blob.get_center().pos[0], blob.get_center().pos[1], 0), mM);
        gl.uniformMatrix4fv(mMV, false, flatten(mM));
        enable_attribute_buffer(vPosition, pos_buffer, 4);
        enable_attribute_buffer(vColor, color_buffer, 4);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, num_vertices);
        requestAnimFrame(render);
    }, 10);

}

function init_blob_world() {
    var blob = blob_world.get_blob();
    var pos = blob.get_pos();
    pos.push(pos[1]);
    var colors = blob.get_color();
    colors.push(colors[1]);
    fill_buffer(pos_buffer, pos);
    fill_buffer(color_buffer, colors);
    num_vertices = blob.get_pos().length;
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
    mMV = gl.getUniformLocation(program, "mM");

    var blob = new Blob(vec4(0,0,0,1), 0.25, 8);
    blob_world = new BlobWorld(blob);

    pos_buffer = gl.createBuffer();
    color_buffer = gl.createBuffer();

    init_blob_world();

    // Start rendering.
    render();
}