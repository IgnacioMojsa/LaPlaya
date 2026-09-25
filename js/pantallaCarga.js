class PantallaCarga {
    constructor(app, alConfirmar) {
        this.app = app;
        this.alConfirmar = alConfirmar;
        this.contenedor = new PIXI.Container();

        this.fondo = null;
        this.botonNormal = null;
        this.botonPresionado = null;

        this.onResize = this.redimensionar.bind(this);
    }

    async arrancar() {
        const texturaFondo = await PIXI.Assets.load("assets/IntroduccionLaPlaya.png");
        const texturabotonNormal = await PIXI.Assets.load("assets/ui/BotonJugar.png");
        const texturabotonPresionado = await PIXI.Assets.load("assets/ui/BotonJugarPresionado.png");

        this.fondo = new PIXI.Sprite(texturaFondo);
        this.contenedor.addChild(this.fondo);

        this.botonNormal = new PIXI.Sprite(texturabotonNormal);
        this.botonNormal.anchor.set(0.5);
        this.botonNormal.visible = false;

        this.botonPresionado = new PIXI.Sprite(texturabotonPresionado);
        this.botonPresionado.anchor.set(0.5);
        this.botonPresionado.visible = false;

        this.contenedor.addChild(this.botonNormal);
        this.contenedor.addChild(this.botonPresionado);

        this.contenedor.zIndex = 9999;
        this.app.stage.sortableChildren = true;

        this.app.stage.addChild(this.contenedor);
        this.redimensionar();

        window.addEventListener("resize", this.onResize);
    }

    mostrarBotonJugar() {
        this.botonNormal.visible = true;
        this.configurarInteracciones();
    }

    configurarInteracciones() {
        [this.botonNormal, this.botonPresionado].forEach(btn => {
            btn.eventMode = 'static';
            btn.cursor = 'pointer';

            btn.on('pointerover', () => {
                this.botonNormal.visible = false;
                this.botonPresionado.visible = true;
            });

            btn.on('pointerout', () => {
                this.botonNormal.visible = true;
                this.botonPresionado.visible = false;
            });

            btn.on('pointertap', () => {
                this.destruir();
                if (this.alConfirmar) this.alConfirmar();
            });
        });
    }

    redimensionar() {
        const ancho = window.innerWidth;
        const alto = window.innerHeight;

        if (this.fondo) {
            this.fondo.width = ancho;
            this.fondo.height = alto;
        }

        const escala = Math.min(ancho / 1920, alto / 1080) * 0.7;

        if (this.botonNormal && this.botonPresionado) {
            this.botonNormal.scale.set(escala);
            this.botonPresionado.scale.set(escala);

            const margenX = (this.botonNormal.width / 2) + 10;
            const margenY = (this.botonNormal.height / 2) + 10;

            const posX = ancho - margenX;
            const posY = alto - margenY;

            this.botonNormal.position.set(posX, posY);
            this.botonPresionado.position.set(posX, posY);
        }
    }

    destruir() {
        window.removeEventListener("resize", this.onResize);
        this.app.stage.removeChild(this.contenedor);
        this.contenedor.destroy({ children: true });
    }
}