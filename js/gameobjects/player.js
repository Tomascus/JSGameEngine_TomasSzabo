// Importing necessary components and resources
import GameObject from '../base/gameobject.js';
import Renderer from '../components/renderer.js';
import Physics from '../components/physics.js';
import Input from '../components/input.js';
import { Images } from '../components/resources.js';
import Enemy from './enemy.js';
import Platform from './platform.js';
import Collectible from './collectible.js';
import ParticleSystem from '../components/particleSystem.js';
import GrappleLine from './GrappleLine.js';


// Defining a class Player that extends GameObject
class Player extends GameObject {
  // Constructor initializes the game object and add necessary components
  constructor(x, y) {
    super(x, y); // Call parent's constructor
    this.renderer = new Renderer('blue', 60, 60, Images.player); // Add renderer
    this.addComponent(this.renderer);
    this.addComponent(new Physics({ x: 0, y: 0 }, { x: 0, y: 0 })); // Add physics
    this.addComponent(new Input()); // Add input for handling user input
    // Initialize all the player specific properties
    this.direction = 1;
    this.lives = 3;
    this.score = 0;
    this.isOnPlatform = false;
    this.isJumping = false;
    this.jumpForce = 300;
    this.jumpTime = 0.3;
    this.jumpTimer = 0;
    this.dashSpeed = 1000; 
    this.dashTimer = 0; // Sets it to dashTime when the dash has started 
    this.dashTime = 0.2; // Duration of the dash in seconds
    this.dashCooldown = 0; 
    this.isInvulnerable = false;
    this.isGamepadMovement = false;
    this.isGamepadJump = false;
    this.canGrapple = true;
    this.wasSpacePressed = false; 
  }

  // The update function runs every frame and contains game logic
  update(deltaTime) {
    const physics = this.getComponent(Physics); // Get physics component
    const input = this.getComponent(Input); // Get input component

    this.handleGamepadInput(input);
    
  // Grappling hook mechanic
  if (input.isKeyDown('Space')) {
  if (this.canGrapple && !this.wasSpacePressed) {
    // Get current mouse position and store it as target position
    this.targetPosition = input.getMousePosition();
    console.log(this.targetPosition); // Logs the mouse position checks in console for my testing

   // Attach GrappleLine component
        const grappleLine = new GrappleLine(
          { x: this.x + this.renderer.width / 2, y: this.y + this.renderer.height / 2 }, // Adjust the starting point
          { x: this.targetPosition.x, y: this.targetPosition.y }
        );
        this.addComponent(grappleLine);


    this.wasSpacePressed = true; // set the space pressed to true so that the target position is not updated further while grappling
    this.canGrapple = false; // Set the Grap. hook to false until the next time the button is pressed 
  }

  // Update the players position while space key is held down every frame
  // Move the player towards the target position when we have the target position of the mouse
  const speed = 1000; // Speed of moving towards the mouse 
  if (this.targetPosition) {
    //Calculations for the destination with help from GITHUB COPILOT
    const dx = this.targetPosition.x - this.x;
    const dy = this.targetPosition.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {
      this.x += dx / distance * speed * deltaTime;
      this.y += dy / distance * speed * deltaTime;

      // Update the end position of the grapple line
      const grappleLine = this.getComponent(GrappleLine);
      if (grappleLine) {
        grappleLine.endPosition = { x: this.x, y: this.y };
      }
      

     /* // Set player's velocity based on the direction of the grapple hook
      physics.velocity.x = dx / distance * speed;
      physics.velocity.y = dy / distance * speed;*/

    }
  }
} else {
  this.canGrapple = true; // Resets the grappling hook to be used again
  this.targetPosition = null; // Resets the target position after the action is done
  this.wasSpacePressed = false; // Resets the space action after the action is done (prob. could be done simpler but this worked for me)

  // Remove the grapple line when space is released
  this.removeComponent(GrappleLine);

  /* this.x += physics.velocity.x * deltaTime;
  this.y += physics.velocity.y * deltaTime;*/
}

    // Handle player movement
    if (!this.isGamepadMovement && input.isKeyDown('ArrowRight') || (input.isKeyDown('KeyD'))) {
      physics.velocity.x = 300;
      this.direction = -1;
    } else if (!this.isGamepadMovement && input.isKeyDown('ArrowLeft') || (input.isKeyDown('KeyA'))) {
      physics.velocity.x = -300;
      this.direction = 1;
    } else if (!this.isGamepadMovement) {
      physics.velocity.x = 0;
    }

    // Handle player jumping
    if ((!this.isGamepadJump && input.isKeyDown('ArrowUp')) || (input.isKeyDown('KeyW') && this.isOnPlatform)) {
      this.startJump();
    }

    if (this.isJumping) {
      this.updateJump(deltaTime);
    }

     // Handle player dashing
     if (input.isKeyDown('KeyE')) { // Assuming 'E' is the dash key
      this.startDash();
    }
    
    //Counts down to 0, when the dash stops and the cooldown begins
    if (this.dashTimer > 0) {
      physics.velocity.x -= this.direction * this.dashSpeed; // minus value to accurately dash in the direction of the player
      this.dashTimer -= deltaTime;
    }
    
    //Counts down time to next available dash
    if (this.dashCooldown > 0) {
      this.dashCooldown -= deltaTime;
    }

    // Handle collisions with collectibles
    const collectibles = this.game.gameObjects.filter((obj) => obj instanceof Collectible);
    for (const collectible of collectibles) {
      if (physics.isColliding(collectible.getComponent(Physics))) {
        this.collect(collectible);
        this.game.removeGameObject(collectible);
      }
    }
  
    // Handle collisions with enemies
    const enemies = this.game.gameObjects.filter((obj) => obj instanceof Enemy);
    for (const enemy of enemies) {
      if (physics.isColliding(enemy.getComponent(Physics))) {
        this.collidedWithEnemy();
      }
    }
  
    // Handle collisions with platforms
    this.isOnPlatform = false;  // Reset this before checking collisions with platforms
    const platforms = this.game.gameObjects.filter((obj) => obj instanceof Platform);
    for (const platform of platforms) {
      if (physics.isColliding(platform.getComponent(Physics))) {
        if (!this.isJumping) {
          physics.velocity.y = 0;
          physics.acceleration.y = 0;
          this.y = platform.y + 10 - this.renderer.height;
          this.isOnPlatform = true;
        }
      }
    }
  
    // Check if player has fallen off the bottom of the screen
    if (this.y > this.game.canvas.height) {
      this.resetPlayerState();
    }

    // Check if player has no lives left
    if (this.lives <= 0) {
      location.reload();
    }

    // Check if player has collected all collectibles
    if (this.score >= 3) {
      console.log('You win!');
      location.reload();
    }

    super.update(deltaTime);

    
  }

  handleGamepadInput(input){
    const gamepad = input.getGamepad(); // Get the gamepad input
    const physics = this.getComponent(Physics); // Get physics component
    if (gamepad) {
      // Reset the gamepad flags
      this.isGamepadMovement = false;
      this.isGamepadJump = false;

      // Handle movement
      const horizontalAxis = gamepad.axes[0];
      // Move right
      if (horizontalAxis > 0.1) {
        this.isGamepadMovement = true;
        physics.velocity.x = 100;
        this.direction = -1;
      } 
      // Move left
      else if (horizontalAxis < -0.1) {
        this.isGamepadMovement = true;
        physics.velocity.x = -100;
        this.direction = 1;
      } 
      // Stop
      else {
        physics.velocity.x = 0;
      }
      
      // Handle jump, using gamepad button 0 (typically the 'A' button on most gamepads)
      if (input.isGamepadButtonDown(0) && this.isOnPlatform) {
        this.isGamepadJump = true;
        this.startJump();
      }

      // Handle dash, using gamepad button 1 (typically the 'B' button on most gamepads)
      if (input.isGamepadButtonDown(1)) {
      this.startDash();
      }
    }
  }

  startJump() {
    // Initiate a jump if the player is on a platform
    if (this.isOnPlatform) { 
      this.isJumping = true;
      this.jumpTimer = this.jumpTime;
      this.getComponent(Physics).velocity.y = -this.jumpForce;
      this.isOnPlatform = false;
    }
  }
  
  updateJump(deltaTime) {
    // Updates the jump progress over time
    this.jumpTimer -= deltaTime;
    if (this.jumpTimer <= 0 || this.getComponent(Physics).velocity.y > 0) {
      this.isJumping = false;
    }
  }

  startDash() {
    // Only start a dash if the player is not already dashing
    if (this.dashTimer <= 0 && this.dashCooldown <= 0) { 
      this.dashTimer = this.dashTime;
      this.dashCooldown = 1; // Set cooldown to 1 sec
    }
  }

  collidedWithEnemy() {
    // Checks collision with an enemy and reduce player's life if not invulnerable
    if (!this.isInvulnerable) {
      this.lives--;
      this.isInvulnerable = true;
      // Make player vulnerable again after 2 seconds
      setTimeout(() => {
        this.isInvulnerable = false;
      }, 2000);
    }
  }

  collect(collectible) {
    // Handle collectible pickup
    this.score += collectible.value;
    console.log(`Score: ${this.score}`);
    this.emitCollectParticles(collectible);
  }

  emitCollectParticles() {
    // Create a particle system at the player's position when a collectible is collected
    const particleSystem = new ParticleSystem(this.x, this.y, 'blue', 20, 1, 0.5);
    this.game.addGameObject(particleSystem);
  }

  resetPlayerState() {
    // Reset the player's state, repositioning it and nullifying movement
    this.x = this.game.canvas.width / 2;
    this.y = this.game.canvas.height / 2;
    this.getComponent(Physics).velocity = { x: 0, y: 0 };
    this.getComponent(Physics).acceleration = { x: 0, y: 0 };
    this.direction = 1;
    this.isOnPlatform = false;
    this.isJumping = false;
    this.jumpTimer = 0;
  }

  resetGame() {
    // Reset the game state, which includes the player's state
    this.lives = 3;
    this.score = 0;
    this.resetPlayerState();
  }
}

export default Player;
