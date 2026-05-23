class GameObject {
    constructor(x, y, texture, i){
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;
        this.container.zIndex = y;

        this.id = i;

        this.texture = new PIXI.Sprite(texture);

        this.texture.anchor.set(0.5, 0.92);

        this.container.addChild(this.texture);
    }
}