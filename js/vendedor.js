class Vendedor extends Npc {
  constructor(x, y, animacion, i) {
    super(x, y, animacion, i);
    this.velocidadMax = 0.5;
    this.pausaTiempo = 0;
    this.pausaDuracion = 5;
    this.tiempoCaminando = 20;
    this.timerCaminar = Math.random() * this.tiempoCaminando;
    this.direccion = Math.random() < 0.5 ? -1 : 1; //Es un if mathRandom < 0,5 return -1 else return 1 pero sirve para evitar anidar ifs
    this.velocidad.x = this.direccion * this.velocidadMax;

    this.mensaje = new PIXI.Text({
          text: "Pulsa E para comprar",
          style: {
            fill: "white",
            fontSize: 18
          }
        });
    this.mensaje.anchor.set(0.5);
    this.mensaje.y = -80;
    this.mensaje.visible = false;
    this.container.addChild(this.mensaje);

    /* this.menuCompra = new PIXI.Graphics().rect(50,50,50,50).fill(#ffffff)

    this.container.addChild(this.menuCompra); */
  
    /* window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "e" && this.estaJugadorCerca()){
    this.menuCompra.visible = true;
    }else{
    this.menuCompra.visible = false
    }}); */
  }

  // dentro de class Vendedor
  estaJugadorCerca() {
    const jugador = miJuego.jugador;
    return distancia(this.container.x, jugador.container.x, this.container.y, jugador.container.y) < 60;
  }

  render(){
    this.velocidad.x = Math.max(-this.velocidadMax, Math.min(this.velocidad.x + this.aceleracion.x, this.velocidadMax));
    this.container.x += this.velocidad.x;
    this.container.zIndex = this.container.y;
    this.aceleracion.x = 0;
  }

  update(dt){
    if (this.estaJugadorCerca()){
      this.pausaTiempo = 1;
      this.velocidad.x = 0;
      this.mensaje.visible = true;
      if (this.direccion >= 0) this.cambiarAnimacion('idle_der');
      else this.cambiarAnimacion('idle_izq'); 
      return;
    }
    else{
      this.mensaje.visible = false;
    }
    
    if (this.pausaTiempo > 0) {
      this.pausaTiempo -= dt;
      this.velocidad.x = 0;
      if (this.direccion >= 0) {
        this.cambiarAnimacion('idle_der');
      } else {
        this.cambiarAnimacion('idle_izq');
      }
      if (this.pausaTiempo <= 0) {
        this.direccion = Math.random() < 0.5 ? -1 : 1;
        this.velocidad.x = this.direccion * this.velocidadMax;
        this.timerCaminar = 0;
      }
      return;
    }

    this.timerCaminar += dt;
    if (this.direccion >= 0) {
        this.cambiarAnimacion('der');
      } else {
        this.cambiarAnimacion('izq');
      }
    this.render();

    if(this.timerCaminar >= this.tiempoCaminando){
      this.pausaTiempo = this.pausaDuracion * (0.5 + Math.random());
      this.timerCaminar = 0;
      this.velocidad.x = 0;
      if (this.direccion >= 0) {
        this.cambiarAnimacion('idle_der');
      } else {
        this.cambiarAnimacion('idle_izq');
      }
    }

    if(this.container.x <= 0){
      this.container.x = 0; this.direccion = 1; this.velocidad.x = this.velocidadMax;
    } else if (this.container.x >= miJuego.fondo.width) {
      this.container.x = miJuego.fondo.width; this.direccion = -1; this.velocidad.x = -this.velocidadMax;
    }
  }
}

class VendedoraChurros extends Vendedor{
  constructor(x, y, animacion, i) {
    super(x, y, animacion, i);
    }
}

class VendedorPochoclos extends Vendedor{
  constructor(x, y, animacion, i) {
    super(x, y, animacion, i);
    }
}

class VendedorChoclos extends Vendedor{
  constructor(x, y, animacion, i) {
    super(x, y, animacion, i);
    }
}