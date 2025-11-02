/**
 * Explosion System
 * Handles explosions, particle effects, and radial damage
 */

class ExplosionManager {
    constructor(scene) {
        this.scene = scene;
        this.explosions = scene.add.group();
    }

    /**
     * Create explosion at position with specified radius and damage
     */
    createExplosion(x, y, radius = 100, damage = 50) {
        // Create explosion sprite
        const explosion = this.scene.add.circle(x, y, 5, 0xFF4500);
        explosion.setAlpha(0.8);

        // Animate explosion growth
        this.scene.tweens.add({
            targets: explosion,
            radius: radius,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                explosion.destroy();
            }
        });

        // Create particle burst effect
        this.createParticles(x, y, radius);

        // Apply radial damage
        this.applyRadialDamage(x, y, radius, damage);

        // Check for destructible terrain
        this.destroyTerrain(x, y, radius);

        // Camera shake
        this.scene.cameras.main.shake(200, 0.01);
    }

    /**
     * Create particle effects for explosion
     */
    createParticles(x, y, radius) {
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = Phaser.Math.Between(100, 200);

            const particle = this.scene.add.circle(x, y, 3, 0xFF6600);
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            this.scene.tweens.add({
                targets: particle,
                x: x + velocityX * 0.5,
                y: y + velocityY * 0.5,
                alpha: 0,
                scale: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }

        // Smoke particles
        for (let i = 0; i < 10; i++) {
            const smoke = this.scene.add.circle(
                x + Phaser.Math.Between(-20, 20),
                y + Phaser.Math.Between(-20, 20),
                Phaser.Math.Between(5, 10),
                0x555555
            );
            smoke.setAlpha(0.5);

            this.scene.tweens.add({
                targets: smoke,
                y: smoke.y - 50,
                alpha: 0,
                scale: 2,
                duration: 1000,
                ease: 'Power1',
                onComplete: () => {
                    smoke.destroy();
                }
            });
        }
    }

    /**
     * Apply damage to all entities in radius
     */
    applyRadialDamage(x, y, radius, damage) {
        // Damage player
        if (this.scene.player) {
            const distance = Phaser.Math.Distance.Between(
                x, y,
                this.scene.player.sprite.x,
                this.scene.player.sprite.y
            );

            if (distance < radius) {
                const damageMultiplier = 1 - (distance / radius);
                this.scene.player.takeDamage(Math.floor(damage * damageMultiplier));
            }
        }

        // Damage enemies
        if (this.scene.enemies) {
            this.scene.enemies.getChildren().forEach(enemy => {
                if (enemy.active) {
                    const distance = Phaser.Math.Distance.Between(
                        x, y,
                        enemy.x,
                        enemy.y
                    );

                    if (distance < radius) {
                        const damageMultiplier = 1 - (distance / radius);
                        if (enemy.enemyController) {
                            enemy.enemyController.takeDamage(Math.floor(damage * damageMultiplier));
                        }
                    }
                }
            });
        }
    }

    /**
     * Destroy terrain tiles in radius
     */
    destroyTerrain(x, y, radius) {
        if (this.scene.terrainManager) {
            this.scene.terrainManager.destroyInRadius(x, y, radius);
        }
    }
}
