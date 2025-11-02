/**
 * Terrain System
 * Handles destructible tiles, platforms, and chain reactions
 */

class TerrainManager {
    constructor(scene, levelData) {
        this.scene = scene;
        this.levelData = levelData;
        this.tileSize = 32;

        // Tile types
        this.TILE_TYPES = {
            AIR: 0,
            DIRT: 1,
            STONE: 2,
            PLATFORM: 3,
            DESTRUCTIBLE: 4,
            LADDER: 5
        };

        // Tile health
        this.tileHealth = {};

        // Physics groups
        this.solidTiles = scene.physics.add.staticGroup();
        this.platforms = scene.physics.add.staticGroup();
        this.ladders = scene.add.group();

        this.createTerrain();
    }

    /**
     * Create terrain from level data
     */
    createTerrain() {
        for (let row = 0; row < this.levelData.length; row++) {
            for (let col = 0; col < this.levelData[row].length; col++) {
                const tileType = this.levelData[row][col];
                const x = col * this.tileSize + this.tileSize / 2;
                const y = row * this.tileSize + this.tileSize / 2;

                this.createTile(x, y, tileType, row, col);
            }
        }
    }

    /**
     * Create individual tile
     */
    createTile(x, y, tileType, row, col) {
        let tile;
        const tileId = `${row}-${col}`;

        switch (tileType) {
            case this.TILE_TYPES.DIRT:
                tile = this.scene.add.rectangle(x, y, this.tileSize, this.tileSize, 0x8B4513);
                this.solidTiles.add(tile);
                tile.body.immovable = true;
                tile.setData('destructible', true);
                tile.setData('tileId', tileId);
                this.tileHealth[tileId] = 50;
                break;

            case this.TILE_TYPES.STONE:
                tile = this.scene.add.rectangle(x, y, this.tileSize, this.tileSize, 0x808080);
                this.solidTiles.add(tile);
                tile.body.immovable = true;
                tile.setData('destructible', false);
                tile.setData('tileId', tileId);
                break;

            case this.TILE_TYPES.PLATFORM:
                tile = this.scene.add.rectangle(x, y, this.tileSize, 8, 0x654321);
                tile.y = y - this.tileSize / 2 + 4;
                this.platforms.add(tile);
                tile.body.immovable = true;
                tile.body.checkCollision.down = false;
                tile.body.checkCollision.left = false;
                tile.body.checkCollision.right = false;
                tile.setData('platform', true);
                tile.setData('tileId', tileId);
                break;

            case this.TILE_TYPES.DESTRUCTIBLE:
                tile = this.scene.add.rectangle(x, y, this.tileSize, this.tileSize, 0xD2691E);
                this.solidTiles.add(tile);
                tile.body.immovable = true;
                tile.setData('destructible', true);
                tile.setData('explosive', true);
                tile.setData('tileId', tileId);
                this.tileHealth[tileId] = 30;
                break;

            case this.TILE_TYPES.LADDER:
                tile = this.scene.add.rectangle(x, y, this.tileSize, this.tileSize, 0xFFFF00);
                tile.setAlpha(0.3);
                tile.setData('ladder', true);
                tile.setData('tileId', tileId);
                this.ladders.add(tile);
                break;
        }

        if (tile) {
            tile.setData('row', row);
            tile.setData('col', col);
            tile.setData('tileType', tileType);
        }
    }

    /**
     * Destroy tiles in radius (for explosions)
     */
    destroyInRadius(x, y, radius) {
        const tilesToDestroy = [];

        // Check solid tiles
        this.solidTiles.getChildren().forEach(tile => {
            if (!tile.active) return;

            const distance = Phaser.Math.Distance.Between(x, y, tile.x, tile.y);
            if (distance < radius && tile.getData('destructible')) {
                tilesToDestroy.push(tile);
            }
        });

        // Destroy tiles and trigger chain reactions
        tilesToDestroy.forEach(tile => {
            this.destroyTile(tile);

            // Chain reaction for explosive tiles
            if (tile.getData('explosive')) {
                this.scene.time.delayedCall(100, () => {
                    if (this.scene.explosionManager) {
                        this.scene.explosionManager.createExplosion(
                            tile.x,
                            tile.y,
                            80,
                            30
                        );
                    }
                });
            }
        });
    }

    /**
     * Damage tile
     */
    damageTile(tile, damage) {
        if (!tile.getData('destructible')) return;

        const tileId = tile.getData('tileId');
        if (this.tileHealth[tileId]) {
            this.tileHealth[tileId] -= damage;

            // Visual damage feedback
            tile.setAlpha(this.tileHealth[tileId] / 50);

            if (this.tileHealth[tileId] <= 0) {
                this.destroyTile(tile);
            }
        }
    }

    /**
     * Destroy tile
     */
    destroyTile(tile) {
        const tileId = tile.getData('tileId');

        // Create destruction particles
        this.createDestructionParticles(tile.x, tile.y, tile.fillColor);

        // Update level data
        const row = tile.getData('row');
        const col = tile.getData('col');
        if (row !== undefined && col !== undefined) {
            this.levelData[row][col] = this.TILE_TYPES.AIR;
        }

        // Remove from physics
        if (tile.body) {
            tile.body.destroy();
        }

        // Destroy tile
        tile.destroy();

        // Clean up health tracking
        delete this.tileHealth[tileId];

        // Add to score
        if (window.gameState) {
            window.gameState.score += 10;
        }
    }

    /**
     * Create destruction particles
     */
    createDestructionParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.rectangle(
                x + Phaser.Math.Between(-8, 8),
                y + Phaser.Math.Between(-8, 8),
                4,
                4,
                color
            );

            const velocityX = Phaser.Math.Between(-100, 100);
            const velocityY = Phaser.Math.Between(-150, -50);

            this.scene.tweens.add({
                targets: particle,
                x: particle.x + velocityX * 0.5,
                y: particle.y + velocityY * 0.5,
                alpha: 0,
                angle: Phaser.Math.Between(0, 360),
                duration: 800,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * Check collision at point
     */
    checkCollisionPoint(x, y) {
        let hit = false;

        this.solidTiles.getChildren().forEach(tile => {
            if (!tile.active) return;

            const bounds = tile.getBounds();
            if (bounds.contains(x, y)) {
                hit = tile;
            }
        });

        return hit;
    }

    /**
     * Check if position is on ladder
     */
    isOnLadder(x, y) {
        let onLadder = false;

        this.ladders.getChildren().forEach(ladder => {
            const bounds = ladder.getBounds();
            if (bounds.contains(x, y)) {
                onLadder = true;
            }
        });

        return onLadder;
    }
}
