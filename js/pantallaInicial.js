class Inicio{
    constructor(unaApp){
        this.app = unaApp;
        this.contenedor = new PIXI.Container();
        this.imagenDeInicio = null;
        this.spriteBotonInicioSeleccionado = null;
        this.spriteBotonAjustesSeleccionado = null;
        this.spriteBotonInicioDeseleccionado = null;
        this.spriteBotonAjustesDeseleccionado = null;
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
        this.spriteBotonInicioSeleccionado.scale.set(0.7, 0.6);
        this.spriteBotonInicioSeleccionado.anchor.set(0.5);
        this.spriteBotonInicioSeleccionado.x = 1093;
        this.spriteBotonInicioSeleccionado.y = 282;
        this.contenedor.addChild(this.spriteBotonInicioSeleccionado);

        this.spriteBotonInicioDeseleccionado = new PIXI.Sprite(this.botonInicioDeseleccionado); 
        this.spriteBotonInicioDeseleccionado.scale.set(0.7, 0.6);
        this.spriteBotonInicioDeseleccionado.anchor.set(0.5);
        this.spriteBotonInicioDeseleccionado.x = 1093;
        this.spriteBotonInicioDeseleccionado.y = 282;
        this.spriteBotonInicioDeseleccionado.visible = false;
        this.contenedor.addChild(this.spriteBotonInicioDeseleccionado);

        this.spriteBotonAjustesSeleccionado = new PIXI.Sprite(this.botonAjustesSeleccionado);
        this.spriteBotonAjustesSeleccionado.scale.set(0.7, 0.6);
        this.spriteBotonAjustesSeleccionado.anchor.set(0.5);
        this.spriteBotonAjustesSeleccionado.x = 1093;
        this.spriteBotonAjustesSeleccionado.y = 426;
        this.spriteBotonAjustesSeleccionado.visible = false;
        this.contenedor.addChild(this.spriteBotonAjustesSeleccionado);

        this.spriteBotonAjustesDeseleccionado = new PIXI.Sprite(this.botonAjustesDeseleccionado);
        this.spriteBotonAjustesDeseleccionado.scale.set(0.7, 0.6);
        this.spriteBotonAjustesDeseleccionado.anchor.set(0.5);
        this.spriteBotonAjustesDeseleccionado.x = 1093;
        this.spriteBotonAjustesDeseleccionado.y = 426;
        this.contenedor.addChild(this.spriteBotonAjustesDeseleccionado);

        this.app.stage.addChild(this.contenedor);
    }
    
    destruir() {
        this.app.stage.removeChild(this.contenedor);
        this.contenedor.destroy({ children: true });
        console.log("Pantalla de inicio destruida.");
    }
}
