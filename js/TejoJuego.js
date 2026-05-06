class TejoJuego {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        this.activo = false;

        // carga
        this.cargandoFuerza = false;
        this.cargandoAltura = false;
        this.fuerza = 0;
        this.altura = 0;

        this.maxCarga = 100;

        this.tejin = null;
    }

    async iniciar() {
        this.activo = true;
        this.container.visible = true;

        this.container.removeChildren();

        
        // FONDO CANCHA
        const texturaCancha = await PIXI.Assets.load('assets/cancha_tejo.png');
        this.cancha = new PIXI.Sprite(texturaCancha);
        
        this.cancha.anchor.set(0.5);
        this.cancha.x = window.innerWidth / 2;
        this.cancha.y = window.innerHeight / 2;
        
        this.container.addChild(this.cancha);
        
        // TEJIN
        const texturaTejin = await PIXI.Assets.load('assets/tejin.png');
        this.tejin = new PIXI.Sprite(texturaTejin);
        
        this.tejin.anchor.set(0.5);
        this.tejin.x = window.innerWidth / 2;
        this.tejin.y = window.innerHeight - 100;

        const tamañoDeseado = 80; // 👈 tamaño en píxeles
        const escala = tamañoDeseado / this.tejin.width;
        this.tejin.scale.set(escala);


        this.container.addChild(this.tejin);

        // BARRAS
        this.barraFuerza = new PIXI.Graphics();
        this.barraAltura = new PIXI.Graphics();

        this.container.addChild(this.barraFuerza);
        this.container.addChild(this.barraAltura);

        this.crearInputs();

        this.app.stage.addChild(this.container);
    }

    crearInputs() {
        window.addEventListener("keydown", (e) => {
            if (!this.activo) return;

            if (e.key.toLowerCase() === "f") this.cargandoFuerza = true;
            if (e.key.toLowerCase() === "a") this.cargandoAltura = true;
        });

        window.addEventListener("keyup", (e) => {
            if (!this.activo) return;

            if (e.key.toLowerCase() === "f") this.cargandoFuerza = false;
            if (e.key.toLowerCase() === "a") this.cargandoAltura = false;

            // cuando soltás → tirar
            if (e.key.toLowerCase() === "f" || e.key.toLowerCase() === "a") {
                this.lanzarTejin();
            }
        });
    }

    lanzarTejin() {
        // cálculo simple
        const distancia = this.fuerza * 3;
        const elevacion = this.altura * 2;

        // destino en Y (más fuerza = más arriba)
        const destinoY = this.tejin.y - distancia;

        // animación simple
        const velocidad = 0.1;

        const mover = () => {
            this.tejin.y += (destinoY - this.tejin.y) * velocidad;

            if (Math.abs(this.tejin.y - destinoY) > 1) {
                requestAnimationFrame(mover);
            }
        };

        mover();

        // reset
        this.fuerza = 0;
        this.altura = 0;
    }

    update() {
        if (!this.activo) return;
        if (!this.barraFuerza || !this.barraAltura) return;

        if (this.cargandoFuerza) {
            this.fuerza = Math.min(this.maxCarga, this.fuerza + 1);
        }

        if (this.cargandoAltura) {
            this.altura = Math.min(this.maxCarga, this.altura + 1);
        }

        this.dibujarBarras();
    }

    dibujarBarras() {
        if (!this.barraFuerza || !this.barraAltura) return;

        this.barraFuerza.clear();
        this.barraAltura.clear();

        this.barraFuerza.beginFill(0xff0000);
        this.barraFuerza.drawRect(50, window.innerHeight - 50, this.fuerza * 2, 20);
        this.barraFuerza.endFill();

        this.barraAltura.beginFill(0x00ff00);
        this.barraAltura.drawRect(50, window.innerHeight - 80, this.altura * 2, 20);
        this.barraAltura.endFill();
    }

    salir() {
        this.activo = false;
        this.container.visible = false;

        // 🔥 RESET IMPORTANTE
        this.cargandoFuerza = false;
        this.cargandoAltura = false;
        this.fuerza = 0;
        this.altura = 0;
    }
}