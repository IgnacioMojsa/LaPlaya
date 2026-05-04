let pixiApp;
let jugador;
let pixiInicializado = false;
let ahora = 0;

let cantAdultos = 10; //Se puede crear cant. de hombres y mujeres tambien
let cantNenes = 3;
let arrayDeNpc = [];
let totalAdultos = [];
let totalNenes = [];
let perdidos = 1

let cantidadTotalDeNpc = cantAdultos + cantNenes + perdidos

//MUSICA
let bgm = new Audio("assets/bgm.wav");
bgm.loop = true;

//TEJO
let portalTejo;
let tejoJuego;

//contemplo mayusculas y minusculas pq sino no funca
const keys = {
     w:false,
     a:false,
     s:false,
     d:false,
     W:false,
     A:false,
     S:false,
     D:false
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

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && tejoJuego.activo) {
        tejoJuego.salir();
    }
});

async function precargarAssets() {
    this.hombreAssets = await PIXI.Assets.load("assets/spritesheets/hombre.json");
    this.mujerAssets = await PIXI.Assets.load("assets/spritesheets/mujer.json");
    this.neneAssets = await PIXI.Assets.load("assets/spritesheets/nene.json");
    this.jugadorAssets = await await PIXI.Assets.load('assets/spritesheets/player.json')
}

async function arrancar() {
    console.log("arrancando");
    pixiApp = new PIXI.Application()
    console.log("app de pixi creada");

    const opcionesDePixi = {
        width: window.innerWidth,
        height: window.innerHeight,
        background: "#000000"
    };

    await pixiApp.init(opcionesDePixi);
    window.__PIXI_APP__ = pixiApp
    document.body.appendChild(pixiApp.canvas);
    pixiInicializado = true;

    await cargarFondo();
    await cargarCielo(); // 👈 después del fondo
    await cargarSolYLuna(); 
    await resetearAstros(); 
    await precargarAssets();
    console.log("assets cargados")
    cargarJugador()
    cargarUnPersonajeNoJugable(Hombre, hombreAssets, cantAdultos)
    cargarUnPersonajeNoJugable(Mujer, mujerAssets, cantAdultos)
    cargarUnPersonajeNoJugable(Nenes, neneAssets, (cantNenes + perdidos))

    window.addEventListener('resize', onResize);

    tejoJuego = new TejoJuego(pixiApp);

    portalTejo = new TejoPortal(
        window.innerWidth * 0.7,
        window.innerHeight * 0.7,
        pixiApp,
        tejoJuego
    );

    await portalTejo.init();

    // 👇 ACÁ va el cambio de clima
    iniciarSistemaDeClima();
}

async function cargarUnPersonajeNoJugable(unPersonaje, unaImagen, cantidad) {
    let datosParaNPC = unaImagen;
    for (let i = 0; i < cantidad; i++) {
        const coordenadaXDeNPC = Math.random() * window.innerWidth;
        const coordenadaYDeNPC = LIMITE_AGUA.y + Math.random() * window.innerHeight;
        const instanciaDeNPC = new unPersonaje(coordenadaXDeNPC, coordenadaYDeNPC, datosParaNPC, i)
        arrayDeNpc.push(instanciaDeNPC);
        if (instanciaDeNPC instanceof Nenes) totalNenes.push(instanciaDeNPC);
        else totalAdultos.push(instanciaDeNPC);
    }

    if (unPersonaje === Nenes && perdidos > 0) {
    const primerosNenes = totalNenes.length - cantidad;
    for (let contador = 0; contador < Math.min(perdidos, cantidad); contador++) {
        const nenesActuales = primerosNenes + contador;
        totalNenes[nenesActuales].perdido = true;
        totalNenes[nenesActuales].adulto = null;
        }
    
    //Asignar adulto a nenes
    const adultosDisponibles = totalAdultos.filter(a => a instanceof Npc);
    if(adultosDisponibles.length > 0){
        for (let contador = 0; contador < cantidad; contador++){
        const nenesActuales = primerosNenes + contador;
        const nene = totalNenes[nenesActuales];
        if (nene.perdido) continue;
        const adulto = adultosDisponibles[Math.floor(Math.random() * adultosDisponibles.length)];
        nene.adulto = adulto;
        }
        }
    }

}

async function cargarJugador() {
    const coordenadaXdeJugador = window.innerWidth / 2
    const coordenadaYdeJugador = window.innerHeight / 2

    //const
    jugador = new Jugador(coordenadaXdeJugador, coordenadaYdeJugador, jugadorAssets);
    requestAnimationFrame(gameLoop);
}

async function cargarFondo() {
    const textura = await PIXI.Assets.load('assets/playa.png');

    fondo = new PIXI.Sprite(textura);

    ajustarFondo();

    pixiApp.stage.addChildAt(fondo, 0);
}

let nuevoAhora = performance.now();

function gameLoop(now) {

    const enMiniJuego = tejoJuego && tejoJuego.activo;
    
    const dt = Math.min(0.05, (now - nuevoAhora) / 1000);
    nuevoAhora = now;
    
    bgm.play();
    if (!enMiniJuego) {
        jugador.inputTeclado(dt, keys);
        jugador.mantenerEnPantalla(LIMITE_AGUA.y);
        jugador.update(dt);
    }

    actualizarCielo();
    actualizarAstros();

    for (let i = 0; i < arrayDeNpc.length; i++){
        const npc = arrayDeNpc[i];

        if (!enMiniJuego) {
            npc.update();
        }
    }
    console.log("MiniJuego activo:", enMiniJuego);

    portalTejo.update(jugador);
    
    requestAnimationFrame(gameLoop);
}

arrancar()