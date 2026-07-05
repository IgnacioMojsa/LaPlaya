let LIMITE_AGUA = {x: 0, y: 0};
const AGUA_Y_EN_IMAGEN = 335; // 👈 AJUSTALO a ojo fino
//CLIMA
let tiempoDelDia = 0; // 0 a 1 (0 = amanecer, 0.5 = mediodía, 1 = noche)
let velocidadTiempo = 0.00005//0.00005;

let climaActual = "despejado"; // opciones: "despejado", "nublado", "lluvia", "tormenta"
let ultimoPeriodoDelDia = "";
let intervaloClima = null;
let relampagoActivo = false;
let tiempoRelampago = 0;
let flashRelampago;

//SOL Y LUNA
let sol;
let luna;

let texturaSol;
let texturaLuna;

async function cargarSolYLuna(app) {
    texturaSol = await PIXI.Assets.load('assets/sol.png');
    texturaLuna = await PIXI.Assets.load('assets/luna.png');

    sol = new PIXI.Sprite(texturaSol);
    luna = new PIXI.Sprite(texturaLuna);

    // tamaño opcional
    sol.scale.set(0.15);
    luna.scale.set(0.12);

    app.addChild(sol);
    app.addChild(luna);
    
}

function resetearAstros() {
    sol.x = window.innerWidth;
    luna.x = window.innerWidth;

    sol.y = 100;
    luna.y = 100;
}

// =======================
// FONDO
// =======================

function actualizarAstros(fondo) {

    if (!fondo) return;

    const nivelW = fondo.width;

    const cieloAltura = window.innerHeight * 0.25;
    const offsetY = 120;

    // 🌞 SOL
    if (tiempoDelDia < 0.85) {

        sol.visible = true;
        luna.visible = false;

        let progreso = tiempoDelDia / 0.85;

        // recorrer TODO el nivel
        sol.x = nivelW - (nivelW * progreso);

        // arco del cielo
        sol.y = offsetY + Math.sin(progreso * Math.PI) * (-cieloAltura * 0.8);
    }

    // 🌙 LUNA
    else {

        sol.visible = false;
        luna.visible = true;

        let progreso = (tiempoDelDia - 0.85) / 0.15;

        // recorrer TODO el nivel
        luna.x = nivelW - (nivelW * progreso);

        luna.y = offsetY + Math.sin(progreso * Math.PI) * (-cieloAltura * 0.8);
    }
}

function ajustarFondo(fondoNuevo) {
    if (!fondoNuevo) return;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const texW = fondoNuevo.texture.width;
    const texH = fondoNuevo.texture.height;

    const escalaX = screenW / texW;
    const escalaY = screenH / texH;

    const escala = Math.max(escalaX, escalaY); // cover

    fondoNuevo.scale.set(escala);

    fondoNuevo.x = (screenW - fondoNuevo.width) / 2;
    fondoNuevo.y = (screenH - fondoNuevo.height) / 2;

    // CALCULAR LIMITE DINÁMICO DEL AGUA
    LIMITE_AGUA.y = fondoNuevo.y + (AGUA_Y_EN_IMAGEN * escala);
}

async function cargarCielo(app) {
    const textura = await PIXI.Assets.load('assets/cielo.png'); 

    cielo = new PIXI.Sprite(textura);

    ajustarCielo();

    app.stage.addChildAt(cielo, 0); 
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

function mostrarCambioDePeriodo(periodo) {
    if (ultimoPeriodoDelDia !== periodo) {
        ultimoPeriodoDelDia = periodo;
        console.log("Tiempo del día:", periodo);
    }
}

function actualizarCielo(fondo) {
    // avanzar tiempo
    tiempoDelDia += velocidadTiempo;
    if (tiempoDelDia > 1) tiempoDelDia = 0;

    let colorBase;

    if (tiempoDelDia < 0.25) {
        let t = tiempoDelDia / 0.25;
        colorBase = lerpColor(coloresDia.amanecer, coloresDia.dia, t);
        cielo.alpha = 1;
        
        mostrarCambioDePeriodo("amanecer");

    } else if (tiempoDelDia < 0.5) {
        colorBase = coloresDia.dia;
        cielo.alpha = 1;

        mostrarCambioDePeriodo("dia");

    } else if (tiempoDelDia < 0.75) {
        // día → atardecer
        let t = (tiempoDelDia - 0.5) / 0.25;
        colorBase = lerpColor(coloresDia.dia, coloresDia.atardecer, t);
        cielo.alpha = 1;

        mostrarCambioDePeriodo("atardecer");

    } else {
        // atardecer → noche
        let t = (tiempoDelDia - 0.75) / 0.25;
        colorBase = lerpColor(coloresDia.atardecer, coloresDia.noche, t);
        cielo.alpha = 1;

        mostrarCambioDePeriodo("noche");
    }

    // ☁️ NUBLADO
    if (climaActual === "nublado") {
        colorBase = lerpColor(colorBase, 0x999999, 0.35);
        cielo.alpha = 0.95;
    }

    // 🌧️ LLUVIA
    else if (climaActual === "lluvia") {
        colorBase = lerpColor(colorBase, 0x444466, 0.60);
        cielo.alpha = 1;
    }

    // ⛈️ TORMENTA
    else if (climaActual === "tormenta") {
        colorBase = lerpColor(colorBase, 0x1a1a2a, 0.85);
        cielo.alpha = 1;
    }
    
    if (relampagoActivo) {
        colorBase = lerpColor(colorBase, 0xffffff, 0.8);
    }

    cielo.tint = colorBase;
}

function crearFlashRelampago(app) {

    flashRelampago = new PIXI.Graphics();

    flashRelampago.rect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );

    flashRelampago.fill(0xffffff);

    flashRelampago.alpha = 0;

    app.stage.addChild(flashRelampago);
}

function iniciarSistemaDeClima() {

    if (intervaloClima) return;

    const climas = [
        "despejado",
        "despejado",
        "despejado",
        "nublado",
        "nublado",
        "lluvia",
        "tormenta"
    ];

    

    console.log("Clima actual:", climaActual);

    intervaloClima = setInterval(() => {
        climaActual = climas[Math.floor(Math.random() * climas.length)];
        console.log("Nuevo clima:", climaActual);
    }, 20000);
}

function actualizarRelampagos() {

    if (climaActual !== "tormenta") {
        relampagoActivo = false;
        tiempoRelampago = 0;

        if (flashRelampago) {
            flashRelampago.alpha = 0;
        }

        return;
    }

    if (!relampagoActivo && Math.random() < 0.002) {

        relampagoActivo = true;
        tiempoRelampago = Math.floor(Math.random() * 10) + 5;

        console.log("⚡ Relámpago");
    }

    if (relampagoActivo) {

        flashRelampago.alpha = 0.35;

        tiempoRelampago--;

        if (tiempoRelampago <= 0) {

            relampagoActivo = false;
            flashRelampago.alpha = 0;
        }
    }
    else {

        flashRelampago.alpha = 0;
    }
}

// =======================
// RESIZE
// =======================
function onResize(app) {
    

    ajustarFondo();
    ajustarCielo();
    if (flashRelampago) {

        flashRelampago.clear();

        flashRelampago.rect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );

        flashRelampago.fill(0xffffff);
    }
}