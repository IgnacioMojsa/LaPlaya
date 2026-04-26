// Clase Jugador para PIXI
class Jugador {
  constructor(x, y, texture) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.set(0.5); //Usá el anchor en el centro
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

  //PARAMETRO QUE TOMA EN MAIN.JS PARA QUE NO PASE EL LIMITE DE AGUA
  mantenerEnPantalla(limiteAguaY) {
    const mitadW = this.sprite.width / 2;
    const mitadH = this.sprite.height / 2;

    // límites normales de pantalla
    this.sprite.x = Math.max(mitadW, Math.min(window.innerWidth - mitadW, this.sprite.x));
    this.sprite.y = Math.max(mitadH, Math.min(window.innerHeight - mitadH, this.sprite.y));
      
    // 🚫 agua (misma lógica que NPC)
    if (this.sprite.y + mitadH < limiteAguaY) {
      this.sprite.y = limiteAguaY - mitadH;
    }
  }

}