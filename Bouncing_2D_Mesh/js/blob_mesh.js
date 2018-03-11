
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
            console.log(mult(translate(this.center.pos[0], this.center.pos[1], 0), pos));
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
    constructor(blob) {
        this.blob = blob;
    }

    get_blob() {
        return this.blob;
    }
}

