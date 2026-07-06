class Npc {
    constructor(x, y, animacion, i){
        this.id = i;
        this.container = new PIXI.Container();
        this.container.position.set(x, y)

        this.sombra = new PIXI.Sprite(miJuego.sombra);

        this.maquinaDeEstados = new MaquinaDeEstados(this);
        this.maquinaDeEstados.agregarEstado('DEFAULT', new DefaultState(this));
        this.maquinaDeEstados.agregarEstado('SWIM', new SwimState(this));
        this.maquinaDeEstados.agregarEstado('DROWN', new DrownState(this));
        this.maquinaDeEstados.agregarEstado('RESCUED', new RescuedState(this));
        this.maquinaDeEstados.cambiarA('DEFAULT');
        
        this.velocidad = {x: Math.random() * 2 - 1, y: Math.random() * 2 - 1};
        this.aceleracion = {x: 0, y: 0};
        this.velocidadMax = 1;
        this.fuerzaMax = 0.25;
        this.aceleracionMax = 0.2;

        this.ultimaDir = "izq";
        this.temerosidad = obtenerNumeroAleatorio(1, 5);
        this.ahogandose = false;
        this.rescatado = false;
        this.tiempoEnPeligro = 0;

        this.target = {x: this.container.x, y: this.container.y}
        this.separacion = {x: 50, y: 50};
        this.suavizado = 0.05;
        this.distanciaMaxTarget = 40;
        this.distanciaMinTarget = 20;

        this.temporizador = 0;

        this.mensaje = new PIXI.Text({
          text: "Pulsa E para rescatar",
          style: {
            fill: "white",
            fontSize: 18,
            fontFamily: "PixelFont"
          }
        });
        this.mensaje.anchor.set(0.5);
        this.mensaje.visible = false;
        this.mensaje.y = -80;
        this.container.addChild(this.mensaje);

        this.cargarSpritesAnimados(animacion);
        this.cambiarAnimacion(Object.keys(animacion.animations)[0]);

        this.sombra.anchor.set(0.5, 0.9);
        this.sombra.position.set(this.container.position.x, this.container.position.y);
        this.sombra.alpha = 0.5;
        this.sombra.zIndex = this.container.position.y - 3;

        miJuego.mundo.addChild(this.sombra);
    }

    mantenerEnLimites(dt){
        if (this.container.x < 0) { this.container.x = 0; this.velocidad.x *= -1; }
        if (this.container.x > miJuego.fondo.width) { this.container.x = miJuego.fondo.width; this.velocidad.x *= -1; }

        if(this.estaExcedidoDelLimite()){
            if(this.esMuyTemerario() && !this.rescatado){
                this.ahogandose = true;
            }
            else if(!this.rescatado){
                this.evitarAgua();
            }
        }

        if (this.container.y > miJuego.fondo.height) { this.container.y =  miJuego.fondo.height; this.velocidad.y *= -1; }
    }

    sumarAceleracion(x, y) {
        this.aceleracion.x += x;
        this.aceleracion.y += y;
    }

    estaExcedidoDelLimite(){
        if(this.esTemerario()){
            return this.container.y < miJuego.zonaPeligrosa;
        }
        else if(this.esMuyTemerario()){
            return this.container.y < miJuego.horizonte;
        }
        else{
            return this.container.y < miJuego.limitePermitido;
        }
    }

    evitarAgua(){
        this.sumarAceleracion(0, 0.5)
    }

    ahogarse(){
        this.ahogandose = true;
        
        this.velocidad.x = 0;
        this.velocidad.y = 0;
        this.aceleracion.x = 0;
        this.aceleracion.y = 0;

        if(this.ultimaDir === "izq"){ 
            this.cambiarAnimacion("drown_izq");
        }

        else if(this.ultimaDir === "der"){
            this.cambiarAnimacion("drown_der");
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
                //Calculamos un vector que apunta en dirección opuesta al otro NPC
                let diffX = this.container.x - otro.container.x;
                let diffY = this.container.y - otro.container.y;

                //Cuanto más cerca está el otro, más fuerte es el empuje de alejamiento para eso se divide por la distancia
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

            //Aplicamos la fuerza de separación y uso un valor un poco más alto que en cohesión para que la prioridad sea no chocar
            this.sumarAceleracion(direccionAlejamiento.x * 0.1, direccionAlejamiento.y * 0.1);
        }
    }

    agrupar(boids){
       this.alinear(boids);
       this.cohesion(boids);
       this.separar(boids);
    }

    evitarAlgo(posicionX, posicionY){
        let dx = posicionX - this.container.x;
        let dy = posicionY - this.container.y;

        const dist = Math.hypot(dx, dy);
        
        if (dist < 80){
            const ratio = dist / 100;

            const vx = dx / dist;
            const vy = dy / dist
                
            this.sumarAceleracion(-vx * ratio, -vy * ratio)
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
        if (this.velocidad.x > 0) {
            this.cambiarAnimacion("der");
        }
        else if (this.velocidad.x < 0) {
            this.cambiarAnimacion("izq");
        }
    }

    mantenerCercaDe(alguien){
    if (this.ahogandose) return;

    const targetX = alguien.container.x + this.separacion.x;
    const targetY = alguien.container.y + this.separacion.y;

    this.target.x += (targetX - this.target.x) * this.suavizado;
    this.target.y += (targetY - this.target.y) * this.suavizado;

    const d = distancia(this.container.x, this.target.x, this.container.y, this.target.y);
    if(d === 0) return;

    if(d > this.distanciaMaxTarget){
      const dX = (this.target.x - this.container.x) / d;
      const dY = (this.target.y - this.container.y) / d;
      let intensidad = (d - this.distanciaMaxTarget) * 0.05;
      intensidad = Math.min(intensidad, this.aceleracionMax);
      this.sumarAceleracion(dX * intensidad, dY * intensidad);
    }

    else if(d < this.distanciaMinTarget){
      const dX = (this.container.x - this.target.x) / d;
      const dY = (this.container.y - this.target.y) / d;
      this.sumarAceleracion(dX * 0.05, dY * 0.05);
    }

    else {
      this.sumarAceleracion((alguien.velocidad.x - this.velocidad.x) * 0.05, (alguien.velocidad.y - this.velocidad.y) * 0.05);
    }
    }

    estaNadando(){
        return this.container.y < miJuego.horizonte || this.container.y < miJuego.orillaDelMar
    }

    esTemerario(){
        return this.temerosidad > 3
    }

    esMuyTemerario(){
        return this.temerosidad == 5;
    }

    estaCargandoUnNene(){
        return false 
    }

    estaQuieto(){
        return this.velocidad.x == 0;
    }

    nadar(){
        if(this.estaNadando() && this.velocidad.x > 0){
            this.sombra.visible = false;
            this.cambiarAnimacion("swim_der");
        }
        else if (this.estaNadando() && this.velocidad.x < 0){
            this.sombra.visible = false;
            this.cambiarAnimacion("swim_izq");
        }

        if (this.estaNadando() && this.velocidad.x > 0 && this.rescatado) {
            this.cambiarAnimacion("rescatado_der");
        }
        else if (this.estaNadando() && this.velocidad.x < 0 && this.rescatado) {
            this.cambiarAnimacion("rescatado_izq");
        }
    }

    cambiarVelocidadDeAnimacion(){
        if(this.velocidad.x > 0.09 || this.velocidad.y > 0.09){
            this.spriteAnimadoActual.animationSpeed = 0.09;
        }
        
        else if(this.velocidad.x > 0.5 || this.velocidad.y > 0.5 && this.velocidad.x < 0.08 || this.velocidad.y < 0.08){
            this.spriteAnimadoActual.animationSpeed = 0.07;
        }

        else if(this.velocidad.x < 0.5 || this.velocidad.y < 0.5){
            this.spriteAnimadoActual.animationSpeed = 0.04;
        }
    }

    recuperarse(dt){
        // Si el npc ahogado es llevado a la orilla se debe establecer su animacion idle, esperar unos segundos y volver a moverse. Ademas su 
        // nivel de temerosidad debe reducirse a 3 o menos y se debe recompoensar al jugador con x cantidad de dinero.
        // Tambien hay que eliminar al npc rescatado de la lista de personas temerarias

        if(this.container.y > miJuego.orillaDelMar + 15){
            this.velocidad.x = 0;
            this.velocidad.y = 0;
            this.aceleracion.x = 0;
            this.aceleracion.y = 0;
            
            if(this.ultimaDir === "izq"){
                this.cambiarAnimacion("idle_izq")
            }
            else if(this.ultimaDir === "der"){
                this.cambiarAnimacion("idle_der")                
            }
            
            this.temporizador += dt;

            if(this.temporizador >= 6){
                this.rescatado = false;
                this.temerosidad = obtenerNumeroAleatorio(1,3);
                miJuego.jugador.personaAhogada = null;
                playSfx(sfx.aplauso)
            }
        }
    }

    actualizarPosicionDeSombra(){
        this.sombra.position.set(this.container.position.x, this.container.position.y);
        this.sombra.zIndex = this.container.position.y - 3;
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
        this.container.zIndex = this.container.y;

        this.aceleracion.x = 0;
        this.aceleracion.y = 0;
    }

    update(dt){
       this.render();
       this.mantenerEnLimites(dt);
       this.agrupar(miJuego.arrayDeNpc);
       this.evitarAlgo(miJuego.jugador.container.x, miJuego.jugador.container.y);
       miJuego.castillos.forEach(castillo => {this.evitarAlgo(castillo.x, castillo.y, castillo.destruido);});
       this.maquinaDeEstados.update(dt)

          /*
        if(this.ahogandose && !this.rescatado){
            this.ahogarse();
            return;
        }
        
        else if(!this.ahogandose && this.rescatado){
            this.render();
            this.mantenerEnLimites(dt);
            this.mantenerCercaDe(miJuego.jugador);
            this.nadar();
            this.recuperarse(dt);
            return
        }

        else{
            this.sombra.visible = true;
            this.render();
            this.cambiarDeSpriteDeDireccion();
            this.mantenerEnLimites(dt);
            this.agrupar(miJuego.arrayDeNpc)
            this.evitarAlgo(miJuego.jugador.container.x, miJuego.jugador.container.y);
            this.cambiarVelocidadDeAnimacion();
            this.nadar();
            //this.evitarAgua();
        }

        this.actualizarPosicionDeSombra()
        */
    }
}
