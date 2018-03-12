class Point {

    constructor(pos){

        this.pos = pos;  //When setting new pos values, be sure to include 1 as w-value, always.
        this.mass = 1;  //all unit mass
        this.velocity = vec4(0,0,0,0);  //all start out stagnant
        this.left_neighbor = null;
        this.right_neighbor = null;

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


class Blob {

    /*
     * Forms a blob from a specified
     * center, a radius, and the number
     * of point masses on its perimeter
     * @param center {vec4} the center of the blob
     * @param rad {num} this blob's radius, when the
     * blob is represented as a circle, before any
     * forces act upon it
     * @param num_points {num} the number of points
     * on the perimeter of this blob
     */
    constructor(center, rad, num_points){
        this.center = new Point(center);
        this.rad = rad;
        this.num_points = num_points;
        this.points = [];  //The outer points that track collision and user interaction
        this.pos = [];  //The positions of all points on the blobs perimeter and interior to color
        this.colors = [];  //The colors of the pixels to be rendered

        this.pos.push(center);
        this.colors.push(vec4(0,1,0,1));

        var rotation_increment = 360/num_points;

        var start_pos = add(center, vec4(rad, 0, 0, 0));
        for (var i = 0; i < num_points; i++) {
            var ang_rot = i * rotation_increment;
            var pos = mult(rotateZ(ang_rot), start_pos);
            var point = new Point(pos);
            point.index = i;
            this.points.push(point);
            this.pos.push(point.pos);
            this.colors.push(vec4(1,0,0,1));
        }

        //For each outer point, specifies its
        //adjacent neighbors
        for (var i = 0; i < num_points; i++) {
            if (i == 0) {
                this.points[i].left_neighbor = this.points[((num_points - 1) % num_points)];
            } else {
                this.points[i].left_neighbor = this.points[((i - 1) % num_points)];
            }

            this.points[i].right_neighbor = this.points[((i + 1) % num_points)];
        }

        console.log(this.points[1].pos);
        console.log(this.points[3].pos);
        console.log(this.calculate_controls(this.points[1], this.points[3]));

        //this.Bezier();
    }

    /*
     * Calculates the positions of
     * the control points of the control
     * cage for the current portion of this
     * Blob's cubic curve.
     * @param p0 {vec4} the point with position, "P0"
     * of the current control cage
     * @param p3 {vec4} the point with position, "P3"
     * @return [pos1, pos2] the second and third
     * positions of the second and third points
     * on the cage.
     */
    calculate_controls(p0, p3) {

        var comp1 = subtract(p0.pos, p0.right_neighbor.pos);
        var vect1 = normalize(add(subtract(p0.pos, p0.right_neighbor.pos), subtract(p0.left_neighbor.pos, p0.pos)));
        var pos1 = add(p0.pos,scale(-dot(vect1, comp1)/dot(vect1,vect1),vect1));

        var comp2 = subtract(p3.pos, p3.left_neighbor.pos);
        var vect2 = normalize(add(subtract(p3.pos, p3.left_neighbor.pos), subtract(p3.right_neighbor.pos, p3.pos)));
        var pos2 = add(p3.pos, scale(-dot(vect2,comp2)/dot(vect2,vect2), vect2));

        return [pos1, pos2];
    }

    /*
     * Helper function for computing
     * each curve position, by performing
     * vector-matrix multiplication.
     * @param vec {vec4}: the Bezier "b-vector"
     * @param mat {mat4}: the 4x4 matrix of the
     * coordinates of the 4 points along the curve
     * @return pos {vec4}: the point along the curve
     * at time t.
     */
    special_dot(vec, mat) {
        var pos = vec4(0,0,0,0);

        for (var i = 0; i < 4; i++) {
            var total = 0;
            for (var j = 0; j < 4; j++) {
                total += mat[i][j] * vec[j];
            }
            pos[i] += total;
        }
        pos[2] = 0;
        pos[3] = 1;

        return pos;
    }

    /*
     * Recursively creates new, smaller
     * control cages to add new positions
     * along this Blob's cubic curve.
     * The base condition is triggered when
     * the cubic and quadratic curve of the
     * current control points are close enough
     * to each other, at which point we apply
     * the Bezier geometric matrix to find
     * the final points along the curve
     * @param {p0, p1, p2, p3} {vec4}: the
     * control points of the control cage for
     * this Blob's cubic Bezier curve
     */
    deCasteljau(p0, p1, p2, p3) {
        var t = 0.5;
        var p = add(p1, scale(0.5, subtract(p2,p1)));
        var difference = length(scale(0.125,add(add(p0,scale(4,p)),add(scale(-3,add(p1, p2)), p3))));
        if (difference <= 0.001) {
            var u = vec4(0, 1/3, 2/3, 1);

            var points = [p0, p1, p2, p3];
            for (var i = 0; i < 4; i++) {
                var ts = [1, u[i], Math.pow(u[i], 2), Math.pow(u[i], 3)];
                var M_b = [[1,0,0,0],[-3,3,0,0],[3,-6,3,0],[-1,3,-3,1]];
                var b = this.special_dot(ts,M_b);
                var pos = this.special_dot(b, points);
                this.pos.push(points[i]);
                this.colors.push(vec4(1,0,0,1));
            }
        } else {
            var p11 = add(scale(1 - t, p0), scale(t, p1));
            var p21 = add(scale(1 - t, p1), scale(t, p2));
            var p31 = add(scale(1 - t, p2), scale(t, p3));
            var p12 = add(scale(1 - t, p11), scale(t, p21));
            var p22 = add(scale(1 - t, p21), scale(t, p31));
            var p13 = add(scale(1 - t, p12), scale(t, p22));

            this.deCasteljau(p0, p11, p12, p13);
            this.deCasteljau(p13, p22, p31, p3);
        }
    }


    /*
     * Creates smooth arcs between trios
     * of this Blob's outer points.
     */
    Bezier() {
        var index = 0;

        while ((index + 2) <= this.num_points) {
            var point0 = this.points[index % this.num_points];
            var point3 = this.points[(index + 2) % this.num_points];
            var inner_controls = this.calculate_controls(point0, point3);
            var p0 = point0.pos;
            var p1 = inner_controls[0];
            var p2 = inner_controls[1];
            var p3 = point3.pos;
            this.deCasteljau(p0, p1, p2, p3);
            index += 2;
        }
    }

    get_points(){

        return this.points;

    }

    get_color() {
        return this.colors;
    }

    get_pos() {
        return this.pos;
    }

    get_center() {
        return this.center;
    }

}


class BlobWorld {
    /*
     * The world in which the Blob exists.
     * Includes the blob and the pixel array
     * from the program, that actually colors
     * the appropriate pixels, based on the
     * locations of the point masses of the blob.
     * @param {Blob} the Blob this world contains
     */
    constructor(blob, gl, program) {
        this.blob = blob;
        this.gl = gl;
        this.program = program;
        this.pos_buffer = this.gl.createBuffer();
        this.color_buffer = this.gl.createBuffer();
        this.vPosition = this.gl.getAttribLocation(program, "vPosition");
        this.vColor = gl.getAttribLocation(program, "vColor");
        this.mMV = gl.getUniformLocation(program, "mM");
        this.num_vertices = this.blob.get_pos().length;
    }

    get_blob() {
        return this.blob;
    }

    free_fall(gravity){

        this.blob.center.velocity[1] -= gravity; //Set the new velocity.y of the blob's center
        this.blob.center.pos[0] += this.blob.center.velocity[0]; //Set the new position.x of the blob's center
        this.blob.center.pos[1] += this.blob.center.velocity[1]; //Set the new position.y of the blob's center

        for (var i = 0; i < this.blob.num_points; i++) {
            this.blob.points[i].velocity[1] -= gravity; //Set the new velocity.y of the blob's point
            this.blob.points[i].pos[0] += this.blob.points[i].velocity[0]; //Set the new position.x of the blob's point
            this.blob.points[i].pos[1] += this.blob.points[i].velocity[1]; //Set the new position.y of the blob's point
        }
    }

    new_position(mouse){
        var mousex = mouse.x; //x-coordinate of the mouse click
        var mousey = mouse.y; //y-coordinate of the mouse click

        console.log(mousex);
        console.log(mousey);

        this.blob.center.pos[0] = mousex; //Set the position.x of the blob's center to be mousex
        this.blob.center.pos[1] = mousey; //Set the position.y of the blob's center to be mousey
        this.blob.center.velocity[0] = 0; //Reset the velocity.x of the blob's center
        this.blob.center.velocity[1] = 0; //Reset the velocity.y of the blob's center

        //For testing purposes
        console.log(this.blob.center.pos[0]);
        console.log(this.blob.center.pos[1]);

        //Do the same steps for each exterior point on the blob
        for (var i = 0; i < this.blob.num_points; i++) {
            this.blob.points[i].pos[0] = mousex - this.blob.points[i].pos[0]; //Set the new position.x of the blob's point
            this.blob.points[i].pos[1] = mousey - this.blob.points[i].pos[1]; //Set the new position.y of the blob's point
            this.blob.points[i].velocity[0] = 0; //Reset the velocity.x of the blob's point
            this.blob.points[i].velocity[1] = 0; //Reset the velocity.y of the blob's point
        }
    }

    evolve(h, w){
        var height = h;
        var width = w;

        //Check for collisions

        if (this.blob.center.pos[1] > height - this.blob.rad || this.blob.center.pos[0] > width - this.blob.rad || this.blob.center.pos[0] < this.blob.rad) {
            this.blob.center.pos[1] = height - this.blob.rad;
            //blob.pos.x = WIDTH/2;

            this.blob.center.velocity[0] = 0; //Set the velocity.x of the blob's center
            this.blob.center.velocity[1] *= -0.2; //Set the velocity.y of the blob's center (-0.2 = bounce factor)
        }

        for (var i = 0; i < this.blob.num_points; i++) {
            if (this.blob.points[i].pos[1] > height - this.blob.rad || this.blob.points[i].pos[0] > width - this.blob.rad || this.blob.points[i].pos[0] < this.blob.rad) {
                this.blob.points[i].pos[1] = height - this.blob.rad;
                //blob.pos.x = WIDTH/2;

                this.blob.points[i].velocity[0] = 0; //Set the velocity.x of the blob's point
                this.blob.points[i].velocity[1] *= -0.2; //Set the velocity.y of the blob's point (-0.2 = bounce factor)
            }
        }
    }

    init_blob_world() {
        var pos = this.blob.get_pos();
        pos.push(pos[1]);
        var colors = this.blob.get_color();
        colors.push(colors[1]);
        fill_buffer(this.pos_buffer, pos);
        fill_buffer(this.color_buffer, colors);
        this.num_vertices = this.blob.get_pos().length;
    }

    render(){
        this.gl.useProgram(this.program);

        var mM = mat4();
        mM = mult(translate(this.blob.get_center().pos[0], this.blob.get_center().pos[1], 0), mM);
        this.gl.uniformMatrix4fv(this.mMV, false, flatten(mM));
        enable_attribute_buffer(this.vPosition, this.pos_buffer, 4);
        enable_attribute_buffer(this.vColor, this.color_buffer, 4);
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.num_vertices);
    }
}