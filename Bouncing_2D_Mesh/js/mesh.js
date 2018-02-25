

class Vertex {

    constructor(){

        this.pos = vec4();
        this.color = vec4();
        this.flag = 0;

    }

}

class Edge {

    constructor(head, tail, next, twin, face){

        this.head = head;
        this.tail = tail;
        this.next = next;
        this.twin = twin;
        this.face = face;

    }

}

class Face {

    constructor(edge){

        this.edge = edge;
        this.flag = 0; // Used to track whether the face is visited.

    }

    fill_arrays(flag, pos, color){

        if (this.flag <= flag){

            var e = this.edge;

            this.flag = flag + 1;

            for (var i = 0; i < 3; i++){
                pos.push(e.head.pos);
                color.push(e.head.color);
                e.head.odd = false;
                e.head.flag = flag + 1;
                e.tail.odd = false;
                e.tail.flag = flag + 1;

                e = e.next;
            }

            for (var i = 0; i < 3; i++){
                if (e.twin != null)
                    e.twin.face.fill_arrays(flag, pos, color);
                e = e.next;
            }
        }

    }

}

class Mesh{

    // Takes two arrays and constructs a half-edge mesh.
    //
    // The first parameter is an array of vertices in the mesh. Each element of
    // the vertex array is a length three array containing the position,
    // the color, and the normal of the vertex as a vec4().
    //
    // The second parameter is an array of triangular faces in the mesh.
    // Each element of the face array is a face described by a length
    // three array containing the indices of the vertices (into the first array
    // that make up the face (in that order).

    // Assumes that the orientations of the faces are consistent with each other.

    // >>>> New in Project 3 <<<<
    // Takes two additional arguments which are the GL context
    // and the shader program that the mesh will be rendered with.
    constructor(vertex_array, face_array, gl, program){

        // >>>> New in Project 3 <<<<
        // Initialize gl buffers.
        this.gl = gl;
        this.pos_buffer = gl.createBuffer();
        this.color_buffer = gl.createBuffer();
        this.line_buffer = gl.createBuffer();
        this.line_color_buffer = gl.createBuffer();
        this.num_lines = 0;
        this.num_vertices = 0;
        this.vPosition = gl.getAttribLocation(program, "vPosition");
        this.vColor = gl.getAttribLocation(program, "vColor");
        // >>>> End New <<<<

        this.root_face = null;


        var verts = new Array(vertex_array.length);

        // Arrays to store edges to twin.
        var twins = new Array(vertex_array.length);

        // Convert vertex array to objects.
        for (var i = 0; i < vertex_array.length; i++){

            var new_v = new Vertex();
            new_v.pos = vertex_array[i][0];
            new_v.color = vertex_array[i][1];
            new_v.odd = false;
            new_v.flag = 0;
            verts[i] = new_v;
            twins[i] = [];

        }

        // Convert face array to objects.
        for (var i = 0; i < face_array.length; i++){
            var face = face_array[i];

            var new_face = new Face(null);
            var edges = [];
            for (var j = 0; j < 3; j++) {
                var new_edge = new Edge(verts[face[(j + 1) % 3]], verts[face[j]], null, null, new_face);
                twins[Math.min(face[j],face[(j+1)%3])].push([Math.max(face[j],face[(j+1)%3]), new_edge]);
                edges.push(new_edge);
            }
            for (var j = 0; j < 3; j++) {
                edges[j].next = edges[(j+1)%3];
            }

            new_face.edge = edges[0];

            this.root_face = new_face; // Root is last face created.
        }

        // Glue the faces together by setting twin edges.
        for (var i = 0; i < twins.length; i++){

            twins[i].sort(function(a,b){ return a[0] <= b[0];});

            var j = 0;

            while (j < twins[i].length){

                if ((j + 1) < twins[i].length){

                    if (twins[i][j][0] == twins[i][j+1][0]) {
                        twins[i][j][1].twin = twins[i][j+1][1];
                        twins[i][j+1][1].twin = twins[i][j][1];
                        j++;
                    }
                }
                j++;

            }

        }

        // >>>> New in Project 3 <<<<
        // Fill the gl buffers now that construction is complete.
        this.fill_buffers();
        // >>>> End New <<<<

    }


    /**
     * >>>> New in Project 3 <<<<
     *
     * This function replaces fill_arrays. It still calls the fill_arrays
     * function of the Face class (with the same interface), but it then
     * initializes GL buffers with the using the results of fill_arrays.
     * These GL buffers are used to render the mesh when render() is
     * called.
      */
    fill_buffers(){

        var poses = [];
        var colors = [];
        this.root_face.fill_arrays(this.root_face.flag, poses, colors);

        // >>>> New in Project 3 <<<<
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
        fill_buffer(this.line_buffer,line_poses);
        fill_buffer(this.line_color_buffer, line_colors);
        this.num_lines = line_poses.length;

        fill_buffer(this.pos_buffer,poses);
        fill_buffer(this.color_buffer,colors);
        this.num_vertices = poses.length;
        // >>>> End New <<<<
    }


    /**
     * >>>> New in Project 3 <<<<
     *
     * This function renders the mesh using previously constructed GL
     * buffers.
     *
     * IMPORTANT: This function calls gl.drawarrays() to
     * render the mesh.  This means that all of the uniform
     * projection-view-model information expected by the vertex shader
     * must be bound before calling this function. In particular, you
     * must compute and bind the uniform attributes for the
     * projection-view matrix mPV and the model matrix mM
     * before calling this function.  An example of this
     * being done can be found in Mobile.render().
     *
     * @param {int} draw_mode
     *      Should be one of constants DRAW_FILL or DRAW_WIRE
     *      describing whether to render filled or wireframe.
     */
    render(draw_mode){

        if (draw_mode == DRAW_FILL) {

            enable_attribute_buffer(this.vPosition, this.pos_buffer, 4);
            enable_attribute_buffer(this.vColor, this.color_buffer, 4);

            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.num_vertices);

        } else if (draw_mode == DRAW_WIRE) {

            enable_attribute_buffer(this.vPosition, this.line_buffer, 4);
            enable_attribute_buffer(this.vColor, this.line_color_buffer, 4);
            this.gl.drawArrays(this.gl.LINES, 0, this.num_lines);

        }

    }


}



