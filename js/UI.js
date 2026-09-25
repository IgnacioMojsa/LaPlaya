//HUD
class Objetivos {
  constructor(unMensaje, x, y){
    this.container = new PIXI.Container();
    
    this.mensaje = new PIXI.Text({
        text: unMensaje,
        style: {
        fill: "#ffffff",
        fontSize: 18,
        fontFamily: "PixelFont",
      }});

    this.condicion = true;
    
    this.casillero = new PIXI.Sprite(miJuego.casillero);
    this.completado = new PIXI.Sprite(miJuego.tilde);

    this.mensaje.anchor.set(0,1);
    this.mensaje.x = x;
    this.mensaje.y = y;

    this.completado.anchor.set(0, 0.5);
    this.completado.x = this.mensaje.x - 30;
    this.completado.y = this.mensaje.y - 5;
    this.completado.visible = false;

    this.casillero.anchor.set(0, 0.5);
    this.casillero.x = this.mensaje.x - 30;
    this.casillero.y = this.mensaje.y - 5;

    this.container.addChild(this.mensaje);
    this.container.addChild(this.casillero);
    this.container.addChild(this.completado);

    miJuego.listaDeTareas.addChild(this.container);
  }

  corroborarYCambiarACompletado(){
    if(!this.condicion){
      this.completado.visible = true;
    }
  }

  estaCompletado(){
    return this.completado.visible === true 
  }

  actualizarCondicion(condicion){
    this.condicion = condicion;
  }
}

function cargarInterfaz(){
  miJuego.comprasPendientes = new PIXI.Text({
    text: "Comprar " + miJuego.cantidadDeComida + miJuego.comidaAComprar,
    style: {
    fill: "#ffffff",
    fontSize: 18,
    fontFamily: "PixelFont",
    },
  })

  const visualReloj = new UIReloj(miJuego.reloj);
  miJuego.uiRelojBanderin.addChild(visualReloj.container);
  miJuego.uiRelojBanderin.addChild(miJuego.uiRelojBanderin);
  miJuego.app.stage.addChild(miJuego.uiRelojBanderin);
  miJuego.uiRelojBanderin.x = window.innerWidth - 10;
  miJuego.uiRelojBanderin.y = 10;

  const visualObjetivosContraidos = new PIXI.Sprite(miJuego.objetivosContraidos);
  visualObjetivosContraidos.anchor.set(1, 0);
  miJuego.uiObjetivosContraidos.addChild(visualObjetivosContraidos)
  miJuego.app.stage.addChild(miJuego.uiObjetivosContraidos);
  miJuego.uiObjetivosContraidos.x = window.innerWidth - 10;
  miJuego.uiObjetivosContraidos.y = miJuego.uiRelojBanderin.y + 130;

  const visualObjetivosDesplegados = new PIXI.Sprite(miJuego.objetivosDesplegados);
  visualObjetivosDesplegados.anchor.set(1, 0);
  miJuego.uiObjetivosDesplegados.addChild(visualObjetivosDesplegados)
  miJuego.app.stage.addChild(miJuego.uiObjetivosDesplegados);
  miJuego.uiObjetivosDesplegados.x = window.innerWidth - 10;
  miJuego.uiObjetivosDesplegados.y = miJuego.uiRelojBanderin.y + 130;
  miJuego.uiObjetivosDesplegados.visible = false;

  miJuego.barraAmarilla = new PIXI.Graphics();
  miJuego.barraAmarilla.beginFill("#ffb700");
  miJuego.barraAmarilla.drawRect(2, 2, miJuego.energiaDelJugador * 3.6, 30);
  miJuego.barraAmarilla.endFill();
  miJuego.barraAmarilla.x = -370;
  miJuego.barraAmarilla.y = 25;

  miJuego.barraFondo = new PIXI.Graphics();
  miJuego.barraFondo.beginFill("#9f0006");
  miJuego.barraFondo.drawRect(2, 2, 360, 30);
  miJuego.barraFondo.endFill();
  miJuego.barraFondo.x = -370;
  miJuego.barraFondo.y = 25;

  const visualBarraEnergia = new PIXI.Sprite(miJuego.barraEnergia);
  visualBarraEnergia.anchor.set(1, 0);
  miJuego.uiBarraEnergia.addChild(visualBarraEnergia);
  miJuego.uiBarraEnergia.addChild(miJuego.barraAmarilla);
  miJuego.uiBarraEnergia.addChild(miJuego.barraFondo);
  miJuego.app.stage.addChild(miJuego.uiBarraEnergia);
  miJuego.uiBarraEnergia.x = 430;
  miJuego.uiBarraEnergia.y = 10;
  miJuego.uiBarraEnergia.setChildIndex(miJuego.barraAmarilla, 0);
  miJuego.uiBarraEnergia.setChildIndex(miJuego.barraFondo, 0);

  miJuego.dinero = new PIXI.Text({text: miJuego.dineroDelJugador, style: {fill: "#ffb700", fontSize: 30, fontWeight: 900, fontFamily: "PixelFont"}});
  miJuego.dinero.y = 19;
  miJuego.dinero.x = -230;

  const visualDinero = new PIXI.Sprite(miJuego.dineroDisponible);
  visualDinero.anchor.set(1, 0);
  miJuego.uiDinero.addChild(visualDinero);
  miJuego.uiDinero.addChild(miJuego.dinero);
  miJuego.app.stage.addChild(miJuego.uiDinero);
  miJuego.uiDinero.x = 316;
  miJuego.uiDinero.y = 90;

  miJuego.pantallaDeVictoria = new UIPuntaje();

  miJuego.nenesPorRescatar = new Objetivos(
    "Encontrar " + miJuego.perdidos + " nenes perdidos", 
    miJuego.uiObjetivosDesplegados.x - 300, 
    miJuego.uiObjetivosDesplegados.y + 80
  );

  miJuego.ahogadosARescatar = new Objetivos(
    "Rescatar " + miJuego.cantidadDeAhogadosARescatar + " personas ahogadas", 
    miJuego.uiObjetivosDesplegados.x - 300, 
    miJuego.uiObjetivosDesplegados.y + 160
  );

  miJuego.comprasPendientes = new Objetivos(
    "Comprar " + miJuego.comidaAComprar.mensajeDeCompra, 
    miJuego.uiObjetivosDesplegados.x - 300, 
    miJuego.uiObjetivosDesplegados.y + 120
  );

  miJuego.objetivoTejo = new Objetivos(
    "Ganar una partida de tejo", 
    miJuego.uiObjetivosDesplegados.x - 300, 
    miJuego.uiObjetivosDesplegados.y + 200
  )

  miJuego.visualReloj = new UIReloj(miJuego.reloj);
  miJuego.uiRelojBanderin.addChild(miJuego.visualReloj.container);
        
  miJuego.app.stage.addChild(miJuego.listaDeTareas);
  miJuego.app.stage.addChild(miJuego.pantallaDeVictoria.container);
}

function quedanNenesPorRescatar(){
  const cantNenesPerdidos = miJuego.totalNenes.filter(nene => nene.perdido).length

  return cantNenesPerdidos > 0;
}

function quedanAhogadosPorRescatar(){
  const cantidadDeAhogadosPorRescatar = Math.round(miJuego.totalPersonasTemerarias.length / 2) - miJuego.cantidadDePersonasRescatadas;
  
  return cantidadDeAhogadosPorRescatar > 0;
}

function quedanComprasPendientes(){
  const comprasPendientes = miJuego.comidaAComprar.compraRequerida - miJuego.cantidadComidaRequeridaComprada();
  return comprasPendientes;
}

function partidaDeTejoPorGanar(){
  const partidaPorGanar = miJuego.tejoJuego.partidaTerminada && miJuego.tejoJuego.ganador === "BLANCO";

  return !partidaPorGanar
}

function cantidadObjetivosCompletados(){
  const objetivos = [miJuego.nenesPorRescatar, miJuego.ahogadosARescatar, miJuego.comprasPendientes, miJuego.objetivoTejo];
  
  const cantObjCompletados = objetivos.filter(obj => obj.estaCompletado());

  return cantObjCompletados.length
}

function actualizarPuntaje(){
  miJuego.puntajePorObjetivosCompletados = cantidadObjetivosCompletados() * 500;
  miJuego.puntajePorDineroSobrante = miJuego.dineroDelJugador;
}

function actualizarInterfaz(){
    const cantNenesPerdidos = miJuego.totalNenes.filter(nene => nene.perdido).length
    const cantidadDeAhogadosPorRescatar = Math.round(miJuego.totalPersonasTemerarias.length / 2) - miJuego.cantidadDePersonasRescatadas;

    miJuego.nenesPorRescatar.mensaje.text = "Encontrar " + cantNenesPerdidos + " nenes perdidos";
    miJuego.comprasPendientes.mensaje.text = "Comprar " + miJuego.comidaAComprar.mensajeDeCompra;
    miJuego.ahogadosARescatar.mensaje.text = "Rescatar " + cantidadDeAhogadosPorRescatar + " personas ahogadas",
    miJuego.dinero.text = miJuego.dineroDelJugador;

    miJuego.nenesPorRescatar.actualizarCondicion(quedanNenesPorRescatar());
    miJuego.comprasPendientes.actualizarCondicion(quedanComprasPendientes());
    miJuego.ahogadosARescatar.actualizarCondicion(quedanAhogadosPorRescatar());
    miJuego.objetivoTejo.actualizarCondicion(partidaDeTejoPorGanar());

    miJuego.nenesPorRescatar.corroborarYCambiarACompletado();
    miJuego.comprasPendientes.corroborarYCambiarACompletado();
    miJuego.ahogadosARescatar.corroborarYCambiarACompletado();
    miJuego.objetivoTejo.corroborarYCambiarACompletado();
    
    const energiaActual = miJuego.energiaDelJugador * 3.6;
    miJuego.barraAmarilla.clear();
    miJuego.barraAmarilla.beginFill("#ffb700");
    miJuego.barraAmarilla.drawRect(2, 2, energiaActual, 30);
    miJuego.barraAmarilla.endFill();
}

class UICompra {
  constructor(app, opciones, vendedor){
    this.app = app;
    this.container = new PIXI.Container();
    this.container.visible = false;
    this.app.stage.addChild(this.container);

    this.vendedor = vendedor;

    const menuAncho = 700;
    const menuAltura = 120;
    const x = window.innerWidth/2 - 350;
    const y = window.innerHeight - 210;

    /* const fondoMenu = new PIXI.Graphics();
    fondoMenu.fill(0xffffff);
    fondoMenu.roundRect(0, 0, menuAncho, menuAltura, 8);
    fondoMenu.endFill() ;*/
    const fondoMenu = new PIXI.Sprite(miJuego.menuCompra);
    fondoMenu.x = x; fondoMenu.y = y; 
    this.container.addChild(fondoMenu);

    this.title = new PIXI.Text({text: "¿Qué te gustaría comprar?", style: {fontFamily: "PixelFont", fontSize: 25, fill: "#ffb700", fontWeight: 900}});
    this.title.x = x + 20; this.title.y = y + 16;
    this.container.addChild(this.title);

    this.cantidadOpcion1 = null;
    this.cantidadOpcion2 = null;

    this.opciones = [
    { label: `${opciones.opcion1} - $${opciones.precio1} (+${opciones.energia1} energía)`,
    price: opciones.precio1,
    energia: opciones.energia1,
    cantidad: opciones.cantidad1
    },

    { label: `${opciones.opcion2} - $${opciones.precio2} (+${opciones.energia2} energía)`,
    price: opciones.precio2,
    energia: opciones.energia2,
    cantidad: opciones.cantidad2
    }
    ];


    this.textoOpciones = [];
    const bordeY = y + 40;
    const bordeYOpcion2 = bordeY + 10;
    const izqX = x + 20;
    //const derX = x + menuAncho / 2 + 10;

    const inicioY = y + 60;
    const separacion = 40;

    this.opciones.forEach((opc, i) => {
      const texto = new PIXI.Text({
        text: opc.label,
        style: { fontFamily: "PixelFont", fontSize: 23, fill: "#ffffff" }
      });

      texto.x = x + 20;
      texto.y = inicioY + i * separacion;

      this.container.addChild(texto);
      this.textoOpciones.push(texto);
    });

    this.hover = new PIXI.Graphics();
    this.hover.x = izqX - 6;
    this.hover.y = bordeY - 4;
    this.container.addChild(this.hover);

    this.abierto = false;
    this.indexOpcion = 0;
    this.hoverOpcion();

    this.infoTxt = new PIXI.Text({
      text: "W y S Elegir | Enter Comprar | E Salir", 
      style: {fontFamily: "PixelFont", fontSize: 20, fill: "#ffb700"}}); 
    this.infoTxt.x = x + 25; this.infoTxt.y = y + menuAltura + 40;
    this.container.addChild(this.infoTxt);

    this.confirmarCompra = opciones.confirmarCompra || ((idx,opc) => console.log("Compró", idx, opc));

    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this.keysProcesadas = {};
  }

  ocultarMenu(){
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.app.stage.removeChild(this.container);
    this.container.ocultarMenu({children: true});
  }

  abrir(){
    this.abierto = true;
    this.container.visible = true;
    if (miJuego.jugador) miJuego.jugador.inputBloqueado = true;
    this.hoverOpcion();
  }

  cerrar(){
    this.abierto = false;
    this.container.visible = false;
    if (miJuego.jugador) miJuego.jugador.inputBloqueado = false;
  }

  toggle(){
    this.abierto ? this.cerrar() : this.abrir();
  }

  hoverOpcion(){
    const x0 = this.textoOpciones[0].x - 6;
    const x1 = this.textoOpciones[1].x - 6;
    this.hover.x = this.indexOpcion === 0 ? x0 : x1;
    this.textoOpciones.forEach((texto,i) => texto.style.fill = i===this.indexOpcion ? "#ffffff" : "#ffffff");
    this.textoOpciones.forEach((texto,i) => texto.style.fontWeight = i===this.indexOpcion ? 900 : 100);
  }

  comprarProducto(){
  const opc = this.opciones[this.indexOpcion];

  if (miJuego.dineroDelJugador >= opc.price){
    miJuego.dineroDelJugador -= opc.price;
    miJuego.energiaDelJugador += opc.energia;
    miJuego.energiaDelJugador = Math.min(100, miJuego.energiaDelJugador);
    this.confirmarCompra(this.indexOpcion, opc);
  
    const compraCorrecta = this.textoOpciones[this.indexOpcion].style.fill;
    this.textoOpciones[this.indexOpcion].style.fill = "#ffb700";
    setTimeout(() => {this.textoOpciones[this.indexOpcion].style.fill = compraCorrecta;}, 500);
    playSfx(sfx.compra);
    
    for (let i = 0; i < opc.cantidad; i++){
      if (Array.isArray(this.vendedor.producto)) {
        this.vendedor.producto[this.indexOpcion] ? 
        miJuego.jugador.comidasCompradas.push(this.vendedor.producto[this.indexOpcion]) : null;
      } else {
        miJuego.jugador.comidasCompradas.push(this.vendedor.producto);
      }
    }
    

  }else{
    if (this.mensajeError) this.mensajeError.destroy();
    const opcion = this.textoOpciones[this.indexOpcion];
    this.mensajeError = new PIXI.Text({
      text: "Dinero insuficiente",
      style: { fontFamily: "PixelFont", fontSize: 25, fill: "#ffffff" }
    });
    this.mensajeError.x = opcion.x + opcion.width + 10;
    this.mensajeError.y = opcion.y;
    this.container.addChild(this.mensajeError);
    setTimeout(() => { if (this.mensajeError){
        this.container.removeChild(this.mensajeError);
        this.mensajeError.destroy();
        this.mensajeError = null;}
    },800);
    playSfx(sfx.error);
    }
  }

  onKeyDown(e){
    const key = e.key.toLowerCase();
    if (this.keysProcesadas[key]) return;
    this.keysProcesadas[key] = true;
    actualizarInterfaz();
    if (!this.abierto) return;
      if (key === 'w'){
        this.indexOpcion = 0; this.hoverOpcion();
        playSfx(sfx.opcion);
      }
      else if (key === 's'){
        this.indexOpcion = 1; this.hoverOpcion();
        playSfx(sfx.opcion);
      }
      else if (key === 'enter'){this.comprarProducto();}
  }
  onKeyUp(e){ this.keysProcesadas[e.key.toLowerCase()] = false;}
}

class UIReloj{
  constructor(texture){
    this.container = new PIXI.Container();
    this.spritesAnimados = null;
    this.intervaloReloj = null;

    this.cargarSprites(texture);
  }

  cargarSprites(spritesACargar){
    const frames = spritesACargar.animations["reloj"] || Object.values(spritesACargar.textures);

    this.spritesAnimados = new PIXI.AnimatedSprite(frames);
    this.spritesAnimados.anchor.set(1, 0);

    this.spritesAnimados.stop(); 
    this.spritesAnimados.currentFrame = 0;

    this.container.addChild(this.spritesAnimados);
  }

  iniciarTemporizador(){
    if (this.intervaloReloj) return;

    const tiempoPorFrameMS = 5000; 

    this.intervaloReloj = setInterval(() => {
      if (this.spritesAnimados){
        let siguienteFrame = this.spritesAnimados.currentFrame + 1;
        
        miJuego.puntajePorTiempoEmpleado -= 200;

        if (siguienteFrame >= this.spritesAnimados.totalFrames){
          siguienteFrame = 72;
          miJuego.terminarPartidaYMostrarPuntaje();
          this.limpiarTemporizador();
        }

        this.spritesAnimados.gotoAndStop(siguienteFrame);
      }
    }, tiempoPorFrameMS);
  }

  limpiarTemporizador(){
    if (this.intervaloReloj) {
      clearInterval(this.intervaloReloj);
    }
  }
}

class UIPuntaje{
  constructor(){
    this.container = new PIXI.Container();

    this.fondo = new PIXI.Graphics();
    this.fondo.visible = false;
    
    this.jornadaCompletada = new PIXI.Sprite(miJuego.finDePartida);
    this.jornadaCompletada.anchor.set(0.5, 0.5);
    this.jornadaCompletada.visible = false;

    this.contenedorPuntaje = new PIXI.Sprite(miJuego.contenedor);
    this.contenedorPuntaje.anchor.set(0.5, 0);
    this.contenedorPuntaje.visible = false;

    this.totalPuntaje = new PIXI.Sprite(miJuego.totalPuntos);
    this.totalPuntaje.anchor.set(0.5, 0);
    this.totalPuntaje.visible = false;

    this.lobby = new PIXI.Sprite(miJuego.botonDeLobby);
    this.lobby.anchor.set(0.5, 0.5);
    this.lobby.visible = false;

    this.lobby.eventMode = 'static';
    this.lobby.cursor = 'pointer';
    this.lobby.on('pointertap', () => { window.location.reload(); });

    this.container.addChild(this.fondo);
    this.container.addChild(this.totalPuntaje);
    this.container.addChild(this.jornadaCompletada);
    this.container.addChild(this.contenedorPuntaje);
    this.container.addChild(this.lobby);

    this.reescalar();
    window.addEventListener("resize", () => this.reescalar());
  }

  puntosPorObjetivos(){
    this.puntosObjetivos = new PIXI.Text({
      text: miJuego.puntajePorObjetivosCompletados + " por objetivos",
      style: {
      fill: "#f2b705",
      fontSize: 30,
      fontFamily: "PixelFont",
    }});
    this.puntosObjetivos.anchor.set(0, 0.5);

    this.container.addChild(this.puntosObjetivos);

    this.reescalar();
  }

  puntosPorDinero(){
    this.puntosDinero = new PIXI.Text({
      text: miJuego.puntajePorDineroSobrante + " por dinero sobrante",
      style: {
      fill: "#f2b705",
      fontSize: 30,
      fontFamily: "PixelFont",
    }});
    this.puntosDinero.anchor.set(0, 0.5);

    this.container.addChild(this.puntosDinero);

    this.reescalar();
  }

  puntosPorTiempo(){
    this.puntosTiempo = new PIXI.Text({
      text: miJuego.puntajePorTiempoEmpleado + " por tiempo empleado",
      style: {
      fill: "#f2b705",
      fontSize: 30,
      fontFamily: "PixelFont",
    }});
    this.puntosTiempo.anchor.set(0, 0.5);

    this.container.addChild(this.puntosTiempo);

    this.reescalar();
  }

  reescalar() {
    const ancho = window.innerWidth;
    const alto = window.innerHeight;

    this.fondo.clear();
    this.fondo.beginFill(0x000000, 0.75);
    this.fondo.drawRect(0, 0, ancho, alto);
    this.fondo.endFill();

    const escalaBase = Math.min(ancho / 1920, alto / 1080);
    const escalaFinal = Math.max(0.5, Math.min(escalaBase * 1.2, 1.2));

    this.jornadaCompletada.scale.set(escalaFinal);
    this.contenedorPuntaje.scale.set(escalaFinal);
    this.totalPuntaje.scale.set(escalaFinal);
    this.lobby.scale.set(escalaFinal * 0.4);

    this.jornadaCompletada.x = ancho / 2;
    this.jornadaCompletada.y = alto * 0.18;

    this.contenedorPuntaje.x = ancho / 2;
    this.contenedorPuntaje.y = this.jornadaCompletada.y + (100 * escalaFinal);

    this.totalPuntaje.x = ancho / 2;
    this.totalPuntaje.y = this.contenedorPuntaje.y + (380 * escalaFinal);

    const anchoBarraTotal = this.totalPuntaje.texture ? (this.totalPuntaje.texture.width * escalaFinal) : (400 * escalaFinal);
    const altoBarraTotal = this.totalPuntaje.texture ? (this.totalPuntaje.texture.height * escalaFinal) : (80 * escalaFinal);
    const separacionX = (this.lobby.width / 2) + (15 * escalaFinal);

    this.lobby.x = (ancho / 2) - (anchoBarraTotal / 2) - separacionX;
    this.lobby.y = this.totalPuntaje.y + (altoBarraTotal / 2);

    if (this.puntosObjetivos) {
      this.puntosObjetivos.style.fontSize = Math.round(30 * escalaFinal);
      this.puntosObjetivos.x = this.contenedorPuntaje.x - (230 * escalaFinal);
      this.puntosObjetivos.y = this.contenedorPuntaje.y + (40 * escalaFinal);
    }

    if (this.puntosDinero) {
      this.puntosDinero.style.fontSize = Math.round(30 * escalaFinal);
      this.puntosDinero.x = this.contenedorPuntaje.x - (230 * escalaFinal);
      this.puntosDinero.y = this.contenedorPuntaje.y + (80 * escalaFinal);
    }

    if (this.puntosTiempo) {
      this.puntosTiempo.style.fontSize = Math.round(30 * escalaFinal);
      this.puntosTiempo.x = this.contenedorPuntaje.x - (230 * escalaFinal);
      this.puntosTiempo.y = this.contenedorPuntaje.y + (120 * escalaFinal);
    }
  }
}

function menuDeCompra(app, juego, opciones, vendedor) {
  const menu = new UICompra(app, opciones, vendedor);
  if (typeof juego.jugadorDinero !== "undefined") menu.mostrarDinero(juego.jugadorDinero);

  menu.confirmarCompra = (index, option) => {
    if (typeof juego.jugadorDinero !== "undefined"){
      juego.jugadorDinero = menu.dineroDelJugador;
    }
    console.log("Compró:", option.label);
    if (opciones.compra) opciones.compra(index, option, juego);
  };
return {menu};
}
