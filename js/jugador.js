// Clase Jugador para PIXI
class Jugador {
  constructor(x, y, texture) {
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;

    this.vx = 0;
    this.vy = 0;

    this.aceleracion = 300;
    this.friccion = 1;

    this.cargarSpritesAnimados(texture);
    this.cambiarAnimacion(Object.keys(texture.animations)[0]);
    window.__PIXI_APP__.stage.addChild(this.container);
  }

  inputTeclado(dt, keys) {
    const izq    = keys.a || keys.A;
    const der    = keys.d || keys.D;
    const arriba = keys.w || keys.W;
    const abajo  = keys.s || keys.S;


    if (izq) this.vx -= this.aceleracion * dt;
    else if (der) this.vx += this.aceleracion * dt;
    else this.vx = this.aplicarFriccion(this.vx, dt);

    if (arriba) this.vy -= this.aceleracion * dt;
    else if (abajo) this.vy += this.aceleracion * dt;
    else this.vy = this.aplicarFriccion(this.vy, dt);
  }

  aplicarFriccion(dt, vel){
    if (vel == 0) return 0;
    const signo = Math.sign(vel);
    const nueva = Math.abs(vel) - this.friccion * dt;
    if (nueva > 0){
      return signo * nueva;
    }
    else {
      return 0;
    }
  }

  update(dt){
    this.container.x += this.vx * dt;
    this.container.y += this.vy * dt;
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
    if (this.velocidad.x > 0) {
      this.cambiarAnimacion("der");
    }
    else if (this.velocidad.x < 0) {
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

}