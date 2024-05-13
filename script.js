// Global variable
let isRunning = false;
let AIR_FRICTION = 0.2;
let apply_physics = true;

// Get settings
const spring_constant_input = document.getElementById('springConstant');
const air_friction_input = document.getElementById('airFriction');
const mass_input = document.getElementById('mass');
const start_button = document.getElementById('start');
const stop_button = document.getElementById('stop');
const reset_button = document.getElementById('reset');
const status_label = document.getElementById('status');

// Canvas set up
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Get the device pixel ratio, falling back to 1.
const dpr = window.devicePixelRatio || 1;

// Get the size of the canvas in CSS pixels.
const canvas_rect = canvas.getBoundingClientRect();

// Give the canvas pixel dimensions of their CSS
// size * the device pixel ratio.
canvas.width = canvas_rect.width * dpr;
canvas.height = canvas_rect.height * dpr;

// Scale all drawing operations by the dpr, so everything is drawn at the correct resolution.
ctx.scale(dpr, dpr);

// Now, set the canvas style width and height back to the CSS dimensions
canvas.style.width = canvas_rect.width + 'px';
canvas.style.height = canvas_rect.height + 'px';


class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    plus(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }
    minus(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    scalar_product(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
}

class Particle {
    constructor(radius, mass, pos) {
        this.mass = mass;
        this.position = pos;
        this.velocity = new Vector2D(0, 0);
        this.acceleration = new Vector2D(0, 0);
        this.radius = radius;
    }
    
    apply_forces(forces) {
        const total_force = forces.reduce((acc, force) => acc.plus(force), new Vector2D(0, 0));
        this.acceleration = total_force.multiply(1 / this.mass);
    }
    
    integrate(delta_time) {
        this.position = this.position.plus(this.velocity.multiply(delta_time));
        this.velocity = this.velocity.plus(this.acceleration.multiply(delta_time));
        
        if (this.position.y > canvas_rect.height - this.radius) {
            this.position.y = canvas_rect.height - this.radius;
            this.velocity.y = 0;
            this.acceleration.y = 0;
        }
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fill();
    }
}

class Spring {
    constructor(particle1, particle2, spring_constant, rest_length) {
        this.particle1 = particle1;
        this.particle2 = particle2;
        this.spring_constant = spring_constant;
        this.rest_length = rest_length;
    }
    
    get_force() {
        const displacement = this.particle1.position.minus(this.particle2.position);
        const distance = displacement.length();
        const shift = distance - this.rest_length;

        // Calculate the force magnitude (Hooke's law: F = -k * x)
        const forceMagnitude = this.spring_constant * shift;

        // Normalize the displacement vector and then scale by the force magnitude
        const force = displacement.multiply(forceMagnitude / distance);

        return force;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgb(255, 255, 255)';
        ctx.moveTo(this.particle1.position.x, this.particle1.position.y);
        ctx.lineTo(this.particle2.position.x, this.particle2.position.y);
        ctx.stroke();
    }
}

const GRAVITY = new Vector2D(0, 10);

const fixedParticle = new Particle(25, 0, new Vector2D(canvas_rect.width / 2, 100));
const myParticle = new Particle(25, 30, new Vector2D(canvas_rect.width / 2, canvas_rect.height / 2));
const mySpring = new Spring(fixedParticle, myParticle, 1, canvas_rect.height / 2 - 10);

const draw = () => {
    ctx.clearRect(0, 0, canvas_rect.width, canvas_rect.height);
    myParticle.draw(ctx);
    fixedParticle.draw(ctx);
    mySpring.draw(ctx);

}

const update = () => {
    if (!isRunning) {
        return;
    }

    // Apply physics
    if (apply_physics) {
        const forces = [mySpring.get_force(), myParticle.velocity.multiply(-1 * AIR_FRICTION), GRAVITY];
        myParticle.apply_forces(forces);
        
        myParticle.integrate(0.1);
    }

    // Draw
    draw();

    requestAnimationFrame(update);
}

const getMousePos = (event) => {
    const result = new Vector2D(
        (event.clientX - canvas_rect.left), 
        (event.clientY - canvas_rect.top)
    );
    
    return result;
};

document.addEventListener('mousedown', (event) => {
    // Drag
    const mouse = getMousePos(event);
    const distance = myParticle.position.minus(mouse).length();

    console.log(`Mouse pos: ${mouse.x}, ${mouse.y}`);
    console.log(`Particle pos: ${myParticle.position.x}, ${myParticle.position.y}`);

    if (distance < myParticle.radius && isRunning) {
        apply_physics = false;
        myParticle.velocity = new Vector2D(0, 0);
        myParticle.acceleration = new Vector2D(0, 0);

        // Create a specific function for mousemove
        const moveParticle = (event) => {
            const mouse = getMousePos(event);

            // Check if the particle is not dragged out of the canvas nad higher than the fixed particle
            if (mouse.x < myParticle.radius || 
                mouse.x > canvas_rect.width - myParticle.radius || 
                mouse.y > canvas_rect.height - myParticle.radius ||
                mouse.y < fixedParticle.position.y + myParticle.radius) {
                return;
            }

            myParticle.position = new Vector2D(mouse.x, mouse.y);
        };

        // Add the mousemove listener
        document.addEventListener('mousemove', moveParticle);

        // Remove the mousemove listener on mouseup
        const stopDragging = () => {
            document.removeEventListener('mousemove', moveParticle);
            document.removeEventListener('mouseup', stopDragging); // Clean up the mouseup listener itself
            apply_physics = true;
        };

        // Add the mouseup listener
        document.addEventListener('mouseup', stopDragging);
    }
});

start_button.addEventListener('click', () => {
    if (isRunning) {
        return;
    }

    // Update values
    const spring_constant = parseFloat(spring_constant_input.value);
    const air_friction = parseFloat(air_friction_input.value);
    const mass = parseFloat(mass_input.value);

    myParticle.mass = mass;
    mySpring.spring_constant = spring_constant;
    AIR_FRICTION = air_friction;

    isRunning = true;
    status_label.innerHTML = 'Status: Running';
    update();
});

stop_button.addEventListener('click', () => {
    isRunning = false;
    status_label.innerHTML = 'Status: Stopped';
});

reset_button.addEventListener('click', () => {
    myParticle.position = new Vector2D(canvas_rect.width / 2, canvas_rect.height / 2);
    myParticle.velocity = new Vector2D(0, 0);
    myParticle.acceleration = new Vector2D(0, 0);

    isRunning = false;
    status_label.innerHTML = 'Status: Stopped';

    draw();
});
