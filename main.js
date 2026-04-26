let pixiApp;
let jugador;
let pixiInicializado = false;
let ahora = 0;
let arrayDeHombres = []
let cantidadTotalDeNpc = 200
let arrayDeNpc = []
//MUSICA
let bgm = new Audio("./bgm.wav");
bgm.loop = true;
//AGUA Y PLAYA
let LIMITE_AGUA_Y = 0;
const AGUA_Y_EN_IMAGEN = 335; // 👈 AJUSTALO a ojo fino
//CLIMA
let tiempoDelDia = 0; // 0 a 1 (0 = amanecer, 0.5 = mediodía, 1 = noche)
let velocidadTiempo = 0.00005;

let climaActual = "soleado"; // opciones: "soleado", "nublado", "lluvia"

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

async function precargarAssets() {
    this.hombreAssets = await PIXI.Assets.load("spritesheet.json")
    this.mujerAssets = await PIXI.Assets.load("mujer.json")
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
    await precargarAssets();
    console.log("assets cargados")
    cargarJugador()
    cargarUnPersonajeNoJugable(Hombre, hombreAssets)
    cargarUnPersonajeNoJugable(Mujer, mujerAssets)
    //cargarUnPersonajeNoJugable(Nenes, 'nene.png')

    window.addEventListener('resize', onResize);

    // 👇 ACÁ va el cambio de clima
    iniciarSistemaDeClima();
}

async function cargarUnPersonajeNoJugable(unPersonaje, unaImagen) {
    let datosParaNPC = unaImagen;

    //const separacionX = 34 NO SE USA
    //const separacionY = 60 NO SE USA
           
    for (let i = 0; i < cantidadTotalDeNpc; i ++){

        const coordenadaXDeNPC = Math.random();
        const coordenadaYDeNPC = Math.random();
        const instanciaDeNPC = new unPersonaje(coordenadaXDeNPC, coordenadaYDeNPC, datosParaNPC, i)
        arrayDeNpc.push(instanciaDeNPC)
        //pixiApp.stage.addChild(instanciaDeNPC.sprite);
        }
                //Acá debería estar el gameLoop pero choca con el input de teclado por alguna razon, sale en console. Funciona aunque esté comentado
                //gameLoop()
            }

async function cargarJugador() {
    const coordenadaXdeJugador = window.innerWidth / 2
    const coordenadaYdeJugador = window.innerHeight / 2

    //const
    texture = await PIXI.Assets.load('player.png');
    jugador = new Jugador(coordenadaXdeJugador, coordenadaYdeJugador, texture);
    pixiApp.stage.addChild(jugador.sprite);
    requestAnimationFrame(gameLoop);
}

/*function verCuantosHombreEstanFueraDePantalla(){ NO SE USA
    let arr = []

    for (let i = 0; i < arrayDeNpc.length; i++){
        const npcs = arrayDeNpc[i]

        if (npcs.sprite.x < 0 || npcs.sprite.x > window.innerWidth || npcs.sprite.y < 0 || npcs.sprite.y > window.innerHeight){
            arr.push(npcs)
            }
        }

        return arr
}*/
// =======================
// FONDO
// =======================
async function cargarFondo() {
    const textura = await PIXI.Assets.load('playa.png');

    fondo = new PIXI.Sprite(textura);

    ajustarFondo();

    pixiApp.stage.addChildAt(fondo, 0);
}

function ajustarFondo() {
    if (!fondo) return;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const texW = fondo.texture.width;
    const texH = fondo.texture.height;

    const escalaX = screenW / texW;
    const escalaY = screenH / texH;

    const escala = Math.max(escalaX, escalaY); // cover

    fondo.scale.set(escala);

    fondo.x = (screenW - fondo.width) / 2;
    fondo.y = (screenH - fondo.height) / 2;

    // CALCULAR LIMITE DINÁMICO DEL AGUA
    LIMITE_AGUA_Y = fondo.y + (AGUA_Y_EN_IMAGEN * escala);
}

async function cargarCielo() {
    const textura = await PIXI.Assets.load('cielo.png'); // tu imagen

    cielo = new PIXI.Sprite(textura);

    ajustarCielo();

    pixiApp.stage.addChildAt(cielo, 1); 
    // 👆 arriba del fondo (que está en 0)
}

function ajustarCielo() {
    if (!cielo) return;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    alturaCielo = screenH * 0.25;

    const texW = cielo.texture.width;
    const texH = cielo.texture.height;

    // 👇 importante: cubrir ancho siempre
    const escala = screenW / texW;

    cielo.scale.set(escala);

    // centrar horizontalmente
    cielo.x = 0;

    // posicion arriba
    cielo.y = 0;

    // 👇 RECORTE si sobra altura
    if (cielo.height > alturaCielo) {
        cielo.height = alturaCielo;
    }
}

function lerpColor(a, b, t) {
    const ar = (a >> 16) & 0xff;
    const ag = (a >> 8) & 0xff;
    const ab = a & 0xff;

    const br = (b >> 16) & 0xff;
    const bg = (b >> 8) & 0xff;
    const bb = b & 0xff;

    const rr = ar + t * (br - ar);
    const rg = ag + t * (bg - ag);
    const rb = ab + t * (bb - ab);

    return (rr << 16) + (rg << 8) + rb;
}

const coloresDia = {
    amanecer: 0xffb27f,
    dia: 0x87ceeb,
    atardecer: 0xff8c42,
    noche: 0x0a0a2a
};

function actualizarCielo() {
    // avanzar tiempo
    tiempoDelDia += velocidadTiempo;
    if (tiempoDelDia > 1) tiempoDelDia = 0;

    let colorBase;

    if (tiempoDelDia < 0.25) {
        // amanecer → día
        let t = tiempoDelDia / 0.25;
        colorBase = lerpColor(coloresDia.amanecer, coloresDia.dia, t);

    } else if (tiempoDelDia < 0.5) {
        colorBase = coloresDia.dia;

    } else if (tiempoDelDia < 0.75) {
        // día → atardecer
        let t = (tiempoDelDia - 0.5) / 0.25;
        colorBase = lerpColor(coloresDia.dia, coloresDia.atardecer, t);

    } else {
        // atardecer → noche
        let t = (tiempoDelDia - 0.75) / 0.25;
        colorBase = lerpColor(coloresDia.atardecer, coloresDia.noche, t);
    }

    // 🌧️ modificar según clima
    if (climaActual === "nublado") {
        colorBase = lerpColor(colorBase, 0x888888, 0.5);
    }

    if (climaActual === "lluvia") {
        colorBase = lerpColor(colorBase, 0x444466, 0.7);
        cielo.alpha = 1;
        fondo.alpha = 0.8;
    } else {
        cielo.alpha = 1;
        fondo.alpha = 1;
    }

    cielo.tint = colorBase;
}

function iniciarSistemaDeClima() {
    const climas = ["soleado", "nublado", "lluvia"];

    setInterval(() => {
        climaActual = climas[Math.floor(Math.random() * climas.length)];
        console.log("Nuevo clima:", climaActual);
    }, 20000); // cada 20 segundos
}

// =======================
// RESIZE
// =======================
function onResize() {
    const newW = window.innerWidth;
    const newH = window.innerHeight;

    pixiApp.renderer.resize(newW, newH);

    ajustarFondo();
    ajustarCielo();
}

//arrancarGameLoop
let nuevoAhora = performance.now();

function gameLoop(now) {
    bgm.play();
    jugador.inputTeclado(keys);
    jugador.mantenerEnPantalla(LIMITE_AGUA_Y);
    actualizarCielo();


    for (let i = 0; i < arrayDeNpc.length; i++){
        const npc = arrayDeNpc[i];

        npc.render();

        if (npc.container.y < LIMITE_AGUA_Y) {
            npc.container.y = LIMITE_AGUA_Y;
        }
    }
    requestAnimationFrame(gameLoop);
}

arrancar()