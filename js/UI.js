//HUD

function cargarInterfaz(){
  miJuego.nenesPorRescatar = new PIXI.Text({
    text: "Encontrar " + miJuego.perdidos + " nenes perdidos",
    style: {
    fill: "#ffffff",
    fontSize: 18,
    fontFamily: "PixelFont",
    },
  });

  miJuego.comprasPendientes = new PIXI.Text({
    text: "Comprar " + miJuego.cantidadDeComida + miJuego.comidaAComprar,
    style: {
    fill: "#ffffff",
    fontSize: 18,
    fontFamily: "PixelFont",
    },
  })

  const visualObjetivosContraidos = new PIXI.Sprite(miJuego.objetivosContraidos);
  visualObjetivosContraidos.anchor.set(1, 0);
  miJuego.uiObjetivosContraidos.addChild(visualObjetivosContraidos)
  miJuego.app.stage.addChild(miJuego.uiObjetivosContraidos);
  miJuego.uiObjetivosContraidos.x = window.innerWidth - 10;
  miJuego.uiObjetivosContraidos.y = window.innerHeight/60;

  const visualObjetivosDesplegados = new PIXI.Sprite(miJuego.objetivosDesplegados);
  visualObjetivosDesplegados.anchor.set(1, 0);
  miJuego.uiObjetivosDesplegados.addChild(visualObjetivosDesplegados)
  miJuego.app.stage.addChild(miJuego.uiObjetivosDesplegados);
  miJuego.uiObjetivosDesplegados.x = window.innerWidth - 10;
  miJuego.uiObjetivosDesplegados.y = window.innerHeight/60;
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

  miJuego.nenesPorRescatar.anchor.set(0,1);
  miJuego.nenesPorRescatar.y = miJuego.uiObjetivosDesplegados.y + 80;
  miJuego.nenesPorRescatar.x = miJuego.uiObjetivosDesplegados.x - 300;

  miJuego.comprasPendientes.anchor.set(0,1);
  miJuego.comprasPendientes.y = miJuego.uiObjetivosDesplegados.y + 100;
  miJuego.comprasPendientes.x = miJuego.uiObjetivosDesplegados.x - 300;

  miJuego.listaDeTareas.addChild(miJuego.nenesPorRescatar);
  miJuego.listaDeTareas.addChild(miJuego.comprasPendientes);
        
  miJuego.app.stage.addChild(miJuego.listaDeTareas);
}

function actualizarInterfaz(){
    const cantNenesPerdidos = miJuego.totalNenes.filter(nene => nene.perdido).length
    miJuego.nenesPorRescatar.text = "Encontrar " + cantNenesPerdidos + " nenes perdidos"
    miJuego.comprasPendientes.text = "Comprar" + miJuego.comidaAComprar.mensajeDeCompra;
    miJuego.dinero.text = miJuego.dineroDelJugador;
    
    const energiaActual = miJuego.energiaDelJugador * 3.6;
    miJuego.barraAmarilla.clear();
    miJuego.barraAmarilla.beginFill("#ffb700");
    miJuego.barraAmarilla.drawRect(2, 2, energiaActual, 30);
    miJuego.barraAmarilla.endFill();
  }


class UICompra {
  constructor(app, opciones){
    this.app = app;
    this.container = new PIXI.Container();
    this.container.visible = false;
    this.app.stage.addChild(this.container);

    const menuAncho = 700;
    const menuAltura = 120;
    const x = window.innerWidth/2 - 350;
    const y = window.innerHeight - 140;

    const fondoMenu = new PIXI.Graphics();
    fondoMenu.fill(0xffffff);
    fondoMenu.roundRect(0, 0, menuAncho, menuAltura, 8);
    fondoMenu.endFill();
    fondoMenu.x = x; fondoMenu.y = y;
    this.container.addChild(fondoMenu);

    this.title = new PIXI.Text({text: "¿Qué te gustaría comprar?", style: {fontFamily: "PixelFont", fontSize: 20, fill: 0x000000, fontWeight: 900}});
    this.title.x = x + 15; this.title.y = y + 8;
    this.container.addChild(this.title);

    this.opciones = [
      {label: opciones.opcion1 , price: opciones.precio1},
      {label: opciones.opcion2 , price: opciones.precio2}
    ];

    this.textoOpciones = [];
    const bordeY = y + 40;
    const izqX = x + 20;
    const derX = x + menuAncho / 2 + 10;

    this.opciones.forEach((opc, i) => {
      const texto = new PIXI.Text({text: opc.label, style: {fontFamily: "PixelFont", fontSize: 16, fill: "#000000"}});
      texto.x = i === 0 ? izqX : derX;
      texto.y = bordeY;
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
      //Esto está para modificar después en la construcción de la UI
      text: "A o D para elegir producto    |    Enter para confirmar compra                                                           Salir (E)", 
      style: {fontFamily: "PixelFont", fontSize: 14, fill: "#000000"}}); 
    this.infoTxt.x = x + 18; this.infoTxt.y = y + menuAltura - 28;
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
    //Le cambia el color y el grosor del texto a la opcion seleccionada
    this.textoOpciones.forEach((texto,i) => texto.style.fill = i===this.indexOpcion ? "#048000" : "#000000");
    this.textoOpciones.forEach((texto,i) => texto.style.fontWeight = i===this.indexOpcion ? 900 : 100);
  }

  comprarProducto(){
    const opc = this.opciones[this.indexOpcion];
    if (miJuego.dineroDelJugador >= opc.price){
      miJuego.dineroDelJugador -= opc.price;
      this.confirmarCompra(this.indexOpcion, opc);
    } else {
      //Le cambia el color cuando no te alcanza la plata para comprar algo, por 500 ms
      const errorDeCompra = this.textoOpciones[this.indexOpcion].style.fill;
      this.textoOpciones[this.indexOpcion].style.fill = "#ff0000";
      setTimeout(()=> this.textoOpciones[this.indexOpcion].style.fill = errorDeCompra, 500);
    }
  }

  onKeyDown(e){
    const key = e.key.toLowerCase();
    if (this.keysProcesadas[key]) return;
    this.keysProcesadas[key] = true;
    actualizarInterfaz();
    if (!this.abierto) return;
         if (key === 'a'){ this.indexOpcion = 0; this.hoverOpcion();}
    else if (key === 'd'){ this.indexOpcion = 1; this.hoverOpcion();}
    else if (key === 'enter'){ this.comprarProducto();}
  }
  onKeyUp(e){ this.keysProcesadas[e.key.toLowerCase()] = false;}
}

class UIObjetivos{
  constructor(texture){
    this.container = new PIXI.Container();
    this.texture = texture;

    this.desplegado = false;
  }

  desplegar(){
    if(!this.desplegado){
      this.desplegado = true;
    }
  }

  contraer(){
    if(this.desplegado){
      this.desplegado = false;
    }
  }
}

function menuDeCompra(app, juego, opciones) {
  const menu = new UICompra(app, opciones);
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