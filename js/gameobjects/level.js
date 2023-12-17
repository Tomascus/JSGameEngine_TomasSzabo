// Import necessary classes and resources
import Game from '../base/game.js';
import Player from './player.js';
import Enemy from './enemy.js';
import PlayerUI from './playerUI.js';
import Platform from './platform.js';
import Wall from './wall.js';
import Collectible from './collectible.js';
import { Images, AudioFiles } from '../components/resources.js';


// Define a class Level that extends the Game class from the engine
class Level extends Game {
  
  // Define the constructor for this class, which takes one argument for the canvas ID
  constructor(canvasId) {
    // Call the constructor of the superclass (Game) with the canvas ID
    super(canvasId);

    //Starts playing the background music only when the user click on the screen, due to background music policy some browsers as I learned
    document.addEventListener('click', () => {
      this.backgroundSound.play();
    });

    this.backgroundSound = new Audio(AudioFiles.background);
    this.backgroundSound.loop = true;
    this.backgroundSound.volume = 0.5;
    this.backgroundSound.play();
    
    // Create a player object and add it to the game
    const player = new Player(this.canvas.width / 2 - 25, this.canvas.height / 2 - 25);
    this.addGameObject(player);
    
    // Add the player UI object to the game
    this.addGameObject(new PlayerUI(20, 20));

    // Set the game's camera target to the player
    this.camera.target = player;

    // Define the platform's width and the gap between platforms
    const platformWidth = 500;
    const gap = 300;

    // Create platforms and add them to the game
    const platforms = [
      new Platform(1800, 3500, 100, 150, Images.platform2),
      new Platform(500, 3000, platformWidth, 150, Images.platform),
      new Platform(500, 1200, platformWidth, 150, Images.platform),
      new Platform(platformWidth + gap, 3500, platformWidth, 150, Images.platform),
      new Platform(1.5 * (platformWidth + gap), 1500, platformWidth, 150, Images.platform),
      new Platform(1.2 * (platformWidth + gap), 2000, platformWidth, 150, Images.platform),
      new Platform(1.8 * (platformWidth + gap), 2500, platformWidth, 150, Images.platform),
      new Platform(1.2 * (platformWidth + gap), 4300, platformWidth, 150, Images.platform),
      new Platform(2 * (platformWidth + gap), 1200, platformWidth, 150, Images.platform),
      new Platform(2 * (platformWidth + gap), 4500, platformWidth, 150, Images.platform),
      new Platform(2 * (platformWidth + gap), 3800, platformWidth, 150, Images.platform),
    ];
    for (const platform of platforms) {
      this.addGameObject(platform);
    }

    const walls = [
      new Wall(300, 1500, 100, 300, Images.wall),
      new Wall(2300, 2000, 100, 200, Images.wall),
      new Wall(300, 4000, 100, 200, Images.wall),
    ];
    for (const wall of walls) {
      this.addGameObject(wall);
    }

    // Create enemies and add them to the game
    this.addGameObject(new Enemy(platforms[1].x + platformWidth / 2, platforms[1].y - 90));
    this.addGameObject(new Enemy(platforms[3].x + platformWidth / 2, platforms[3].y - 90));
    this.addGameObject(new Enemy(platforms[5].x + platformWidth / 2, platforms[5].y - 90));

    // Create collectibles and add them to the game
    this.addGameObject(new Collectible(250, this.canvas.height - 100, 30, 30, Images.collectible));
    this.addGameObject(new Collectible(450, this.canvas.height - 100, 30, 30, Images.collectible));
    this.addGameObject(new Collectible(650, this.canvas.height - 100, 30, 30, Images.collectible));
  }
  
}

// Export the Level class as the default export of this module
export default Level;
