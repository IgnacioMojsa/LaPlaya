class Npc {
    constructor(x, y, animacion, i){
        this.id = i;
        this.container = new PIXI.Container();
        this.container.position.set(x, y)
        this.velocidad = {x: Math.random() * 2 - 1, y: Math.random() * 2 - 1};
        this.aceleracion = {x: 0, y: 0};
        this.velocidadMax = 1;
        this.fuerzaMax = 0.25;


        this.cargarSpritesAnimados(animacion);
        this.cambiarAnimacion(Object.keys(animacion.animations)[0]);
        window.__PIXI_APP__.stage.addChild(this.container);
    }

/*     mantenerEnLimites(){
        //this.container.y = this.container.y + this.velocidadY;
        //this.container.x = this.container.x + this.velocidadX;

        if (this.container.y > window.innerHeight){
            this.container.y = -this.container.height - Math.random()*100;
        }

        if (this.container.y < -this.container.height){
            this.container.y = window.innerHeight;
        }

        if (this.container.x < -this.container.width){
            this.container.x = window.innerWidth
        }

         if (this.container.x > window.innerWidth){
            this.container.x = 0
        } */

    mantenerEnLimites(){
        if (this.container.x < 0) { this.container.x = 0; this.velocidad.x *= -1; }
        if (this.container.x > window.innerWidth) { this.container.x = window.innerWidth; this.velocidad.x *= -1; }

        if (this.container.y < 0) { this.container.y = 0; this.velocidad.y *= -1; }
        if (this.container.y > window.innerHeight) { this.container.y = window.innerHeight; this.velocidad.y *= -1; }
    }
    

    sumarAceleracion(x, y) {
        this.aceleracion.x += x;
        this.aceleracion.y += y;
    }

    evitarAgua(){
        if(this.container.y < LIMITE_AGUA.y + 0.5){
            this.sumarAceleracion(0, 0.5)
        }
        else if(this.container.y){

        }
    }

    alinear(boids){
        let radioDePercepcion = 20;
        let direccionDeseada = {x: 0, y:0};
        let total = 0;

        for(let otro of boids){
            if(otro !== this && distancia(
                otro.container.x, 
                this.container.x, 
                otro.container.y,
                this.container.y
            ) < radioDePercepcion) {
                    direccionDeseada.x += otro.velocidad.x;
                    direccionDeseada.y += otro.velocidad.y;
                    total++;
            }
        }

        if (total > 0){
            //Obtengo el promedio por medio de la division
            direccionDeseada.x /= total;
            direccionDeseada.y /= total;
            
            let fuerzaX = direccionDeseada.x - this.velocidad.x;
            let fuerzaY = direccionDeseada.y - this.velocidad.y;
            this.sumarAceleracion(fuerzaX * 0.5, fuerzaY * 0.5)
        }
    }

    cohesion(boids){
        let radioDePercepcion = 10;
        let promedioDePosicion = {x: 0, y: 0}
        let total = 0;
        this.npcCercanos = [];

        for(let otro of boids){
            let d = distancia(
                this.container.x, otro.container.x, 
                this.container.y, otro.container.y
            );

        // Si no soy yo mismo y está dentro del rango
            if (otro !== this && d < radioDePercepcion) {
                promedioDePosicion.x += otro.container.x;
                promedioDePosicion.y += otro.container.y;
                total++;
            }
        }        

        if (total > 0) {
            //Calculo el centro de masa de los vecinos
            promedioDePosicion.x /= total;
            promedioDePosicion.y /= total;

            //Calculo el vector hacia ese centro (dirección deseada)
            let deseadoX = promedioDePosicion.x - this.container.x;
            let deseadoY = promedioDePosicion.y - this.container.y;

            //Aplico una fuerza pequeña para que se acerquen suavemente
            this.sumarAceleracion(deseadoX * 0.01, deseadoY * 0.01);
        }
    }

    separar(boids) {
        let distanciaDeseada = 50; // El espacio personal de cada NPC
        let direccionAlejamiento = { x: 0, y: 0 };
        let total = 0;

        for (let otro of boids) {
            let d = distancia(
                this.container.x, otro.container.x, 
                this.container.y, otro.container.y
            );

            if (otro !== this && d < distanciaDeseada) {
                // Calculamos un vector que apunta en dirección opuesta al otro NPC
                let diffX = this.container.x - otro.container.x;
                let diffY = this.container.y - otro.container.y;

                // Cuanto más cerca está el otro, más fuerte es el empuje de alejamiento para eso se divide 
                // por la distancia
                diffX /= d;
                diffY /= d;

                direccionAlejamiento.x += diffX;
                direccionAlejamiento.y += diffY;
                total++;
            }
        }

        if (total > 0) {
            direccionAlejamiento.x /= total;
            direccionAlejamiento.y /= total;

            // Aplicamos la fuerza de separación y uso un valor un poco más alto que en cohesión para que la prioridad 
            // sea no chocar
            this.sumarAceleracion(direccionAlejamiento.x * 0.1, direccionAlejamiento.y * 0.1);
        }
    }

    agrupar(boids){
       this.alinear(boids);
       this.cohesion(boids);
       this.separar(boids);
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
        if (this.velocidad.x > 0) {
            this.cambiarAnimacion("der");
        }
        else if (this.velocidad.x < 0) {
            this.cambiarAnimacion("izq");
        }
    }

    render(){
        this.velocidad.x += this.aceleracion.x;
        this.velocidad.y += this.aceleracion.y;
        
        let mag = Math.sqrt(this.velocidad.x**2 + this.velocidad.y**2);
        
        if (mag > this.velocidadMax) {
            this.velocidad.x = (this.velocidad.x / mag) * this.velocidadMax;
            this.velocidad.y = (this.velocidad.y / mag) * this.velocidadMax;
        }
        
        this.container.x += this.velocidad.x;
        this.container.y += this.velocidad.y;

        this.aceleracion.x = 0;
        this.aceleracion.y = 0;
    }

    update(){
        //this.mantenerCercaDelAdulto();
        this.render();
        this.cambiarDeSpriteDeDireccion();
        this.mantenerEnLimites();
        this.agrupar(arrayDeNpc)
        this.evitarAgua();
    }
}
