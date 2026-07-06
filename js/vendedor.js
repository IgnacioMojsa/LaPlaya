class Vendedor extends Npc {
  constructor(x, y, animacion, i) {
    super(x, y, animacion, i);
    this.velocidadMax = 0.5;
    this.pausaTiempo = 0;
    this.pausaDuracion = 5;
    this.tiempoCaminando = 20;
    this.timerCaminar = Math.random() * this.tiempoCaminando;
    this.direccion = Math.random() < 0.5 ? -1 : 1;
    this.velocidad.x = this.direccion * this.velocidadMax;

    this.producto = null;
    this.cantidades = null;

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

    this.actualizarPosicionDeSombra();
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

    this.producto = new Churro();
    this.cantidades = [6, 12];

    this.infoVenta = menuDeCompra(miJuego.app, miJuego,
      {opcion1: this.cantidades[0] + " churros", precio1: 5000, energia1: 30, cantidad1: this.cantidades[0],
       opcion2: this.cantidades[1] + " churros", precio2: 12000, energia2: 60, cantidad2: this.cantidades[1],
       dineroDelJugador: miJuego.dineroDelJugador,
      },
      this
    );
  }
}

class VendedorPochoclos extends Vendedor{
  constructor(x, y, animacion, i) {
    super(x, y, animacion, i);

    this.infoVenta = menuDeCompra(miJuego.app, miJuego,
      {opcion1: "Pochoclo chico", precio1: 2000, energia1: 10,
       opcion2: "Pochoclo grande", precio2: 5000, energia2: 30,
       dineroDelJugador: miJuego.dineroDelJugador,
      }
    );
    }
}

class VendedorChoclos extends Vendedor{
  constructor(x, y, animacion, i) {
    super(x, y, animacion, i);

    this.producto = new Choclo();

    this.cantidades = [1, 2]

    this.infoVenta = menuDeCompra(miJuego.app, miJuego,
      {opcion1: this.cantidades[0] + " choclo", precio1: 2000, energia1: 20, cantidad1: this.cantidades[0],
       opcion2: this.cantidades[1] + " choclos", precio2: 5000, energia2: 40, cantidad2: this.cantidades[1],
       dineroDelJugador: miJuego.dineroDelJugador,
      },
      this
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

    this.producto = [new Agua(), new Helado()];

    this.cantidades = 1;

    this.infoVenta = menuDeCompra(miJuego.app, miJuego,
      {opcion1: "Botella de agua", precio1: 1000, energia1: 30, cantidad1: 1,
       opcion2: "Helado", precio2: 2000, energia2: 10, cantidad2: 1,
       dineroDelJugador: miJuego.dineroDelJugador,
      },
      this
    );

    this.velocidadMax = 1;
    this.pausaTiempo = 0;
    this.pausaDuracion = 5;
    this.tiempoCaminando = 60;
      
    }
}