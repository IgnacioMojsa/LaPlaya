// Clase Jugador para PIXI
class Jugador {
  constructor(x, y, texture) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.set(1);
    this.sprite.x = x;
    this.sprite.y = y;

    this.movimiento = 5 //px
  }

  inputTeclado(keys) {
    const izq    = keys.a || keys.A;
    const der    = keys.d || keys.D;
    const arriba = keys.w || keys.W;
    const abajo  = keys.s || keys.S;

    //Izquierda
    if (izq) this.sprite.x -= this.movimiento;

    //Derecha
    else if (der) this.sprite.x += this.movimiento;

    // Arriba
    if (arriba) this.sprite.y -= this.movimiento;

    //Abajo
    else if (abajo) this.sprite.y += this.movimiento;

  }

  //auxilio no sé cómo logré esto el código se ve horrible
  mantenerEnPantallaX() {
    this.sprite.x = Math.max(this.sprite.width, Math.min(window.innerWidth - this.sprite.width, this.sprite.x));
    this.sprite.y = Math.max(this.sprite.height, Math.min(window.innerHeight - this.sprite.height, this.sprite.y));
  }

}