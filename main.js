let pixiApp;
let jugador;
let pixiInicializado = false;
let ahora = 0;

let arrayDeHombres = []
let cantidadTotalDeNpc = 200
let arrayDeNpc = []
let bgm = new Audio("./bgm.wav");
bgm.loop = true;


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

    await cargarFondo(); // 👈 importante esperar
    //cargarUnaImagen()
    cargarJugador()
    cargarUnPersonajeNoJugable(Hombre, 'npc_prueba.png')
    cargarUnPersonajeNoJugable(Mujer, 'npc_prueba2.png')
    cargarUnPersonajeNoJugable(Nenes, 'nene.png')

    // 👇 resize
    window.addEventListener('resize', onResize);
}

async function cargarUnPersonajeNoJugable(unPersonaje, unaImagen) {
    texture = await PIXI.Assets.load(unaImagen);
    const separacionX = 34
    const separacionY = 60
           
    for (let i = 0; i < cantidadTotalDeNpc; i ++){
                  
        const coordenadaXDeNPC = window.innerWidth / 2;
        const coordenadaYDeNPC = window.innerHeight / 2;
        const instanciaDeNPC = new unPersonaje(coordenadaXDeNPC, coordenadaYDeNPC, texture, i)
        arrayDeNpc.push(instanciaDeNPC)
        pixiApp.stage.addChild(instanciaDeNPC.sprite);
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

function verCuantosHombreEstanFueraDePantalla(){
    let arr = []

    for (let i = 0; i < arrayDeNpc.length; i++){
        const npcs = arrayDeNpc[i]

        if (npcs.sprite.x < 0 || npcs.sprite.x > window.innerWidth || npcs.sprite.y < 0 || npcs.sprite.y > window.innerHeight){
            arr.push(npcs)
            }
        }

        return arr
}
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
}

// =======================
// RESIZE
// =======================
function onResize() {
    const newW = window.innerWidth;
    const newH = window.innerHeight;

    pixiApp.renderer.resize(newW, newH);

    ajustarFondo();
}

//arrancarGameLoop
let nuevoAhora = performance.now();

function gameLoop(now) {
    bgm.play();
    jugador.inputTeclado(keys);
    jugador.mantenerEnPantallaX();

    for (let i = 0; i < arrayDeNpc.length; i++){
        const npc = arrayDeNpc[i]
            npc.moverse()
    }

    requestAnimationFrame(gameLoop);
}

arrancar()