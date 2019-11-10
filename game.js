const game = {
    ctx     : null,
    platform: null,
    ball    : null,
    blocks: [],
    rows: 4,
    cols: 8,
    sprites : {
        background: null,
        ball      : null,
        platform  : null,
        block     : null,
    },

    init() {
        //init
        this.ctx = document.getElementById('mycanvas').getContext('2d');
    },

    preload(callback) {
        let loaded   = 0;
        let required = Object.keys(this.sprites).length;
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

    run() {
        window.requestAnimationFrame(() => {
            this.render();
        });
    },
    render() {
        //render
        this.ctx.drawImage(this.sprites.background, 0, 0);
        this.ctx.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.renderBlocks();
    },

    renderBlocks() {
        this.blocks.forEach((block) => {
            this.ctx.drawImage(this.sprites.block, block.x, block.y);
        })
    },
    start() {
        this.init();
        this.preload(() => {
            this.create();
            this.run()
        });

    }
};

game.ball     = {
    x     : 320,
    y     : 270,
    width : 20,
    height: 20,
}
game.platform = {
    x: 280,
    y: 300,
}

window.addEventListener('load', () => {
    game.start();
});
