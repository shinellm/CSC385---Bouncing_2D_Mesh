
class Vertex {

    constructor(){

        this.pos = vec3();  //When setting new pos values, be sure to include 1 as w-value, always.
        this.old_pos = vec3();  //Is set to this Vertex's pos during subdivision, to shift its old even neighbors.
        this.color = vec3();
        this.old_color = vec3();//Is set to this Vertex's color during subdivision, to shift its old even neighbors.
        this.flag = 0;  //Could be used to indicate that if this Vertex has been shifted?
        this.neighbor_dict = [];  //Tracks which vertices have already been added as this vertex's neighbors
        this.neighbors = [];  //The set of indices (no dupicates!) of this vertex's neighbors.
        this.index = -1; //Keeps track of the index in Verts, so it can
                         //be assigned as the appropriate Faces' indices.

    }

    /*
     * For setting position and color of new odd vertices or old even vertices,
     * based on surrounding ones. For parts b. and d. of Loop formula.
     * param: verts the surrounding vertices used as basis for scaling
     * param: weights the weights with which to scale each surrounding vertex's color and position
     * param: s the scalar of this Vertex, to be done before adding its neighbors' weights
     * NOTE: want to scale each even vertex by its neighbors' values, as they all
     * were before subdivision, so verts here must be a copy of these values, not
     * the actual Vertex objects of the Mesh.
     */
    set_to_average(verts, weights, s){

        this.pos = scale(s, this.pos);
        this.color = scale(s, this.color);

        for (var i = 0; i < verts.length; i++){
            this.pos = add(this.pos, scale(weights[i],verts[i].pos));
            this.color = add(this.color, scale(weights[i], verts[i].color));
        }

    }

}

class Edge {

    constructor(head, tail, next, twin, face){

        this.head = head;
        this.tail = tail;
        this.next = next;
        this.twin = twin;
        this.face = face;
        this.flag = 0;  //Signifies whether or not this edge has already had an odd vertex added
                        //on it during subdivision. Only needed for subdivision.
        this.odd_vert_index = -1; //Used when adding edges between already-existing odd vertices:
                                  //if this edge's twin needs to reference the odd vertex lying on
                                  //this edge, it can do so by taking this edge's odd vertex index,
                                  //and reference it within the containing Mesh's verts array.
                                  //Only needed for subdivision
    }



}

class Face {

    constructor(edge){

        this.edge = edge;
        this.flag = 0; // Used to track whether the face is visited.

    }

    /*
     * Makes sure that for this face, its three edges are all distinct.
     * Also checks to see that each edge is connected with its next edge
     * by the correct vertex, and that this face's half-edges' twins are
     * correctly oriented.
     */
    validate() {
        var e = this.edge;
        if (e == e.next || e.next == e.next.next || e == e.next.next) {
            console.log("Error: triangle does not have three distinct edges");
            return;
        }
        if (e.head != e.next.tail || e.next.head != e.next.next.tail || e.next.next.head != e.tail) {
            console.log("Error: triangle does not have three distinct vertices");
            return;
        }
        if ((e.twin != null && e.twin.head != e.tail) || (e.next.twin != null && e.next.twin.head != e.next.tail) ||
            (e.next.next.twin != null && e.next.next.twin.head != e.next.next.tail)) {
            console.log("Error: adjacent faces not oriented correctly");
            return;
        }

        console.log("Hit");
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
    constructor(vertex_array, face_array){

        this.verts = new Array(vertex_array.length);  //change

        this.edges = new Array(vertex_array.length);

        // Array to store faces, rather than use a root of a tree of faces
        this.faces = new Array(face_array.length)  //change

        // Convert vertex array to objects.
        for (var i = 0; i < vertex_array.length; i++){

            var new_v = new Vertex();
            new_v.pos = vertex_array[i][0];
            new_v.color = vertex_array[i][1];
            new_v.odd = false;
            new_v.flag = 0;
            new_v.index = i;
            this.verts[i] = new_v;
            this.edges[i] = [];  //Each element is a 3-array, containing the three twin half-edges for each of the three inner edges for each face

        }

        // Convert face array to objects.
        for (var i = 0; i < face_array.length; i++){
            var face = face_array[i];

            //  this.root_face = new_face; // Root is last face created.
            this.faces[i] = this.add_face(face);
        }

        this.glue_faces();

        // Fill the arrays now that construction is complete.
        this.fill_arrays();

    }

    /*
     * Adds a new face to this mesh, given a trio of vertex indices to represent the
     * coordinates of the vertices that make up the current face.
     * NOTE: this.faces is still empty before this method is ever called.
     * param: face the 3-array of vertex indices for this mesh's Vertex array
     * returns: the new face, as constructed by the Vertex and Edge objects it comprises
    */
    add_face(face) {
        var new_face = new Face(null);
        var edges = [];

        //Assigns the head and tail vertices to each edge of the face (think the interior of face) as well as the half-edge on the exterior of that edge.
        //Adds each of the current face's three half-edge's to this.edges.
        for (var j = 0; j < 3; j++) {
            var new_edge = new Edge(this.verts[face[(j + 1) % 3]], this.verts[face[j]], null, null, new_face);  //face is a three-array of ints representing indices of vertices, such each pair from this trio makes up this face's corresponding edges. If j here is the same as the index value within face, then the edges always look like 0->1, 1->2, 2->0, in that order
            if (this.verts[face[(j + 1) % 3]].neighbor_dict[face[j]] == null) {

                this.verts[face[(j + 1) % 3]].neighbor_dict[face[j]] = face[j];  //Each of these vertices has another neighbor's index added to it.
                this.verts[face[(j + 1) % 3]].neighbors.push(face[j]);
                this.verts[face[j]].neighbor_dict[face[(j + 1) % 3]] = face[(j + 1) % 3];
                this.verts[face[j]].neighbors.push(face[(j + 1) % 3]);
            }
            this.edges[Math.min(face[j],face[(j+1)%3])].push([Math.max(face[j],face[(j+1)%3]), new_edge]);  //The minimum element is new_edge's twin's tail, and the max element it new_edge's twin's head. The edge is the edge comprising these this.edges (half-edge + half-edge = full edge)
            edges.push(new_edge);  //After its half-edges are accounted for
        }

        //Accounts for the half-edges pre- and succeeding each half-edge within triangular face
        for (var j = 0; j < 3; j++) {
            edges[j].next = edges[(j+1)%3];
        }

        new_face.edge = edges[0];  //Each face only needs to know one Edge object for reference to its other edges and vertices

        return new_face;
    }

    // Glue the faces together by setting twin edges.
    //At this point, this.faces is completely filled,
    //as is this.edges. Just modifies some Edges' twin values.
    glue_faces() {
        for (var i = 0; i < this.edges.length; i++){ //there are three this.edges per face

            this.edges[i].sort(function(a,b){ return a[0] <= b[0];}); //Sorts the vertex indices, for the three vertices corresponding to each face.

            var j = 0;

            while (j < this.edges[i].length){

                if ((j + 1) < this.edges[i].length){ //for cases j = 1, 2
                    //Sorting can result in consecutive equal Vertex indices
                    //in each element of this.edges.
                    if (this.edges[i][j][0] == this.edges[i][j+1][0]) {
                        this.edges[i][j][1].twin = this.edges[i][j+1][1];
                        this.edges[i][j+1][1].twin = this.edges[i][j][1];
                        j++;
                    }
                }
                j++;

            }

        }
    }

    /*
     * Performs subdivision on this mesh. First sets all
     * existing vertices to be "even," then adds, for each
     * face, four new faces in its place, then shifts all
     * even vertices, then resets each vertex's (even and odd)
     * neighbors feature, as the add_face will refill it accordingly.
     * Then it glues these new faces together with glue_face,
     * and refills this mesh's position and color vectors for drawing.
     */
    subdivide(){
        var face_length = this.faces.length;
        var face_array = [];
        for (var i = 0; i < face_length; i++) {
            var new_faces = this.add_odd_verts(this.faces[i]);
            for (var k = 0; k < 4; k++) {
                face_array.push(new_faces[k]);  //Pushes another 3-vector, to be used add_face at bottom
            }
        }

        //Only start shifting even vertices after all even vertices' old_pos values have been adjusted by add_odd_vert.
        for (var i = 0; i < face_length; i++) {
            this.even_vertex_shift(this.faces[i]);
        }

        for (var i = 0; i < face_length; i++) {
            var edge = this.faces[i].edge;
            for (var j = 0; j < 3; j++) {
                if (edge.head.neighbors.length > 0) {
                    edge.head.neighbors = [];       //Although we do not remove any Vertex objects, we change
                    edge.head.neighbor_dict = [];   //each of their neighbors.
                }
                edge = edge.next;
            }
        }

        this.edges = new Array(this.verts.length);  //Just as in the constructor; this length is up to date, as
                                                    //add_odd_vertices has been adding odd vertices to this.verts
        for (var i = 0; i < this.verts.length; i++) {  //As in the constructor, edge index of this.edges must be
            this.edges[i] = [];                        //ready to store new sets pairs of twins.
        }

        this.faces = new Array(face_array.length);  //For every original face, 4 new ones were added to face_array
        for (var i = 0; i < face_array.length; i++){
            var face = face_array[i];

            this.faces[i] = this.add_face(face);
        }

        this.glue_faces();
        this.fill_arrays();
    }

    /*
     * For a given face in this mesh, adds 4 new odd vertices to
     * this Mesh's vertex array. Returns the new faces formed
     * by existing even vertices and these new odd vertices that
     * are contained by the passed face.
     * param: face the face of this mesh, within which 4 new faces
     * will be formed
     * return: length-4 array of vec3 objects that hold the ordered
     * vertex coordinates, to be used to create the new actual Edges
     * and Faces of this Mesh.
     */
    add_odd_verts(face) {
        var e = face.edge;
        var vert_length = this.verts.length;
        var four_new_faces = [];

        for (var i = 0; i < 3; i++) {
            if (e.twin == null || e.twin.flag == 0) {  //With no twin, we know no odd vertex has been added along this edge yet
                var tail = e.tail;
                var head = e.head;
                for (var j = 0; j < 4; j++) {   //Preparation for even vertex shift. Cannot be done within
                    head.old_pos[j] = head.pos[j]; //even_vertex_shift, lest we define old_pos with an updated position
                    head.old_color[j] = head.color[j];
                }
                var new_vert = new Vertex();
                if (e.twin == null) {
                    var verts = [head, tail];
                    var weights = [0.5, 0.5];
                    new_vert.set_to_average(verts, weights, 0);
                } else {
                    var v3 = e.twin.next.head;
                    var v4 = e.next.head;
                    var verts = [head, tail, v3, v4];
                    var weights = [0.375, 0.375, 0.125, 0.125];
                    new_vert.set_to_average(verts, weights, 0);
                }
                new_vert.index = vert_length;
                e.odd_vert_index = new_vert.index;
                new_vert.odd = true;
                this.verts[vert_length] = new_vert;
                vert_length += 1;
                if (e.twin != null) {
                    e.flag += 1;  //Signals to twin what to do.
                }
            } else {
                e.odd_vert_index = e.twin.odd_vert_index;  //All that needs to be done; everything else in the above
                                                           //condition has already been done for the edge's twin
            }

            e = e.next;
        }

        //Adds 3 of the 4 new vectors, for 3 of the new faces' indices, to the return value
        for (var i = 0; i < 3; i++) {
            var one_face = [e.head.index, e.next.odd_vert_index, e.odd_vert_index];
            four_new_faces.push(one_face);
            e = e.next;
        }
        //This last new face consists of the three new odd vertices.
        four_new_faces.push([e.next.odd_vert_index, e.next.next.odd_vert_index, e.odd_vert_index]);

        return four_new_faces;
    }

    /*
     * For the provided face, shifts all even vertices along
     * this original face's edges.
     * param: face the face whose even vertices are to be shifted
     */
    even_vertex_shift(face) {
        var e = face.edge;
        for (var i = 0; i < 3; i++) {
            var head = e.head;
            if (head.flag == 0) {
                var num_neighbors = head.neighbors.length;
                var verts = [];
                var null_verts = [];
                var weights = [];
                var j = 0;
                var temp_e = e;
                var end = false;
                while (j < num_neighbors && end == false) {  //Ensures that if the current vertex IS on
                    if (temp_e.next.twin == null) {          //the boundary; we start and thus end at different
                        null_verts.push(temp_e.next.head.index);  //boundary edges
                        if (temp_e.twin != null) {
                            temp_e = temp_e.twin;
                        } else {
                            null_verts.push(temp_e.tail.index);  //Means this Vertex is on the corner.
                            j = num_neighbors;
                        }
                        end = true;                          // incident boundary edges in the below loop
                    } else {
                        temp_e = temp_e.next.twin;
                    }
                    j += 1;
                }

                var m;
                if (j >= num_neighbors) {  //Either the current Vertex is interior, or is on the corner,
                    m = j;                  //as per the above loop.
                } else {                   //We have only encountered one of the boundary edges with
                    m = 1;                  //which this Vertex is incident, from the above loop.
                }
                while (m < num_neighbors && null_verts.length < 2) {
                    if (temp_e.next.next.twin == null) {
                        null_verts.push(temp_e.next.next.tail.index);
                    } else {
                        temp_e = temp_e.next.next.twin;
                    }

                    m += 1;
                }

                if (null_verts.length > 0) {
                    for (var k = 0; k < null_verts.length; k++) {
                        var new_vert = new Vertex();
                        new_vert.pos = this.verts[null_verts[k]].old_pos;
                        new_vert.color = this.verts[null_verts[k]].old_color;
                        verts.push(new_vert);
                        weights.push(0.125);
                    }
                    head.set_to_average(verts, weights, 0.75);

                } else{
                    var B;
                    var neighbors = head.neighbors;
                    if (num_neighbors <= 3) {
                        B = 0.1875;
                    } else {
                        B = 3 / (8 * num_neighbors);
                    }
                    for (var k = 0; k < num_neighbors; k++) {
                        var new_vert = new Vertex();
                        new_vert.pos = this.verts[neighbors[k]].old_pos;
                        new_vert.color = this.verts[neighbors[k]].old_color;
                        verts.push(new_vert);
                        weights.push(B);
                    }
                    head.set_to_average(verts, weights, 1 - (num_neighbors * B));
                }

                head.flag += 1;
            }

            e = e.next;
        }
    }

    /*
     * Use the face objects of this mesh
     * to draw the desired picture.
     * NOTE: the Face objects have here
     * already been added to this.faces,
     * as per the add_face method.
     */
    fill_arrays(){

        this.poses = [];
        this.colors = [];
        for (var i = 0; i < this.faces.length; i++) {
            if (this.faces[i].flag == 0) {
                var e = this.faces[i].edge;
                this.faces[i].flag += 1;

                for (var j = 0; j < 3; j++) {
                    e.flag = 0;
                    this.poses.push(e.head.pos);
                    this.colors.push(e.head.color);
                    e.head.odd = false;
                    e.head.flag = 0;
                    if (e.twin != null) {  //Fills in any adjacent faces, exactly once, due to above conditional
                        if (e.twin.face == 0) {  //Ensures that faces are filled based on adjacency
                            var e2 = e.twin.face.edge;
                            e.twin.face.flag += 1;
                            for (var k = 0; k < 3; k++) {
                                e2.flag = 0;
                                this.poses.push(e2.head.pos);
                                this.colors.push(e2.head.color);
                                e2.head.odd = false;
                                e2.head.flag = 0;

                                e2 = e2.next;
                            }
                        }
                    }

                    e = e.next;
                }
            }
            this.faces[i].validate();
        }
    }

    /*
     * Creates a complete deep copy of this Mesh object
     * returns: a deep copy of this Mesh object
     */
    clone() {
        var verts_length = this.verts.length;
        var faces_length = this.faces.length;
        var verts_array = [];
        var faces_array = [];
        for (var i = 0; i < verts_length; i++) {
            var result = [];
            result.push(add(vec4(1, 1, 1, 1), this.verts[i].pos));
            result.push(add(vec4(0, 0, 0, 1), this.verts[i].color));
            verts_array.push(result);
        }

        for (var j = 0; j < faces_length; j++) {
            var result = [];
            var edge = this.faces[j].edge;
            for (var k = 0; k < 3; k++) {
                var head_index = edge.head.index;
                result.push(head_index);
                edge = edge.next;
            }
            faces_array.push(result);
        }

        var deep_copy = new Mesh(verts_array, faces_array);
        return deep_copy;
    }

    get_pos(){

        return this.poses;

    }

    get_color(){

        return this.colors;
    }


}



© 2018 GitHub, Inc.
Terms
Privacy
Security
Status
Help
Contact GitHub
API
Training
Shop
Blog
About
