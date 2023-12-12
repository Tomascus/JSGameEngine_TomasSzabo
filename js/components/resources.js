// Create an Images object to hold the Image instances for the player and the enemy.
const Images = {
  player: new Image(), // The Image instance for the player.
  enemy: new Image(), // The Image instance for the enemy.
  platform: new Image(),
};

// Create an AudioFiles object to hold the file paths of the audio resources.
const AudioFiles = {
  jump: './resources/audio/jump.mp3', // The file path of the jump sound.
  collect: './resources/audio/collect.mp3', // The file path of the collect sound.
  // Add more audio file paths as needed
};

// Set the source of the player image.
Images.player.src = './resources/images/player/ghosty.png'; // Update the image path

// Set the source of the enemy image.
Images.enemy.src = './resources/images/enemy/flowerdog.png'; // Update the image path

Images.platform.src = './resources/images/platform/grassplatform.png';

// Export the Images and AudioFiles objects so they can be imported and used in other modules.
export { Images, AudioFiles };