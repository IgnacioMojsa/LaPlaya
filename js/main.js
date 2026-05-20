class Juego{
    constructor(){
        this.app = null;
        this.mundo = null;
        this.enMiniJuego = false;
        this.tejoJuego = null;
        this.portalTejo = null;
        this.bgm = new Audio("assets/audio/bgm.wav");
        this.nuevoAhora = performance.now();
        this.listaDeTareas = new PIXI.Container();

        this.cantAdultos = 30;
        this.cantNenes = 3;
        this.arrayDeNpc = [];
        this.totalAdultos = [];
        this.totalNenes = [];
        this.vendedores = 1
        this.perdidos = obtenerNumeroAleatorio(2, 5);
        this.cantidadTotalDeNpc = this.cantAdultos + this.cantNenes + this.perdidos + this.vendedores

        this.orillaDelMar = 690;
        this.horizonte = 600;

        this.bgm.loop = true;
    }

    async arrancar() {
        /* const opcionesDePixi = {
            width: window.innerWidth,
            height: window.innerHeight,
            background: "#000000"
        }; */
        
        const opcionesDePixi = {
            resizeTo: window,
            background: "#000000"
        };
        console.log("arrancando");
        this.app = new PIXI.Application();
        console.log("app de pixi creada");
        await this.app.init(opcionesDePixi);

        window.__PIXI_APP__ = this.app;

        document.body.appendChild(this.app.canvas);
        
        this.mundo = new PIXI.Container();
        this.mundo.sortableChildren = true;
        this.app.stage.addChild(this.mundo);

        await this.precargarAssets();
        await this.prepararEscena();

        //Espera a que el usuario interactúe con el documento antes de reproducir la música, y no lanza error en la consola
        this.bgmIniciada = false;
        const iniciarBgm = () => {
            this.bgm.play()
            .then(() => {this.bgmIniciada = true;})
            .catch(() => {});
            document.removeEventListener('click', iniciarBgm);
            document.removeEventListener('keydown', iniciarBgm);
        };
        document.addEventListener('click', iniciarBgm);
        document.addEventListener('keydown', iniciarBgm);

        //Empieza el loop
        this.app.ticker.add(() => this.gameLoop());
    }

    async precargarAssets() {
        this.hombreAssets = await PIXI.Assets.load("assets/spritesheets/hombre.json");
        this.mujer1 = await PIXI.Assets.load("assets/spritesheets/mujer.json");
        this.mujer2 = await PIXI.Assets.load("assets/spritesheets/mujer2.json");
        this.mujer4 = await PIXI.Assets.load("assets/spritesheets/mujer4.json");
        this.neneAssets = await PIXI.Assets.load("assets/spritesheets/nene.json");
        this.jugadorAssets = await PIXI.Assets.load('assets/spritesheets/player.json');
        this.churrosAssets = await PIXI.Assets.load("assets/spritesheets/vendedora1.json")
        //Para armar después
        //this.choclosAssets = await PIXI.Assets.load("assets/spritesheets/vendedor2.json")
        //this.pochocloAssets = await PIXI.Assets.load("assets/spritesheets/vendedor3.json")
        this.playaTextura = await PIXI.Assets.load('assets/playa2.png');
        this.garitaTextura = await PIXI.Assets.load('assets/garitaGuardavidas.png')
    }

    async cargarJugador() {
        const coordenadaXdeJugador = window.innerWidth / 2
        const coordenadaYdeJugador = this.orillaDelMar + window.innerHeight / 2

        //Se crea el jugador
        this.jugador = new Jugador(coordenadaXdeJugador, coordenadaYdeJugador, this.jugadorAssets);
        
        //Se lo agrega en el mundo, no en el stage
        this.mundo.addChild(this.jugador.container);
        //this.app.stage.addChild(this.jugador.mensaje);
    }

    async cargarUnPersonajeNoJugable(unPersonaje, unaImagen, cantidad) {
        let datosParaNPC = unaImagen;

        for (let i = 0; i < cantidad; i++) {
            const coordenadaXDeNPC = Math.min(Math.random() * this.fondo.width, this.fondo.width);
            const coordenadaYDeNPC = Math.min(this.orillaDelMar + Math.random() * this.fondo.height, this.fondo.height);
            const instanciaDeNPC = new unPersonaje(coordenadaXDeNPC, coordenadaYDeNPC, datosParaNPC, i)
            
            this.arrayDeNpc.push(instanciaDeNPC);
            this.mundo.addChild(instanciaDeNPC.container);

            if (instanciaDeNPC instanceof Nenes) this.totalNenes.push(instanciaDeNPC);
            else this.totalAdultos.push(instanciaDeNPC);
        }

        if (unPersonaje === Nenes && this.perdidos > 0) {
            const primerosNenes = this.totalNenes.length - cantidad;
            
            for (let contador = 0; contador < Math.min(this.perdidos, cantidad); contador++) {
                const nenesActuales = primerosNenes + contador;

                this.totalNenes[nenesActuales].perdido = true;
                this.totalNenes[nenesActuales].adulto = null;
                }

            //Asignar adulto a nenes
            const adultosDisponibles = this.totalAdultos.filter(a => a instanceof Npc);

            if(adultosDisponibles.length > 0){
                    for (let contador = 0; contador < cantidad; contador++){
                        const nenesActuales = primerosNenes + contador;
                        const nene = this.totalNenes[nenesActuales];

                        if (nene.perdido) continue;

                        const adulto = adultosDisponibles[Math.floor(Math.random() * adultosDisponibles.length)];
                        nene.adulto = adulto;
                }
            }
        }
    }

    async cargarFondo() {
        this.fondo = new PIXI.Sprite(this.playaTextura);

        //ajustarFondo(this.fondo);

        this.mundo.addChildAt(this.fondo, 2);
    }

    async cargarInterfaz(){
        this.tareasPendientes = new PIXI.Text({
            text: "Encontrar " + this.perdidos + " nenes perdidos",
            style: {
                fill: "#ffffff",
                fontSize: 25,
                fontFamily: "Arial",
            },
        })

        this.listaDeTareas.addChild(this.tareasPendientes)
        
        this.app.stage.addChild(this.listaDeTareas)
    }

    async cargarGarita(){
        this.garita = new PIXI.Sprite(this.garitaTextura);

        this.mensajeDeGarita = new PIXI.Text({
            text: "Pulsa E para resguardar al nene",
            style: { fill: "white", fontSize: 18 }
        });
        
        this.mundo.addChild(this.garita);
        this.mundo.addChild(this.mensajeDeGarita);

        this.garita.anchor.set(0.5, 0.9);
        this.garita.y = this.orillaDelMar + 200;
        this.garita.x = this.orillaDelMar + Math.random();
        this.garita.zIndex = this.garita.y;

        this.mensajeDeGarita.anchor.set(0.5);
        this.mensajeDeGarita.x = this.garita.x;
        this.mensajeDeGarita.y = this.garita.y - 120; 
        this.mensajeDeGarita.zIndex = this.garita.zIndex + 1;
        this.mensajeDeGarita.visible = false;
    }

    async prepararEscena(){
        await cargarCielo(this.app);
        await cargarSolYLuna(this.mundo); 
        await this.cargarFondo();
        resetearAstros(); 

        await this.cargarInterfaz();
    
        await this.cargarJugador();
        this.cargarUnPersonajeNoJugable(Hombre, this.hombreAssets, this.cantAdultos);
        //Tengo que ver como barajar los assets de mujeres acá... pero no sé si es mucho más fácil ponerlo de esta forma.
        this.cargarUnPersonajeNoJugable(Mujer, this.mujer1, this.cantAdultos);
        this.cargarUnPersonajeNoJugable(Mujer, this.mujer2, this.cantAdultos);
        this.cargarUnPersonajeNoJugable(Mujer, this.mujer4, this.cantAdultos);
        this.cargarUnPersonajeNoJugable(Nenes, this.neneAssets, (this.cantNenes + this.perdidos));
        this.cargarUnPersonajeNoJugable(VendedoraChurros, this.churrosAssets, (this.vendedores));
        //this.cargarUnPersonajeNoJugable(VendedorChoclos, this.chocloAssets, (this.vendedores));
        //this.cargarUnPersonajeNoJugable(VendedorPochoclos, this.pochocloAssets, (this.vendedores));
        console.log("assets cargados")

        window.addEventListener('resize', onResize);

        await this.cargarGarita();
        
        this.tejoJuego = new TejoJuego(this.app);

        this.portalTejo = new TejoPortal(
            window.innerWidth * 0.7,
            this.orillaDelMar + window.innerHeight * 0.7,
            this.app,
            this.tejoJuego
        );

        this.portalTejo.init();

        // Aca va el cambio de clima
        iniciarSistemaDeClima();
        window.addEventListener("resize", () => onResize(this.app))
    }


    actualizarCamara(){
        if (!this.jugador) return;

        const centroX = window.innerWidth / 2;
        const centroY = window.innerHeight / 2;

        let targetX = centroX - this.jugador.container.x;
        let targetY = centroY - this.jugador.container.y;

        // Límites para que la cámara no muestre el "vacío" negro
        const limiteDerecho = -(this.fondo.width - window.innerWidth);
        const limiteInferior = -(this.fondo.height - window.innerHeight);

        this.mundo.x = Math.max(limiteDerecho, Math.min(0, targetX));
        this.mundo.y = Math.max(limiteInferior, Math.min(0, targetY));
    }

    actualizarInterfaz(){
        const cantNenesPerdidos = this.totalNenes.filter(nene => nene.perdido).length
        
        this.tareasPendientes.text = "Encontrar " + cantNenesPerdidos + " nenes perdidos"
    }

    mostrarMensajeDeGarita(){
        if(this.jugador.estaCercaDeLaGarita() && this.jugador.neneRescatado instanceof Nenes){
            console.log("mostrar mensaje de garita");
        
            this.mensajeDeGarita.visible = true;
        }
        
        else{
            this.mensajeDeGarita.visible = false;
        }
    }

    gameLoop() {
        const ahora = performance.now();
        if(!this.nuevoAhora) this.nuevoAhora = ahora;

        const enMiniJuego = this.tejoJuego && this.tejoJuego.activo;
        
        
        const dt = Math.min(0.05, (ahora - this.nuevoAhora) / 1000);
        if (isNaN(dt) || dt > 0.1) dt = 1/60;
        this.nuevoAhora = ahora;
        
        if (!this.bgmIniciada){
        this.bgm.play().then(() => {this.bgmIniciada = true;}).catch(()=>{});
        }

        if (!enMiniJuego) {
            this.jugador.inputTeclado(dt, keys);
            this.jugador.mantenerEnPantalla(300, this.fondo.width, this.fondo.height);
            this.jugador.update(dt);
            
            this.actualizarCamara();
            this.actualizarInterfaz();
            this.mostrarMensajeDeGarita();
            actualizarCielo(this.fondo);
            actualizarAstros();

            for (let i = 0; i < this.arrayDeNpc.length; i++){
                this.arrayDeNpc[i].update();
            }

            this.portalTejo.update(this.jugador);
        }

        else if (enMiniJuego) {
            this.tejoJuego.update();
        }

        //requestAnimationFrame(this.gameLoop); // SIEMPRE SE LLAMA
    }
}


const miJuego = new Juego()

//contemplo mayusculas y minusculas pq sino no funca
const keys = {
     w:false,
     a:false,
     s:false,
     d:false,
     e:false,
     W:false,
     A:false,
     S:false,
     D:false,
     E:false
};

const keysProcesadas = {
    e: false,
    E: false,
    q: false,
    Q: false
};

//comprende cuando una tecla es presionada
window.addEventListener('keydown', (e) => {
  if (e.key in keys){
    keys[e.key] = true;
    e.preventDefault();
    }
});

//comprende cuando una tecla es soltada
window.addEventListener('keyup', (e) => {
  if (e.key in keys){
    keys[e.key] = false;
    e.preventDefault();
    }
});

function unaTeclaFuePresionada(key){
    if (keys[key] && !keysProcesadas[key]){
        keysProcesadas[key] = true;
        return true;
    }
    else{
        return false;
    }
}

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && miJuego.tejoJuego.activo) {
        miJuego.tejoJuego.salir();
    }
});

miJuego.arrancar()