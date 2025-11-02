/**
 * Player Controller
 * Handles player movement, jumping, shooting, grenades, climbing
 */

class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create player sprite
        this.sprite = scene.add.rectangle(x, y, 24, 32, 0x0000FF);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setMaxVelocity(300, 600);

        // Player properties
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 200;
        this.jumpPower = -400;
        this.facing = 1; // 1 = right, -1 = left

        // Jump properties
        this.jumpsLeft = 2;
        this.maxJumps = 2;
        this.canDoubleJump = true;

        // Climbing
        this.isClimbing = false;
        this.climbSpeed = 150;

        // Shooting
        this.fireRate = 200; // ms between shots
        this.lastFired = 0;
        this.grenadeCount = 5;

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = {
            W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            K: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
            L: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
            E: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            SPACE: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        };

        // Mouse input
        scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.shoot();
            }
        });

        // Invulnerability after hit
        this.invulnerable = false;
        this.invulnerabilityTime = 1000;
    }

    /**
     * Update player each frame
     */
    update() {
        if (this.health <= 0) {
            this.die();
            return;
        }

        this.handleMovement();
        this.handleJumping();
        this.handleClimbing();
        this.handleShooting();
        this.handleGrenades();

        // Update facing direction visual
        if (this.facing === 1) {
            this.sprite.setFillStyle(0x0000FF);
        } else {
            this.sprite.setFillStyle(0x0000AA);
        }
    }

    /**
     * Handle horizontal movement
     */
    handleMovement() {
        const onGround = this.sprite.body.blocked.down || this.sprite.body.touching.down;

        // Don't allow horizontal movement while climbing
        if (this.isClimbing) {
            this.sprite.body.setVelocityX(0);
            return;
        }

        // Left/Right movement
        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.sprite.body.setVelocityX(-this.speed);
            this.facing = -1;
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.sprite.body.setVelocityX(this.speed);
            this.facing = 1;
        } else {
            // Apply friction
            if (onGround) {
                this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.8);
            } else {
                this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.95);
            }
        }
    }

    /**
     * Handle jumping
     */
    handleJumping() {
        const onGround = this.sprite.body.blocked.down || this.sprite.body.touching.down;

        // Reset jumps when on ground
        if (onGround) {
            this.jumpsLeft = this.maxJumps;
        }

        // Jump input
        const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                          Phaser.Input.Keyboard.JustDown(this.keys.W) ||
                          Phaser.Input.Keyboard.JustDown(this.keys.SPACE);

        if (jumpPressed && this.jumpsLeft > 0 && !this.isClimbing) {
            this.sprite.body.setVelocityY(this.jumpPower);
            this.jumpsLeft--;

            // Double jump effect
            if (this.jumpsLeft < this.maxJumps - 1) {
                this.createJumpEffect();
            }
        }
    }

    /**
     * Handle climbing ladders
     */
    handleClimbing() {
        // Check if on ladder
        const onLadder = this.scene.terrainManager.isOnLadder(
            this.sprite.x,
            this.sprite.y
        );

        // E key to grab ladder
        if (onLadder && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
            this.isClimbing = !this.isClimbing;
        }

        if (this.isClimbing) {
            // Disable gravity while climbing
            this.sprite.body.setAllowGravity(false);
            this.sprite.body.setVelocityX(0);

            // Climb up/down
            if (this.cursors.up.isDown || this.keys.W.isDown) {
                this.sprite.body.setVelocityY(-this.climbSpeed);
            } else if (this.cursors.down.isDown || this.keys.S.isDown) {
                this.sprite.body.setVelocityY(this.climbSpeed);
            } else {
                this.sprite.body.setVelocityY(0);
            }

            // Exit ladder if not on it anymore
            if (!onLadder) {
                this.isClimbing = false;
                this.sprite.body.setAllowGravity(true);
            }
        } else {
            this.sprite.body.setAllowGravity(true);
        }
    }

    /**
     * Handle shooting
     */
    handleShooting() {
        const now = this.scene.time.now;

        // Continuous fire with K key
        if (this.keys.K.isDown && now - this.lastFired > this.fireRate) {
            this.shoot();
        }
    }

    /**
     * Shoot bullet
     */
    shoot() {
        const now = this.scene.time.now;
        if (now - this.lastFired < this.fireRate) return;

        this.lastFired = now;

        // Fire from gun position (in front of player)
        const gunX = this.sprite.x + (this.facing * 16);
        const gunY = this.sprite.y;

        if (this.scene.weaponManager) {
            this.scene.weaponManager.fireBullet(gunX, gunY, this.facing, false);
        }

        // Recoil
        this.sprite.body.setVelocityX(this.sprite.body.velocity.x - (this.facing * 50));
    }

    /**
     * Handle grenade throwing
     */
    handleGrenades() {
        if (Phaser.Input.Keyboard.JustDown(this.keys.L) && this.grenadeCount > 0) {
            this.throwGrenade();
        }
    }

    /**
     * Throw grenade
     */
    throwGrenade() {
        if (this.grenadeCount <= 0) return;

        this.grenadeCount--;

        const grenadeX = this.sprite.x + (this.facing * 10);
        const grenadeY = this.sprite.y - 10;

        if (this.scene.weaponManager) {
            this.scene.weaponManager.throwGrenade(
                grenadeX,
                grenadeY,
                this.facing,
                -300
            );
        }
    }

    /**
     * Take damage
     */
    takeDamage(amount) {
        if (this.invulnerable) return;

        this.health -= amount;
        this.health = Math.max(0, this.health);

        // Visual feedback
        this.sprite.setTint(0xFF0000);
        this.scene.time.delayedCall(200, () => {
            this.sprite.clearTint();
        });

        // Temporary invulnerability
        this.invulnerable = true;
        this.scene.time.delayedCall(this.invulnerabilityTime, () => {
            this.invulnerable = false;
        });

        // Knockback
        const knockbackX = -this.facing * 200;
        const knockbackY = -100;
        this.sprite.body.setVelocity(knockbackX, knockbackY);

        // Camera shake
        this.scene.cameras.main.shake(100, 0.005);
    }

    /**
     * Create jump effect particles
     */
    createJumpEffect() {
        for (let i = 0; i < 5; i++) {
            const particle = this.scene.add.circle(
                this.sprite.x + Phaser.Math.Between(-10, 10),
                this.sprite.y + 16,
                3,
                0xFFFFFF
            );

            this.scene.tweens.add({
                targets: particle,
                y: particle.y + 10,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * Player death
     */
    die() {
        if (this.sprite.active === false) return;

        // Death animation
        this.sprite.setActive(false);
        this.sprite.setVisible(false);

        // Create death particles
        for (let i = 0; i < 15; i++) {
            const particle = this.scene.add.rectangle(
                this.sprite.x,
                this.sprite.y,
                4,
                4,
                0x0000FF
            );

            const velocityX = Phaser.Math.Between(-200, 200);
            const velocityY = Phaser.Math.Between(-300, -100);

            this.scene.tweens.add({
                targets: particle,
                x: particle.x + velocityX * 0.5,
                y: particle.y + velocityY * 0.5,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }

        // Respawn after delay
        window.gameState.lives--;

        if (window.gameState.lives > 0) {
            this.scene.time.delayedCall(2000, () => {
                this.respawn();
            });
        } else {
            // Game over
            this.scene.time.delayedCall(2000, () => {
                this.scene.scene.restart();
                window.gameState.lives = 3;
                window.gameState.score = 0;
            });
        }
    }

    /**
     * Respawn player
     */
    respawn() {
        this.sprite.setActive(true);
        this.sprite.setVisible(true);
        this.sprite.setPosition(100, 100);
        this.health = this.maxHealth;
        this.grenadeCount = 5;
        this.sprite.body.setVelocity(0, 0);
    }
}
