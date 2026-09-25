class Inicio{
    constructor(unaApp){
        this.app = unaApp;
        this.contenedor = new PIXI.Container();
        this.imagenDeInicio = null;
        this.spriteBotonInicioSeleccionado = null;
        this.spriteBotonAjustesSeleccionado = null;
        this.spriteBotonInicioDeseleccionado = null;
        this.spriteBotonAjustesDeseleccionado = null;

        this.anchoDeReferencia = 1920; 
        this.altoDeReferencia = 1080;

        this.posicionStart = { x: 1590, y: 474 };
        this.posicionSettings = { x: 1590, y: 714 };

        this.onResize = this.redimensionar.bind(this);
    }

    async precargarAssets(){
        this.pantallaInicialSprite = await PIXI.Assets.load("assets/pantallaInicial.png");
        this.botonInicioSeleccionado = await PIXI.Assets.load("assets/ui/JugarHabilitado.png");
        this.botonAjustesSeleccionado = await PIXI.Assets.load("assets/ui/AjustesHabilitado.png");
        this.botonInicioDeseleccionado = await PIXI.Assets.load("assets/ui/JugarDeshabilitado.png");
        this.botonAjustesDeseleccionado = await PIXI.Assets.load("assets/ui/AjustesDeshabilitado.png");
    }

    async arrancar(){
        await this.precargarAssets();
        
        this.imagenDeInicio = new PIXI.Sprite(this.pantallaInicialSprite);
        this.imagenDeInicio.width = window.innerWidth;
        this.imagenDeInicio.height = window.innerHeight;
        this.contenedor.addChild(this.imagenDeInicio);

        this.spriteBotonInicioSeleccionado = new PIXI.Sprite(this.botonInicioSeleccionado); 
        //this.spriteBotonInicioSeleccionado.scale.set(0.7, 0.6);
        this.spriteBotonInicioSeleccionado.anchor.set(0.5);
        this.spriteBotonInicioSeleccionado.visible = false;
        this.contenedor.addChild(this.spriteBotonInicioSeleccionado);

        this.spriteBotonInicioDeseleccionado = new PIXI.Sprite(this.botonInicioDeseleccionado); 
        //this.spriteBotonInicioDeseleccionado.scale.set(0.7, 0.6);
        this.spriteBotonInicioDeseleccionado.anchor.set(0.5);
        this.contenedor.addChild(this.spriteBotonInicioDeseleccionado);

        this.spriteBotonAjustesSeleccionado = new PIXI.Sprite(this.botonAjustesSeleccionado);
        //this.spriteBotonAjustesSeleccionado.scale.set(0.7, 0.6);
        this.spriteBotonAjustesSeleccionado.anchor.set(0.5);
        this.spriteBotonAjustesSeleccionado.visible = false;
        this.contenedor.addChild(this.spriteBotonAjustesSeleccionado);

        this.spriteBotonAjustesDeseleccionado = new PIXI.Sprite(this.botonAjustesDeseleccionado);
        //this.spriteBotonAjustesDeseleccionado.scale.set(0.7, 0.6);
        this.spriteBotonAjustesDeseleccionado.anchor.set(0.5);
        this.contenedor.addChild(this.spriteBotonAjustesDeseleccionado);

        this.app.stage.addChild(this.contenedor);

        this.configurarInteracciones();

        this.redimensionar();

        window.addEventListener("resize", this.onResize);
    }
    
    redimensionar() {
        const anchoVentana = window.innerWidth;
        const altoVentana = window.innerHeight;

        const escalaX = anchoVentana / this.anchoDeReferencia;
        const escalaY = altoVentana / this.altoDeReferencia;

        this.imagenDeInicio.width = anchoVentana;
        this.imagenDeInicio.height = altoVentana;

        const posXStart = this.posicionStart.x * escalaX;
        const posYStart = this.posicionStart.y * escalaY;

        const posXSettings = this.posicionSettings.x * escalaX;
        const posYSettings = this.posicionSettings.y * escalaY;

        this.spriteBotonInicioSeleccionado.position.set(posXStart, posYStart);
        this.spriteBotonInicioDeseleccionado.position.set(posXStart, posYStart);

        this.spriteBotonAjustesSeleccionado.position.set(posXSettings, posYSettings);
        this.spriteBotonAjustesDeseleccionado.position.set(posXSettings, posYSettings);

        const escalaBoton = Math.min(escalaX, escalaY);
        this.spriteBotonInicioSeleccionado.scale.set(escalaBoton);
        this.spriteBotonInicioDeseleccionado.scale.set(escalaBoton);
        this.spriteBotonAjustesSeleccionado.scale.set(escalaBoton);
        this.spriteBotonAjustesDeseleccionado.scale.set(escalaBoton);
    }

    destruir() {
        this.app.stage.removeChild(this.contenedor);
        this.contenedor.destroy({ children: true });
        console.log("Pantalla de inicio destruida.");
    }

    configurarInteracciones() {
        [this.spriteBotonInicioSeleccionado, this.spriteBotonInicioDeseleccionado].forEach(boton => {
            boton.eventMode = 'static';
            boton.cursor = 'pointer';

            boton.on('pointerover', () => {
                this.seleccionarBoton('inicio');
            });

            boton.on('pointertap', () => {
                if (!miJuego.juegoEnCurso) {
                    miJuego.juegoEnCurso = true;
                    miJuego.empezarPartida();
                }
            });
        });

        [this.spriteBotonAjustesSeleccionado, this.spriteBotonAjustesDeseleccionado].forEach(boton => {
            boton.eventMode = 'static';
            boton.cursor = 'pointer';

            boton.on('pointerover', () => {
                this.seleccionarBoton('ajustes');
            });
        });
    }

    seleccionarBoton(tipo) {
        if (tipo === 'inicio') {
            this.spriteBotonInicioSeleccionado.visible = true;
            this.spriteBotonInicioDeseleccionado.visible = false;

            this.spriteBotonAjustesSeleccionado.visible = false;
            this.spriteBotonAjustesDeseleccionado.visible = true;
        } else if (tipo === 'ajustes') {
            this.spriteBotonInicioSeleccionado.visible = false;
            this.spriteBotonInicioDeseleccionado.visible = true;

            this.spriteBotonAjustesSeleccionado.visible = true;
            this.spriteBotonAjustesDeseleccionado.visible = false;
        }
    }
}
