/* Engine Setup */

var Engine = Matter.Engine,
	Render = Matter.Render,
	Runner = Matter.Runner,
	Bodies = Matter.Bodies,
	Body = Matter.Body,
	Events = Matter.Events,
	Vector = Matter.Vector,
	Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create a renderer

var render = Render.create({
	element: document.getElementById("simulation"),
	engine: engine,
	options: {
		width: 1200,
		height: 500,
		wireframes: false,
		background: "#37C6FA",
	},
});

var ball = Bodies.circle(825, 420, 20, {
	friction: 0,
	frictionAir: 0,
	inverseInertia: 0,
	render: {
		fillStyle: "white",
		sprite: {
			texture: "./img/ball.png",
			xScale: 0.24,
			yScale: 0.24,
		},
	},
});

var ground = Bodies.rectangle(450, 470, 1500, 60, {
	isStatic: true,
	render: {
		lineWidth: 2,
		strokeStyle: "white",
		fillStyle: "#4CB050",
	},
});

var goalLineMarker = Bodies.rectangle(1000, 430, 10, 20, {
	isSensor: true,
	isStatic: true,
	render: {
		strokeStyle: "#000000",
		fillStyle: "white",
		lineWidth: 1,
	},
});

engine.world.gravity.y = 1;
// console.log(ball);

/* ---------------------------------------------------------------------- */

let d = 25; // d is the distance.
let theta = 0; // theta is the firing angle.
var v0 = 0; // v0 is the initial velocity.
let t1 = 0; //  t1 is the time to reach the max height.
let h_max = 0; // h_max is the max height.
let t2 = 0; // t2 is the time to reach the goal.
let h_goal = 0; // h_goal is the ball height at goal plane arrival point.
var trail = [];

const distanceInput = document.getElementById("distance-input");
const angleInput = document.getElementById("angle-input");
const velocityInput = document.getElementById("velocity-input");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const maxHeight = document.getElementById("max-height");
const heightFromGoal = document.getElementById("height-from-goal");
const distanceValue = document.getElementById("distance-value");
const angleValue = document.getElementById("angle-value");
const velocityValue = document.getElementById("velocity-value");
const simulationDiv = document.getElementById("simulation");

/* Distance Slider*/

distanceInput.addEventListener("input", () => {
	d = distanceInput.value;
	distanceValue.textContent = d;

	// max distance = 100 m but in pixels = 700px
	// distance in px = 700 * distance / 100

	Body.setPosition(ball, { x: 850 - d * 7, y: 420 });
});

/* Angle Slider*/

angleInput.addEventListener("input", () => {
	theta = angleInput.value;
	angleValue.textContent = theta;
});

/* Velocity Slider*/

velocityInput.addEventListener("input", () => {
	v0 = velocityInput.value;
	velocityValue.textContent = v0;
});

/* Start Button */

startBtn.addEventListener("click", startAnimation);

/* Reset Button */

resetBtn.addEventListener("click", resetAnimation);

/* ----------------------- Rendering the World and Running the Engine -------------------------- */

Composite.add(engine.world, [ball, ground, goalLineMarker]);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);
/* ---------------------------------------------------------------- */

/* Start Function */

function startAnimation() {
	if (v0 != 0) {
		theta = theta * (Math.PI / 180);
		t1 = (v0 * Math.sin(theta)) / 9.8;
		h_max = v0 * Math.sin(theta) * t1 - 0.5 * 9.8 * t1 ** 2;
		t2 = d / (v0 * Math.cos(theta));
		h_goal = h_max - 0.5 * 9.8 * (t2 - t1) ** 2;
		maxHeight.textContent = h_max.toFixed(2);
		heightFromGoal.textContent = h_goal.toFixed(2);

		let vx, vy;
		vx = v0 * Math.cos(theta);
		vy = -v0 * Math.sin(theta);
		Body.setVelocity(ball, { x: vx, y: vy });

		Events.on(render, "afterRender", addingPath);

		// for checking
		console.log(`time: ${t1}, max.Height: ${h_max}`);
		console.log(`time: ${t2}, ball.Height: ${h_goal}`);
	}
}

/* Adding Path funciton */

function addingPath() {
	trail.unshift({
		position: Vector.clone(ball.position),
		speed: ball.speed,
	});

	Render.startViewTransform(render);
	render.context.globalAlpha = 0.7;

	for (var i = 0; i < trail.length; i += 1) {
		var point = trail[i].position,
			speed = trail[i].speed;

		// var hue = 250 + Math.round((1 - Math.min(1, speed / 10)) * 170);
		// render.context.fillStyle = "hsl(" + hue + ", 100%, 55%)";
		render.context.fillStyle = "#5A5A5A";
		render.context.fillRect(point.x, point.y, 4, 4);
	}

	render.context.globalAlpha = 1;
	Render.endViewTransform(render);

	if (trail.length > 2000) {
		trail.pop();
	}
}

/* Reset Function */
function resetAnimation() {
	velocityInput.value = 0;
	distanceInput.value = 25;
	angleInput.value = 0;
	angleValue.textContent = 0;
	velocityValue.textContent = 0;
	distanceValue.textContent = 25;
	maxHeight.textContent = " 0";
	heightFromGoal.textContent = " 0";
	
	d = 25; 
	theta = 0; 
	v0 = 0; 
	t1 = 0; 
	h_max = 0; 
	t2 = 0; 
	h_goal = 0; 
	trail = [];

	Body.setPosition(ball, { x: 825, y: 420 });
	Body.setVelocity(ball, { x: v0, y: v0 });
	Events.off(render, "afterRender", addingPath);
}
