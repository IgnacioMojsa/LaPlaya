class Juego{
    constructor(){
        this.app = null;
        this.mundo = null;
        //this.enMiniJuego = false;
        this.tejoJuego = null;
        this.portalTejo = null;
        this.bgm = new Audio("assets/audio/bgm.wav");
        this.nuevoAhora = performance.now();
        this.listaDeTareas = new PIXI.Container();

        this.cantAdultos = 100;
        this.cantNenes = 6;
        this.arrayDeNpc = [];
        this.totalAdultos = [];
        this.totalNenes = [];
        this.nenesRescatados = [];
        this.totalVendedores = [];
        this.vendedores = 2;
        this.temporizador = 0;
        this.perdidos = obtenerNumeroAleatorio(2, 5);
        this.totalPersonasTemerarias = [];
        this.maxPersonasTemerarias = obtenerNumeroAleatorio(5, 10); 
        this.cantidadTotalDeNpc = this.cantAdultos + this.cantNenes + this.perdidos + this.vendedores

        this.orillaDelMar = 690;
        this.horizonte = 300;
        this.limitePermitido = 515;
        this.zonaPeligrosa = 390;

        this.dineroDelJugador = 10000;

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
        this.chocloAssets = await PIXI.Assets.load("assets/spritesheets/choclo.json")
        //this.pochocloAssets = await PIXI.Assets.load("assets/spritesheets/vendedor3.json")
        this.playaTextura = await PIXI.Assets.load('assets/playa3.png');
        this.garitaTextura = await PIXI.Assets.load('assets/garitaGuardavidas.png')
        this.sombrilla1 = await PIXI.Assets.load('assets/sombrilla.png');
        this.sombrilla2 = await PIXI.Assets.load('assets/sombrilla2.png');
        this.sombrilla3 = await PIXI.Assets.load('assets/sombrilla3.png');
        this.sombra = await PIXI.Assets.load('assets/sombra.png');
        this.tipografia = await PIXI.Assets.load({src: "assets/Tiny5-Regular.ttf", data:{family: "PixelFont"}}); 
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
            else if (instanciaDeNPC instanceof Vendedor) this.totalVendedores.push(instanciaDeNPC)
            else this.totalAdultos.push(instanciaDeNPC);

            
            this.generarTemerosidadEnNpc(instanciaDeNPC);
            
        }
    }

    async cargarFondo() {
        this.fondo = new PIXI.Sprite(this.playaTextura);

        //ajustarFondo(this.fondo);

        this.mundo.addChildAt(this.fondo, 2);
    }

    async cargarGarita(){
        this.garita = new PIXI.Sprite(this.garitaTextura);

        this.mensajeDeGarita = new PIXI.Text({
            text: "Pulsa E para resguardar al nene",
            style: { fill: "white", fontSize: 18, fontFamily: "PixelFont"}
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

    async cargarSombrillas(){
        const maxSombrillas = 20;
        const texturasDeSombrilla = [this.sombrilla1, this.sombrilla2, this.sombrilla3];

        this.sombrillas = [];

        for(let i = 0; i < maxSombrillas; i++){
            const coordenadaXDeSombrilla = Math.min(Math.random() * this.fondo.width, this.fondo.width);
            const coordenadaYDeSombrilla = Math.min(this.orillaDelMar + Math.random() * this.fondo.height, this.fondo.height);
            const texturaAleatoria = texturasDeSombrilla[obtenerNumeroAleatorio(0,2)]  ;    

            const sombrillaNueva = new GameObject(coordenadaXDeSombrilla, coordenadaYDeSombrilla, texturaAleatoria, i);

            this.sombrillas.push(sombrillaNueva);
            this.mundo.addChild(sombrillaNueva.container);
        }
    }

    async cargarMujeres(){
        const cantAdultos = this.cantAdultos;
        const texturasNPCS = [this.mujer1, this.mujer2, this.mujer4];

        for(let i = 0; i < cantAdultos; i++){
            const texturaAleatoria = texturasNPCS[obtenerNumeroAleatorio(0,2)];    
            await this.cargarUnPersonajeNoJugable(Mujer, texturaAleatoria, 1)
        };

        console.log("mujeres creadas");
    }

    async cargarHombres(){
        const cantAdultos = this.cantAdultos;
        const texturasNPCS = [this.hombreAssets];

        for(let i = 0; i < cantAdultos; i++){
            const texturaAleatoria = texturasNPCS[obtenerNumeroAleatorio(0,0)]  ;    
            await this.cargarUnPersonajeNoJugable(Hombre, texturaAleatoria, 1)
        };

        console.log("hombres creados");
    }

    async prepararEscena(){
        await cargarCielo(this.app);
        await cargarSolYLuna(this.mundo); 
        await this.cargarFondo();

        crearFlashRelampago(this.app);
        
        resetearAstros(); 

        cargarInterfaz();
    
        await this.cargarJugador();
        await this.cargarHombres();
        await this.cargarMujeres();
        await this.cargarUnPersonajeNoJugable(Nenes, this.neneAssets, (this.cantNenes + this.perdidos));
        await this.cargarUnPersonajeNoJugable(VendedoraChurros, this.churrosAssets, (this.vendedores));
        await this.cargarUnPersonajeNoJugable(VendedorChoclos, this.chocloAssets, (this.vendedores));
        this.asignarNenesPerdidos((this.cantNenes + this.perdidos))
        //this.cargarUnPersonajeNoJugable(VendedorPochoclos, this.pochocloAssets, (this.vendedores));
        console.log("assets cargados")

        window.addEventListener('resize', onResize);

        await this.cargarGarita();
        await this.cargarSombrillas();
        
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

    mostrarMensajeDeGarita(){
        if(this.jugador.estaCercaDeLaGarita() && this.jugador.neneRescatado instanceof Nenes){
            console.log("mostrar mensaje de garita");
        
            this.mensajeDeGarita.visible = true;
        }
        
        else{
            this.mensajeDeGarita.visible = false;
        }
    }

    generarTemerosidadEnNpc(unNpc){
        if(unNpc instanceof Mujer || unNpc instanceof Hombre){
            if (unNpc.esTemerario() && this.totalPersonasTemerarias.length < this.maxPersonasTemerarias){
                this.equipararMujeresYHombresTemerarios(unNpc);
            }
            else{
                unNpc.temerosidad = obtenerNumeroAleatorio(1, 3);
            }
        }
    }

    equipararMujeresYHombresTemerarios(npcAEquiparar){
        //Evalua que siempre exista la misma o aproximada cantidad de hombres y mujeres temerari@s
        
        const maxHombreTemerarios = this.maxPersonasTemerarias/2;
        
        if(npcAEquiparar instanceof Hombre && this.totalPersonasTemerarias.length >= maxHombreTemerarios){
            npcAEquiparar.temerosidad = obtenerNumeroAleatorio(1, 3);
        }
        else{
            this.totalPersonasTemerarias.push(npcAEquiparar);
        }
    }

    hayPersonasAhogadas(){
        return this.totalPersonasTemerarias.some(npc => npc.ahogandose)
    }

    llevarTemerariosAlMar(dt){
        this.temporizador += dt;

        if(this.temporizador >= 30 && !this.hayPersonasAhogadas() && this.totalPersonasTemerarias.length > 0){
            console.log("Pasaron 20 segundos sin ahogados")
            
            this.totalPersonasTemerarias[obtenerNumeroAleatorio(1, this.maxPersonasTemerarias) - 1].sumarAceleracion(0, 0.5)

            this.temporizador -= 30;
        }
    }

    asignarNenesPerdidos(cantidad){
        if (this.perdidos > 0) {
            const primerosNenes = this.totalNenes.length - cantidad;
            
            for (let contador = 0; contador < Math.min(this.perdidos, cantidad); contador++) {
                const nenesActuales = primerosNenes + contador;

                this.totalNenes[nenesActuales].perdido = true;
                this.totalNenes[nenesActuales].adulto = null;
            }

            //Asignar adulto a nenes
            const adultosDisponibles = this.totalAdultos.filter(adulto => !adulto.neneACargo);

            if(adultosDisponibles.length > 0){
                for (let contador = 0; contador < cantidad; contador++){
                    const nenesActuales = primerosNenes + contador;
                    const nene = this.totalNenes[nenesActuales];

                    if (nene.perdido) continue;

                    const adulto = adultosDisponibles[obtenerNumeroAleatorio(0, adultosDisponibles.length - 1)];
                    
                    adulto.neneACargo = nene;
                    nene.adulto = adulto;
                }
            }
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

        if (!enMiniJuego){
          if (this.jugador.inputBloqueado){
            this.jugador.velocidad.x = 0;
            this.jugador.velocidad.y = 0;
          } else {
            this.jugador.inputTeclado(dt, keys);
          }

            this.jugador.mantenerEnPantalla(300, this.fondo.width, this.fondo.height + 50);
            this.jugador.update(dt);
            
            this.actualizarCamara();
            actualizarInterfaz();
            this.mostrarMensajeDeGarita();
            this.llevarTemerariosAlMar(dt);
            actualizarCielo(this.fondo);
            actualizarAstros();
            actualizarRelampagos();

            for (let i = 0; i < this.arrayDeNpc.length; i++){
                this.arrayDeNpc[i].update(dt);
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

window.addEventListener('keydown', (e) => {
  if (e.key in keys){
    keys[e.key] = true;
    e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
  if (e.key in keys){
    keys[e.key] = false;
    e.preventDefault();
    }
});

window.inputKeys = window.inputKeys || {};
window.addEventListener('keydown', (e) => { window.inputKeys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup',   (e) => { window.inputKeys[e.key.toLowerCase()] = false; });

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