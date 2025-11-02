/**
 * Weapon System
 * Handles bullets, grenades, and projectile pooling
 */

class WeaponManager {
    constructor(scene) {
        this.scene = scene;

        // Bullet pool
        this.bullets = scene.physics.add.group({
            maxSize: 50,
            runChildUpdate: true
        });

        // Grenade pool
        this.grenades = scene.physics.add.group({
            maxSize: 20,
            runChildUpdate: true
        });

        // Enemy bullets pool
        this.enemyBullets = scene.physics.add.group({
            maxSize: 30,
            runChildUpdate: true
        });
    }

    /**
     * Fire a bullet from position in direction
     */
    fireBullet(x, y, direction, isEnemy = false) {
        const bulletGroup = isEnemy ? this.enemyBullets : this.bullets;

        // Get or create bullet from pool
        let bullet = bulletGroup.getFirstDead(false);

        if (!bullet) {
            bullet = this.scene.add.rectangle(0, 0, 8, 3, isEnemy ? 0xFF0000 : 0xFFFF00);
            bulletGroup.add(bullet);
            this.scene.physics.add.existing(bullet);
        }

        // Set bullet properties
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setPosition(x, y);
        bullet.body.setAllowGravity(false);
        bullet.body.setVelocityX(direction * 600);
        bullet.body.setSize(8, 3);

        // Bullet lifetime
        bullet.lifespan = 2000;
        bullet.birthTime = this.scene.time.now;

        // Update function for bullet
        bullet.update = () => {
            if (this.scene.time.now - bullet.birthTime > bullet.lifespan) {
                this.destroyBullet(bullet, bulletGroup);
            }

            // Check collision with terrain
            if (this.scene.terrainManager) {
                const tileHit = this.scene.terrainManager.checkCollisionPoint(bullet.x, bullet.y);
                if (tileHit) {
                    this.hitEffect(bullet.x, bullet.y, 5);
                    this.destroyBullet(bullet, bulletGroup);
                }
            }
        };

        return bullet;
    }

    /**
     * Throw grenade from position
     */
    throwGrenade(x, y, direction, velocityY = -300) {
        // Get or create grenade from pool
        let grenade = this.grenades.getFirstDead(false);

        if (!grenade) {
            grenade = this.scene.add.circle(0, 0, 4, 0x00FF00);
            this.grenades.add(grenade);
            this.scene.physics.add.existing(grenade);
        }

        // Set grenade properties
        grenade.setActive(true);
        grenade.setVisible(true);
        grenade.setPosition(x, y);
        grenade.body.setVelocity(direction * 200, velocityY);
        grenade.body.setBounce(0.6, 0.6);
        grenade.body.setCircle(4);

        // Grenade fuse timer (2 seconds)
        grenade.fuseTime = 2000;
        grenade.birthTime = this.scene.time.now;

        // Update function for grenade
        grenade.update = () => {
            const timeAlive = this.scene.time.now - grenade.birthTime;

            // Flash faster as fuse runs out
            if (Math.floor(timeAlive / 100) % 2 === 0) {
                grenade.setFillStyle(0xFF0000);
            } else {
                grenade.setFillStyle(0x00FF00);
            }

            // Explode after fuse time
            if (timeAlive > grenade.fuseTime) {
                this.explodeGrenade(grenade);
            }
        };

        return grenade;
    }

    /**
     * Explode grenade
     */
    explodeGrenade(grenade) {
        if (this.scene.explosionManager) {
            this.scene.explosionManager.createExplosion(
                grenade.x,
                grenade.y,
                120, // radius
                60   // damage
            );
        }

        grenade.setActive(false);
        grenade.setVisible(false);
        grenade.body.setVelocity(0, 0);
    }

    /**
     * Destroy bullet and return to pool
     */
    destroyBullet(bullet, bulletGroup) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.setVelocity(0, 0);
    }

    /**
     * Create hit effect when bullet hits something
     */
    hitEffect(x, y, damage = 10) {
        // Create small spark particles
        for (let i = 0; i < 5; i++) {
            const spark = this.scene.add.circle(
                x + Phaser.Math.Between(-3, 3),
                y + Phaser.Math.Between(-3, 3),
                2,
                0xFFFF00
            );

            this.scene.tweens.add({
                targets: spark,
                alpha: 0,
                scale: 0,
                duration: 200,
                onComplete: () => {
                    spark.destroy();
                }
            });
        }
    }

    /**
     * Check bullet collision with target
     */
    checkBulletHit(bullet, target, callback) {
        if (!bullet.active || !target.active) return;

        const hit = this.scene.physics.overlap(bullet, target);
        if (hit) {
            this.hitEffect(bullet.x, bullet.y);
            callback(bullet, target);
            this.destroyBullet(bullet, this.bullets);
        }
    }

    /**
     * Update all active projectiles
     */
    update() {
        // Update bullets
        this.bullets.getChildren().forEach(bullet => {
            if (bullet.active && bullet.update) {
                bullet.update();
            }
        });

        // Update enemy bullets
        this.enemyBullets.getChildren().forEach(bullet => {
            if (bullet.active && bullet.update) {
                bullet.update();
            }
        });

        // Update grenades
        this.grenades.getChildren().forEach(grenade => {
            if (grenade.active && grenade.update) {
                grenade.update();
            }
        });
    }
}
