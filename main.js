let system;



const GRAVITATIONAL_CONSTANT = -200

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  system = new ParticleSystem(createVector(width / 2, 50));
//   console.log(createVector(width / 2, 50))

//   frameRate(200); // Attempt to refresh at starting FPS

}

function draw() {
  background(51);

  system.run();
}

function mouseClicked() {
    // console.log('starting vector', createVector(mouseX, mouseY))
    system.addParticle(createVector(mouseX, mouseY));

}

function keyPressed() {
    console.log(keyCode)
    if (keyCode === 84){
        system.addTinyParticle(createVector(mouseX, mouseY)) // T -- make a tiny particle
    } else if (keyCode === 83) {    // S -- make everything slow down
        system.slow()
    } else if (keyCode === 70) { // F -- make everything move faster
        system.fast()
    } else if (keyCode === 76) {  // L -- change if lines are shown 
        system.showLines()
    }   else { // Any Key --- SPAWN BLACK HOLE
        system.addShape(mouseX, mouseY)
    }
}

function keyReleased() {
    system.removeShape()
}

class Particle {
    constructor(position, position_number, shape = false) {
        this.shape = 'shape' === shape
        this.acceleration = createVector(0, 0.00);
        this.velocity = createVector(0, 0);
        this.position = position.copy();
        this.position_number = position_number
        this.mass = shape == 'shape' ? 9000 : shape == 'tiny' ? .3 : 10 * Math.random()
        this.color_R = ( Math.random() * .8 + .2) * 255
        this.color_G = ( Math.random() * .8 + .2) * 255
        this.color_B = ( Math.random() * .8 + .2) * 255
        this.lifespan = 20
        this.trail = []
    }

    run = function(particles, shapes) {
        this.update(particles, shapes);
        this.display();
      };
    
    update = function(particles, shapes){
        if (this.shape) return
        this.trail.push( {  x: this.position.x, y: this.position.y, lifespan: this.lifespan, })
        if (this.position.x > width || this.position.x < 0){
            this.velocity.x *= -1
        }
        if (this.position.y > window.innerHeight || this.position.y < 0){
            this.velocity.y *= -1
        }
        this.velocity.add(this.nBodyPhysics(particles, shapes));
        this.position.add(this.velocity);
        this.velocity.x *= .999
        this.velocity.y *= .999
    };

    display = function() {
        if (this.shape) {
            fill(0)
            stroke (0)
            strokeWeight(100)
            ellipse(this.position.x, this.position.y, 100, 100)
        } else {
            for (let trail_piece of this.trail) {
                strokeWeight(0)
                stroke(32)
                fill(color(this.color_R, this.color_G, this.color_B, trail_piece.lifespan));
                ellipse(trail_piece.x, trail_piece.y, 8 * this.mass, 8 * this.mass);
                trail_piece.lifespan -= .1
                if (trail_piece.lifespan < 1) this.trail.shift()
            }
            strokeWeight(1);
            fill(color(this.color_R, this.color_G, this.color_B));
            ellipse(this.position.x, this.position.y, 8 * this.mass, 8 * this.mass);
        }
       
        
    };

    isDead = () => {
        return this.lifespan < 0
    }

    nBodyPhysics = (particles, shapes) => {

        let x_component = 0, y_component = 0
        for (let i = 0; i < particles.length + shapes.length && particles.length > 1; i++) {
            
            if (i === this.position_number) continue

            let p

            if (i < particles.length){
                p = particles[i]

            } else {
                p = shapes[i - particles.length]
            }
            

            let x_distance = this.position.x - p.position.x
            let y_distance = this.position.y - p.position.y

           
            let total_distance =  Math.sqrt(  Math.abs( x_distance)**2 + Math.abs(y_distance)**2)

            // console.log('total_distance', total_distance)
            if (total_distance < 80 ) continue

            let gravitational_force = GRAVITATIONAL_CONSTANT * p.mass * this.mass / ( total_distance ** 2 )

            if (gravitational_force < -100 ) continue

            let cos = x_distance / total_distance 
            let sin = y_distance / total_distance

            cos = cos > 1 ? 1 : cos
            sin = sin > 1 ? 1 : sin

            // console.log('gravitational_force, cos, sin', gravitational_force, cos, sin)

            x_component += cos * gravitational_force
            y_component += sin * gravitational_force

            // console.log('x and y',x_component, y_component)

        }

        return createVector(x_component /  (this.mass **2 ), y_component / (this.mass **2) )

    }

}

class ParticleSystem{ 
    constructor(position) {
        this.particles = [];
        this.shapes = [];
        this.field = [[]]
        this.LINES = 30
        this.frame_count = 0
        this.show_lines = false
    }

    showLines = () => this.show_lines = !this.show_lines

    createFieldLines = () => {
        let { particles , shapes, LINES } = this
        this.field = []
        for (let x = 0; x < LINES; x++ ) {
            this.field.push([])
            for ( let y = 0; y < LINES; y++){


                let x_component = 0, y_component = 0
                for (let i = 0; i < particles.length + shapes.length && particles.length > 1; i++) {
                    
        
                    let p
        
                    if (i < particles.length){
                        p = particles[i]
        
                    } else {
                        p = shapes[i - particles.length]
                    }
                    
        
                    let x_distance = width / this.LINES * x - p.position.x
                    let y_distance = height / this.LINES * y - p.position.y

                    // console.log(x, y)

                    // console.log(x_distance, Math.abs(x_distance)**2)
        
                    
                    let total_distance =  Math.sqrt(  Math.abs( x_distance)**2 + Math.abs(y_distance)**2)
        

        
                    let gravitational_force = GRAVITATIONAL_CONSTANT * p.mass * 1 / ( total_distance ** 2 )

                    
        
                  
        
                    let cos = x_distance / total_distance 
                    let sin = y_distance / total_distance

        
                    // cos = cos > 1 ? 1 : cos < -1 ? -1 : cos
                    // sin = sin > 1 ? 1 : sin < -1 ? -1 : sin
        
                    // console.log('gravitational_force, cos, sin', gravitational_force, cos, sin)
                    
                    x_component += cos * gravitational_force
                    y_component += sin * gravitational_force

                    // if (x_component > 10 || y_component > 10) console.log(sin, cos, total_distance, x_distance, y_distance)
        
                    // console.log('x and y',x_component, y_component)
        
                }
        
                const gravitational_field_vector = createVector(x_component  , y_component  )
                this.field[x][y] = gravitational_field_vector
            }
        }
    }

    displayFieldLines = () => {
        for (let i = 0; i < this.LINES; i++){
            for (let j = 0; j < this.LINES; j++) {
                const MAX_LENGTH = 40
                let current_vector = this.field[i]?.[j]
                let x_coord = width / this.LINES * i
                let y_coord = height / this.LINES * j

                let x_length = current_vector?.x * 10000
                let y_length = current_vector?.y * 10000


                strokeWeight(0)
                fill('#4158D0')

                circle(x_coord, y_coord, 3)
                strokeWeight(1)
                stroke(255)
                if (x_length < 3 && y_length < 3 && x_length > -3 && y_length > -3 ) continue
                x_length = (x_length < -MAX_LENGTH || x_length > MAX_LENGTH) ? Math.sign(x_length) * MAX_LENGTH : x_length
                y_length = (y_length < -MAX_LENGTH  || y_length > MAX_LENGTH ) ? Math.sign(y_length) * MAX_LENGTH : y_length


                // console.log(current_vector)
                line(x_coord, y_coord, x_coord + x_length, y_coord + y_length)
            }
        }
    }

    slow = () => {
        this.particles.forEach( v => {
            v.velocity.x *= .75
            v.velocity.y *= .75
        })
    }

    fast = () => {
        this.particles.forEach( v => {
            v.velocity.x *= 1.25
            v.velocity.y *= 1.25
        })
    }

    addParticle = function(creationVector) {
        this.particles.push(new Particle(creationVector, this.particles.length));
    };

    addTinyParticle = function(creationVector) {
        this.particles.push(new Particle(creationVector, this.particles.length, 'tiny'));
    };

    addShape = ( mouseX, mouseY) => {
        this.shapes.push(new Particle(createVector(mouseX, mouseY), 1, 'shape'))
    }

    removeShape = () => this.shapes.shift()

    run = function() {
        for (let i = this.particles.length-1; i >= 0; i--) {
            let p = this.particles[i];
            p.run(this.particles, this.shapes);
           
        }
        for (let i = 0; i < this.shapes.length; i++){
            this.shapes[i].run()
        }
        if (this.show_lines){
            if (this.frame_count === 3) {
                this.frame_count = -1
                this.createFieldLines()
            }
            this.frame_count++
            this.displayFieldLines()
    
        }
        
        
    };
}

