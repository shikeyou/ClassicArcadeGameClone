//=========================================================
// HELPER METHODS
//=========================================================

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
}
Number.prototype.fit = function(oldMin, oldMax, newMin, newMax) {
    return (this - oldMin) / (oldMax - oldMin) * (newMax - newMin) + newMin;
}

//=========================================================
// SCREEN ENTITY - SUPER CLASS FOR ALL THINGS THAT APPEAR ON SCREEN
//=========================================================

//constructor function
var ScreenEntity = function() {}

//shared properties
ScreenEntity.prototype.x = 0;  //screen position x
ScreenEntity.prototype.y = 0;  //screen position y
ScreenEntity.prototype.col = 0;  //row in the grid system
ScreenEntity.prototype.row = 0;  //row in the grid system
ScreenEntity.prototype.collisionAreaMarginRight = 0;  //how much margin to shave off from the right when detecting collision
ScreenEntity.prototype.collisionAreaMarginLeft = 0;  //how much margin to shave off from the left when detecting collision
ScreenEntity.prototype.renderOffsetX = 0;  //used to offset in X when rendering on screen
ScreenEntity.prototype.renderOffsetY = 0;  //used to offset in Y when rendering on screen
ScreenEntity.prototype.isVisible = true;

//shared methods
ScreenEntity.prototype.update = function(dt) {}
ScreenEntity.prototype.render = function() {
    if (this.isVisible) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}
ScreenEntity.prototype.setCol = function(col) {
    this.col = col;
    this.x = col * 101 + this.renderOffsetX;
}
ScreenEntity.prototype.setRow = function(row) {
    this.row = row;
    this.y = row * 83 + this.renderOffsetY;
}
ScreenEntity.prototype.hasCollidedWith = function(entity) {
    return (

        //condition 1: must be visible
        (this.isVisible === true)

        //condition 2: must be in the same row to collide
        && (this.row === entity.row)

        //to overlap horizontally, two more conditions must hold true at the same time:
        //condition 3A: right edge of this entity is more than the left edge of that entity
        && ((this.x + 101 - this.collisionAreaMarginRight) > (entity.x + entity.collisionAreaMarginLeft))
        //condition 3B: left edge of this entity is less than the right edge of that entity
        && ((this.x + this.collisionAreaMarginLeft) < (entity.x + 101 - entity.collisionAreaMarginRight))
    );
}

//=========================================================
// ENEMY CLASS
//=========================================================

//constructor function
var Enemy = function() {
    this.sprite = 'images/enemy-bug.png';
    this.collisionAreaMarginLeft = 3;
    this.collisionAreaMarginRight = 3;
    this.renderOffsetY = -20;

    //init
    this.reset();
}

//inherit from ScreenEntity
Enemy.prototype = Object.create(ScreenEntity.prototype);
Enemy.prototype.constructor = Enemy;

//shared properties
Enemy.prototype.minSpeed = 250;  //pixels per second
Enemy.prototype.maxSpeed = 400;  //pixels per second
Enemy.prototype.minInitialDelay = 0.5;  //second
Enemy.prototype.maxInitialDelay = 1.5;  //second

//shared methods
Enemy.prototype.reset = function() {

    //pick a random row on the rocks (row 1 to 3)
    this.setRow(Math.floor(Math.random().fit(0, 1, 1, 4)));

    //pick a random speed
    this.speed = Math.random().fit(0, 1, this.minSpeed, this.maxSpeed);

    //make sure it is out of screen to the left during reset
    this.x = -Math.random().fit(0, 1, this.minInitialDelay, this.maxInitialDelay) * this.speed;
}
Enemy.prototype.update = function(dt) {

    //add distance to x based on dt
    this.x += this.speed * dt;

    //if out of screen, reset
    if (this.x > canvasWidth) {
        this.reset();
    }
}

//=========================================================
// PLAYER CLASS
//=========================================================

//constructor function
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.collisionAreaMarginLeft = 16;
    this.collisionAreaMarginRight = 16;

    //init
    this.reset();
}

//inherit from ScreenEntity
Player.prototype = Object.create(ScreenEntity.prototype);
Player.prototype.constructor = Player;

//shared methods
Player.prototype.reset = function() {
    this.setRow(5);
    this.setCol(2);
}
Player.prototype.handleInput = function(keyString) {
    if (keyString !== 'undefined') {
        switch (keyString) {
            case 'left':
                this.setCol((this.col - 1).clamp(0, numCols - 1));
                break;
            case 'right':
                this.setCol((this.col + 1).clamp(0, numCols - 1));
                break;
            case 'up':
                this.setRow((this.row - 1).clamp(0, numRows - 1));
                break;
            case 'down':
                this.setRow((this.row + 1).clamp(0, numRows - 1));
                break;
        }
    }
}



//=========================================================
// COLLECTABLE - SUPER CLASS FOR ALL POWER UP ITEMS
//=========================================================
var Collectable = function() {}
Collectable.prototype = Object.create(ScreenEntity.prototype);
Collectable.prototype.constructor = Collectable;
Collectable.prototype.renderOffsetY = -32;

//=========================================================
// BLUE GEM COLLECTABLE CLASS
//=========================================================
var BlueGem = function() {
    this.sprite = 'images/Gem Blue.png';
    this.points = 1;
    this.appearProbability = 0.6;
}
BlueGem.prototype = Object.create(Collectable.prototype);
BlueGem.prototype.constructor = BlueGem;

//=========================================================
// GREEN GEM COLLECTABLE CLASS
//=========================================================
var GreenGem = function() {
    this.sprite = 'images/Gem Green.png';
    this.points = 3;
    this.appearProbability = 0.3;
}
GreenGem.prototype = Object.create(Collectable.prototype);
GreenGem.prototype.constructor = GreenGem;

//=========================================================
// STAR COLLECTABLE CLASS
//=========================================================
var Star = function() {
    this.sprite = 'images/Star.png';
    this.points = 10;
    this.appearProbability = 0.2;
}
Star.prototype = Object.create(Collectable.prototype);
Star.prototype.constructor = Star;



//=========================================================
// TEXT CLASS
//=========================================================
var Text = function(text, col, row, duration, color) {
    this.text = text;
    this.setCol(col);
    this.setRow(row);
    this.duration = duration;
    this.color = color;
    this.speed = 50;  //pixels per second
}
Text.prototype = Object.create(ScreenEntity.prototype);
Text.prototype.constructor = Text;
Text.prototype.update = function(dt) {
    this.duration -= dt;
    this.y -= this.speed * dt;
}
Text.prototype.render = function(dt) {
    ctx.font = "30px Arial";
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.x + 30, this.y + 120);
}


//=========================================================
// OBJECT INSTANTIATION
//=========================================================

//enemies
var allEnemies = [];
for (var i = 0; i < 3; i++) {
    allEnemies.push(new Enemy());
}

//player
var player = new Player();

//collectables
var allCollectables = [];
for (var i = 0; i < 4; i++) {
    allCollectables.push(new BlueGem());
}
for (var i = 0; i < 2; i++) {
    allCollectables.push(new GreenGem());
}
for (var i = 0; i < 1; i++) {
    allCollectables.push(new Star());
}

//texts
var allTexts = [];



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
