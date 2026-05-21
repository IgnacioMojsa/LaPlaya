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
    this.neneRescatado = null;
    
    this.input = {izq: false, der: false, arriba: false, abajo: false};

    this.silbato = new Audio("assets/audio/silbato3.mp3");
    this.silbato.preload = "auto";

    window.addEventListener("keydown", (e) => {
    if (e.key && e.key.toLowerCase() === "q"){
    this.tocarSilbato();}});

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
    const interactuar = (keys.e && !keysProcesadas.e) || (keys.E && !keysProcesadas.E);
      
    if (interactuar && !this.neneRescatado && this.estaCercaDeAlgunNenePerdido()){
      const nenePerdido = this.nenePerdidoMasCercano();

      console.log("interactuando con nene perdido");
      this.neneRescatado = nenePerdido;
      nenePerdido.adulto = this;
      nenePerdido.perdido = false;
      nenePerdido.rescatado = true;
    }

    else if (this.neneRescatado && this.neneRescatado.rescatado && interactuar && this.estaCercaDeLaGarita()) {
        console.log("nene resguardado en la garita");
        
        this.neneRescatado.container.x = miJuego.garita.x + ((Math.random() * 40) - 20);
        this.neneRescatado.container.y = miJuego.garita.y + 10;

        this.neneRescatado.resguardado = true;
        this.neneRescatado.rescatado = false;
        this.neneRescatado.adulto = null;

        this.neneRescatado.velocidad.x = 0;
        this.neneRescatado.velocidad.y = 0;
        this.neneRescatado.aceleracion.x = 0;
        this.neneRescatado.aceleracion.y = 0;

        this.neneRescatado.cambiarAnimacion("idle_der");

        this.neneRescatado = null;
      }
  }

  tocarSilbato(){
  const silbido = this.silbato.cloneNode(false);
  silbido.play()
  }

  estaNadando(){
    return this.container.y < miJuego.horizonte || this.container.y < miJuego.orillaDelMar
  }

  estaQuieto(){
    return Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1;
  }

  estaCercaDeLaGarita(){
    return distancia(this.container.x, miJuego.garita.x, this.container.y, miJuego.garita.y) < 60;
  }

  estaCercaDeAlgunNenePerdido(){
    // Devuelve un booleano. Es verdadero si el personaje esta cerca de algun nene perdido, sino devuelve falso

    return miJuego.totalNenes.some(nene => nene.perdido && distancia(this.container.x, nene.container.x, this.container.y, nene.container.y) < 20)
  }

  nenePerdidoMasCercano(){
    // Devuelve al nene perdido que mas cerca se encuentra del jugador
    
    const nenePerdido = miJuego.totalNenes.find(nene => nene.perdido && distancia(this.container.x, nene.container.x, this.container.y, nene.container.y) < 20);

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

  estaCargandoUnNene(){
    return this.neneRescatado && this.neneRescatado.rescatado 
  }

  update(dt){
    this.container.x += this.vx * dt;
    this.container.y += this.vy * dt;
    this.container.zIndex = this.container.y;
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
    
    if(!this.estaCargandoUnNene() && this.estaQuieto() && this.ultimaDireccion === "der"){
      this.cambiarAnimacion("idle_der")
    }
    else if(!this.estaCargandoUnNene() && this.estaQuieto() && this.ultimaDireccion === "izq"){
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

    if(this.estaCargandoUnNene() && this.estaQuieto() && this.ultimaDireccion === "der"){
      this.cambiarAnimacion("idle_con_nene_der")
    }
    else if(this.estaCargandoUnNene() && this.estaQuieto() && this.ultimaDireccion === "izq"){
      this.cambiarAnimacion("idle_con_nene_izq")
    }

    if(this.estaCargandoUnNene() && !this.estaQuieto() && this.vx > 0){
      this.cambiarAnimacion("der_con_nene")
    }
    else if(this.estaCargandoUnNene() && !this.estaQuieto() && this.vx < 0){
      this.cambiarAnimacion("izq_con_nene")
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
    if (this.container.y < limiteAguaY) {
      this.container.y = limiteAguaY - 0.5;
    }
  }

  getPosicion() {
    return {
        x: this.container?.x ?? this.x ?? 0,
        y: this.container?.y ?? this.y ?? 0
    };
  }

}