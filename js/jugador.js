// Clase Jugador para PIXI
class Jugador {
  constructor(x, y, texture) {
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;

    this.vx = 0;
    this.vy = 0;

    //Para cambiar la fuidez del movimiento, modifiquen aceleracion o vel maxima
    this.aceleracion = 100;
    this.friccion = 1;
    this.velMaxima = 150;

    this.mensaje = new PIXI.Text("Pulsa F para rescatar al nene", { fill: "white", fontSize: 24});
    this.mensaje.anchor.set(0.5);
    this.mensaje.visible = false;

    this.cargarSpritesAnimados(texture);
    this.cambiarAnimacion(Object.keys(texture.animations)[0]);
    window.__PIXI_APP__.stage.addChild(this.container);
    window.__PIXI_APP__.stage.addChild(this.mensaje);
  }

  inputTeclado(dt, keys) {
    const izq    = keys.a || keys.A;
    const der    = keys.d || keys.D;
    const arriba = keys.w || keys.W;
    const abajo  = keys.s || keys.S;
    const interactuar = (keys.f && !keysProcesadas.f) || (keys.F && !keysProcesadas.F);


    if (izq) this.vx -= this.aceleracion * dt;
    else if (der) this.vx += this.aceleracion * dt;
    else this.vx = this.aplicarFriccion(this.vx, dt);

    if (arriba) this.vy -= this.aceleracion * dt;
    else if (abajo) this.vy += this.aceleracion * dt;
    else this.vy = this.aplicarFriccion(this.vy, dt);

    const velocidad = Math.hypot(this.vx, this.vy);
    if (velocidad > this.velMaxima){
      const limite = this.velMaxima / velocidad;
      this.vx *= limite;
      this.vy *= limite;
      }
    
    if (interactuar && this.estaCercaDeNenePerdido()){
      if (keys.f) keysProcesadas.f = true;
      if (keys.F) keysProcesadas.F = true;
      
      const nenePerdido = totalNenes.find(nene => nene.perdido)
      
      console.log("interactuando con nene perdido");
      nenePerdido.adulto = this;
      nenePerdido.perdido = false;
    } 
  }

  estaCercaDeNenePerdido(){
      const nenePerdido = totalNenes.find(nene => nene.perdido);

      if(!nenePerdido){
        return false
      }
      else{
        return distancia(this.container.x, nenePerdido.container.x, this.container.y, nenePerdido.container.y) < 40
      }
  }

  aplicarFriccion(dt, v){
    if (v) return 0;
    const signo = Math.sign(v);
    const nueva = Math.abs(v) - this.friccion * dt;
    if (nueva > 0){
      return signo * nueva;
    }
    else {
      return 0;
    }
  }

  mostrarmensajeDeRescate(){
    //const mensaje = new PIXI.Text("Pulsa F para rescatar al nene", { fill: "white", fontSize: 24});
    
    if(this.estaCercaDeNenePerdido()){
      console.log("Estas cerca de un nene perdido")
      this.mensaje.visible = true;
      this.mensaje.x = this.container.x;
      this.mensaje.y = this.container.y + 20
    }
    else{
      this.mensaje.visible = false;
    }
  }

  update(dt){
    this.container.x += this.vx * dt;
    this.container.y += this.vy * dt;
    this.cambiarDeSpriteDeDireccion();
    this.mostrarmensajeDeRescate()
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
    if (this.vx > 0) {
      this.cambiarAnimacion("der");
    }
    else if (this.vx < 0) {
      this.cambiarAnimacion("izq");
    }
  }

  //PARAMETRO QUE TOMA EN MAIN.JS PARA QUE NO PASE EL LIMITE DE AGUA
  mantenerEnPantalla(limiteAguaY) {
    const mitadW = this.container.width / 2;
    const mitadH = this.container.height / 2;

    // límites normales de pantalla
    this.container.x = Math.max(mitadW, Math.min(window.innerWidth - mitadW, this.container.x));
    this.container.y = Math.max(mitadH, Math.min(window.innerHeight - mitadH, this.container.y));
      
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