/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let input = {
    left: false,
    right: false,
    up: false,
    down: false,
};

let player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
};

let shooting = false;
let direction = 'north'; // "north" | "east" | "south" | "west"
let accelerometer = { x: 0, y: 0, z: 0 };
navigator.permissions.query({ name: 'accelerometer' }).then((result) => {
    console.log(result.state);
    if (result.state === 'granted') {
        accelerometer = new Accelerometer({ frequency: 60 });
        accelerometer.addEventListener('reading', () => {
            console.log(`Acceleration along the X-axis ${accelerometer.x}`);
            console.log(`Acceleration along the Y-axis ${accelerometer.y}`);
            console.log(`Acceleration along the Z-axis ${accelerometer.z}`);
        });
        accelerometer.start();
    }
    // Don't do anything if the permission was denied.
}, console.log);

// BULLETS
let bullets = [];
setInterval(function () {
    if (shooting) {
        shootBullet();
    }
}, 100);

const shootBullet = () => {
    bullets.push({
        x: player.x + 5,
        y: player.y,
    });
};

// ENEMIES
let enemies = [];
setInterval(function () {
    // spawnEnemy();
}, 200);

const spawnEnemy = () => {
    enemies.push({
        x: Math.random() * canvas.width,
        y: -20,
    });
};

// GAME LOOP
let lastTime = 0;
window.requestAnimationFrame(gameLoop);
function gameLoop(time) {
    // console.log(`Acceleration along the X-axis ${acl.x}`);

    let delta = time - lastTime; // Time since last frame
    lastTime = time;

    // Player movement
    // if (input.left) {
    //     player.x -= 0.5 * delta;
    // } else if (input.right) {
    //     player.x += 0.5 * delta;
    // } else if (input.up) {
    //     player.y -= 0.5 * delta;
    // } else if (input.down) {
    //     player.y += 0.5 * delta;
    // }

    // player.x += acl.x;

    // BULLET LOGIC
    for (let bullet of bullets) {
        let bulletX = player.x;
        let bulletY = player.y;
        switch (direction) {
            case 'north':
                bulletX += 5;
                break;
            case 'east':
                bulletX += 5;

                break;
            case 'south':
                break;
            case 'west':
                break;
        }
        bullet.y -= 0.5 * delta;
        for (let enemy of enemies) {
            if (colliding(bullet, enemy)) {
                bullets = bullets.filter((b) => b !== bullet);
                enemies = enemies.filter((e) => e !== enemy);
            }
        }
    }

    // ENEMY LOGIC
    for (let enemy of enemies) {
        enemy.y += 0.15 * delta;
        // if (enemy.y > canvas.height) {
        //     // Game over
        //     gameOver();
        //     // Stops the game loop
        //     return;
        // }
    }

    // DRAWING
    draw();
    window.requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (typeof Gyroscope === 'function') {
        // run in circles…
        ctx.fillStyle = 'pink';
    } else {
        ctx.fillStyle = 'lightgreen';
    }

    ctx.fillRect(player.x, player.y, 20, 20);

    ctx.fillStyle = 'white';
    for (let bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, 5, 10);
    }

    ctx.fillStyle = 'red';
    for (let enemy of enemies) {
        ctx.fillRect(enemy.x, enemy.y, 20, 20);
    }
}

function colliding(bullet, enemy) {
    let topOfBullet = bullet.y;
    let bottomOfEnemy = enemy.y + 20;
    let topOfEnemy = enemy.y;

    let leftSideOfBullet = bullet.x;
    let rightSideOfBullet = bullet.x + 10;
    let leftSideOfEnemy = enemy.x;
    let rightSideOfEnemy = enemy.x + 20;

    if (topOfBullet < bottomOfEnemy && topOfBullet > topOfEnemy) {
        if (
            leftSideOfBullet > leftSideOfEnemy &&
            leftSideOfBullet < rightSideOfEnemy
        ) {
            return true;
        } else if (
            rightSideOfBullet > leftSideOfEnemy &&
            rightSideOfBullet < rightSideOfEnemy
        ) {
            return true;
        }
    }
    return false;
}

const gameOver = () => {
    ctx.fillStyle = 'white';
    ctx.font = '48px sans-serif';
    ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2);
};

// Keyboard controls
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        input.left = true;
        direction = 'west';
    } else if (event.key === 'ArrowRight') {
        input.right = true;
        direction = 'east';
    } else if (event.key === 'ArrowUp') {
        input.up = true;
        direction = 'north';
    } else if (event.key === 'ArrowDown') {
        input.down = true;
        direction = 'south';
    }

    if (event.keyCode == 32) {
        shooting = true;
    }
});
document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') {
        input.left = false;
    } else if (event.key === 'ArrowRight') {
        input.right = false;
    } else if (event.key === 'ArrowUp') {
        input.up = false;
    } else if (event.key === 'ArrowDown') {
        input.down = false;
    }

    if (event.keyCode == 32) {
        shooting = false;
    }
});

// BONUS: TAP CONTROLS
document.addEventListener(
    'touchstart',
    (event) => {
        if (event.changedTouches[0].clientX < canvas.width / 2) {
            input.left = true;
        } else {
            input.right = true;
        }
        // Prevent default behavior, like scrolling, zooming and long-press menus.
        event.preventDefault();
        event.stopPropagation();
    },
    { passive: false }
);
document.addEventListener('touchend', (event) => {
    if (event.changedTouches[0].clientX < canvas.width / 2) {
        input.left = false;
    } else {
        input.right = false;
    }
});
