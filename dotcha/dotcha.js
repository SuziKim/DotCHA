var demo_inputStrs = ['DOTCHA', 'RKEBCD', 'ATXEOP', 'OHVFPS', 'LTXFDA', 'XCTEPA'];
var demo_eraseRatios = [0.15, 0.3, 0.3, 0.2, 0.2, 0.2];
var demo_sphereSizes = [0.5, 0.5, 0.35, 0.5, 0.35, 0.35];
var demo_sphereOffsetRanges = [0, 0.2, 0.2, 0.3, 0.3, 0.3];
var demo_randomNoiseCounts = [0.0003, 0.0003, 0.0003, 0.0005, 0.0005, 0.0005];

init();
animate();

function showDemo(demoNo) {
	gParameters.input = demo_inputStrs[demoNo];
	gParameters.eraseRatio = demo_eraseRatios[demoNo];
	gParameters.sphereSize = demo_sphereSizes[demoNo];
	gParameters.sphereOffsetRange = demo_sphereOffsetRanges[demoNo];
	gParameters.randomNoiseCount = demo_randomNoiseCounts[demoNo];

    document.getElementById("desc_answer").innerHTML = "Correct Answer: " + demo_inputStrs[demoNo];
    document.getElementById("desc_parameters").innerHTML = "(μ, ρ, σ, δ) = (" + (1-demo_eraseRatios[demoNo]) + ", " + demo_sphereSizes[demoNo] + ", " + demo_sphereOffsetRanges[demoNo] + ", " + demo_randomNoiseCounts[demoNo] + ")";

	removeAllSpheres();
	var cubes = loadNewAlphabets(gParameters.input); 
	buildAGraph(cubes);	
	rankAndErase(cubes);
	makeSphere(cubes);
	addNoise(cubes);
}


//////////////////////////////////
// GLOBAL VARIABLES
var gScene, gRenderer;
var gCamera, gControl;

var gParentSet = [];
var gCubes = [];

const gK = 10;
const gN = 6;
const gXDepth = gN * gK;

var gGraph;
var gParameters = {
	input: "DOTCHA",
	eraseRatio: 0.15,
	sphereSize: 0.5,
	sphereOffsetRange: 0,
	randomNoiseCount: 0.0005,
};


function findPatternOf(pStr) {
	var strArr = pStr.split('');
	var pattern = [];
	for (var i=0; i<gK; i++) {
		var tmpArr = [];
		for (var s in strArr) {
			var patArr = window['pat_10_'+strArr[s].toLowerCase()];
			tmpArr = tmpArr.concat(patArr[i]);
		}		
		pattern.push(tmpArr);
	}

	return pattern;
}

function sculptCube(pPattern) {	
	var cubes = [];

	for (var i=0; i<gXDepth; i++) {
		candidates_y = [];
		for (var j=0; j<gK; j++) {
			candidates_z = [];
			if (pPattern[j][i] == 0) {
				for (var k=0; k<gK; k++) {
					candidates_z.push(0);
				}
			} else {
				for (var k=0; k<gK; k++) {
					candidates_z.push(1);
				}
			}
			candidates_y.push(candidates_z);
		}
		cubes.push(candidates_y);
	}

	return cubes;
}

function loadNewAlphabets(str) {
	var pattern = findPatternOf(str);
	return sculptCube(pattern);
}

function buildAGraph (pCubes) {
	gGraph = new Graph(gXDepth, gK, gK);

	for (var i=0; i<gXDepth; i++) {
		for (var j=0; j<gK; j++) {
			for (var k=0; k<gK; k++) {
				if (pCubes[i][j][k] == 1) {
					gGraph.addCoord(i, j, k);
				}
			}
		}
	}
}

function rankAndErase(pCubes) {
	gGraph.initialScoring(0);

	var tCounts = gXDepth * gK * gK;
	var removalCounts = 0;

	while (removalCounts < tCounts * (1 - gParameters.eraseRatio)) {
		var topRankVtx = gGraph.peepTopScoreVertex();
		if (topRankVtx == null)	break;

		var topRankCoord = topRankVtx.getCoord();
		if (!isCoordLonely(pCubes, topRankCoord)) {
			pCubes[topRankCoord[0]][topRankCoord[1]][topRankCoord[2]] = 0;
			gGraph.removeVertex(topRankVtx, 0);
			
			removalCounts++;
		} else {
			gGraph.removeVertexFromScoreList(topRankVtx);
		} 		
	}
}

function numberOfBlkInRow(pCubes, j, k) {	
	var counts = 0;
	for (var i=0 ; i<gXDepth; i++) {
		if (pCubes[i][j][k] == 1) {
			counts++;
		}
	}

	return counts-1;
}

function numberOfBlkInColumn(pCubes, i, j) {
	var counts = 0;
	for (var k=0 ; k<gK ; k++) {
		if (pCubes[i][j][k] == 1) {
			counts++;
		}
	}

	return counts-1;
}

function isCoordLonely(pCubes, pCoord) {
	if (numberOfBlkInRow(pCubes , pCoord[1], pCoord[2]) == 0 
		|| numberOfBlkInColumn(pCubes , pCoord[0], pCoord[1]) == 0) {
		return true;
	}

	return false;
}

function addNoise(pSpheres) {
	var xRange = gXDepth * 3;
	var yRange = gK * 3;
	var zRange = gK * 3;

	var randomCount = Math.floor(xRange * yRange * zRange * gParameters.randomNoiseCount) * 5;
	var noiseSpheres = new THREE.Object3D();
	while (randomCount > 0) {
		var random_i = Math.floor((Math.random() * xRange));
		var random_j = Math.floor((Math.random() * yRange));
		var random_k = Math.floor((Math.random() * zRange));

		var xOffset = gXDepth * 0.5;
		var yOffset = gK;
		var zOffset = gK;

		if ((random_i > xOffset && random_i < xOffset + gXDepth) 
			&& (random_j > yOffset && random_j < yOffset + gK) 
			&& (random_k > zOffset && random_k < zOffset + gK))
			continue;

		makeUnitSphereAt(noiseSpheres, random_i, random_j, random_k, xRange, yRange, zRange, true);
		randomCount--;
	}

	gScene.add(noiseSpheres);
	gParentSet.push(noiseSpheres);
}

function rotateAroundWorldAxis(pObject, pAxis, pRadians) {
	var rotWorldMatrix = new THREE.Matrix4();
	rotWorldMatrix.makeRotationAxis(pAxis.normalize(), pRadians);
	rotWorldMatrix.multiply(pObject.matrix);
	pObject.matrix = rotWorldMatrix;
	pObject.rotation.setFromRotationMatrix(pObject.matrix);
}

function makeUnitSphereAt(pSubSphere, pX, pY, pZ, pXDepth, pYDepth, pZDepth, pInterpolation) {
	var xSizeOffset = pXDepth / 2.0;
	var ySizeOffset = pYDepth / 2.0;
	var zSizeOffset = pZDepth / 2.0;

	var dis1 = Math.sqrt(Math.pow(pX, 2) + Math.pow(pY, 2));
	var dis2 = Math.sqrt(Math.pow(60 - pX, 2) + Math.pow(10 - pY, 2));

	if (pInterpolation) {
		var oXDepth = pXDepth / 3;
		var oYDepth = pYDepth / 3;
		var oZDepth = pZDepth / 3;

		var kx = 0; var ky = 0;
		if (pX < oXDepth * 1) kx = 0;
		else if(pX > oXDepth * 2)	kx = 60;
		else kx = pX - 1 * oXDepth;

		if (pY < oYDepth * 1) ky = 0;
		else if(pY > oYDepth * 2)	ky = 10;
		else ky = pY - 1 * oYDepth;

		dis1 = Math.sqrt(Math.pow(kx, 2) + Math.pow(ky, 2));
		dis2 = Math.sqrt(Math.pow(60-kx, 2) + Math.pow(10-ky, 2));
	}

	var tR = (37 - 236) / (dis1 + dis2) * dis1 + 236;
	var tG = (170 - 0) / (dis1 + dis2) * dis1 + 0;
	var tB = ( 225 - 140) / (dis1 + dis2) * dis1 + 140;
	var tColor = new THREE.Color(tR/256, tG/256, tB/256);

	var geometry = new THREE.SphereGeometry(gParameters.sphereSize);
	var material = new THREE.MeshLambertMaterial( {color: tColor, shading: THREE.SmoothShading, overdraw: 0.5});

	var randomOffsetX = getRandomArbitrary(-gParameters.sphereOffsetRange, gParameters.sphereOffsetRange);
	var randomOffsetY = getRandomArbitrary(-gParameters.sphereOffsetRange, gParameters.sphereOffsetRange);
	var randomOffsetZ = getRandomArbitrary(-gParameters.sphereOffsetRange, gParameters.sphereOffsetRange);

	var sphere = new THREE.Mesh(geometry, material);
	sphere.position.set(pX-xSizeOffset+randomOffsetX, -pY+ySizeOffset+randomOffsetY, pZ-zSizeOffset+randomOffsetZ);
	pSubSphere.add(sphere);
}

function makeSphere(pCubes) {	
	var xDepth = pCubes.length;

	for (var i=0; i<xDepth; i++ ) {
		var subObject = new THREE.Object3D();
		for (var j=0; j<gK; j++) {
			for (var k=0; k<gK; k++) {
				if (pCubes[i][j][k] == 1) {
					makeUnitSphereAt(subObject, i, j, k, gXDepth, gK, gK, false);
				}
			}
		}

		rotateAroundWorldAxis(subObject, new THREE.Vector3(1,0,0), Math.PI / 7 * Math.floor(i / gK));
		gScene.add(subObject);
		gParentSet.push(subObject);
	}
}

function getRandomArbitrary(pMin, pMax) {
	return Math.random() * (pMax - pMin) + pMin;
}

function removeAllSpheres() {
	for (i=0 ; i < gParentSet.length; i++) {
		gScene.remove(gParentSet[i]);
	}
	gParentSet = []
}

function animate() {
	requestAnimationFrame(animate);
	gRenderer.render(gScene, gCamera);
	gControl.update();
}

function init() {
	gScene = new THREE.Scene();
	gRenderer = new THREE.WebGLRenderer({antialias:true});
	const canvas = gRenderer.domElement;

	document.getElementById('threejscanvas').appendChild(gRenderer.domElement);

	var cWidth = canvas.clientWidth;
	var cHeight = canvas.clientHeight;
	gRenderer.setSize(cWidth, cHeight);

	var aspect = canvas.clientWidth / canvas.clientHeight;
	var frustumSize = 700;
	gCamera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 2000);
	gCamera.zoom = 12;
	gCamera.updateProjectionMatrix();
	gCamera.position.set(0, 0, 100);
	gScene.add(gCamera);

	window.addEventListener( 'resize', function (){
		var aspect = canvas.clientWidth / canvas.clientHeight;
		gCamera.left   = - frustumSize * aspect / 2;
		gCamera.right  =   frustumSize * aspect / 2;
		gCamera.top    =   frustumSize / 2;
		gCamera.bottom = - frustumSize / 2;
		gCamera.updateProjectionMatrix();
		gRenderer.setSize( canvas.clientWidth, canvas.clientHeight );
	}, false );
	
	gRenderer.setClearColor(0xffffff, 1);

	var gBaselight = new THREE.AmbientLight(0x707070);
	gScene.add(gBaselight)

	var lightColor = 0x606060;
	var lightColor2 = 0x606060;

	var light1 = new THREE.HemisphereLight( lightColor, lightColor2, 0.6 );
	light1.position.set( 1500, 0, 0);
	gScene.add( light1 );

	var light2 = new THREE.HemisphereLight( lightColor, lightColor2, 0.6 );
	light2.position.set( 0, 1500, 0 );
	gScene.add( light2 );

	var light3 = new THREE.HemisphereLight( lightColor, lightColor2, 0.6 );
	light3.position.set( 0, 0, 1500 );
	gScene.add( light3 );

	gControl = new THREE.TrackballControls(gCamera, gRenderer.domElement);  
	gControl.autoRotateSpeed =  0.006;
}
