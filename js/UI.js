//HUD
function cargarInterfaz(){
  miJuego.tareasPendientes = new PIXI.Text({
    text: "Encontrar " + miJuego.perdidos + " nenes perdidos",
    style: {
    fill: "#000000",
    fontSize: 25,
    fontFamily: "Arial",
    },
  });

  miJuego.listaDeTareas.addChild(miJuego.tareasPendientes);
        
  miJuego.app.stage.addChild(miJuego.listaDeTareas);

  miJuego.dinero = new PIXI.Text({text: "$" + miJuego.dineroDelJugador, style: {fill: "#009e42", fontSize: 30, fontWeight: 900, fontFamily: "Arial"}});
  miJuego.dinero.y = 50;
  miJuego.app.stage.addChild(miJuego.dinero)
}


class UICompra {
  constructor(app, opciones){
    this.app = app;
    this.container = new PIXI.Container();
    this.container.visible = false;
    this.app.stage.addChild(this.container);

    const menuAncho = opciones.menuAncho || 700;
    const menuAltura = opciones.menuAltura || 120;
    const x = window.innerWidth/2 - 350;
    const y = 800;

    const fondoMenu = new PIXI.Graphics();
    fondoMenu.fill(0xffffff);
    fondoMenu.roundRect(0, 0, menuAncho, menuAltura, 8);
    fondoMenu.endFill();
    fondoMenu.x = x; fondoMenu.y = y;
    this.container.addChild(fondoMenu);

    this.title = new PIXI.Text({text: "¿Qué te gustaría comprar?", style: {fontFamily: "Arial", fontSize: 20, fill: 0x000000, fontWeight: 900}});
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
      const texto = new PIXI.Text({text: opc.label, style: {fontFamily: "Arial", fontSize: 16, fill: "#000000"}});
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

    this.dineroDelJugador = miJuego.dineroDelJugador;
    this.textoDinero = new PIXI.Text({text: "Dinero disponible: $" + this.dineroDelJugador, style: {fontFamily: "Arial", fontSize: 14, fill: "#000000"}});
    this.textoDinero.x = x + 18; this.textoDinero.y = y + menuAltura - 28;
    this.container.addChild(this.textoDinero);

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

  abrir(){  this.abierto = true; this.container.visible = true; this.hoverOpcion();}
  cerrar(){ this.abierto = false; this.container.visible = false;}
  toggle(){ this.abierto ? this.cerrar() : this.abrir();}

  mostrarDinero(m){miJuego.dineroDelJugador = m; this.textoDinero.text = "Dinero disponible: $" + miJuego.dineroDelJugador;}

  hoverOpcion(){
    const x0 = this.textoOpciones[0].x - 6;
    const x1 = this.textoOpciones[1].x - 6;
    this.hover.x = this.indexOpcion === 0 ? x0 : x1;
    //Le cambia el color y el grosor del texto a la opcion seleccionada
    this.textoOpciones.forEach((texto,i) => texto.style.fill = i===this.indexOpcion ? "#048000" : "#000000");
    this.textoOpciones.forEach((texto,i) => texto.style.fontWeight = i===this.indexOpcion ? 900 : 100);
  }

  tryBuySelected(){
    const opc = this.opciones[this.indexOpcion];
    if (this.dineroDelJugador >= opc.price){
      this.dineroDelJugador -= opc.price;
      miJuego.dinero.text = "$" + this.dineroDelJugador;
      this.mostrarDinero(this.dineroDelJugador);
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

    if (!this.abierto) return;
         if (key === 'a'){ this.indexOpcion = 0; this.hoverOpcion();}
    else if (key === 'd'){ this.indexOpcion = 1; this.hoverOpcion();}
    else if (key === 'enter'){ this.tryBuySelected();}
  }

  onKeyUp(e){ this.keysProcesadas[e.key.toLowerCase()] = false;}

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