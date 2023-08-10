import { OrbitControls } from './OrbitControls.js'


// Scene Declartion
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// This defines the initial distance of the camera, you may ignore this as the camera is expected to be dynamic

camera.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 3, 5));
camera.lookAt(0, -5, 1)

function updateCameraPosition() {
	let newZ = ball.position.z - camera.position.z;
	camera.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, newZ + 3));
}


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


// helper function for later on
function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}


// Here we load the cubemap and pitch images, you may change it

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  'src/pitch/right.jpg',
  'src/pitch/left.jpg',
  'src/pitch/top.jpg',
  'src/pitch/bottom.jpg',
  'src/pitch/front.jpg',
  'src/pitch/back.jpg',
]);
scene.background = texture;

// --------------------------------------------------------------------------------------------------
// Lights

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const endDirectionalLight = new THREE.DirectionalLight( 0x0000FF, 0.8 ); // blue directional light
endDirectionalLight.position.set(0, 1, 0);
scene.add( endDirectionalLight );

const startDirectionalLight = new THREE.DirectionalLight( 0xFF0000, 0.8 ); // red directional light
startDirectionalLight.position.set(0, 1, 100);
scene.add( startDirectionalLight );

const spotLight = new THREE.SpotLight(0x00FF00, 1);
spotLight.position.set(0, 2, 2);
spotLight.target.position.set(0, 0, 0);
scene.add(spotLight);
scene.add(spotLight.target);

// --------------------------------------------------------------------------------------------------
// Goal


class Goal {

	constructor() {
		this.goalThreeObject = new THREE.Group();
		this.goalSkeleton = [];
		this.nets = [];
		this.goalHeight = 1;
		this.createCrossbar();
		this.createGoalPosts();
		this.createBackSupports();
		this.createNets();
		this.addToThreeObject();
	}

	createCrossbar() {
		const crossbarGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 32);
		crossbarGeometry.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
		crossbarGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, this.goalHeight, 0));
		const crossbarMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false });
		const crossbar = new THREE.Mesh(crossbarGeometry, crossbarMaterial);
		this.goalSkeleton.push(crossbar);
	}

	createGoalPosts() {

		const createLeftPost = () => {

			const leftPostGeometry = new THREE.CylinderGeometry(0.05, 0.05, this.goalHeight, 32);
			leftPostGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-1.5, 0.5, 0));
			const leftPostMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false });
			const leftPost = new THREE.Mesh(leftPostGeometry, leftPostMaterial);
			
			return leftPost;
	
		}

		const createRightPost = (leftPost) => {

			const rightPost = leftPost.clone();
			rightPost.applyMatrix4(new THREE.Matrix4().makeTranslation(3, 0, 0));
			return rightPost;
	
		}

		const createLeftPostEdge = () => {

			const leftPostEdgeGeometry = new THREE.TorusGeometry(0.05, 0.05, 2, 32);
			leftPostEdgeGeometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
			leftPostEdgeGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-1.5, 0, 0));
			const leftPostEdgeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false });
			const leftPostEdge = new THREE.Mesh(leftPostEdgeGeometry, leftPostEdgeMaterial);
	
			return leftPostEdge;
	
		}

		const createRightPostEdge = (leftPostEdge) => {

			const rightPostEdge = leftPostEdge.clone();
			rightPostEdge.applyMatrix4(new THREE.Matrix4().makeTranslation(3, 0, 0));
	
			return rightPostEdge;
	
		}

		const leftPost = createLeftPost();
		const rightPost = createRightPost(leftPost);
		this.goalSkeleton.push(leftPost);
		this.goalSkeleton.push(rightPost);

		const leftPostEdge = createLeftPostEdge();
		const rightPostEdge = createRightPostEdge(leftPostEdge);
		this.goalSkeleton.push(leftPostEdge);
		this.goalSkeleton.push(rightPostEdge);

	}

	createBackSupports() {

		const createLeftBackSupport = () => {

			const leftBackSupportGeometry = new THREE.CylinderGeometry(0.05, 0.05, Math.SQRT2, 32);
			leftBackSupportGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-1.5, Math.SQRT2 / 2, -1));
			const leftBackSupportMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false });
			const leftBackSupport = new THREE.Mesh(leftBackSupportGeometry, leftBackSupportMaterial);

			// Translate to origin
			let translationMatrix = new THREE.Matrix4().makeTranslation(1.5, 0, 1);
			leftBackSupport.applyMatrix4(translationMatrix);

			// Apply 45 degrees rotation about X axis
			let rotationMatrix = new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(45));
			leftBackSupport.applyMatrix4(rotationMatrix);

			// Translate back to the original position
			let translationMatrixInverse = translationMatrix.invert();
			leftBackSupport.applyMatrix4(translationMatrixInverse);

			return leftBackSupport;

		}

		const createRightBackSupport = (leftBackSupport) => {

			const rightBackSupport = leftBackSupport.clone();
			rightBackSupport.applyMatrix4(new THREE.Matrix4().makeTranslation(3, 0, 0));

			return rightBackSupport;

		}

		const createLeftBackSupportEdge = () => {

			const leftBackSupportEdgeGeometry = new THREE.TorusGeometry(0.05, 0.05, 2 * Math.SQRT2, 32);
			leftBackSupportEdgeGeometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
			leftBackSupportEdgeGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-1.5, 0, -1));
			const leftBackSupportEdgeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false });
			const leftBackSupportEdge = new THREE.Mesh(leftBackSupportEdgeGeometry, leftBackSupportEdgeMaterial);

			return leftBackSupportEdge;
		}

		const createRightBackSupportEdge = (leftBackSupportEdge) => {

			const rightBackSupportEdge = leftBackSupportEdge.clone();
			rightBackSupportEdge.applyMatrix4(new THREE.Matrix4().makeTranslation(3, 0, 0));

			return rightBackSupportEdge;

		}

		const leftBackSupport = createLeftBackSupport();
		const rightBackSupport = createRightBackSupport(leftBackSupport);
		const leftBackSupportEdge = createLeftBackSupportEdge();
		const rightBackSupportEdge = createRightBackSupportEdge(leftBackSupportEdge);

		this.goalSkeleton.push(leftBackSupport, rightBackSupport, leftBackSupportEdge, rightBackSupportEdge);



	} 
	
	createNets() {

		const backNet = createBackNet();
		const rightTriangleNet = createRightTriangleNet();
		const leftTriangleNet = createLeftTriangleNet(rightTriangleNet);

		this.nets.push(backNet, rightTriangleNet, leftTriangleNet);


		function createBackNet() {

			let pointA = new THREE.Vector3(0,1,0);
			let pointB = new THREE.Vector3(-1,0,0);
			const rectHeight = pointA.distanceTo(pointB);

			const netWidth = 3;
			const netHeight = rectHeight;
			const netDepth = 0.02;
			const netGeometry = new THREE.BoxGeometry(netWidth, netHeight, netDepth);
			const netMaterial = new THREE.MeshPhongMaterial({ 
				color: 0xd3d3d3,
				transparent: true,
				opacity: 0.5
			});
			const backNet = new THREE.Mesh(netGeometry, netMaterial);

			// Positioning
			backNet.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.5 * rectHeight, -1));

			// Translate the middle of the bottom part of the rectangle to the origin
			let backNetTranslationMatrix = new THREE.Matrix4().makeTranslation(0, 0, 1);
			backNet.applyMatrix4(backNetTranslationMatrix);

			// Apply 45 degrees rotation about X axis
			let rotationMatrix = new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(45));
			backNet.applyMatrix4(rotationMatrix);

			// Translate back to the original position
			let backNetTranslationMatrixInverse = backNetTranslationMatrix.invert();
			backNet.applyMatrix4(backNetTranslationMatrixInverse);

			return backNet;

		}

		function createRightTriangleNet() {

			let vertices = new Float32Array([
				1.5, 0, 0,    // vertex 1
				1.5, 0, -1,     // vertex 2
				1.5, 1, 0,      // vertex 3
			]);
			
			// Creating the right triangle net as shown in recitation 7
			const sideNetGeometry = new THREE.BufferGeometry();
			sideNetGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
			// BUG
			const sideNetMaterial = new THREE.MeshPhongMaterial({ 
				color: 0xd3d3d3,
				transparent: true,
				opacity: 0.5, 
				side: THREE.DoubleSide });
			const rightTriangleNet = new THREE.Mesh(sideNetGeometry, sideNetMaterial);

			return rightTriangleNet;

		}

		function createLeftTriangleNet(rightTriangleNet) {

			const leftTriangleNet = rightTriangleNet.clone();
			leftTriangleNet.applyMatrix4(new THREE.Matrix4().makeTranslation(-3, 0, 0));

			return leftTriangleNet;
		}
	}

	addToThreeObject() {

		for (var i = 0; i < this.goalSkeleton.length; i++) {
			this.goalThreeObject.add(this.goalSkeleton[i]);
		}

		for (var i = 0; i < this.nets.length; i++) {
			this.goalThreeObject.add(this.nets[i]);
		}
	}

}

const goal = new Goal();
scene.add(goal.goalThreeObject);

// --------------------------------------------------------------------------------------------------
// Ball

const ballGeometry = new THREE.SphereGeometry( 1/16, 32, 32 ); 
const ballTexture = new THREE.TextureLoader().load('src/textures/soccer_ball.jpg');
const ballMaterial = new THREE.MeshPhongMaterial( { map: ballTexture } );
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 100));

scene.add(ball);


// ------------------------------------------------------------------------------------------
// Routes

class Route {
	constructor(v0, v1, v2, bezierSplitPoints, routeNumber) {
		this.curve = new THREE.QuadraticBezierCurve3(v0, v1, v2);
		this.points = this.curve.getPoints(bezierSplitPoints);
		this.routeNumber = routeNumber;
	}
}

const leftWingerRoute = new Route(	
	new THREE.Vector3( 0, 0, 10 ),
	new THREE.Vector3( -5, 0, 5 ),
	new THREE.Vector3( 0, 0, 0 ),
	3000,
	0
	);

const centerForwardRoute = new Route(	
	new THREE.Vector3( 0, 0, 10 ),
	new THREE.Vector3( 0, 5, 5 ),
	new THREE.Vector3( 0, 0, 0 ),
	3000,
	1
	);

const rightWingerRoute = new Route(	
	new THREE.Vector3( 0, 0, 10 ),
	new THREE.Vector3( 5, 0, 5 ),
	new THREE.Vector3( 0, 0, 0 ),
	3000,
	2
	);

let routes = [leftWingerRoute, centerForwardRoute, rightWingerRoute];

const centerGeometry = new THREE.BufferGeometry().setFromPoints( centerForwardRoute.points );
const rightGeometry = new THREE.BufferGeometry().setFromPoints( rightWingerRoute.points );
const leftGeometry = new THREE.BufferGeometry().setFromPoints( leftWingerRoute.points );

const material = new THREE.LineBasicMaterial( { color: 0x000000 } );

// Create the final object to add to the scene
const centerCurveObject = new THREE.Line( centerGeometry, material );
const rightCurveObject = new THREE.Line( rightGeometry, material );
const leftCurveObject = new THREE.Line( leftGeometry, material );


// ------------------------------------------------------------------------------------------
// Cards

let counter = 0;

const CardType = {
	YELLOW: 'yellow',
	RED: 'red',
	VAR: 'var'
};

class Card {
	constructor(cardType, route, t_val) {

		const cardGeometry = new THREE.BoxGeometry(0.25, 0.5, 0.05);
		let cardTexture;

		if (cardType == CardType.YELLOW) {
			cardTexture = new THREE.TextureLoader().load('src/textures/yellow_card.jpg');
		} else if (cardType == CardType.RED) { 
			cardTexture = new THREE.TextureLoader().load('src/textures/red_card.jpg');
		} else {
			cardTexture = new THREE.TextureLoader().load('src/textures/VAR.png');

		}

		const cardMaterial = new THREE.MeshPhongMaterial({ map: cardTexture });
		const card = new THREE.Mesh(cardGeometry, cardMaterial);
		this.cardType = cardType;
		this.body  = card;

		this.route = route;
		this.t_val = t_val;

		this.position = this.route.curve.getPoint(t_val);
		this.body.applyMatrix4(new THREE.Matrix4().makeTranslation(this.position.x, this.position.y, this.position.z)); 
	}
}

let cards = [];

for(var i = 0; i < routes.length; i++) {

	for (var j = 0; j < Math.floor(Math.random() * 2) + 2; j++) {
		const yellow = new Card(CardType.YELLOW, routes[i], Math.random());
		const red = new Card(CardType.RED, routes[i], Math.random());
		const var_ = new Card(CardType.VAR, routes[i], Math.random());
		cards.push(yellow, red, var_);
	}

}

cards.sort((a, b) => a.t_val - b.t_val);

cards.forEach(card => {
	scene.add(card.body);
  });


// ------------------------------------------------------------------------------------------
// Flag

const flagPoleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 32);
flagPoleGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(2.5, 0.6, 0));
const flagPoleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const flagPole = new THREE.Mesh(flagPoleGeometry, flagPoleMaterial);

const flagGeometry = new THREE.PlaneGeometry(1.2, 0.75); 
const flagTexture = new THREE.TextureLoader().load('src/textures/RealMadrid.jpeg');
const flagMaterial = new THREE.MeshPhongMaterial( { map: flagTexture } );
const flag = new THREE.Mesh(flagGeometry, flagMaterial);
flag.applyMatrix4(new THREE.Matrix4().makeTranslation(3.1, 0.8, 0));

scene.add(flag, flagPole);

// ------------------------------------------------------------------------------------------
// Trophy

const trophyParts = [];
const shoesHeight = 0.08;
const legsHeight = goal.goalHeight / 4;
const upperBodyHeight = legsHeight;
const neckHeight = legsHeight / 7;
const headHeight = 5 * neckHeight;
const handsHeight = legsHeight;
const trophyColor = 'gold';
const platformHeight = 0.2;

// trophy platform 
const platformGeometry = new THREE.CylinderGeometry(0.25, 0.25,  platformHeight, 32);
platformGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, platformHeight / 2, 0));
const platformMaterial = new THREE.MeshPhongMaterial({ color: trophyColor });
const platform = new THREE.Mesh(platformGeometry, platformMaterial);
trophyParts.push(platform);

// left shoe 
const leftShoeGeometry = new THREE.BoxGeometry(shoesHeight, shoesHeight, 2 * shoesHeight);
leftShoeGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-0.075, shoesHeight / 2 + platformHeight, 0.02));
const leftShoeMaterial = new THREE.MeshPhongMaterial({ color: trophyColor });
const leftShoe = new THREE.Mesh(leftShoeGeometry, leftShoeMaterial);
trophyParts.push(leftShoe);

//  right shoe 
// Clone the left Shoe and translate the clone
const rightShoe = leftShoe.clone();
rightShoe.applyMatrix4(new THREE.Matrix4().makeTranslation(0.15, 0, 0));
trophyParts.push(rightShoe);

// left leg 
const leftLegGeometry = new THREE.CylinderGeometry(0.03, 0.03, legsHeight, 32);
leftLegGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-0.075, legsHeight / 2 + shoesHeight + platformHeight, 0));
const leftLegMaterial = new THREE.MeshPhongMaterial({ color: trophyColor });
const leftLeg = new THREE.Mesh(leftLegGeometry, leftLegMaterial);
trophyParts.push(leftLeg);

// right leg
// Clone the left leg and translate the clone
const rightLeg = leftLeg.clone();
rightLeg.applyMatrix4(new THREE.Matrix4().makeTranslation(0.15, 0, 0));
trophyParts.push(rightLeg);

// upper body
const upperBodyGeometry = new THREE.BoxGeometry(upperBodyHeight, upperBodyHeight, upperBodyHeight / 3);
upperBodyGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, upperBodyHeight / 2 + legsHeight + shoesHeight + platformHeight, 0));
const upperBodyMaterial = new THREE.MeshPhongMaterial({ color: trophyColor });
const upperBody = new THREE.Mesh(upperBodyGeometry, upperBodyMaterial);
trophyParts.push(upperBody);

// neck
const neckGeometry = new THREE.CylinderGeometry(0.03, 0.03, neckHeight, 32);
neckGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, neckHeight / 2 + upperBodyHeight + legsHeight + shoesHeight + platformHeight, 0));
const neckMaterial = new THREE.MeshPhongMaterial({ color: trophyColor });
const neck = new THREE.Mesh(neckGeometry, neckMaterial);
trophyParts.push(neck);

// head 
const headGeometry = new THREE.SphereGeometry(headHeight / 2, 32, 32 ); 
const headMaterial = neckMaterial; 
const head = new THREE.Mesh(headGeometry, headMaterial);
head.applyMatrix4(new THREE.Matrix4().makeTranslation(0, headHeight / 2 + neckHeight + upperBodyHeight + legsHeight + shoesHeight + platformHeight, 0));
trophyParts.push(head);

// left hand
const leftHandGeometry = new THREE.CylinderGeometry(0.03, 0.03, handsHeight, 32);
leftHandGeometry.applyMatrix4(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(-30)));
leftHandGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(upperBodyHeight * 0.6, handsHeight / 2 + upperBodyHeight * 0.75 + legsHeight + shoesHeight + platformHeight , 0));
const leftHandMaterial = new THREE.MeshPhongMaterial({ color: trophyColor });
const leftHand = new THREE.Mesh(leftHandGeometry, leftHandMaterial);
trophyParts.push(leftHand);

// right hand
const rightHandGeometry = new THREE.CylinderGeometry(0.03, 0.03, handsHeight, 32);
rightHandGeometry.applyMatrix4(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(30)));
rightHandGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(upperBodyHeight * -0.6, handsHeight / 2 + upperBodyHeight * 0.75 + legsHeight + shoesHeight + platformHeight , 0));
const rightHandMaterial = new THREE.MeshPhongMaterial({ color: trophyColor });
const rightHand = new THREE.Mesh(rightHandGeometry, rightHandMaterial);
trophyParts.push(rightHand);

// left glove
const gloveWidth = 0.08;
const gloveHeight = 0.1;
const gloveDepth = 0.08;

const leftGloveGeometry = new THREE.BoxGeometry(gloveWidth, gloveHeight, gloveDepth);
leftGloveGeometry.applyMatrix4(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(-30)));
leftGloveGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(upperBodyHeight * 0.6 + gloveWidth, handsHeight + upperBodyHeight * 0.75 + legsHeight + shoesHeight + platformHeight, 0));
const leftGloveMaterial = new THREE.MeshPhongMaterial({ color: trophyColor });
const leftGlove = new THREE.Mesh(leftGloveGeometry, leftGloveMaterial);
trophyParts.push(leftGlove);

// right glove
const rightGloveGeometry = new THREE.BoxGeometry(gloveWidth, gloveHeight, gloveDepth);
rightGloveGeometry.applyMatrix4(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(30)));
rightGloveGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(upperBodyHeight * -0.6 - gloveWidth, handsHeight + upperBodyHeight * 0.75 + legsHeight + shoesHeight + platformHeight, 0));
const rightGloveMaterial = new THREE.MeshPhongMaterial({ color: trophyColor });
const rightGlove = new THREE.Mesh(rightGloveGeometry, rightGloveMaterial);
trophyParts.push(rightGlove);

const trophy = new THREE.Group();
for (var i = 0; i < trophyParts.length; i++) {
	trophy.add(trophyParts[i]);
}

trophy.applyMatrix4(new THREE.Matrix4().makeTranslation(-1.5, 0, 0));
var currentTrophyMatrix = new THREE.Matrix4().copy(trophy.matrix);
var scaleMatrix = new THREE.Matrix4().makeScale(0.5, 0.5, 0.5);
trophy.applyMatrix4(currentTrophyMatrix.multiply(scaleMatrix));
scene.add(trophy);

// ------------------------------------------------------------------------------------------
// Controls Orbit

const controls = new OrbitControls(camera, renderer.domElement);

// ------------------------------------------------------------------------------------------
// States

let isOrbitEnabled = true;
let origin = new THREE.Vector3(0,0,0);
let closestCard = 0;
let currentRoute = 1;
let fairPlayScore = 0;
let numberOfYellowCards = 0;
let numberOfRedCards = 0;
let numberOfVarCards = 0;

// ------------------------------------------------------------------------------------------
// Events and Functions

const toggleOrbit = (e) => {
	if (e.key == "o") {
		isOrbitEnabled = !isOrbitEnabled;
	}
}

document.addEventListener('keydown', toggleOrbit)

// We wrote some of the function for you
const handle_keydown = (e) => {
	if(e.code == 'ArrowLeft'){
		currentRoute = (currentRoute === 0) ? 2 : (currentRoute - 1);
	} else if (e.code == 'ArrowRight'){
		currentRoute = (currentRoute === 2) ? 0 : (currentRoute + 1);
	}
}
document.addEventListener('keydown', handle_keydown);

controls.update();

function collision(card) {

	card.body.visible = false;

	if (card.cardType == CardType.YELLOW) {
		numberOfYellowCards++;
	} else if (card.cardType == CardType.RED) {
		numberOfRedCards++;
	} else if (card.cardType == CardType.VAR) {
		numberOfVarCards++;
	}

	let powerSum = -(numberOfYellowCards + 10*numberOfRedCards - 5*numberOfVarCards) / 10;
	fairPlayScore = 100 * (2 ** powerSum);
}

function onGoal() {
	let loader = new THREE.FontLoader();

	loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {

		let geometry = new THREE.TextGeometry(`Fair Play Score: ${fairPlayScore.toFixed(0)}`, {
			font: font,
			size: 0.2, // size of the text
			height: 0.02, // thickness to extrude text
		});

		let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		let text = new THREE.Mesh(geometry, material);
		text.applyMatrix4(new THREE.Matrix4().makeTranslation(-1.2, 1.1, 0));

		scene.add(text);
	});
}

function rotateBall() {

	let rotationMatrix = new THREE.Matrix4();
	rotationMatrix.makeRotationX(-0.02);
	ball.matrix.multiply(rotationMatrix);

	rotationMatrix.makeRotationY(-0.02);
	ball.matrix.multiply(rotationMatrix);

	ball.matrixAutoUpdate = false;
	ball.matrixWorldNeedsUpdate = true;
}

function rotateTrophy() {

	let rotationMatrix = new THREE.Matrix4();
	rotationMatrix.makeRotationY(-0.02);
	trophy.matrix.multiply(rotationMatrix);

	trophy.matrixAutoUpdate = false;
	trophy.matrixWorldNeedsUpdate = true;
}

function animate() {

	requestAnimationFrame( animate );

	controls.enabled = isOrbitEnabled;
	controls.update();

	let chosenRoute = routes[currentRoute];

	if (counter <= chosenRoute.points.length) {
		let t = counter / chosenRoute.points.length;
		if (t == 1) {
			onGoal();
		}
		else {
			rotateBall()
		}

		let positionNeedToBe = chosenRoute.curve.getPoint(t);
		let newX = positionNeedToBe.x - ball.position.x;
		let newY = positionNeedToBe.y - ball.position.y;
		let newZ = positionNeedToBe.z - ball.position.z;
		var translationMatrix = new THREE.Matrix4().makeTranslation(newX, newY, newZ);
		ball.applyMatrix4(translationMatrix);
		updateCameraPosition();
		if (t.toFixed(3) == cards[closestCard].t_val.toFixed(3) && currentRoute == cards[closestCard].route.routeNumber) {

			collision(cards[closestCard]);
			if (closestCard < cards.length - 1) {
				closestCard++;
			}
		} 
		else if (closestCard < cards.length && t.toFixed(3) > cards[closestCard].t_val.toFixed(3)) {
			cards[closestCard].body.visible = false;
			
			if (closestCard < cards.length - 1) {
			closestCard++;
			}
		}

		counter++;
	}

	if (counter == chosenRoute.points.length && camera.position.y > 0) {
		camera.lookAt(0, 1, 1);
		camera.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -2, 0));
	}
	
	rotateTrophy();

	renderer.render( scene, camera );

}
animate()