// Import the necessary classes from the 'engine' directory
import GameObject from '../base/gameobject.js';
import Renderer from '../components/renderer.js';
import Physics from '../components/physics.js';

// Define a new class, Platform, which extends (inherits from) GameObject
class Wall extends GameObject {
  
  // Define the constructor for the Platform class. It takes arguments for the x and y coordinates,
  // width, height, and color (with a default value of 'gray' if no color is provided)
  constructor(x, y, width, height, image = null) {
    
    // Call the constructor of the superclass (GameObject) with the x and y coordinates
    super(x, y);
    
    if (image) {
      this.addComponent(new Renderer('gray', width, height, image)); // Use true to indicate it's an image
    } else {
      this.addComponent(new Renderer('gray', width, height)); // Create a basic platform without any picture sprite 
    }

    // Add a Physics component to this platform, with initial velocity, acceleration, and forces set to zero.
    // Since platforms don't move, these values will remain zero throughout the game
    this.addComponent(new Physics({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }));
    
    // Set the tag property to 'platform'. This can be used to identify platforms later in the game logic
    this.tag = 'wall'; 
  }
}

// Export the Platform class as the default export of this module
export default Wall;
