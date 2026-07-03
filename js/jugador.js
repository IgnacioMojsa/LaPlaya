class Jugador {
  constructor(x, y, texture) {
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;

    this.velocidad = {x: 0, y: 0};

    this.maquinaDeEstados = new MaquinaDeEstados(this);

    this.maquinaDeEstados.agregarEstado('DEFAULT', new DefaultState(this));
    this.maquinaDeEstados.agregarEstado('SWIM', new SwimState(this));
    this.maquinaDeEstados.agregarEstado('WITH_CHILD', new WithChildState(this));

    this.maquinaDeEstados.cambiarA('DEFAULT');

    this.sombra = new PIXI.Sprite(miJuego.sombra);

    this.velMaxima = 80;
    this.aceleracion = 80;
    this.friccion = 0.95;
    this.ultimaDireccion = "der";
    this.neneRescatado = null;
    this.personaAhogada = null;
    
    this.input = {izq: false, der: false, arriba: false, abajo: false};
    this.inputBloqueado = false;

    this.silbato = new Audio("assets/audio/silbato3.mp3");
    this.silbato.preload = "auto";

    window.addEventListener("keydown", (e) => {
    if (e.key && e.key.toLowerCase() === "q"){
    this.tocarSilbato();}});

    this.cargarSpritesAnimados(texture);
    this.cambiarAnimacion(Object.keys(texture.animations)[0]);

    this.sombra.anchor.set(0.5, 1.2);
    this.sombra.position.set(this.container.position.x, this.container.position.y);
    this.sombra.zIndex = this.container.position.y - 3;
    this.sombra.alpha = 0.5;

    miJuego.mundo.addChild(this.sombra);
  }

  inputTeclado(dt, keys){
    if (this.inputBloqueado) return;

    this.input.izq    = keys.a || keys.A;
    this.input.der    = keys.d || keys.D;
    this.input.arriba = keys.w || keys.W;
    this.input.abajo  = keys.s || keys.S;
    
    let aceleracionX = 0, aceleracionY = 0;
    if (this.input.izq)    aceleracionX -= this.aceleracion;
    if (this.input.der)    aceleracionX += this.aceleracion;
    if (this.input.arriba) aceleracionY -= this.aceleracion;
    if (this.input.abajo)  aceleracionY += this.aceleracion;

    this.velocidad.x += aceleracionX * dt;
    this.velocidad.y += aceleracionY * dt;
    
    if (aceleracionX === 0) this.velocidad.x *= this.friccion;
    if (aceleracionY === 0) this.velocidad.y *= this.friccion;

    this.container.x += this.velocidad.x * dt;
    this.container.y += this.velocidad.y * dt;

    const velocidad = Math.hypot(this.velocidad.x, this.velocidad.y);
    if (velocidad > this.velMaxima){
      const limite = this.velMaxima / velocidad;
      this.velocidad.x *= limite;
      this.velocidad.y *= limite;
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

      if(interactuar && !this.personaAhogada && this.estaCercaDeUnAhogado()){
        const npcAhogadoCercano = this.npcAhogadoMasCercano();

        this.personaAhogada = npcAhogadoCercano;
        npcAhogadoCercano.rescatado = true;
        npcAhogadoCercano.ahogandose = false;
      }

      //Interfaz
      const desplegar = (keys.t && !keysProcesadas.t) || (keys.T && !keysProcesadas.T);

      if(desplegar){
        console.log("Tecla T presionada")
        miJuego.uiObjetivosDesplegados.visible = true;
        miJuego.listaDeTareas.children.forEach(tarea => {tarea.visible = true});
      }
      else{
        miJuego.uiObjetivosDesplegados.visible = false;
        miJuego.listaDeTareas.children.forEach(tarea => {tarea.visible = false});
      }
  }
  
  bloquearInput(estado = true){
    this.inputBloqueado = !!estado;
  }

  tocarSilbato(){
  const silbido = this.silbato.cloneNode(false);
  silbido.play()
  }

  estaNadando(){
    return this.container.y < miJuego.horizonte || this.container.y < miJuego.orillaDelMar
  }

  estaQuieto(){
    return Math.abs(this.velocidad.x) < 0.1 && Math.abs(this.velocidad.y) < 0.1;
  }

  estaCercaDeLaGarita(){
    return distancia(this.container.x, miJuego.garita.x, this.container.y, miJuego.garita.y) < 60;
  }

  estaCercaDeCastillo(){
  return miJuego.castillos.some(castillo => !castillo.destruido && distancia(this.container.x, castillo.x + 20, this.container.y, castillo.y) < 40)
}

  estaCercaDeAlgunNenePerdido(){
    // Devuelve un booleano. Es verdadero si el personaje esta cerca de algun nene perdido, sino devuelve falso

    return miJuego.totalNenes.some(nene => nene.perdido && distancia(this.container.x, nene.container.x, this.container.y, nene.container.y) < 20)
  }

  estaCercaDeUnAhogado(){
    // Devuelve verdadero si el personaje se encuentra cerca de algun npc que se este ahogando
    
    return miJuego.totalPersonasTemerarias.some(npc => npc.ahogandose && distancia(this.container.x, npc.container.x, this.container.y, npc.container.y) < 20);
  }

  npcAhogadoMasCercano(){
    const npcAhogado = miJuego.totalPersonasTemerarias.find(npc => npc.ahogandose && distancia(this.container.x, npc.container.x, this.container.y, npc.container.y) < 20);
    
    return npcAhogado
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

  actualizarMensajesDeAhogados(){ 
    const ahogado = this.npcAhogadoMasCercano();
    
    miJuego.totalPersonasTemerarias.forEach(temerario => {
      temerario.mensaje.visible = false;

      if(this.estaCercaDeUnAhogado()){
      ahogado.mensaje.zIndex = ahogado.container.y;

      ahogado.mensaje.visible = true;
    }
    });
  }

  estaCargandoUnNene(){
    return this.neneRescatado && this.neneRescatado.rescatado 
  }

  evitarQueEntreAlAguaConNene(){
    if(this.estaCargandoUnNene() && this.container.y < miJuego.orillaDelMar){
      this.container.y = miJuego.orillaDelMar;
    }
  }

  update(dt){
      this.container.x += this.velocidad.x * dt;
      this.container.y += this.velocidad.y * dt;
      this.container.zIndex = this.container.y;

      this.actualizarMensajesDeNenes();
      this.actualizarMensajesDeAhogados();

      this.maquinaDeEstados.update(dt);

      /*this.cambiarDeSpriteDeDireccion();
      this.evitarQueEntreAlAguaConNene();
      this.mostrarMensajeDeRescate()
      this.actualizarMensajesDeNenes();*/
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

  /*cambiarDeSpriteDeDireccion(){
    if (this.velocidad.x > 0) this.ultimaDireccion = "der";
    if (this.velocidad.x < 0) this.ultimaDireccion = "izq";
    
    if(!this.estaCargandoUnNene() && this.estaQuieto() && this.ultimaDireccion === "der"){
      this.cambiarAnimacion("idle_der")
    }
    else if(!this.estaCargandoUnNene() && this.estaQuieto() && this.ultimaDireccion === "izq"){
      this.cambiarAnimacion("idle_izq")
    }
    
    if (this.velocidad.x > 0 && !this.estaQuieto()) {
      this.cambiarAnimacion("der");
    }
    else if (this.velocidad.x < 0 && !this.estaQuieto()) {
      this.cambiarAnimacion("izq");
    }

    if (this.estaNadando() && this.velocidad.x > 0){
      this.cambiarAnimacion("swim_der")
    }
    else if (this.estaNadando() && this.velocidad.x < 0){
      this.cambiarAnimacion("swim_izq")
    }

    if(this.estaCargandoUnNene() && this.estaQuieto() && this.ultimaDireccion === "der"){
      this.cambiarAnimacion("idle_con_nene_der")
    }
    else if(this.estaCargandoUnNene() && this.estaQuieto() && this.ultimaDireccion === "izq"){
      this.cambiarAnimacion("idle_con_nene_izq")
    }

    if(this.estaCargandoUnNene() && !this.estaQuieto() && this.velocidad.x > 0){
      this.cambiarAnimacion("der_con_nene")
    }
    else if(this.estaCargandoUnNene() && !this.estaQuieto() && this.velocidad.x < 0){
      this.cambiarAnimacion("izq_con_nene")
    }
  }*/

  romperCastillo(){
    const index = miJuego.castillos.findIndex(castillo => !castillo.destruido && distancia(this.container.x, castillo.x, this.container.y, castillo.y) < 40);

    if (index === -1) return;

    const castillo = miJuego.castillos[index];
    castillo.destruido = true;
    miJuego.mundo.removeChild(castillo);

    const animacion = new PIXI.AnimatedSprite(miJuego.castilloAnimacion.animations.romperse);
    animacion.x = castillo.x;
    animacion.y = castillo.y;
    animacion.loop = false;
    animacion.animationSpeed = 0.15;

    animacion.onComplete = () => {animacion.gotoAndStop(animacion.totalFrames - 1);}
    animacion.play();
    miJuego.mundo.addChild(animacion);
    miJuego.castillos[index] = animacion;
    animacion.destruido = true; // opcional, para no tocarlo después
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