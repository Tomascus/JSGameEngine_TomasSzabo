// Importing necessary components and resources
import GameObject from '../base/gameobject.js';
import Renderer from '../components/renderer.js';
import Physics from '../components/physics.js';
import Input from '../components/input.js';
import { Images, AudioFiles  } from '../components/resources.js';
import Enemy from './enemy.js';
import Platform from './platform.js';
import Wall from './wall.js';
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
    this.isOnWall = false;
    this.isJumping = false;
    this.jumpForce = 300;
    this.jumpTime = 0.6;
    this.jumpTimer = 0;
    this.dashSpeed = 1000; 
    this.dashTimer = 0; // Sets it to dashTime when the dash has started 
    this.dashTime = 0.2; // Duration of the dash in seconds
    this.dashCooldown = 0; 
    this.isInvulnerable = false;
    this.isGamepadMovement = false;
    this.isGamepadJump = false;
    this.canGrapple = true;
    this.SpacePressed = false; 
    this.maxJumps = 2; // Maximum number of jumps
    this.jumpsLeft = this.maxJumps; // Tracks jumps left
    this.jumpSound = new Audio(AudioFiles.jump);
    this.dashSound = new Audio(AudioFiles.dash);
    this.collectSound = new Audio(AudioFiles.collect);
    this.ropeSound = new Audio(AudioFiles.rope);
  }

  // The update function runs every frame and contains game logic
  update(deltaTime) {
    const physics = this.getComponent(Physics); // Get physics component
    const input = this.getComponent(Input); // Get input component

    this.handleGamepadInput(input);
    
  // Grappling hook mechanic
  if (input.isKeyDown('Space')) {
  if (this.canGrapple && !this.SpacePressed) {
    // Get current mouse position and store it as target position
    let targetPosition = input.getMousePosition();
    this.ropeSound.play();
    

    // Calculate distance between player and target position USING GITHUB COPILOT
    let dx = targetPosition.x - this.x;
    let dy = targetPosition.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Limit the maximum distance HELPED WITH GITHUB COPILOT
    const maxDistance = 500; 
    if (distance > maxDistance) {
      // Adjust target position to be at maximum distance from player
      let ratio = maxDistance / distance;
      targetPosition.x = this.x + dx * ratio;
      targetPosition.y = this.y + dy * ratio;
    }

    this.targetPosition = targetPosition;
    console.log(this.targetPosition); // Logs the mouse position checks in console for my testing

    // Attach GrappleLine component
    const grappleLine = new GrappleLine(
      { x: this.targetPosition.x, y: this.targetPosition.y }, // Start from the mouse position
      { x: this.x + this.renderer.width / 2, y: this.y + this.renderer.height / 2 } // End at the player's position
    );
    this.addComponent(grappleLine);

    this.SpacePressed = true; // set the space pressed to true so that the target position is not updated further while grappling
    this.canGrapple = false; // Set the Grap. hook to false until the next time the button is pressed 
  }

  // Update the players position while space key is held down every frame and move towards the target position
  const speed = 1000; // speed of moving towards the end of the rope
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
  

    }
  }
} else {
  this.canGrapple = true; // Resets the grappling hook to be used again
  this.targetPosition = null; // Resets the target position after the action is done
  this.SpacePressed = false; // Resets the space action after the action is done (prob. could be done simpler but this worked for me)

  // Remove the grapple line when space is released
  this.removeComponent(GrappleLine);

 
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
    if ((!this.isGamepadJump && input.isKeyDown('ArrowUp')) && this.jumpsLeft > 0 || (input.isKeyDown('KeyW') && this.jumpsLeft > 0)) {
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
        this.collectSound.play();
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
          this.y = (platform.y + 10 ) - this.renderer.height;
          this.isOnPlatform = true;
          this.jumpsLeft = this.maxJumps; // Resets jumps left when on a platfrom
        }
      }
    }

    // Check for collisions with walls
    this.isOnWall = false;
    const walls = this.game.gameObjects.filter((obj) => obj instanceof Wall);
    for (const wall of walls) {
      if (physics.isColliding(wall.getComponent(Physics))) {
      physics.velocity.x = 0;
      this.x = wall.x + this.renderer.width;
      this.isOnWall = true;
    }
  }

   
  
    //With a help of GITHUB COPILOT set custom height of the game to set boundaries of the level
    const GAME_HEIGHT = 6000; 

    // Check if player has fallen off the bottom of the screen
    if (this.y > GAME_HEIGHT) {
      this.resetPlayerState();
    }

  // Creating message was IMPLMEMENTED WITH GITHUB COPILOT
  // Check if player has no lives left 
  if (this.lives <= 0) {
  // Create a "You lost" message
  const message = document.createElement('div');
  message.style.position = 'absolute';
  message.style.top = '50%';
  message.style.left = '50%';
  message.style.transform = 'translate(-50%, -50%)';
  message.style.fontSize = '100px';
  message.style.color = 'red';
  message.textContent = 'You lost, Restarting...';

  // Add the message to the body
  document.body.appendChild(message);

  // Wait for 3 seconds, remove the text and reset the game
  setTimeout(() => {
    location.reload();
    document.body.removeChild(message);
  }, 3000);
}

    // Creating message was IMPLMEMENTED WITH GITHUB COPILOT
    // Check if player has collected all collectibles
    if (this.score >= 1000) {
      // Create a "You win" message
    const message = document.createElement('div');
    message.style.position = 'absolute';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.fontSize = '100px';
    message.style.color = 'gold';
    message.textContent = 'You win!';

    // Add the message to the body
    document.body.appendChild(message);

    // Wait for 10 seconds, then reload the page and remove the message
    setTimeout(() => {
      location.reload();
      document.body.removeChild(message);
    }, 10000);
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
    // Starts a jump if the player is not already jumping and has jumps any jumps left
    if (this.jumpsLeft > 0 && !this.isJumping) { 
      this.jumpSound.play();
      this.isJumping = true;
      this.jumpTimer = this.jumpTime;
      this.getComponent(Physics).velocity.y = -this.jumpForce;
      this.jumpsLeft--;
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
      this.dashSound.play();
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
