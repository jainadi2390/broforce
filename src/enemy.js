/**
 * Enemy Controller
 * Handles enemy AI, patrol behavior, shooting, and death
 */

class Enemy {
    constructor(scene, x, y, patrolDistance = 200) {
        this.scene = scene;

        // Create enemy sprite
        this.sprite = scene.add.rectangle(x, y, 24, 32, 0xFF0000);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);

        // Enemy properties
        this.health = 50;
        this.maxHealth = 50;
        this.speed = 80;
        this.facing = -1; // Start facing left

        // Patrol AI
        this.patrolStartX = x;
        this.patrolDistance = patrolDistance;
        this.patrolLeft = x - patrolDistance / 2;
        this.patrolRight = x + patrolDistance / 2;
        this.state = 'patrol'; // patrol, chase, shoot

        // Shooting
        this.fireRate = 1500;
        this.lastFired = 0;
        this.detectionRange = 400;
        this.shootRange = 350;

        // Store reference on sprite for collision callbacks
        this.sprite.enemyController = this;
    }

    /**
     * Update enemy AI each frame
     */
    update() {
        if (this.health <= 0) {
            return;
        }

        if (!this.sprite.active) return;

        // Check if player is nearby
        const player = this.scene.player;
        if (player && player.sprite.active) {
            const distance = Phaser.Math.Distance.Between(
                this.sprite.x,
                this.sprite.y,
                player.sprite.x,
                player.sprite.y
            );

            // State machine
            if (distance < this.shootRange) {
                this.state = 'shoot';
                this.shootAtPlayer(player);
            } else if (distance < this.detectionRange) {
                this.state = 'chase';
                this.chasePlayer(player);
            } else {
                this.state = 'patrol';
                this.patrol();
            }
        } else {
            this.patrol();
        }

        // Update visual based on facing
        if (this.facing === 1) {
            this.sprite.setFillStyle(0xFF0000);
        } else {
            this.sprite.setFillStyle(0xAA0000);
        }
    }

    /**
     * Patrol back and forth
     */
    patrol() {
        const onGround = this.sprite.body.blocked.down || this.sprite.body.touching.down;

        if (!onGround) return;

        // Move in patrol direction
        if (this.facing === 1) {
            this.sprite.body.setVelocityX(this.speed);

            // Turn around at patrol boundary
            if (this.sprite.x >= this.patrolRight) {
                this.facing = -1;
            }
        } else {
            this.sprite.body.setVelocityX(-this.speed);

            // Turn around at patrol boundary
            if (this.sprite.x <= this.patrolLeft) {
                this.facing = 1;
            }
        }

        // Also turn around at edges or walls
        if (this.sprite.body.blocked.left) {
            this.facing = 1;
        } else if (this.sprite.body.blocked.right) {
            this.facing = -1;
        }
    }

    /**
     * Chase player
     */
    chasePlayer(player) {
        const onGround = this.sprite.body.blocked.down || this.sprite.body.touching.down;

        if (!onGround) return;

        // Move towards player
        if (player.sprite.x > this.sprite.x) {
            this.sprite.body.setVelocityX(this.speed * 1.5);
            this.facing = 1;
        } else {
            this.sprite.body.setVelocityX(-this.speed * 1.5);
            this.facing = -1;
        }
    }

    /**
     * Shoot at player
     */
    shootAtPlayer(player) {
        // Stop moving when shooting
        this.sprite.body.setVelocityX(0);

        // Face player
        if (player.sprite.x > this.sprite.x) {
            this.facing = 1;
        } else {
            this.facing = -1;
        }

        // Fire at intervals
        const now = this.scene.time.now;
        if (now - this.lastFired > this.fireRate) {
            this.lastFired = now;
            this.fire();
        }
    }

    /**
     * Fire bullet
     */
    fire() {
        const gunX = this.sprite.x + (this.facing * 16);
        const gunY = this.sprite.y;

        if (this.scene.weaponManager) {
            this.scene.weaponManager.fireBullet(gunX, gunY, this.facing, true);
        }

        // Visual muzzle flash
        const flash = this.scene.add.circle(gunX, gunY, 8, 0xFFFF00);
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 2,
            duration: 100,
            onComplete: () => {
                flash.destroy();
            }
        });
    }

    /**
     * Take damage
     */
    takeDamage(amount) {
        this.health -= amount;
        this.health = Math.max(0, this.health);

        // Visual feedback
        this.sprite.setTint(0xFFFFFF);
        this.scene.time.delayedCall(100, () => {
            this.sprite.clearTint();
        });

        // Die if health depleted
        if (this.health <= 0) {
            this.die();
        } else {
            // Knockback
            const knockbackX = this.facing * -100;
            const knockbackY = -50;
            this.sprite.body.setVelocity(knockbackX, knockbackY);
        }
    }

    /**
     * Enemy death
     */
    die() {
        if (!this.sprite.active) return;

        // Deactivate
        this.sprite.setActive(false);
        this.sprite.setVisible(false);

        // Death particles
        for (let i = 0; i < 12; i++) {
            const particle = this.scene.add.rectangle(
                this.sprite.x,
                this.sprite.y,
                4,
                4,
                0xFF0000
            );

            const velocityX = Phaser.Math.Between(-150, 150);
            const velocityY = Phaser.Math.Between(-250, -50);

            this.scene.tweens.add({
                targets: particle,
                x: particle.x + velocityX * 0.5,
                y: particle.y + velocityY * 0.5,
                alpha: 0,
                angle: Phaser.Math.Between(0, 360),
                duration: 800,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }

        // Add to score
        window.gameState.score += 100;

        // Remove from scene after delay
        this.scene.time.delayedCall(1000, () => {
            if (this.sprite.body) {
                this.sprite.body.destroy();
            }
            this.sprite.destroy();
        });
    }
}

/**
 * Enemy Manager
 * Handles spawning and updating all enemies
 */
class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
    }

    /**
     * Spawn enemy at position
     */
    spawnEnemy(x, y, patrolDistance = 200) {
        const enemy = new Enemy(this.scene, x, y, patrolDistance);
        this.enemies.push(enemy);
        return enemy;
    }

    /**
     * Update all enemies
     */
    update() {
        this.enemies.forEach(enemy => {
            enemy.update();
        });
    }

    /**
     * Get all active enemy sprites
     */
    getEnemySprites() {
        return this.enemies
            .filter(e => e.sprite.active)
            .map(e => e.sprite);
    }
}
