const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const TILE = 32;

let world = [];

const player = {
    x: 300,
    y: 200,
    size: 28,
    hp: 100,
    hunger: 100,
    speed: 4,
    inventory: {
        dirt: 0,
        stone: 0,
        wood: 0
    }
};

const mobs = [];
const keys = {};

let time = 0;

document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

function generateWorld() {

    for (let y = 0; y < 40; y++) {

        world[y] = [];

        for (let x = 0; x < 100; x++) {

            if (y > 20) {
                world[y][x] = 2;
            }
            else if (y === 20) {
                world[y][x] = 1;
            }
            else {
                world[y][x] = 0;
            }
        }
    }
}

generateWorld();

function saveWorld() {
    localStorage.setItem(
        "minecraft2d",
        JSON.stringify(world)
    );
}

function loadWorld() {

    const save =
        localStorage.getItem("minecraft2d");

    if (save) {
        world = JSON.parse(save);
    }
}

loadWorld();

canvas.addEventListener("click", e => {

    let x =
        Math.floor(e.offsetX / TILE);

    let y =
        Math.floor(e.offsetY / TILE);

    if (world[y] && world[y][x] !== 0) {

        if (world[y][x] === 1)
            player.inventory.dirt++;

        if (world[y][x] === 2)
            player.inventory.stone++;

        world[y][x] = 0;

        saveWorld();
    }
});

canvas.addEventListener("contextmenu", e => {

    e.preventDefault();

    let x =
        Math.floor(e.offsetX / TILE);

    let y =
        Math.floor(e.offsetY / TILE);

    if (player.inventory.dirt > 0) {

        world[y][x] = 1;

        player.inventory.dirt--;

        saveWorld();
    }
});

class Zombie {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hp = 40;
    }

    update() {

        let dx = player.x - this.x;
        let dy = player.y - this.y;

        let dist =
            Math.hypot(dx, dy);

        if (dist < 250) {

            this.x += dx / dist;
            this.y += dy / dist;
        }

        if (dist < 30) {
            player.hp -= 0.05;
        }
    }

    draw() {

        ctx.fillStyle = "green";

        ctx.fillRect(
            this.x,
            this.y,
            28,
            28
        );

        ctx.fillStyle = "red";
        ctx.fillRect(
            this.x,
            this.y - 8,
            28,
            4
        );

        ctx.fillStyle = "lime";
        ctx.fillRect(
            this.x,
            this.y - 8,
            28 * (this.hp / 40),
            4
        );
    }
}

for (let i = 0; i < 5; i++) {

    mobs.push(
        new Zombie(
            600 + Math.random() * 500,
            400
        )
    );
}

function update() {

    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    player.hunger -= 0.003;

    mobs.forEach(m => m.update());

    time += 0.002;
}

function drawWorld() {

    for (let y = 0; y < world.length; y++) {

        for (let x = 0; x < world[y].length; x++) {

            if (world[y][x] === 1) {

                ctx.fillStyle = "#4CAF50";

                ctx.fillRect(
                    x * TILE,
                    y * TILE,
                    TILE,
                    TILE
                );
            }

            if (world[y][x] === 2) {

                ctx.fillStyle = "#777";

                ctx.fillRect(
                    x * TILE,
                    y * TILE,
                    TILE,
                    TILE
                );
            }
        }
    }
}

function drawPlayer() {

    ctx.fillStyle = "dodgerblue";

    ctx.fillRect(
        player.x,
        player.y,
        player.size,
        player.size
    );
}

function updateUI() {

    document.getElementById(
        "hpFill").style.width =
        player.hp + "%";

    document.getElementById(
        "hungerFill").style.width =
        player.hunger + "%";

    const inv =
        document.getElementById(
            "inventory");

    inv.innerHTML = "";

    for (let item in player.inventory) {

        const slot =
            document.createElement("div");

        slot.className = "slot";

        slot.innerHTML =
            item + "<br>" +
            player.inventory[item];

        inv.appendChild(slot);
    }
}

function dayNight() {

    let brightness =
        60 + Math.sin(time) * 40;

    canvas.style.filter =
        `brightness(${brightness}%)`;
}

function loop() {

    update();

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawWorld();

    mobs.forEach(m => m.draw());

    drawPlayer();

    updateUI();

    dayNight();

    requestAnimationFrame(loop);
}

loop();