/**
 * Broforce - Main Game Entry Point
 * Phaser 3 configuration and initialization
 */

console.log('[Game] Initializing game...');
console.log('[Game] Phaser version:', typeof Phaser !== 'undefined' ? Phaser.VERSION : 'NOT LOADED');
console.log('[Game] MainScene defined:', typeof MainScene !== 'undefined');

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

console.log('[Game] Config created');

// Initialize the game
const game = new Phaser.Game(config);

console.log('[Game] Game instance created');

// Global game state
window.gameState = {
    score: 0,
    lives: 3,
    currentLevel: 1
};

console.log('[Game] Game state initialized');
