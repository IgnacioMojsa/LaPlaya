class Npc {
    constructor(x, y, animacion, i){
        this.id = i;
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;
        this.velocidadX = Math.random() * 10 - 5;
        this.velocidadY = Math.random() * 10 - 5;

        this.cargarSpritesAnimados(animacion);
        this.cambiarAnimacion(Object.keys(animacion.animations)[0]);
        window.__PIXI_APP__.stage.addChild(this.container);
    }

    moverse(){
        this.container.y = this.container.y + this.velocidadY;
        this.container.x = this.container.x + this.velocidadX;

        if (this.container.y > window.innerHeight){
            this.container.y = -this.container.height - Math.random()*100;
        }

        if (this.container.y < -this.container.height){
            this.container.y = window.innerHeight
        }

        if (this.container.x < -this.container.width){
            this.container.x = window.innerWidth
        }

         if (this.container.x > window.innerWidth){
            this.container.x = 0
        }
    }

    cambiarAnimacion(nuevaAnimacion){
        this.animacionActual = nuevaAnimacion
        for (let key of Object.keys(this.spritesAnimados)) {
            this.spritesAnimados[key].visible = false;
        }
        
        this.spritesAnimados[nuevaAnimacion].visible = true;
        this.spriteAnimadoActual = this.spritesAnimados[nuevaAnimacion];
    }

    cargarSpritesAnimados(spritesACargar){
        this.spritesAnimados = {};

        for (let key of Object.keys(spritesACargar.animations)) {
            this.spritesAnimados[key] = new PIXI.AnimatedSprite(spritesACargar.animations[key])
        
            this.spritesAnimados[key].name = key;
            this.spritesAnimados[key].play();
            this.spritesAnimados[key].loop = true;
            this.spritesAnimados[key].animationSpeed = 0.1;
            this.spritesAnimados[key].anchor.set(0.5, 1);
            this.container.addChild(this.spritesAnimados[key]);
        }
    }

    cambiarDeSpriteDeDireccion(){
        if (this.velocidadX > 0) {
            this.cambiarAnimacion("der");
        }
        else if (this.velocidadX < 0) {
            this.cambiarAnimacion("izq");
        }
    }

    render(){
        this.moverse();
        this.cambiarDeSpriteDeDireccion();
    }
}
