class Nenes{
    constructor(x, y, textura, i){
        this.id = i;
        this.sprite = new PIXI.Sprite(textura);
        this.sprite.x = x;
        this.sprite.y = y;
        this.velocidadX = Math.random() * 10 - 5;
        this.velocidadY = Math.random() * 10 - 5;
    }

    moverse(){
        this.sprite.y = this.sprite.y + this.velocidadY;
        this.sprite.x = this.sprite.x + this.velocidadX;

        if (this.sprite.y > window.innerHeight){
            this.sprite.y = -this.sprite.height - Math.random()*100;
        }

        if (this.sprite.y < -this.sprite.height){
            this.sprite.y = window.innerHeight
        }

        if (this.sprite.x < -this.sprite.width){
            this.sprite.x = window.innerWidth
        }

         if (this.sprite.x > window.innerWidth){
            this.sprite.x = 0
        }
    }
}