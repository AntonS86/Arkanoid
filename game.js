const keys = {
    left : 37,
    right: 39,
    space: 32,
}

const game = {
    ctx     : null,
    platform: null,
    ball    : null,
    blocks  : [],
    rows    : 4,
    cols    : 8,
    width   : 640,
    height  : 360,
    sprites : {
        background: null,
        ball      : null,
        platform  : null,
        block     : null,
    },

    //инициализация
    init() {
        this.ctx = document.getElementById('mycanvas').getContext('2d');
        this.setEvents();
    },

    //вызов обработчиков нажатия клавиш
    setEvents() {
        window.addEventListener("keydown", (e) => {
            if (e.keyCode === keys.space) {
                this.platform.fire();
            } else if (e.keyCode === keys.left || e.keyCode === keys.right) {
                this.platform.start(e.keyCode);
            }
        });

        window.addEventListener("keyup", (e) => {
            this.platform.stop();
        });
    },

    //предзагрузка спрайтов картинок
    preload(callback) {
        let loaded        = 0;
        let required      = Object.keys(this.sprites).length;
        const onImageLoad = () => {
            loaded += 1;
            if (loaded >= required) {
                callback();
            }
        };
        Object.keys(this.sprites).forEach((key) => {
            this.sprites[key]     = new Image();
            this.sprites[key].src = `img/${key}.png`;
            this.sprites[key].addEventListener('load', onImageLoad);
        });
    },

    //создание массива с координатами блоков
    create() {
        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                this.blocks.push({
                    x: 64 * col + 65,
                    y: 24 * row + 30,
                })
            }
        }
    },

    //обновление координат
    update() {
        this.platform.move();
        this.ball.move();
    },

    //рекурсивная функция объединяет все отрисовки и обновления
    run() {
        window.requestAnimationFrame(() => {
            this.update();
            this.render();
            this.run();
        });
    },

    //отририсовка всех спрайтов
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.drawImage(this.sprites.background, 0, 0);
        this.ctx.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.renderBlocks();
    },

    //отрисовка всех блоков
    renderBlocks() {
        this.blocks.forEach((block) => {
            this.ctx.drawImage(this.sprites.block, block.x, block.y);
        })
    },

    //старт приложения
    start() {
        this.init();
        this.preload(() => {
            this.create();
            this.run()
        });

    },

    //случайное число
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
};

//объект мяча
game.ball = {
    velocity: 3,
    dx      : 0,
    dy      : 0,
    x       : 320,
    y       : 280,
    width   : 20,
    height  : 20,

    //смещение мяча
    start() {
        this.dy = -this.velocity;
        this.dx = game.random(-this.velocity, this.velocity);
    },

    //изменение координат
    move() {
        if (this.dy) {
            this.y += this.dy;
        }

        if (this.dx) {
            this.x += this.dx;
        }
    }
}

//объект платформы
game.platform = {
    //движение платформы
    velocity: 6,
    dx      : 0,
    x       : 280,
    y       : 300,
    ball    : game.ball,

    //смещение платформы
    start(direction) {
        if (direction === keys.left) {
            this.dx = -this.velocity;
        } else if (direction === keys.right) {
            this.dx = this.velocity;
        }
    },

    //прекращение смещения платформы
    stop() {
        this.dx = 0;
    },

    //изменение координаты x
    move() {
        if (this.dx) {
            this.x += this.dx;
            if (this.ball) {
                this.ball.x += this.dx;
            }
        }
    },

    //выстред мячем
    fire() {
        if (this.ball) {
            this.ball.start();
            this.ball = null;
        }
    }
}

window.addEventListener('load', () => {
    game.start();
});
