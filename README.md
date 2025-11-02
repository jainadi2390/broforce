# Broforce - Phaser 3 Game

A complete Broforce-style 2D side-scrolling run-and-gun game built with Phaser 3 and plain JavaScript.

## 🎮 Overview

This is a fully playable Broforce-inspired game featuring destructible terrain, explosive chain reactions, enemy AI, and smooth character controls. The game runs entirely in the browser with no build step required.

## ✨ Features

### Player Mechanics
- **Movement**: Run left/right with smooth acceleration
- **Jumping**: Single and double-jump capabilities
- **Shooting**: Rapid-fire weapon with recoil
- **Grenades**: Timed grenades with radial damage
- **Climbing**: Ladder system for vertical navigation
- **Health System**: 100 HP with visual feedback
- **Lives System**: 3 lives with respawn

### Combat & Weapons
- **Automatic Rifle**: Rapid-fire projectiles
- **Grenades**: Explosive grenades with 2-second fuses
- **Bullet Pooling**: Optimized object reuse for performance
- **Hit Detection**: Pixel-perfect collision detection

### Enemies
- **Patrol AI**: Enemies walk back and forth in designated areas
- **Chase Mode**: Enemies pursue player when in range
- **Shooting**: Enemies fire at player when in range
- **Death Animations**: Particle effects on death

### Destructible Terrain
- **Multiple Tile Types**: Dirt, stone, platforms, destructible blocks
- **Explosion Physics**: Grenades and explosions destroy terrain
- **Chain Reactions**: Explosive blocks trigger additional explosions
- **Particle Effects**: Debris and smoke on destruction

### Camera & UI
- **Smooth Following**: Camera follows player with deadzone
- **Camera Shake**: Impact feedback on explosions and hits
- **HUD Display**: Health bar, score, lives, grenade count
- **Controls Guide**: On-screen control hints

## 🎯 Controls

| Action | Keys |
|--------|------|
| Move Left | `A` or `←` |
| Move Right | `D` or `→` |
| Jump | `W` or `Space` or `↑` |
| Climb (Grab Ladder) | `E` |
| Climb Up/Down | `W`/`S` or `↑`/`↓` |
| Shoot | `K` or `Left Click` |
| Throw Grenade | `L` |

## 🚀 How to Run

1. **Copy all files** to a folder on your computer
2. **Open `index.html`** in a modern web browser (Chrome, Firefox, Edge, Safari)
3. **Start playing!** No installation or build step required

### Using a Local Server (Optional)

For best results, serve via HTTP:

```bash
# Using Python 3
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080

# Using PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

## 📁 File Structure

```
broforce/
├── index.html              # Entry point - loads Phaser and game scripts
├── README.md              # This file
└── src/
    ├── game.js            # Phaser configuration and initialization
    ├── scene_main.js      # Main gameplay scene and level data
    ├── player.js          # Player controller and mechanics
    ├── enemy.js           # Enemy AI and behavior
    ├── weapon.js          # Weapon system and projectile pooling
    ├── explosion.js       # Explosion effects and radial damage
    ├── terrain.js         # Destructible terrain system
    └── ui.js              # UI elements and HUD
```

## 🎨 Assets

The game currently uses **colored rectangles and circles as placeholders** for:
- **Player**: Blue rectangle (24x32px)
- **Enemies**: Red rectangles (24x32px)
- **Terrain**: Brown/gray rectangles (32x32px tiles)
- **Bullets**: Yellow/red rectangles (8x3px)
- **Grenades**: Green circles (8px radius)
- **Particles**: Various colored circles for effects

### Adding Custom Assets

To replace placeholder graphics with real sprites:

1. Create sprite sheets for player, enemies, and tiles
2. Add them to an `assets/` folder
3. Load them in `scene_main.js` `preload()` method:
   ```javascript
   this.load.spritesheet('player', 'assets/player.png', {
       frameWidth: 32, frameHeight: 32
   });
   ```
4. Replace `this.scene.add.rectangle()` calls with `this.scene.add.sprite()`

## 🎮 Gameplay Tips

1. **Destroy Everything**: Shoot destructible terrain for points
2. **Use Grenades Wisely**: You only have 5 grenades - make them count
3. **Chain Reactions**: Explosive blocks create massive chain reactions
4. **Watch Your Health**: Enemies hit hard - use cover and movement
5. **Climb to Safety**: Use ladders to reach high ground
6. **Double Jump**: Press jump twice to reach higher platforms

## 🛠️ Technical Details

- **Engine**: Phaser 3.70.0
- **Physics**: Arcade Physics
- **Rendering**: WebGL with Canvas fallback
- **Resolution**: 1280x720 pixels
- **Frame Rate**: 60 FPS (default)
- **Language**: Pure JavaScript (ES6+)
- **Dependencies**: None (Phaser loaded from CDN)

## 🔧 Customization

### Adjust Game Difficulty

Edit values in `src/player.js` and `src/enemy.js`:

```javascript
// Player power
this.health = 100;        // Starting health
this.speed = 200;         // Movement speed
this.jumpPower = -400;    // Jump strength

// Enemy difficulty
this.health = 50;         // Enemy health
this.fireRate = 1500;     // Enemy shooting delay (ms)
```

### Modify Level Layout

Edit the `levelData` array in `src/scene_main.js`:
```javascript
// 0=air, 1=dirt, 2=stone, 3=platform, 4=destructible, 5=ladder
this.levelData = [
    [0,0,0,0,0,...],  // Row 0 (top)
    [0,0,0,0,0,...],  // Row 1
    // ... more rows
];
```

### Add More Enemies

In `src/scene_main.js` `create()` method:
```javascript
this.enemyManager.spawnEnemy(x, y, patrolDistance);
```

## 🐛 Known Issues

- Enemies may occasionally get stuck on terrain edges
- Camera bounds don't account for tall levels
- No mobile touch controls yet

## 📝 License

Free to use, modify, and distribute. Built as an educational example.

## 🎓 Learning Resources

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Phaser 3 Examples](https://phaser.io/examples)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)

---

**Enjoy the game!** 🎮💥🔥
