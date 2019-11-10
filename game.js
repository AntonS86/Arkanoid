const game = {
    ctx     : null,
    platform: null,
    ball    : null,
    blocks  : [],
    rows    : 4,
    cols    : 8,
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

    //вызов люраюотчиков нажатия клавиш
    setEvents() {
        window.addEventListener("keydown", (e) => {
            if (e.keyCode === 37) {
                this.platform.dx = -this.platform.velocity;
            } else if (e.keyCode === 39) {
                this.platform.dx = this.platform.velocity;
            }
        });

        window.addEventListener("keyup", (e) => {
            this.platform.dx = 0;
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

    }
};

//объект мяча
game.ball     = {
    x     : 320,
    y     : 270,
    width : 20,
    height: 20,
}

//объект платформы
game.platform = {
    //движение платформы
    velocity: 6,
    dx      : 0,
    x       : 280,
    y       : 300,
    //изменение координаты x
    move() {
        if (this.dx) {
            this.x += this.dx;
        }
    }
}

window.addEventListener('load', () => {
    game.start();
});
