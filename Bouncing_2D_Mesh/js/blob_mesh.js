class Point {

    /**
     * Creates a Point from a specified position.
     * @param pos {vec4}
     *      The position of the Point
     */
    constructor(pos){

        this.pos = pos;  //When setting new pos values, be sure to include 1 as w-value, always.
        this.mass = 1;  //all unit mass
        this.velocity = vec4(0,0,0,0);  //all start out stagnant
        this.left_neighbor = null;
        this.right_neighbor = null;

    }

    /**
     * For setting position and color of new odd vertices or old even vertices,
     * based on surrounding ones. For parts b. and d. of Loop formula.
     * @param: verts
     *      The surrounding vertices used as basis for scaling
     * @param: weights
     *      The weights with which to scale each surrounding vertex's color and position
     * @param: s
     *      The scalar of this Vertex, to be done before adding its neighbors' weights
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

    /**
     * Forms a blob from a specified
     * center, a radius, and the number
     * of point masses on its perimeter
     * @param center {vec4}
     *      The center of the blob
     * @param rad {num}
     *      This blob's radius, when the blob is
     *      represented as a circle, before any
     *      forces act upon it
     * @param num_points {num}
     *      The number of points on the perimeter
     *      of this blob
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

    /**
     * Calculates the positions of
     * the control points of the control
     * cage for the current portion of this
     * Blob's cubic curve.
     *
     * @param p0 {vec4}
     *      The "P0" of the current control cage
     * @param p3 {vec4}
     *      The "P3"
     * @return [pos1, pos2]
     *      The second and third positions of the
     *      second and third points on the cage.
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

    /**
     * Recursively creates new, smaller
     * control cages to add new positions
     * along this Blob's cubic curve.
     * The base condition is triggered when
     * the cubic and quadratic curve of the
     * current control points are close enough
     * to each other, at which point we apply
     * the Bezier geometric matrix to find
     * the final points along the curve
     *
     * @param {p0, p1, p2, p3} {vec4}
     *      The control points of the control
     *      cage for this Blob's cubic Bezier curve.
     */
    deCasteljau(p0, p1, p2, p3) {

    }

    /**
     * Creates smooth arcs between trios
     * of this Blob's outer points.
     */
    Bezier() {
        var index = 0;

        while ((index + 2) <= this.num_points) {
            var p0 = this.points[index % this.num_points].pos;
            var p3 = this.points[(index + 2) % this.num_points].pos;
            var inner_controls = this.calculate_controls(p0, p3);
            var p1 = inner_controls[0];
            var p2 = inner_controls[1];
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
    /**
     * The world in which the Blob exists.
     * Includes the blob and the pixel array
     * from the program, that actually colors
     * the appropriate pixels, based on the
     * locations of the point masses of the blob.
     *
     * @param {Blob}
     *      The Blob this world contains.
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

    /**
     * Sets every point on the blob to a new position
     * based on gravity.
     *
     * @param {number} gravity
     *      The gravity applied to the blob.
     */
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

    /**
     * Sets every point on the blob to a new position
     * based on the position of the mouse click on
     * the canvas.
     *
     * @param {object} mouse
     *      The position of the mouse click on the canvas.
     */
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

    /**
     * Evolves the blob by moving every point on the
     * blob and checks for collisions with the canvas.
     *
     * @param {number} h
     *      The height of the canvas.
     * @param {number} w
     *      The width of the canvas.
     */
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