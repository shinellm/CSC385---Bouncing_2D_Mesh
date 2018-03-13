const DRAW_WIRE = 0;
const DRAW_FILL = 1;

const CAMERA_FREE = 0;
const CAMERA_FIXED = 1;
const CAMERA_TRACKING = 2;

// Constants for primary colors.
const COLOR_WHITE = vec4(1.0,1.0,1.0,1.0);
const COLOR_BLACK = vec4(0.0,0.0,0.0,1.0);
const COLOR_CYAN = vec4(0.0,1.0,1.0,1.0);
const COLOR_MAGENTA = vec4(1.0,0.0,1.0,1.0);
const COLOR_YELLOW = vec4(1.0,1.0,0.0,1.0);
const COLOR_RED = vec4(1.0,0.0,0.0,1.0);
const COLOR_GREEN = vec4(0.0,1.0,0.0,1.0);
const COLOR_BLUE = vec4(0.0,0.0,1.0,1.0);


function enable_attribute_buffer(attrib, buffer, stride){

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attrib, stride, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attrib);

}

function fill_buffer(buffer, array){

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(array), gl.STATIC_DRAW);

}



function rotateX(theta){
    return rotate(theta, vec3(1.0,0.0,0.0));
}

function rotateY(theta){
    return rotate(theta, vec3(0.0,1.0,0.0));
}

function rotateZ(theta){
    return rotate(theta, vec3(0.0,0.0,1.0));
}