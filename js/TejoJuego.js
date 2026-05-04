class TejoJuego {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        this.activo = false;
    }

    iniciar() {
        this.activo = true;
        this.container.visible = true;

        const fondo = new PIXI.Graphics();
        fondo.rect(0, 0, window.innerWidth, window.innerHeight);
        fondo.fill(0x1e1e1e);
        this.container.addChild(fondo);

        const texto = new PIXI.Text("MINIJUEGO TEJO\n(ESC para salir)", {
            fill: "white",
            fontSize: 32
        });

        texto.anchor.set(0.5);
        texto.x = window.innerWidth / 2;
        texto.y = window.innerHeight / 2;

        this.container.addChild(texto);

        this.app.stage.addChild(this.container);
    }

    salir() {
        this.activo = false;
        this.container.visible = false;
    }
}