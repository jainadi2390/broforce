/**
 * UI System
 * Handles health bar, score, lives, and other UI elements
 */

class UIManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.createUI();
    }

    /**
     * Create all UI elements
     */
    createUI() {
        const cam = this.scene.cameras.main;

        // Create UI container (fixed to camera)
        // Health bar
        this.healthBarBg = this.scene.add.rectangle(20, 20, 204, 24, 0x000000);
        this.healthBarBg.setOrigin(0, 0);
        this.healthBarBg.setScrollFactor(0);
        this.healthBarBg.setDepth(1000);

        this.healthBar = this.scene.add.rectangle(22, 22, 200, 20, 0x00FF00);
        this.healthBar.setOrigin(0, 0);
        this.healthBar.setScrollFactor(0);
        this.healthBar.setDepth(1001);

        this.healthText = this.scene.add.text(22, 22, 'HP: 100/100', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.healthText.setOrigin(0, 0);
        this.healthText.setScrollFactor(0);
        this.healthText.setDepth(1002);

        // Score
        this.scoreText = this.scene.add.text(20, 50, 'SCORE: 0', {
            fontSize: '18px',
            fontFamily: 'Courier New',
            color: '#FFFF00',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.scoreText.setOrigin(0, 0);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1002);

        // Lives
        this.livesText = this.scene.add.text(20, 75, 'LIVES: 3', {
            fontSize: '18px',
            fontFamily: 'Courier New',
            color: '#FF0000',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.livesText.setOrigin(0, 0);
        this.livesText.setScrollFactor(0);
        this.livesText.setDepth(1002);

        // Grenades
        this.grenadesText = this.scene.add.text(20, 100, 'GRENADES: 5', {
            fontSize: '16px',
            fontFamily: 'Courier New',
            color: '#00FF00',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.grenadesText.setOrigin(0, 0);
        this.grenadesText.setScrollFactor(0);
        this.grenadesText.setDepth(1002);

        // Controls hint
        this.controlsText = this.scene.add.text(
            this.scene.cameras.main.width - 20,
            20,
            'CONTROLS:\nA/D - Move\nW/Space - Jump\nK/Click - Shoot\nL - Grenade\nE - Climb',
            {
                fontSize: '12px',
                fontFamily: 'Courier New',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'right'
            }
        );
        this.controlsText.setOrigin(1, 0);
        this.controlsText.setScrollFactor(0);
        this.controlsText.setDepth(1002);
    }

    /**
     * Update UI each frame
     */
    update() {
        if (!this.player) return;

        // Update health bar
        const healthPercent = this.player.health / this.player.maxHealth;
        this.healthBar.width = 200 * healthPercent;

        // Health bar color based on health
        if (healthPercent > 0.6) {
            this.healthBar.setFillStyle(0x00FF00); // Green
        } else if (healthPercent > 0.3) {
            this.healthBar.setFillStyle(0xFFFF00); // Yellow
        } else {
            this.healthBar.setFillStyle(0xFF0000); // Red
        }

        // Update health text
        this.healthText.setText(`HP: ${this.player.health}/${this.player.maxHealth}`);

        // Update score
        this.scoreText.setText(`SCORE: ${window.gameState.score}`);

        // Update lives
        this.livesText.setText(`LIVES: ${window.gameState.lives}`);

        // Update grenades
        this.grenadesText.setText(`GRENADES: ${this.player.grenadeCount}`);
    }

    /**
     * Show message on screen
     */
    showMessage(message, duration = 2000) {
        const messageText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            message,
            {
                fontSize: '32px',
                fontFamily: 'Courier New',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center'
            }
        );
        messageText.setOrigin(0.5);
        messageText.setScrollFactor(0);
        messageText.setDepth(2000);

        // Fade out and destroy
        this.scene.tweens.add({
            targets: messageText,
            alpha: 0,
            duration: duration,
            delay: duration / 2,
            onComplete: () => {
                messageText.destroy();
            }
        });
    }
}
