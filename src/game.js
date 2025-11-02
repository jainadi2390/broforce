/**
 * Broforce - Main Game Entry Point
 * Phaser 3 configuration and initialization
 */

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [MainScene]
};

// Initialize the game
const game = new Phaser.Game(config);

// Global game state
window.gameState = {
    score: 0,
    lives: 3,
    currentLevel: 1
};
