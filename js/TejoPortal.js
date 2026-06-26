class TejoPortal {
    constructor(x, y, app, juego) {
        this.app = app;
        this.mundo = miJuego.mundo;
        this.juego = juego;
        this.x = x;
        this.y = y;

        this.sprite = null;
        this.mensaje = null;
        this.jugadorCerca = false;
    }

    async init() {
        const textura = await PIXI.Assets.load('assets/tejo.png');
        this.sprite = new PIXI.Sprite(textura);

        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.anchor.set(0.5);

        const tamañoDeseado = 50; // píxeles
        const escala = tamañoDeseado / this.sprite.width;
        this.sprite.scale.set(escala);

        this.mundo.addChild(this.sprite);

        this.mensaje = new PIXI.Text("Pulsa E para jugar al tejo", {
            fill: "white",
            fontSize: 24,
            fontFamily: 'PixelFont'
        });

        this.mensaje.anchor.set(0.5);
        this.mensaje.visible = false;
        this.mensaje.x = this.sprite.x;
        this.mensaje.y = this.sprite.y;
        

        this.mundo.addChild(this.mensaje);

        window.addEventListener("keydown", (e) => {

            if (e.key.toLowerCase() === "e" && this.jugadorCerca) {
            
                // SOLO entrar si NO está activo
                if (!this.juego.activo) {
                    this.juego.iniciar();
                }
            }
        });
    }

    update(jugador) {
        if (!jugador || !this.sprite) return;

        const pos = jugador.getPosicion?.();
        if (!pos) return;

        const dx = pos.x - this.sprite.x;
        const dy = pos.y - this.sprite.y;

        const distancia = Math.sqrt(dx * dx + dy * dy);

        this.jugadorCerca = distancia < 45;
        this.mensaje.visible = this.jugadorCerca;

        if (this.jugadorCerca) {
            this.mensaje.x = this.sprite.x;
            this.mensaje.y = this.sprite.y - 50;
        }
    }
}    