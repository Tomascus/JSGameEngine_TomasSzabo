// Create an Images object to hold the Image instances for the player and the enemy.
const Images = {
  player: new Image(), // The Image instance for the player.
  enemy: new Image(), // The Image instance for the enemy.
  platform: new Image(), // The Image instance for the platform.
  collectible: new Image(), // The Image instance for the collectible.
};

// Create an AudioFiles object to hold the file paths of the audio resources.
const AudioFiles = {
  jump: './resources/audio/jump.mp3', // The file path of the jump sound.
  collect: './resources/audio/collect.mp3', // The file path of the collect sound.
  dash: './resources/audio/dash.mp3', // The file path of the dash sound. 
  background: './resources/audio/background.mp3', // The file path of the background music.
  rope: './resources/audio/rope.mp3', // The file path of the rope sound.
};

// Set the source of the player image.
Images.player.src = './resources/images/player/ghosty.png'; // Update the image path

// Set the source of the enemy image.
Images.enemy.src = './resources/images/enemy/bat.png'; // Update the image path

// Set the source of the platform image.
Images.platform.src = './resources/images/platform/mossyplatform.png'; // Update the image path

// Set the source of the collectible image.
Images.collectible.src = './resources/images/collectible/gem1.png'; // Update the image path

// Export the Images and AudioFiles objects so they can be imported and used in other modules.
export { Images, AudioFiles };
