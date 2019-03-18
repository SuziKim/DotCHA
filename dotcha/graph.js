var densityOffset = 2;

var Class = function(methods) {   
    var klass = function() {    
        this.initialize.apply(this, arguments);          
    };  
    
    for (var property in methods) { 
       klass.prototype[property] = methods[property];
    }
          
    if (!klass.prototype.initialize) klass.prototype.initialize = function(){};      
    
    return klass;    
};

var Vertex = Class({
	initialize: function(i, j, k) {
		this.coord = [i, j, k];
		this.score = 0;

		this.faceXEdges = [];
		this.faceYEdges = [];
        this.faceZEdges = [];

		this.densityVertices = [];

		this.fullDensity = 0;
		
        this.fullXEdges = 0;
		this.fullYEdges = 0;
        this.fullZEdges = 0;
	},getInfo: function () {
    	return this.coord;
    },
    addFaceXEdge: function (e) {
    	this.faceXEdges.push(e);
    },
    addFaceYEdge: function(e) {
    	this.faceYEdges.push(e);
    },
    addFaceZEdge: function(e) {
        this.faceZEdges.push(e);
    },
    addDensityVerices: function(v) {
    	this.densityVertices.push(v);
    },
    removeFaceXEdge: function(e) {
    	var idx = this.faceXEdges.indexOf(e);
    	if (idx > -1) {
			this.faceXEdges.splice(idx, 1);
    	}
    },
	removeFaceYEdge: function(e) {
    	var idx = this.faceYEdges.indexOf(e);
    	if (idx > -1) {
			this.faceYEdges.splice(idx, 1);
    	}
    },
    removeFaceZEdge: function(e) {
        var idx = this.faceZEdges.indexOf(e);
        if (idx > -1) {
            this.faceZEdges.splice(idx, 1);
        }
    },
    removeDensityVertices: function(v) {
    	var idx = this.densityVertices.indexOf(v);
    	if (idx > -1) {
			this.densityVertices.splice(idx, 1);
    	}
    },
    setFullDensity: function(d) {
    	this.fullDensity = d;
    },
    setFullXEdges: function(d) {
    	this.fullXEdges = d;
    },
    setFullYEdges: function(d) {
    	this.fullYEdges = d;
    },
    setFullZEdges: function(d) {
        this.fullZEdges = d;
    },
    calculateCAPTCHAScore: function() {
    	this.score = this.densityVertices.length / this.fullDensity 
                        // + this.faceXEdges.length / this.fullXEdges
                        + this.faceYEdges.length / this.fullYEdges
                        + this.faceZEdges.length / this.fullZEdges;
    },
    getScore: function() {
    	return this.score;
    },
    getCoord: function() {
    	return this.coord;
    },
    getFaceXEdges: function() {
    	return this.faceXEdges;
    },
    getFaceYEdges: function() {
    	return this.faceYEdges;
    },
    getFaceZEdges: function() {
        return this.faceZEdges;
    },
    getDensityVertices: function() {
    	return this.densityVertices;
    },
});


var Edge = Class({
	initialize: function(v1, v2, type) {
		this.v1 = v1;
		this.v2 = v2;
		this.type = type; // 1=faceX, 2=faceY, 3=faceZ
	},
	getAnotherVertex: function(v) {
		if (this.v1 == v) return this.v2;
		return this.v1;
	},
	deallocate: function() {
		this.v1 = null;
		this.v2 = null;
		this.type = null;
	}
});


var Graph = Class({
	initialize: function(iSize, jSize, kSize) {
		this.vertices = [];

		// initialize the vertices : space complexity = iSize*jSize*kSize;
		for (var i=0; i<iSize; i++) {
			var v_j = [];
			for (var j=0; j<jSize; j++) {
				var v_k = [];
				for (var k=0; k<kSize; k++) {
					v_k.push(0);
				}
				v_j.push(v_k);
			}
			this.vertices.push(v_j);
		}

		this.iSize = iSize;
    	this.jSize = jSize;
		this.kSize = kSize;

		this.scoreList = [];
    },
    toString: function() {
        return this.vertices;
    },
    initialScoring: function() {
    	// TODO - efficient way
    	for (var i=0; i<this.iSize; i++) {
    		for (var j=0; j<this.jSize; j++) {
    			for (var k=0; k<this.kSize; k++) { 
    				if (this.vertices[i][j][k] == 0) continue;

                    this.vertices[i][j][k].calculateCAPTCHAScore();
					this.scoreList.push(this.vertices[i][j][k]);
    			}
    		}
    	}

    	this.scoreList.sort(function(v1, v2){return v2.getScore()-v1.getScore()});
    },
    peepTopScoreVertex: function() {
    	if (this.scoreList.length > 0)
    		return this.scoreList[0];
    	else
    		return null;
    },
    removeVertex: function(v) {
    	// remove From vertices list
    	var index = this.vertices.indexOf(v);
    	if (index > -1) {
    		this.vertices.splice(index, 1);
		}

		// remove this on scoring list
    	index = this.scoreList.indexOf(v);
    	if (index > -1) {
			this.scoreList.splice(index, 1);
    	}

		var affectedVertexList = [];

    	// affect to faceXEdges
    	var faceXEdges = v.getFaceXEdges();
    	for (var xIdx in faceXEdges) {
    		var v2 = faceXEdges[xIdx].getAnotherVertex(v);
    		v2.removeFaceXEdge(faceXEdges[xIdx]);

    		faceXEdges[xIdx].deallocate();
    		faceXEdges[xIdx] = null;

    		affectedVertexList.push(v2);
    	}

    	// affect to faceYEdges
    	var faceYEdges = v.getFaceYEdges();
    	for (var yIdx in faceYEdges) {
    		var v2 = faceYEdges[yIdx].getAnotherVertex(v);
    		v2.removeFaceYEdge(faceYEdges[yIdx]);

    		faceYEdges[yIdx].deallocate();
    		faceYEdges[yIdx] = null;

    		affectedVertexList.push(v2);
    	}

        // affect to faceZEdges
        var faceZEdges = v.getFaceZEdges();
        for (var zIdx in faceZEdges) {
            var v2 = faceZEdges[zIdx].getAnotherVertex(v);
            v2.removeFaceZEdge(faceZEdges[zIdx]);

            faceZEdges[zIdx].deallocate();
            faceZEdges[zIdx] = null;

            affectedVertexList.push(v2);
        }
    	
        // affect to densityVertices
        var densityVertices = v.getDensityVertices();
        for (var vIdx in densityVertices) {
        	var vd = densityVertices[vIdx];
        	vd.removeDensityVertices(v);
             	affectedVertexList.push(v2);
        }

        // rescoring affecte vertice and update the scoreList
        for (var vIdx in affectedVertexList) {
             affectedVertexList[vIdx].calculateCAPTCHAScore();
        }

        // TODO - efficient way
        this.scoreList.sort(function(v1, v2){return v2.getScore()-v1.getScore()});
    },
    removeVertexFromScoreList: function(v) {
    	var index = this.scoreList.indexOf(v);
    	if (index > -1) {
    		this.scoreList.splice(index, 1);
		}
    },
    addCoord: function(i, j, k) {
		var v = new Vertex(i, j, k);

		// check faceXEdges
		for (var i_=0; i_<this.iSize; i_++) {
			if (i_ == i) continue;

			var v2 = this.vertices[i_][j][k];
			if (v2 != 0) {
				var e = new Edge(v, v2, 1);
				v2.addFaceXEdge(e);
				v.addFaceXEdge(e);
			}
		}

		// check faceYEdges
		for (var k_=0; k_<this.kSize; k_++) {
			if (k_ == k) continue;

			var v2 = this.vertices[i][j][k_];
			if (v2 != 0) {
				var e = new Edge(v, v2, 2);
				v2.addFaceYEdge(e);
				v.addFaceYEdge(e);
			}
		}

        // check faceZEdges
        for (var j_=0; j_<this.jSize; j_++) {
            if (j_ == j) continue;

            var v2 = this.vertices[i][j_][k];
            if (v2 != 0) {
                var e = new Edge(v, v2, 3);
                v2.addFaceZEdge(e);
                v.addFaceZEdge(e);
            }
        }

		// check densityVertices
		for (var i_=-densityOffset; i_<=densityOffset ; i_++) {
			if (i_ == 0 || i+i_ >= this.iSize || i+i_ < 0) continue;

			for (var j_=-densityOffset; j_<=densityOffset ; j_++) {
				if (j_ == 0 || j+j_ >= this.jSize || j+j_ < 0) continue;

				for (var k_=-densityOffset; k_<=densityOffset ; k_++) {
					if (k_ == 0 || k+k_ >= this.kSize || k+k_ < 0) continue;

					var v2 = this.vertices[i+i_][j+j_][k+k_];
					if (v2 != 0) {
						v.addDensityVerices(v2);
						v2.addDensityVerices(v);
					}
				}
			}
		}

		// set full variables
		var fullDensity = 0;
		for (var i_=-densityOffset; i_<=densityOffset ; i_++) {
			if (i_ == 0 || i+i_ >= this.iSize || i+i_ < 0) continue;

			for (var j_=-densityOffset; j_<=densityOffset ; j_++) {
				if (j_ == 0 || j+j_ >= this.jSize || j+j_ < 0) continue;

				for (var k_=-densityOffset; k_<=densityOffset ; k_++) {
					if (k_ == 0 || k+k_ >= this.kSize || k+k_ < 0) continue;

					fullDensity++;
				}
			}
		}
		
		v.setFullDensity(fullDensity);
		v.setFullXEdges(this.iSize);
		v.setFullYEdges(this.kSize);
        v.setFullZEdges(this.jSize);

		this.vertices[i][j][k] = v;
	}
});