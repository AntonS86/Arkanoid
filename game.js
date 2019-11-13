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
                    active: true,
                    width : 60,
                    height: 20,
                    x     : 64 * col + 65,
                    y     : 24 * row + 30,
                })
            }
        }
    },

    //обновление координат
    update() {
        //проверка на столкновения с границей экрана
        this.ball.collideWorldBounds();
        this.platform.collideWorldBounds();

        //проверка на столкновение с блоком
        this.collideBlocks();
        this.collidePlatform();

        this.platform.move();
        this.ball.move();
    },

    //проверка на столкновение с блоком
    collideBlocks() {
        this.blocks.forEach((block) => {
            if (block.active && this.ball.collide(block)) {
                this.ball.bumpBlock(block);
            }
        });
    },
    //столкновение с платформой
    collidePlatform() {
        if (this.ball.collide(this.platform)) {
            this.ball.bumpPlatform(this.platform);
        }
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
            if (block.active) {
                this.ctx.drawImage(this.sprites.block, block.x, block.y);
            }
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
    },

    //столкновение с элиментом
    collide(element) {
        //следующий кадр анимации
        const x = this.x + this.dx;
        const y = this.y + this.dy;

        if (x + this.width > element.x &&
            x < element.x + element.width &&
            y + this.height > element.y &&
            y < element.y + element.height) {
            return true;
        }

        return false;
    },

    //изменение направления после столкновения
    bumpBlock(block) {
        this.dy *= -1;
        block.active = false;
    },

    //изменений угла направления после столкновения с платформой
    bumpPlatform(platform) {
        if (this.dy <= 0) return;
        //точка касания мяча и платформы
        const touchX = this.x + this.width / 2;
        //изменение угла отскока
        this.dx      = this.velocity * platform.getTouchOffset(touchX);
        this.dy      = -this.velocity;
    },

    //изменение направление после столкновения с краем мира
    collideWorldBounds() {
        //следующий кадр анимации
        const x = this.x + this.dx;
        const y = this.y + this.dy;

        //координаты мяча
        const ballLeft   = x;
        const ballRight  = ballLeft + this.width;
        const ballTop    = y;
        const ballBottom = ballTop + this.height;

        //координаты мира
        const worldLeft   = 0;
        const worldRight  = game.width;
        const worldTop    = 0;
        const worldBottom = game.height;

        if (ballLeft < worldLeft) {
            this.x = 0;
            this.dx *= -1;
        } else if (ballRight > worldRight) {
            this.x = worldRight - this.width;
            this.dx *= -1;
        } else if (ballTop < worldTop) {
            this.y = 0;
            this.dy *= -1;
        } else if (ballBottom > worldBottom) {
            console.log('game over');
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
    width   : 100,
    height  : 14,
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

    //столкновение платформы с краем мира
    collideWorldBounds() {
        const x = this.x + this.dx;

        const platformLeft  = x;
        const platformRight = platformLeft + this.width;

        const worldLeft  = 0;
        const worldRight = game.width;

        if (platformLeft < worldLeft || platformRight > worldRight) {
            //остановка движения
            this.dx = 0;
        }
    },

    //выстрел мячем
    fire() {
        if (this.ball) {
            this.ball.start();
            this.ball = null;
        }
    },

    //алгоритм смещения шара при касании платформы
    getTouchOffset(x) {
        //растояние справа от касания
        const diff   = (this.x + this.width) - x;
        //растояние слева от касания
        const offset = this.width - diff;
        //берем платформу равнуб 2 частям, расчитаем точку касания по отношению
        //к 2 частям this.width = 2; offset = result;
        //result равен точке от 0 до 2
        const result = 2 * offset / this.width;
        //вычитаем еденицу, чтобы получить точку от -1 до 1
        return result - 1;
    }
}

window.addEventListener('load', () => {
    game.start();
});
