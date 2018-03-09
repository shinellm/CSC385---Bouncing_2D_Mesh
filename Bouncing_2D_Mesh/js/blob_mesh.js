
class Point {

    constructor(pos){

        this.pos = pos;  //When setting new pos values, be sure to include 1 as w-value, always.
        this.mass = 1;
        this.velocity = 0;
        this.neighbor_dict = [];  //Tracks which vertices have already been added as this vertex's neighbors
        this.neighbors = [];  //The set of indices (no dupicates!) of this vertex's neighbors.

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
     * @param center {vec3} the center of the blob
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
        this.points = [];

        var rotation_increment = 360/num_points;
        var trans_rot = mat3();
        trans_rot[2][0] = center[0];
        trans_rot[2][1] = center[1];

        var start_pos = add(center, vec3(rad, 0, 1));
        for (var i = 0; i < num_points; i++) {
            var ang_rot = i * rotation_increment;
            var rot_mat = this.get_rot_matrix(ang_rot);
            var pos = mult(rot_mat, start_pos);
            pos = mult(trans_rot, pos);
            var point = new Point(pos);
            point.index = i;
            this.points.push(point);
        }

    }

    //helper function for calculating initial
    //position of each outer point of Blob
    get_rot_matrix(angle) {
        var rot_matrix = mat3();
        var c = Math.cos( radians(angle) );
        var s = Math.sin( radians(angle) );
        rot_matrix[0][0] = c;
        rot_matrix[1][1] = c;
        rot_matrix[0][1] = -s;
        rot_matrix[1][0] = s;
        return rot_matrix;
    }


    get_points(){

        return this.points;

    }


}

