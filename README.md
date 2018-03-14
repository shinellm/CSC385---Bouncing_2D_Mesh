# CSC385---Bouncing_2D_Mesh

The CSC385---Bouncing_2D_Mesh folder contains our current rendering of a Mesh modeling blob like physics:
	We decided to keep separate implementations of the blob. The initial version upon load implements 	a rigid body simulation of a blob responding to collision with the border of the canvas. The second 	version implements a blob with spring forces acting upon it. You can switch between versions by 	pressing the left or right key on your keyboard. 
	
	Our main files are:
	CSC385---Bouncing_2D_Mesh/
        		index.html (Created our own html code)
        		js/	
        			blob_main.js (Mouse/Canvas Listeners, init(), render(), etc)
        			blob_mesh.js (Constructs a Blob function for our Blob World function)
        			helpers.js (Simple helper functions from project 3)
        			initShaders.js (Initialize the shader)
        			MV.js (Matrix and vector functions)
        			webgl_utils.js 
	
	*After switching from version 1 into version 2 and then back, dragging the blob causes it to become 	extremely elongated in the -y direction. In addition, if you size down the blob and then change to 	version 2, it causes the blob velocities to increase. Sizing up the ball and clicking should resolve 	this.
	

The BlobExample folder holds a copy of Hakim El Hattab?s blob implementation that we hoped to build upon (https://lab.hakim.se/blob/03/).

The SimpleBouncingBall and SpringTest are testing environments we wrote, which were later used in the creation of our blob implementation.


