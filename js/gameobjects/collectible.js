// Import the GameObject class from the 'engine' directory
import GameObject from '../base/gameobject.js';

// Import the Renderer class from the 'engine' directory
import Renderer from '../components/renderer.js';

// Import the Physics class from the 'engine' directory
import Physics from '../components/physics.js';

// Define a new class, Collectible, which extends (i.e., inherits from) GameObject
class Collectible extends GameObject {
  
  // Define the constructor for this class. The constructor takes five arguments:
  // - x and y coordinates
  // - width and height of the collectible
  // - color of the collectible, which defaults to 'gold' if not specified
  constructor(x, y, width, height, image = null) {
    
    // Call the constructor of the superclass (GameObject) with the x and y coordinates
    super(x, y);

    if (image) {
      this.addComponent(new Renderer('gold', width, height, image)); // Use true to indicate it's an image
    } else {
      this.addComponent(new Renderer('gold', width, height)); // Create a basic collectible without any picture sprite 
    }

    // Add a new Physics component to this collectible. The physics component is responsible for handling the physics
    // (like movement, collision detection, etc.). In this case, the collectible doesn't move,
    // so the initial velocity, acceleration, and friction are all set to zero.
    this.addComponent(new Physics({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }));

    // Set the 'tag' property of this collectible. The tag is used to identify the type of GameObject
    // (useful when checking collisions, for example)
    this.tag = 'collectible';

    // Set the 'value' property of this collectible. This could be used to score points when the collectible is collected.
    this.value = 1;
  }
}

// Export the Collectible class as the default export of this module
export default Collectible;
