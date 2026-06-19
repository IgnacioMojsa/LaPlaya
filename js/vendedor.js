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
            fontSize: 18,
            fontFamily: 'PixelFont'
          }
        });
    this.mensaje.anchor.set(0.5);
    this.mensaje.y = -80;
    this.mensaje.visible = false;
    this.container.addChild(this.mensaje);    
    this.infoVenta = null;
  }

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
    
    if (this.direccion >= 0) 
      this.cambiarAnimacion('idle_der');
    else 
      this.cambiarAnimacion('idle_izq');
    
    if (window.inputKeys && window.inputKeys['e']){
      if (!this._ePressedHandled){
        if (this.infoVenta && this.infoVenta.menu) this.infoVenta.menu.toggle();
          this._ePressedHandled = true;
        }
      } else{
        this._ePressedHandled = false;
      }
    return;
  } else{
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
    this.infoVenta = menuDeCompra(miJuego.app, miJuego,
      {opcion1: "Media docena de churros - $5000", precio1: 5000,
       opcion2: "Una docena de churros - $12000", precio2: 12000,
       dineroDelJugador: miJuego.dineroDelJugador,
      }
    );
  }
}

class VendedorPochoclos extends Vendedor{
  constructor(x, y, animacion, i) {
    super(x, y, animacion, i);
    this.infoVenta = menuDeCompra(miJuego.app, miJuego,
      {opcion1: "Pochoclo chico - $2000", precio1: 2000,
       opcion2: "Pochoclo grande - $5000", precio2: 5000,
       dineroDelJugador: miJuego.dineroDelJugador,
      }
    );
    }
}

class VendedorChoclos extends Vendedor{
  constructor(x, y, animacion, i) {
    super(x, y, animacion, i);
    this.infoVenta = menuDeCompra(miJuego.app, miJuego,
      {opcion1: "Un choclo - $2000", precio1: 2000,
       opcion2: "Dos choclos - $5000", precio2: 5000,
       dineroDelJugador: miJuego.dineroDelJugador,
      }
    );

    this.velocidadMax = 0.2;
    this.pausaTiempo = 0;
    this.pausaDuracion = 10;
    this.tiempoCaminando = 60;

    }
}

class AguaYHelado extends Vendedor{
  constructor(x, y, animacion, i) {
    super(x, y, animacion, i);
    this.infoVenta = menuDeCompra(miJuego.app, miJuego,
      {opcion1: "Botella de agua - $1000", precio1: 1000,
       opcion2: "Helado - $2000", precio2: 2000,
       dineroDelJugador: miJuego.dineroDelJugador,
      }
    );
    }
}