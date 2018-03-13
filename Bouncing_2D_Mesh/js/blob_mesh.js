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
class Spring {


    constructor(point , center, restlength) {

        this.xpos = point[0];
        this.ypos = point[1];
        this.newxpos = point[0];
        this.newypos = point[1];


        this.k = 0.2;    // Spring constant
        this.damp = 2*Math.sqrt(this.k * point.mass);       // Damping
        this.ideallength = restlength;
        this.velocity = vec4(0,0,0,0);
        this.xvel = 0;   // x velocity
        this.yvel = 0;     // y velocity
        this.a = 0;    // acceleration
        this.force = 0;    // force
}

    /**
     * takes two ends of a spring and the length of the spring when
     * it is at rest, calculates the spring force of the spring
     * @param point
     * @param center
     * @param length
     */
    spring_force(point, center, ideallength) {

        var xlength = Math.abs(point[0] - center[0]);
        var ylength = Math.abs(point[1] - center[1]);
        var springlength = Math.sqrt(xlength*xlength + ylength*ylength); //calculate spring length

        this.force = -this.k * (springlength - ideallength);  //calculate spring force using f=-kx
        this.a = this.force /(center.mass + point.mass);     //calculate acceleration using f=ma
        this.velocity[0] = this.damp * (this.velocity[0] + this.a);     // x velocity with a damping term
        this.newxpos = point[0]  + this.velocity[0];           // Updated position
        this.velocity[1] = this.damp * (this.velocity[1] + this.a);         //y velocity with a damping term
        this.newypos = point[1]  + this.velocity[1];           // Updated position

        var newpoint = vec4(this.newxpos,this.newypos,0,1);
        return newpoint;

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
        this.springs = []; // The spring connect from outer points to the center
        this.pos.push(vec4(0,0,0,1));
        this.colors.push(vec4(0,1,0,1));

        var rotation_increment = 360/num_points;

        var start_pos = add(vec4(0,0,0,1), vec4(rad, 0, 0, 0));
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

    }

    /**
     * Creates a spring from each outer point to the center
     * @param num_points number of outer points
     */
    connect_spring(num_points) {


        for (var i = 0; i < num_points; i++) {
            this.springs[i] = new Spring(this.points[i], this.center, this.rad)
        }

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
        var pos1 = add(p0.pos,scale(-0.3333 * dot(vect1, comp1)/dot(vect1,vect1),vect1));

        var comp2 = subtract(p3.pos, p3.left_neighbor.pos);
        var vect2 = normalize(add(subtract(p3.pos, p3.left_neighbor.pos), subtract(p3.right_neighbor.pos, p3.pos)));
        var pos2 = add(p3.pos, scale(-0.3333 * dot(vect2,comp2)/dot(vect2,vect2), vect2));

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

        var t = 0.5;
        var p = add(p1, scale(0.5, subtract(p2,p1)));
        var difference = length(scale(0.125,add(add(p0,scale(4,p)),add(scale(-3,add(p1, p2)), p3))));
        if (difference <= FLATNESS) {

            var points = [p0, p1, p2, p3];
            for (var i = 0; i < 4; i++) {
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

    /**
     * Creates smooth arcs between pairs
     * of this Blob's outer points.
     */
    Bezier() {
        this.pos = [];
        var index = 0;

        while (index <= this.num_points) {
            var point0 = this.points[index % this.num_points];
            var point3 = this.points[(index + 1) % this.num_points];
            var inner_controls = this.calculate_controls(point0, point3);
            var p0 = point0.pos;
            var p1 = inner_controls[0];
            var p2 = inner_controls[1];
            var p3 = point3.pos;

            this.deCasteljau(p0, p1, p2, p3);
            index += 1;
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

        //console.log("New Velocity Center y " + this.blob.center.velocity[1]);
        //console.log("New Pos Center z " + this.blob.center.pos[2]);


        for (var i = 0; i < this.blob.num_points; i++) {
            this.blob.points[i].velocity[1] -= gravity; //Set the new velocity.y of the blob's point
            this.blob.points[i].pos[0] += this.blob.points[i].velocity[0]; //Set the new position.x of the blob's point
            this.blob.points[i].pos[1] += this.blob.points[i].velocity[1]; //Set the new position.y of the blob's point

            //console.log("New Velocity Vertex y " + i + " " + this.blob.points[i].velocity[1]);
            //console.log("New Pos Vertex z " + i + " " + this.blob.points[i].pos[2]);
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
        var dx; //Distance to translate for x-coordinate
        var dy; //Distance to translate for y-coordinate

        console.log("Mousex " + mousex);
        console.log("Mousey " + mousey);

        //For testing purposes
        console.log("Old Blob Center x " + this.blob.center.pos[0]);
        console.log("Old Blob Center y " + this.blob.center.pos[1]);

        dx = mousex - this.blob.center.pos[0]; //Distance to translate the other points
        dy = mousey - this.blob.center.pos[1]; //Distance to translate the other points

        this.blob.center.pos[0] = mousex; //Set the position.x of the blob's center to be mousex
        this.blob.center.pos[1] = mousey; //Set the position.y of the blob's center to be mousey
        this.blob.center.velocity[0] = 0; //Reset the velocity.x of the blob's center
        this.blob.center.velocity[1] = 0; //Reset the velocity.y of the blob's center

        //For testing purposes
        console.log("New Blob Center x " + this.blob.center.pos[0]);
        console.log("New Blob Center y " + this.blob.center.pos[1]);

        //Do the same steps for each exterior point on the blob
        for (var i = 0; i < this.blob.num_points; i++) {

            //For testing purposes
            console.log("Old Blob Vertex x " + i + " " + this.blob.points[i].pos[0]);
            console.log("Old Blob Vertex y " + i + " " + this.blob.points[i].pos[1]);

            this.blob.points[i].pos[0] += dx; //Set the new position.x of the blob's point
            this.blob.points[i].pos[1] += dy; //Set the new position.y of the blob's point
            this.blob.points[i].velocity[0] = 0; //Reset the velocity.x of the blob's point
            this.blob.points[i].velocity[1] = 0; //Reset the velocity.y of the blob's point

            //For testing purposes
            console.log("New Blob Vertex x " + i + " " + this.blob.points[i].pos[0]);
            console.log("New Blob Vertex y " + i + " " + this.blob.points[i].pos[1]);

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
    evolve(){

        //Check for collisions
        if (this.blob.center.pos[1] + this.blob.rad > 1 || this.blob.center.pos[1] - this.blob.rad < -1 || this.blob.center.pos[0] + this.blob.rad > 1 || this.blob.center.pos[0] - this.blob.rad < -1) {
            this.blob.center.pos[1] = -1 + this.blob.rad;
            //blob.pos.x = WIDTH/2;

            //console.log("hit the ground");
            this.blob.center.velocity[0] = 0; //Set the velocity.x of the blob's center
            this.blob.center.velocity[1] *= -0.8; //Set the velocity.y of the blob's center (-0.2 = bounce factor)

            var start_pos = add(this.blob.center.pos, vec4(this.blob.rad, 0, 0, 0));
            var ang_rot;
            var pos;
            var rotation_increment = 360/this.blob.num_points;
            var point;

            for (var i = 0; i < this.blob.num_points; i++) {
                    ang_rot = i * rotation_increment;
                    pos = mult(rotateZ(ang_rot), start_pos);
                    point = new Point(pos);

                this.blob.points[i].pos[1] = point.pos[1];
                //blob.pos.x = WIDTH/2;

                this.blob.points[i].velocity[0] = 0; //Set the velocity.x of the blob's point
                this.blob.points[i].velocity[1] *= -0.8; //Set the velocity.y of the blob's point (-0.2 = bounce factor)
            }
        }


        /*
        //Check for collisions
        for (var i = 0; i < this.blob.num_points; i++) {
            if (this.blob.points[i].pos[1] > 1 || this.blob.points[i].pos[1] < -1 || this.blob.points[i].pos[0] > 1 || this.blob.points[i].pos[0] < -1) {
                //this.blob.points[i].pos[1] = -1;
                //blob.pos.x = WIDTH/2;

                this.blob.points[i].velocity[0] = 0; //Set the velocity.x of the blob's point
                this.blob.points[i].velocity[1] *= -0.8; //Set the velocity.y of the blob's point (-0.2 = bounce factor)
            }
        }
        */

        /*
        for (var i = 0; i < this.blob.num_points; i++) {
            if (this.blob.points[i].pos[1] > 1 || this.blob.points[i].pos[1] < -1 || this.blob.points[i].pos[0] > 1 || this.blob.points[i].pos[0] < -1) {
                this.blob.points[i].pos[1] = -1 + this.blob.rad;
                //blob.pos.x = WIDTH/2;

                this.blob.points[i].velocity[0] = 0; //Set the velocity.x of the blob's point
                this.blob.points[i].velocity[1] *= -0.2; //Set the velocity.y of the blob's point (-0.2 = bounce factor)
            }
        }*/
    }

    init_blob_world() {
        //this.get_blob().Bezier();
        var pos = this.blob.get_pos();
        pos.push(pos[1]);
        //console.log(pos);
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

