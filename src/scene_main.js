/**
 * Main Game Scene
 * Handles level loading, game loop, collisions, and camera
 */

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    /**
     * Preload assets
     */
    preload() {
        console.log('[MainScene] preload() called');
        // Placeholder assets are created programmatically in create()
        // In production, you would load sprite sheets here
    }

    /**
     * Create game world
     */
    create() {
        console.log('[MainScene] create() started');
        try {
            // Define level data (tile array)
        // 0 = air, 1 = dirt, 2 = stone, 3 = platform, 4 = destructible, 5 = ladder
        this.levelData = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
        ];

        // Set world bounds
        const worldWidth = this.levelData[0].length * 32;
        const worldHeight = this.levelData.length * 32;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Initialize managers
        this.explosionManager = new ExplosionManager(this);
        this.weaponManager = new WeaponManager(this);
        this.terrainManager = new TerrainManager(this, this.levelData);

        // Create player
        this.player = new Player(this, 100, 100);

        // Create enemies
        this.enemyManager = new EnemyManager(this);
        this.enemyManager.spawnEnemy(400, 500, 150);
        this.enemyManager.spawnEnemy(800, 500, 200);
        this.enemyManager.spawnEnemy(1000, 400, 150);

        // Create enemies group for collision
        this.enemies = this.add.group();
        this.enemyManager.enemies.forEach(enemy => {
            this.enemies.add(enemy.sprite);
        });

        // Setup collisions
        this.setupCollisions();

        // Setup camera
        this.setupCamera();

        // Create UI
        this.uiManager = new UIManager(this, this.player);

        // Show start message
        this.time.delayedCall(500, () => {
            this.uiManager.showMessage('DESTROY EVERYTHING!', 3000);
        });

            console.log('[MainScene] create() completed successfully');
        } catch (error) {
            console.error('[MainScene] Error in create():', error);
            throw error;
        }
    }

    /**
     * Setup collision detection
     */
    setupCollisions() {
        // Player collisions with terrain
        this.physics.add.collider(
            this.player.sprite,
            this.terrainManager.solidTiles
        );

        this.physics.add.collider(
            this.player.sprite,
            this.terrainManager.platforms
        );

        // Enemy collisions with terrain
        this.enemies.getChildren().forEach(enemySprite => {
            this.physics.add.collider(
                enemySprite,
                this.terrainManager.solidTiles
            );

            this.physics.add.collider(
                enemySprite,
                this.terrainManager.platforms
            );
        });

        // Player bullets hit enemies
        this.physics.add.overlap(
            this.weaponManager.bullets,
            this.enemies,
            this.bulletHitEnemy,
            null,
            this
        );

        // Enemy bullets hit player
        this.physics.add.overlap(
            this.weaponManager.enemyBullets,
            this.player.sprite,
            this.enemyBulletHitPlayer,
            null,
            this
        );

        // Grenades collide with terrain
        this.physics.add.collider(
            this.weaponManager.grenades,
            this.terrainManager.solidTiles
        );

        this.physics.add.collider(
            this.weaponManager.grenades,
            this.terrainManager.platforms
        );
    }

    /**
     * Setup camera to follow player
     */
    setupCamera() {
        const camera = this.cameras.main;

        // Follow player
        camera.startFollow(this.player.sprite, true, 0.1, 0.1);

        // Set deadzone for smoother following
        camera.setDeadzone(200, 100);

        // Set camera bounds to world
        const worldWidth = this.levelData[0].length * 32;
        const worldHeight = this.levelData.length * 32;
        camera.setBounds(0, 0, worldWidth, worldHeight);
    }

    /**
     * Bullet hits enemy callback
     */
    bulletHitEnemy(bullet, enemySprite) {
        if (!bullet.active || !enemySprite.active) return;

        // Apply damage to enemy
        if (enemySprite.enemyController) {
            enemySprite.enemyController.takeDamage(25);
        }

        // Hit effect
        this.weaponManager.hitEffect(bullet.x, bullet.y);

        // Destroy bullet
        this.weaponManager.destroyBullet(bullet, this.weaponManager.bullets);
    }

    /**
     * Enemy bullet hits player callback
     */
    enemyBulletHitPlayer(bullet, playerSprite) {
        if (!bullet.active || !playerSprite.active) return;

        // Damage player
        this.player.takeDamage(10);

        // Hit effect
        this.weaponManager.hitEffect(bullet.x, bullet.y);

        // Destroy bullet
        this.weaponManager.destroyBullet(bullet, this.weaponManager.enemyBullets);
    }

    /**
     * Main update loop
     */
    update(time, delta) {
        // Update player
        this.player.update();

        // Update enemies
        this.enemyManager.update();

        // Update weapons
        this.weaponManager.update();

        // Update UI
        this.uiManager.update();
    }
}
