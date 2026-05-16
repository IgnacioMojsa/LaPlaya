// Clase Jugador para PIXI
class Jugador {
  constructor(x, y, texture) {
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;

    this.vx = 0;
    this.vy = 0;

    this.velMaxima = 80;
    this.aceleracion = 80;
    this.friccion = 0.95;
    this.ultimaDireccion = "der";
    
    this.input = {izq: false, der: false, arriba: false, abajo: false }; //Me gustó más la forma

    //this.mensaje = new PIXI.Text("Pulsa F para rescatar al nene", {fill: "white", fontSize: 24});
    //this.mensaje.anchor.set(0.5);
    //this.mensaje.visible = false;

    this.cargarSpritesAnimados(texture);
    this.cambiarAnimacion(Object.keys(texture.animations)[0]);
  }

  inputTeclado(dt, keys){
    this.input.izq    = keys.a || keys.A;
    this.input.der    = keys.d || keys.D;
    this.input.arriba = keys.w || keys.W;
    this.input.abajo  = keys.s || keys.S;
    
    let aceleracionX = 0, aceleracionY = 0;
    if (this.input.izq)    aceleracionX -= this.aceleracion;
    if (this.input.der)    aceleracionX += this.aceleracion;
    if (this.input.arriba) aceleracionY -= this.aceleracion;
    if (this.input.abajo)  aceleracionY += this.aceleracion;

    this.vx += aceleracionX * dt;
    this.vy += aceleracionY * dt;
    
    if (aceleracionX === 0) this.vx *= this.friccion;
    if (aceleracionY === 0) this.vy *= this.friccion;

    this.container.x += this.vx * dt;
    this.container.y += this.vy * dt;

    const velocidad = Math.hypot(this.vx, this.vy);
    if (velocidad > this.velMaxima){
      const limite = this.velMaxima / velocidad;
      this.vx *= limite;
      this.vy *= limite;
      }
    
    //Interaccion
    const interactuar = (keys.f && !keysProcesadas.f) || (keys.F && !keysProcesadas.F);

    if (interactuar && this.estaCercaDeAlgunNenePerdido()){
      if (keys.f) keysProcesadas.f = true;
      if (keys.F) keysProcesadas.F = true;
      
      const nenePerdido = this.nenePerdidoMasCercano()
      
      console.log("interactuando con nene perdido");
      nenePerdido.adulto = this;
      nenePerdido.perdido = false;
    } 
  }

  estaNadando(){
    return this.container.y < miJuego.horizonte || this.container.y < miJuego.orillaDelMar
  }

  estaQuieto(){
    return Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1;
  }

  estaCercaDeAlgunNenePerdido(){
    // Devuelve un booleano. Es verdadero si el personaje esta cerca de algun nene perdido, sino devuelve falso

    return miJuego.totalNenes.some(nene => nene.perdido && distancia(this.container.x, nene.container.x, this.container.y, nene.container.y) < 15)
  }

  nenePerdidoMasCercano(){
    // Devuelve al nene perdido que mas cerca se encuentra del jugador
    
    const nenePerdido = miJuego.totalNenes.find(nene => nene.perdido && distancia(this.container.x, nene.container.x, this.container.y, nene.container.y) < 15);

    return nenePerdido
  }

  actualizarMensajesDeNenes(){
  
    // Si ya tengo un nene conmigo, no mostrar mensajes
    const tieneNeneRescatado = miJuego.totalNenes.some(
      nene => nene.adulto === this
    );

    for(const nene of miJuego.totalNenes){

      // Resetear
      nene.mensaje.visible = false;

      // Solo mostrar si:
      // - está perdido
      // - estoy cerca
      // - NO tengo otro nene siguiéndome

      const cerca =
        distancia(
          this.container.x,
          nene.container.x,
          this.container.y,
          nene.container.y
        ) < 15;

      if(
        nene.perdido &&
        cerca &&
        !tieneNeneRescatado
      ){
        nene.mensaje.visible = true;
      }
    }
  }

/*   aplicarFriccion(dt, v){
    if (v) return 0;
    const signo = Math.sign(v);
    const nueva = Math.abs(v) - this.friccion * dt;
    if (nueva > 0){
      return signo * nueva;
    }
    else {
      return 0;
    }
  } */

 /*  mostrarMensajeDeRescate(){
    //const mensaje = new PIXI.Text("Pulsa F para rescatar al nene", { fill: "white", fontSize: 24});
    
    if(this.estaCercaDeAlgunNenePerdido()){
      console.log("Estas cerca de un nene perdido")
      this.mensaje.visible = true;
      this.mensaje.x = this.container.x;
      this.mensaje.y = this.container.y - 5;
    }
    else{
      this.mensaje.visible = false;
    }
  } */

  update(dt){
    this.container.x += this.vx * dt;
    this.container.y += this.vy * dt;
    this.cambiarDeSpriteDeDireccion();
    //this.mostrarMensajeDeRescate()
    this.actualizarMensajesDeNenes();
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

  cambiarAnimacion(nuevaAnimacion){
    this.animacionActual = nuevaAnimacion
      for (let key of Object.keys(this.spritesAnimados)) {
        this.spritesAnimados[key].visible = false;
      }
      
    this.spritesAnimados[nuevaAnimacion].visible = true;
    this.spriteAnimadoActual = this.spritesAnimados[nuevaAnimacion];
  }

  cambiarDeSpriteDeDireccion(){
    if (this.vx > 0) this.ultimaDireccion = "der";
    if (this.vx < 0) this.ultimaDireccion = "izq";
    
    if(this.estaQuieto() && this.ultimaDireccion === "der"){
      this.cambiarAnimacion("idle_der")
    }
    else if(this.estaQuieto() && this.ultimaDireccion === "izq"){
      this.cambiarAnimacion("idle_izq")
    }
    
    if (this.vx > 0 && !this.estaQuieto()) {
      this.cambiarAnimacion("der");
    }
    else if (this.vx < 0 && !this.estaQuieto()) {
      this.cambiarAnimacion("izq");
    }

    if (this.estaNadando() && this.vx > 0){
      this.cambiarAnimacion("swim_der")
    }
    else if (this.estaNadando() && this.vx < 0){
      this.cambiarAnimacion("swim_izq")
    }
  }

  //PARAMETRO QUE TOMA EN MAIN.JS PARA QUE NO PASE EL LIMITE DE AGUA
  mantenerEnPantalla(limiteAguaY, anchoFondo, altoFondo) {
    const mitadW = this.container.width / 2;
    const mitadH = this.container.height / 2;

    // límites normales de pantalla
    this.container.x = Math.max(mitadW, Math.min(anchoFondo - mitadW, this.container.x));
    this.container.y = Math.max(mitadH, Math.min(altoFondo - mitadH, this.container.y));
      
    // agua (misma lógica que NPC)
    if (this.container.y + mitadH < limiteAguaY) {
      this.container.y = limiteAguaY - mitadH;
    }
  }

  getPosicion() {
    return {
        x: this.container?.x ?? this.x ?? 0,
        y: this.container?.y ?? this.y ?? 0
    };
  }

}