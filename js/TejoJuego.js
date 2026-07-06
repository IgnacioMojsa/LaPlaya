class TejoJuego {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        this.activo = false;

        // carga
        
        this.fPresionadaAntes = false;
        this.aPresionadaAntes = false;
        this.fuerza = 0;
        this.altura = 0;

        this.maxCarga = 150;

        this.tejin = null;
        this.velocidadMovimiento = 5;
        this.intentosTejin = 3;

        this.tejinValido = false;
        this.textoIntentos = null;
        this.textoTejinValido = null;

        this.textoTurno = null;
        this.esperandoCambioLado = false;

        this.tejosBlancos = [];
        this.tejosRojos = [];

        this.tejosRestantesBlanco = 6;
        this.tejosRestantesRojo = 6;

        this.puntosBlanco = 0;
        this.puntosRojo = 0;

        this.textoPuntosBlanco = null;
        this.textoPuntosRojo = null;

        this.textoTejosRestantes = null;

        this.turnoActual = "tejin";
        this.objetoActual = null;

        this.lanzando = false;

        this.ladoActual = "izquierda";
        this.esperandoCambioLado = false;

        this.ganador = null;

        this.partidaTerminada = false;

        // ------------------------
        // MODOS DE JUEGO
        // ------------------------

        this.enterPresionadoAntes = false;
        this.wPresionadaAntes = false;
        this.sPresionadaAntes = false;

        this.comHabilitada = true;

        // "pvp" o "pvc"
        //this.modoJuego = null;
        this.modoJuego = "pvp";

        // facil | normal | dificil
        this.dificultadCPU = "normal";

        this.cpuJugando = false;

        this.menuModoVisible = false;

        this.opcionSeleccionada = 0;

        this.opcionesMenu = [];

        window.addEventListener("resize", () => {
            if (this.activo) {
                this.resize();
            }
        });
        this.app.stage.addChild(this.container);

        console.log("NUEVA INSTANCIA", this);
    }

    mostrarMenuModo() {

        this.menuModoVisible = true;

        this.opcionSeleccionada = 0;

        this.menuContainer = new PIXI.Container();

        this.container.addChild(this.menuContainer);

        // fondo oscuro
        const fondo = new PIXI.Graphics();

        fondo.beginFill(0x000000, 0.75);

        fondo.drawRect(
            0,
            0,
            this.app.screen.width,
            this.app.screen.height
        );

        fondo.endFill();

        this.menuContainer.addChild(fondo);

        // titulo
        const titulo = new PIXI.Text({
            text: "SELECCIONAR MODO",
            style: {
                fill: "#ffffff",
                fontSize: this.app.screen.width * 0.04,
                fontFamily: "PixelFont",
                fontWeight: "bold"
            }
        });

        titulo.anchor.set(0.5);

        titulo.x = this.app.screen.width / 2;
        titulo.y = this.app.screen.height * 0.35;

        this.menuContainer.addChild(titulo);

        // opciones
        this.opcionesMenu = [];

        const opciones = [
            "Jugador 1 vs Jugador 2"
        ];

        if (this.comHabilitada) {

            opciones.push("Jugador 1 vs COM");
        }

        opciones.forEach((texto, i) => {

            const opcion = new PIXI.Text({
                text: texto,
                style: {
                    fill: "#aaaaaa",
                    fontSize: this.app.screen.width * 0.03,
                    fontFamily: "PixelFont",
                    fontWeight: "bold"
                }
            });

            opcion.anchor.set(0.5);

            opcion.x = this.app.screen.width / 2;

            opcion.y =
                this.app.screen.height * 0.48
                + (i * 60);

            this.menuContainer.addChild(opcion);

            this.opcionesMenu.push(opcion);
        });

        this.actualizarMenuModo();
    }

    actualizarMenuModo() {

        this.opcionesMenu.forEach((opcion, i) => {

            opcion.style.fill =
                i === this.opcionSeleccionada
                ? "#ffb700"
                : "#aaaaaa";
        });
    }

    confirmarModoJuego() {

        console.log("CONFIRMAR MODO");

        if (this.opcionSeleccionada === 0) {

            this.modoJuego = "pvp";
        }
        else {

            this.modoJuego = "pvc";
        }

        console.log(
            "Modo seleccionado:",
            this.modoJuego
        );

        this.menuModoVisible = false;

        this.container.removeChild(this.menuContainer);

        this.menuContainer.destroy({
            children: true
        });
    }

    async updateCPU() {

        if (this.cpuJugando) return;

        if (this.lanzando) return;

        if (this.turnoActual !== "rojo") return;

        if (this.modoJuego !== "pvc") return;

        this.cpuJugando = true;

        // pequeña pausa "humana"
        await this.esperar(800);

        await this.realizarTiroCPU();

        this.cpuJugando = false;
    }

    esperar(ms) {

        return new Promise(resolve => {
        
            setTimeout(resolve, ms);
        });
    }

    resize() {

        if (!this.cancha) return;

        this.velocidadMovimiento =
            this.app.screen.height * 0.005;

        // ------------------------
        // CANCHA
        // ------------------------

        this.cancha.x = this.app.screen.width / 2;
        this.cancha.y = this.app.screen.height / 2;

        const anchoDeseado = Math.min(
            this.app.screen.width * 0.9,
            this.app.screen.height * 1.4
        );
        const escalaCancha = anchoDeseado / this.cancha.texture.width;

        this.cancha.scale.set(escalaCancha);

        // ------------------------
        // INSTRUCCIONES
        // ------------------------

        if (this.textoInstrucciones) {

            this.textoInstrucciones.x =
                this.app.screen.width / 2;

            this.textoInstrucciones.y =
                this.cancha.y - this.cancha.height * 0.36;

            this.textoInstrucciones.style.fontSize =
                this.app.screen.width * 0.018;
        }

        // ------------------------
        // TEXTO INTENTOS
        // ------------------------

        if (this.textoIntentos) {
            this.textoIntentos.x = this.app.screen.width / 2.7;

            this.textoIntentos.y =
                this.cancha.y - this.cancha.height * 0.33;

            this.textoIntentos.style.fontSize =
                this.app.screen.width * 0.02;
        }

        if (this.textoTejosRestantes) {

            this.textoTejosRestantes.x =
                this.app.screen.width / 2;

            this.textoTejosRestantes.y =
                this.cancha.y - this.cancha.height * 0.28;

            this.textoTejosRestantes.style.fontSize =
                this.app.screen.width * 0.022;
        }

        if (this.textoTurno) {

            this.textoTurno.x =
                this.app.screen.width / 2;
                
            this.textoTurno.y =
                this.cancha.y - this.cancha.height * 0.42;
                
            this.textoTurno.style.fontSize =
                this.app.screen.width * 0.03;
        }
        // ------------------------
        // TEXTO TEJIN VALIDO
        // ------------------------

        if (this.textoTejinValido) {
            this.textoTejinValido.x = this.app.screen.width / 2;

            this.textoTejinValido.y =
                this.cancha.y - this.cancha.height * 0.42;

            this.textoTejinValido.style.fontSize =
                this.app.screen.width * 0.03;
        }
        // ------------------------
        // TEJIN
        // ------------------------

        if (this.tejin) {

            const tamañoDeseado = this.app.screen.width * 0.05;

            const escalaTejin =
                tamañoDeseado / this.tejin.texture.width;

            this.tejin.scale.set(escalaTejin);
        }

        if (this.tejoBlanco) {
        
            const tamañoDeseado = this.app.screen.width * 0.05;
        
            const escalaTejo =
                tamañoDeseado / this.tejoBlanco.texture.width;
        
            this.tejoBlanco.scale.set(escalaTejo);
        }


        // ------------------------
        // LIMITES
        // ------------------------

        this.limiteSuperior =
            this.cancha.y + this.cancha.height * 0.05;

        this.limiteInferior =
            this.cancha.y + this.cancha.height * 0.36;

        if (
            this.turnoActual === "tejin" &&
            this.tejin &&
            !this.lanzando &&
            !this.tejinValido
        ) {
        
            this.tejin.x =
                this.ladoActual === "izquierda"
                ? this.cancha.x - this.cancha.width * 0.45
                : this.cancha.x + this.cancha.width * 0.45;
        
            this.tejin.y =
                this.cancha.y + this.cancha.height * 0.25;
        
            this.tejin.yPiso = this.tejin.y;
        }   

        // ------------------------
        // TEXTO CAMBIO DE LADO
        // ------------------------

        if (this.textoCambioLado) {

            this.textoCambioLado.x =
                this.app.screen.width / 2;

            this.textoCambioLado.y =
                this.cancha.y - this.cancha.height * 0.20;

            this.textoCambioLado.style.fontSize =
                this.app.screen.width * 0.03;
        }
    }

    async iniciar() {

        if (this.activo) return;

        this.activo = true;

        this.faltaProcesada = false;

        this.partidaTerminada = false;

        this.container.sortableChildren = true;

        // ------------------------
        // RESETEO INPUTS
        // ------------------------
        keys["f"] = false;
        keys["F"] = false;

        keys["a"] = false;
        keys["A"] = false;

        this.fuerza = 0;
        this.altura = 0;
        
        this.container.visible = true;

        this.container.removeChildren().forEach(c => c.destroy());

        this.cancha = null;

        this.textoInstrucciones = null;
        this.textoIntentos = null;
        this.textoTejinValido = null;
        this.textoTurno = null;
        this.textoTejosRestantes = null;

        this.textoPuntosBlanco = null;
        this.textoPuntosRojo = null;

        this.turnoActual = "tejin";

        this.tejinValido = false;

        this.intentosTejin = 3;

        this.ladoActual = "izquierda";

        this.puntosBlanco = 0;
        this.puntosRojo = 0;

        this.tejosRestantesBlanco = 6;
        this.tejosRestantesRojo = 6;

        this.esperandoCambioLado = false;

        this.barraFuerza = null;
        this.barraAltura = null;

        this.objetoActual = null;

        this.tejosBlancos = [];
        this.tejosRojos = [];
        
        // FONDO CANCHA
        const texturaCancha = await PIXI.Assets.load('assets/cancha_tejo.png');
        this.cancha = new PIXI.Sprite(texturaCancha);
        
        this.cancha.anchor.set(0.5);

        
        this.container.addChild(this.cancha);

        
        // ------------------------
        // INSTRUCCIONES
        // ------------------------
        
        this.textoInstrucciones = new PIXI.Text({
            text:
            "W/S: MOVER | F: FUERZA | A: ALTURA | ESC: SALIR",
            
            style: {
                fill: "#ffffff",
                fontSize: this.app.screen.width * 0.018,
                fontFamily: "PixelFont",
                fontWeight: "bold",
                align: "center"
            }
        });
        
        this.textoInstrucciones.anchor.set(0.5);
        
        // centrado horizontal
        this.textoInstrucciones.x = this.app.screen.width / 2;
        
        // arriba de la cancha
        this.textoInstrucciones.y =
        this.cancha.y - this.cancha.height * 0.36;
        
        // ------------------------
        // TEXTO INTENTOS
        // ------------------------
        
        this.textoIntentos = new PIXI.Text({
            text: `Intentos de tejín restantes: ${this.intentosTejin}`,
            style: {
                fill: "#ffffff",
                fontSize: this.app.screen.width * 0.02,
                fontFamily: "PixelFont",
                fontWeight: "bold"
            }
        });
        
        this.textoIntentos.x = this.app.screen.width / 2.7;
        this.textoIntentos.y = this.cancha.y - this.cancha.height * 0.33;
        
        this.container.addChild(this.textoIntentos);
        
        
        // ------------------------
        // TEXTO TEJIN VALIDO
        // ------------------------
        
        this.textoTejinValido = new PIXI.Text({
            text: "TEJIN EN POSICION VALIDA",
            style: {
                fill: "#ffffff",
                fontSize: this.app.screen.width * 0.03,
                fontFamily: "PixelFont",
                fontWeight: "bold"
            }
        });
        
        this.textoTejinValido.anchor.set(0.5);
        
        this.textoTejinValido.x = this.app.screen.width / 2;
        this.textoTejinValido.y = this.cancha.y - this.cancha.height * 0.42;
        
        // empieza oculto
        this.textoTejinValido.visible = false;
        
        this.container.addChild(this.textoTejinValido);

        // ------------------------
        // TEXTO FALTA
        // ------------------------

        this.textoFalta = new PIXI.Text({
            text: "",
            style: {
                fill: "#ff4444",
                fontSize: this.app.screen.width * 0.03,
                fontFamily: "PixelFont",
                fontWeight: "bold",
                align: "center"
            }
        });

        this.textoFalta.anchor.set(0.5);

        this.textoFalta.x =
            this.app.screen.width / 2;

        this.textoFalta.y =
            this.cancha.y - this.cancha.height * 0.12;

        this.textoFalta.visible = false;

        this.container.addChild(this.textoFalta);
        
        // ------------------------
        // TEXTO TURNO
        // ------------------------
        
        this.textoTurno = new PIXI.Text({
            text: "JUEGA TEJO BLANCO",
            style: {
                fill: "#ffffff",
                fontSize: this.app.screen.width * 0.03,
                fontFamily: "PixelFont",
                fontWeight: "bold"
            }
        });
        
        this.textoTurno.anchor.set(0.5);
        
        this.textoTurno.x = this.app.screen.width / 2;
        
        this.textoTurno.y =
        this.cancha.y - this.cancha.height * 0.42;
        
        // empieza oculto
        this.textoTurno.visible = false;
        
        this.container.addChild(this.textoTurno);
        
        // ------------------------
        // TEXTO TEJOS RESTANTES
        // ------------------------
        
        this.textoTejosRestantes = new PIXI.Text({
            text: "",
            style: {
                fill: "#ffffff",
                fontSize: this.app.screen.width * 0.022,
                fontFamily: "PixelFont",
                fontWeight: "bold"
            }
        });
        
        this.textoTejosRestantes.anchor.set(0.5);
        
        this.textoTejosRestantes.x =
        this.app.screen.width / 2;
        
        this.textoTejosRestantes.y =
        this.cancha.y - this.cancha.height * 0.28;
        
        // oculto hasta empezar los tejos
        this.textoTejosRestantes.visible = false;
        
        this.container.addChild(this.textoTejosRestantes);
        
        this.container.addChild(this.textoInstrucciones);
        
        // ------------------------
        // PUNTOS BLANCO
        // ------------------------
        
        this.textoPuntosBlanco = new PIXI.Text({
            text: `Blanco: ${this.puntosBlanco}`,
            style: {
                fill: "#ffffff",
                fontSize: this.app.screen.width * 0.025,
                fontFamily: "PixelFont",
                fontWeight: "bold"
            }
        });
        
        this.textoPuntosBlanco.x =
            this.app.screen.width * 0.18;
        
        this.textoPuntosBlanco.y =
            this.app.screen.height * 0.28;
        
        this.container.addChild(this.textoPuntosBlanco);
        
        // ------------------------
        // PUNTOS ROJO
        // ------------------------
        
        this.textoPuntosRojo = new PIXI.Text({
            text: `Rojo: ${this.puntosRojo}`,
            style: {
                fill: "#ffffff",
                fontSize: this.app.screen.width * 0.025,
                fontFamily: "PixelFont",
                fontWeight: "bold"
            }
        });
        
        this.textoPuntosRojo.x =
            this.app.screen.width * 0.73;
        
        this.textoPuntosRojo.y =
            this.app.screen.height * 0.28;
            
        
        this.container.addChild(this.textoPuntosRojo);


        // ------------------------
        // TEXTO CAMBIO DE LADO
        // ------------------------

        this.textoCambioLado = new PIXI.Text({
            text: "PRESIONE E PARA CAMBIAR DE LADO",
            style: {
                fill: "#ffb700",
                fontSize: this.app.screen.width * 0.03,
                fontFamily: "PixelFont",
                fontWeight: "bold"
            }
        });

        this.textoCambioLado.anchor.set(0.5);

        this.textoCambioLado.x = this.app.screen.width / 2;

        this.textoCambioLado.y =
            this.cancha.y - this.cancha.height * 0.20;

        this.textoCambioLado.visible = false;

        this.container.addChild(this.textoCambioLado);
        
        
        // TEJIN
        const texturaTejin = await PIXI.Assets.load('assets/tejin.png');
        
        this.tejin = new PIXI.Sprite(texturaTejin);

        this.tejin.tipo = "tejin";
        
        this.tejin.anchor.set(0.5);

        
        // POSICION INICIAL
        this.tejin.x =
        this.cancha.x - this.cancha.width * 0.45;
        
        this.tejin.y =
        this.cancha.y + this.cancha.height * 0.25;
        
        const tamañoDeseado = this.app.screen.width * 0.05;
        const escala =
        tamañoDeseado / this.tejin.texture.width;
        this.tejin.scale.set(escala);
        
        this.tejin.radioColision = 18;

        this.tejin.yPiso = this.tejin.y;
        this.tejin.alturaVisual = 0;

        this.tejin.velX = 0;
        this.tejin.velY = 0;

        this.tejin.golpeado = false;

        const sombraTejin = new PIXI.Graphics();

        sombraTejin.beginFill(0x000000, 0.25);

        sombraTejin.drawEllipse(0, 0, 20, 8);

        sombraTejin.endFill();

        sombraTejin.x = this.tejin.x;
        sombraTejin.y = this.tejin.y + 10;

        this.container.addChild(sombraTejin);

        this.tejin.sombra = sombraTejin;
        
        this.container.addChild(this.tejin);
        this.objetoActual = this.tejin;
        
        
        // BARRAS
        this.barraFuerza = new PIXI.Graphics();
        this.barraAltura = new PIXI.Graphics();
        
        this.container.addChild(this.barraFuerza);
        this.container.addChild(this.barraAltura);
        
        this.resize();

        this.mostrarMenuModo();

        console.log("INICIAR", this);
        
    }
    
    
    lanzarObjeto() {
        
        if (this.lanzando) return;
        
        if (this.fuerza <= 0 && this.altura <= 0) return;
        
        this.lanzando = true;
        
        const inicioX = this.objetoActual.x;
        const inicioY = this.objetoActual.y;

        // -----------------------------------
        // DISTANCIA REAL
        // -----------------------------------

        // ancho util de la cancha
        const anchoCancha = this.cancha.width;

        // fuerza responsive
        const distanciaHorizontal =
            (this.fuerza / this.maxCarga)
            * anchoCancha
            * 1.4;

        // dirección
        let direccion = 1;

        if (this.ladoActual === "derecha") {
            direccion = -1;
        }

        const destinoX = inicioX + (distanciaHorizontal * direccion);

        const destinoY = inicioY;

        // -----------------------------------
        // ALTURA
        // -----------------------------------

        const alturaParabola =
            (this.altura / this.maxCarga)
            * this.app.screen.height
            * 0.35;

        // -----------------------------------
        // DURACION
        // -----------------------------------

        const duracion = 90;

        let tiempo = 0;

        this.ultimoLanzamiento = {
            inicioX,
            destinoX,
            fuerza: this.fuerza
        };

        const animar = () => {

            tiempo++;

            let t = tiempo / duracion;

            if (t > 1) t = 1;

            this.objetoActual.x =
                inicioX + (destinoX - inicioX) * t;

            this.objetoActual.tiempoGiro =
                (this.objetoActual.tiempoGiro || 0) + 1;
                    
            if (this.objetoActual.tiempoGiro >= 4) {
            
                this.objetoActual.scale.x *= -1;
            
                this.objetoActual.tiempoGiro = 0;
            }    

            const parabola =
                -4 * alturaParabola * (t - 0.5) * (t - 0.5)
                + alturaParabola;

            this.objetoActual.yPiso = destinoY;

            this.objetoActual.alturaVisual = parabola;

            this.objetoActual.y =
                this.objetoActual.yPiso
                - this.objetoActual.alturaVisual;

            this.detectarColisiones();


            if (t >= 1) {

                this.app.ticker.remove(animar);

                const esperarDetencion = () => {
                
                    if (!this.todosLosObjetosQuietos()) {
                    
                        requestAnimationFrame(esperarDetencion);
                    
                        return;
                    }
                
                    this.lanzando = false;
                
                    if (this.turnoActual === "tejin") {
                    
                        this.verificarTejin();
                    }
                    else {
                    
                        this.verificarTejo();
                    }
                };
            
                esperarDetencion();
            }
        };

        this.app.ticker.add(animar);


        this.fuerza = 0;
        this.altura = 0;
    }

    detectarColisiones() {

        // NO COLISIONA SI ESTA EN EL AIRE
        if (this.objetoActual.alturaVisual > 15) {
            return;
        }

        const radioActual =
            this.objetoActual.radioColision;

        const objetos = [
            this.tejin,
            ...this.tejosBlancos,
            ...this.tejosRojos
        ];

        objetos.forEach(obj => {

            if (!obj || obj === this.objetoActual) return;

            const dx =
                obj.x - this.objetoActual.x;

            const dy =
                obj.yPiso - this.objetoActual.yPiso;

            const distancia =
                Math.sqrt(dx * dx + dy * dy);

            const radioObj =
                obj.radioColision;

            if (distancia < radioActual + radioObj) {

                console.log("COLISION");

                this.golpearObjeto(obj);
            }
        });
    }

    moverObjetos() {

        const objetos = [
            this.tejin,
            ...this.tejosBlancos,
            ...this.tejosRojos
        ];

        objetos.forEach(obj => {

            if (!obj) return;

            obj.zIndex = Math.floor(obj.yPiso);

            obj.velX = obj.velX || 0;
            obj.velY = obj.velY || 0;

            obj.x += obj.velX;

            obj.yPiso += obj.velY;
                    
            obj.y =
                obj.yPiso - (obj.alturaVisual || 0);

            const velocidad =
                Math.sqrt(
                    obj.velX * obj.velX +
                    obj.velY * obj.velY
                );
            
            if (velocidad > 0.2) {
            
                obj.tiempoGiro =
                    (obj.tiempoGiro || 0) + 1;
            
                if (obj.tiempoGiro >= 4) {
                
                    obj.scale.x *= -1;
                
                    obj.tiempoGiro = 0;
                }
            }
            else {
            
                // cuando se detiene
                obj.tiempoGiro = 0;
            
                obj.scale.x =
                    Math.abs(obj.scale.x);
            }    

            obj.yPiso = obj.yPiso || obj.y;

            
            if (obj.sombra) {

                obj.sombra.x = obj.x;
                        
                obj.sombra.y =
                    obj.yPiso + 10;
                        
                const altura =
                    obj.alturaVisual || 0;
                        
                // -------------------------
                // VISIBILIDAD
                // -------------------------
                        
                obj.sombra.visible = altura > 5;
                        
                // -------------------------
                // ESCALA
                // -------------------------
                        
                const escala =
                    1 + (altura / 120);
                        
                obj.sombra.scale.set(escala);
                        
                // -------------------------
                // ALPHA
                // -------------------------
                        
                obj.sombra.alpha =
                    Math.max(
                        0.08,
                        0.35 - (altura / 250)
                    );
            }   

            obj.velX *= 0.88;
            obj.velY *= 0.88;

            if (Math.abs(obj.velX) < 0.05) obj.velX = 0;
            if (Math.abs(obj.velY) < 0.05) obj.velY = 0;
        });
    }

    todosLosObjetosQuietos() {

        const objetos = [
            this.tejin,
            ...this.tejosBlancos,
            ...this.tejosRojos
        ];

        for (const obj of objetos) {

            if (!obj) continue;

            const moviendose =
                Math.abs(obj.velX || 0) > 0.05 ||
                Math.abs(obj.velY || 0) > 0.05;

            if (moviendose) {

                return false;
            }
        }

        return true;
    }

    golpearObjeto(obj) {

        const dx =
            obj.x - this.objetoActual.x;

        const dy =
            obj.yPiso - this.objetoActual.yPiso;
        

        const distancia =
            Math.sqrt(dx * dx + dy * dy);

        if (distancia <= 0) return;

        const nx = dx / distancia;
        const ny = dy / distancia;

        // -------------------------
        // FUERZA BASE
        // -------------------------

        let fuerza =
            this.ultimoLanzamiento.fuerza / 25;

        // -------------------------
        // SI EL QUE GOLPEA ES EL TEJIN
        // -------------------------

        if (this.objetoActual.tipo === "tejin") {

            fuerza *= 0.25;
        }

        // -------------------------
        // EMPUJAR OBJETO GOLPEADO
        // -------------------------

        obj.velX = nx * fuerza;
        obj.velY = ny * fuerza;

        // -------------------------
        // FRENAR AL GOLPEADOR
        // -------------------------

        if (this.objetoActual.tipo === "tejo") {

            // el tejo queda casi quieto
            this.objetoActual.velX *= 0.15;
            this.objetoActual.velY *= 0.15;
        }
        else {

            // el tejin prácticamente no mueve
            this.objetoActual.velX *= 0.05;
            this.objetoActual.velY *= 0.05;
        }
    }

    verificarTejin() {

        // RECTANGULO OBJETIVO

        let objetivoMinX;
        let objetivoMaxX;

        // si tira desde izquierda
        if (this.ladoActual === "izquierda") {

            objetivoMinX = this.cancha.x;
            objetivoMaxX = this.cancha.x + this.cancha.width * 0.45;
        }
        else {

            objetivoMinX = this.cancha.x - this.cancha.width * 0.45;
            objetivoMaxX = this.cancha.x;
        }

        // verificar si cayó dentro
        const valido =
            this.tejin.x >= objetivoMinX &&
            this.tejin.x <= objetivoMaxX;

        // -----------------------------------
        // SI ES VALIDO
        // -----------------------------------

        if (valido) {

            this.tejinValido = true;

            this.textoIntentos.visible = false;

            // mostrar cartel unos segundos
            this.textoTejinValido.visible = true;

            setTimeout(() => {

                // ocultar cartel tejin valido
                this.textoTejinValido.visible = false;

                // ------------------------
                // TURNO BLANCO
                // ------------------------

                this.turnoActual = "blanco";

                this.textoTejosRestantes.visible = true;

                this.actualizarTextoTejos();

                this.textoTurno.text =
                    "JUEGA TEJO BLANCO";

                this.textoTurno.visible = true;

                this.crearNuevoTejo("blanco");

            }, 1500);

            console.log("TEJIN VALIDO");

            // ACÁ después empieza la ronda de tejos
        }

        // -----------------------------------
        // SI FALLÓ
        // -----------------------------------

        else {

            this.intentosTejin--;

            this.textoIntentos.text =
                `Intentos de tejín restantes: ${this.intentosTejin}`;

            console.log("FALLÓ EL TEJIN");

            // reset posición
            if (this.ladoActual === "izquierda") {

                this.objetoActual.x =
                    this.cancha.x - this.cancha.width * 0.45;
            }
            else {

                this.objetoActual.x =
                    this.app.screen.width - (this.cancha.x - this.cancha.width * 0.45);
            }

            // si perdió los intentos
            if (this.intentosTejin <= 0) {

                this.pedirCambioLado();

            }
        }
    }

    verificarTejo() {

        // -----------------------------------
        // AREA VALIDA
        // -----------------------------------

        let objetivoMinX;
        let objetivoMaxX;

        if (this.ladoActual === "izquierda") {

            objetivoMinX = this.cancha.x;
            objetivoMaxX = this.cancha.x + this.cancha.width * 0.45;
        }
        else {

            objetivoMinX = this.cancha.x - this.cancha.width * 0.45;
            objetivoMaxX = this.cancha.x;
        }

        // -----------------------------------
        // VALIDAR
        // -----------------------------------

        const valido =
            this.objetoActual.x >= objetivoMinX &&
            this.objetoActual.x <= objetivoMaxX;

        // -----------------------------------
        // SI FALLA
        // -----------------------------------

        this.objetoActual.valido = valido;

        if (!valido) {

            console.log("TEJO INVALIDO");
                
            // gastar tejo igual
            if (this.turnoActual === "blanco") {
            
                this.tejosRestantesBlanco--;
            }
            else {
            
                this.tejosRestantesRojo--;
            }
        
            this.actualizarTextoTejos();

            // si el tejin salió
            if (!this.tejinSigueValido()) {
            
                this.procesarFaltaTejin();
            
                return;
            }

            // cambiar turno
            this.decidirSiguienteTurno();

            return;
        }

        // -----------------------------------
        // SI ES VALIDO
        // -----------------------------------

        console.log("TEJO VALIDO");

        // ------------------------
        // DESCONTAR TEJO
        // ------------------------

        if (this.turnoActual === "blanco") {
        
            this.tejosRestantesBlanco--;
        }
        else {
        
            this.tejosRestantesRojo--;
        }

        this.actualizarTextoTejos();

        // ------------------------
        // VERIFICAR SI EL TEJIN
        // QUEDÓ FUERA
        // ------------------------

        if (!this.tejinSigueValido()) {
        
            this.procesarFaltaTejin();
        
            return;
        }

        // ------------------------
        // CAMBIO DE TURNO
        // ------------------------

        this.decidirSiguienteTurno();

    }

    async decidirSiguienteTurno() {

        if (
            this.puntosBlanco >= 15 ||
            this.puntosRojo >= 15
        ) {
            return;
        }

        // -----------------------------------
        // FIN DE RONDA
        // -----------------------------------

        if (
            this.tejosRestantesBlanco <= 0 &&
            this.tejosRestantesRojo <= 0
        ) {

            this.calcularPuntos();

            this.pedirCambioLado();

            //this.cambiarLado();

            return;
        }

        // -----------------------------------
        // QUIEN VA GANANDO
        // -----------------------------------

        const ganador =
            this.obtenerColorGanador();

        // -----------------------------------
        // SI NADIE VA GANANDO
        // -----------------------------------

        if (!ganador) {

            if (this.turnoActual === "blanco") {

                this.turnoActual = "rojo";

                this.textoTurno.text =
                    "JUEGA TEJO ROJO";

                await this.crearNuevoTejo("rojo");
            }
            else {

                this.turnoActual = "blanco";

                this.textoTurno.text =
                    "JUEGA TEJO BLANCO";

                await this.crearNuevoTejo("blanco");
            }

            return;
        }

        // -----------------------------------
        // SI BLANCO VA GANANDO
        // -----------------------------------

        if (ganador === "blanco") {

            if (this.tejosRestantesRojo <= 0) {
            
                if (this.tejosRestantesBlanco > 0) {
                
                    this.turnoActual = "blanco";
                
                    this.textoTurno.text =
                        "JUEGA TEJO BLANCO";
                
                    await this.crearNuevoTejo("blanco");
                }
            
                return;
            }
        
            this.turnoActual = "rojo";
        
            this.textoTurno.text =
                "JUEGA TEJO ROJO";
        
            await this.crearNuevoTejo("rojo");
        
            return;
        }

        // -----------------------------------
        // SI ROJO VA GANANDO
        // -----------------------------------

        if (ganador === "rojo") {

            if (this.tejosRestantesBlanco <= 0) {
            
                if (this.tejosRestantesRojo > 0) {
                
                    this.turnoActual = "rojo";
                
                    this.textoTurno.text =
                        "JUEGA TEJO ROJO";
                
                    await this.crearNuevoTejo("rojo");
                }
            
                return;
            }
        
            this.turnoActual = "blanco";
        
            this.textoTurno.text =
                "JUEGA TEJO BLANCO";
        
            await this.crearNuevoTejo("blanco");
        }
    }

    pedirCambioLado() {

        if (this.partidaTerminada) return;

        console.log("MOSTRANDO CAMBIO DE LADO");

        this.esperandoCambioLado = true;

        this.textoCambioLado.visible = true;

        this.container.setChildIndex(
            this.textoCambioLado,
            this.container.children.length - 1
        );
    }

    calcularPuntos() {

        const distancias = [];
        
        // ------------------------
        // BLANCOS
        // ------------------------
        
        this.tejosBlancos.forEach(tejo => {
        
            if (!tejo.valido) return;
        
            distancias.push({
                color: "blanco",
                distancia:
                    this.distanciaAlTejin(tejo)
            });
        });
    
        // ------------------------
        // ROJOS
        // ------------------------
    
        this.tejosRojos.forEach(tejo => {
        
            if (!tejo.valido) return;
        
            distancias.push({
                color: "rojo",
                distancia:
                    this.distanciaAlTejin(tejo)
            });
        });
    
        // ordenar
        distancias.sort((a, b) =>
            a.distancia - b.distancia
        );
    
        if (distancias.length <= 0) return;
    
        const ganador =
            distancias[0].color;
    
        let puntos = 0;
    
        for (const d of distancias) {
        
            if (d.color === ganador) {
            
                puntos++;
            }
            else {
            
                break;
            }
        }
    
        // sumar puntos
        if (ganador === "blanco") {
        
            this.puntosBlanco += puntos;
        }
        else {
        
            this.puntosRojo += puntos;
        }
    
        // actualizar UI
        this.textoPuntosBlanco.text =
            `BLANCO: ${this.puntosBlanco}`;
    
        this.textoPuntosRojo.text =
            `ROJO: ${this.puntosRojo}`;
    
        console.log(
            `${ganador} suma ${puntos} puntos`
        );

        // ------------------------
        // GANADOR
        // ------------------------

        if (this.puntosBlanco >= 15) {
        
            this.finalizarPartida("BLANCO");
            return;
        }

        if (this.puntosRojo >= 15) {
        
            this.finalizarPartida("ROJO");
            return;
        }
    }

    finalizarPartida(ganador) {
        this.ganador = ganador; 

        this.partidaTerminada = true;

        this.textoTurno.visible = true;

        this.textoCambioLado.visible = false;

        this.textoTurno.text =
            `GANÓ ${this.ganador}`;

        this.esperandoCambioLado = false;

        console.log(`GANÓ ${this.ganador}`);
    }

    cambiarLado() {

        console.log(
        "CAMBIAR LADO",
        this.puntosBlanco,
        this.puntosRojo,
        this
        );

        this.faltaProcesada = false;

        this.textoFalta.visible = false;

        if (this.ladoActual === "izquierda") {

            this.ladoActual = "derecha";

            this.objetoActual.x =
                this.app.screen.width - (this.cancha.x - this.cancha.width * 0.45);
        }
        else {

            this.ladoActual = "izquierda";

            this.objetoActual.x =
                this.cancha.x - this.cancha.width * 0.45;
        }

        this.intentosTejin = 3;

        this.textoIntentos.text =
            `Intentos de tejín restantes: ${this.intentosTejin}`;

        this.tejinValido = false;

        // ------------------------
        // RESETEAR TEJOS
        // ------------------------

        this.tejosRestantesBlanco = 6;
        this.tejosRestantesRojo = 6;

        this.actualizarTextoTejos();

        // eliminar sprites viejos
        this.tejosBlancos.forEach(t => {

            if (t.sombra) {
                this.container.removeChild(t.sombra);
                t.sombra.destroy();
            }
        
            this.container.removeChild(t);
            t.destroy();
        });

        this.tejosRojos.forEach(t => {
        
            if (t.sombra) {
                this.container.removeChild(t.sombra);
                t.sombra.destroy();
            }
        
            this.container.removeChild(t);
            t.destroy();
        });

        this.tejosBlancos = [];
        this.tejosRojos = [];

        // reset tejin
        this.turnoActual = "tejin";

        this.textoTurno.visible = false;

        this.textoIntentos.visible = true;

        this.textoTejosRestantes.visible = false;

        // reposicionar tejin
        this.objetoActual = this.tejin;

        this.tejin.x =
            this.ladoActual === "izquierda"
            ? this.cancha.x - this.cancha.width * 0.45
            : this.cancha.x + this.cancha.width * 0.45;

        this.tejin.y =
            this.cancha.y + this.cancha.height * 0.25;
    }

    update() {

        console.log("MENU:", this.menuModoVisible);

        if (!this.activo) return;
        if (this.partidaTerminada) {

            // permitir salir con ESC
            return;
        }

        const cpuControlando =
        this.modoJuego === "pvc" &&
        this.turnoActual === "rojo" &&
        this.cpuJugando;

        // ------------------------
        // MENU MODO DE JUEGO
        // ------------------------

        if (this.menuModoVisible) {
        
            if (keys["w"] || keys["W"]) {
            
                if (!this.wPresionadaAntes) {
                
                    this.opcionSeleccionada--;
                
                    if (this.opcionSeleccionada < 0) {
                    
                        this.opcionSeleccionada =
                            this.opcionesMenu.length - 1;
                    }
                
                    this.actualizarMenuModo();
                }
            
                this.wPresionadaAntes = true;
            }
            else {
            
                this.wPresionadaAntes = false;
            }
        
            if (keys["s"] || keys["S"]) {
            
                if (!this.sPresionadaAntes) {
                
                    this.opcionSeleccionada++;
                
                    if (
                        this.opcionSeleccionada >=
                        this.opcionesMenu.length
                    ) {
                        this.opcionSeleccionada = 0;
                    }
                
                    this.actualizarMenuModo();
                }
            
                this.sPresionadaAntes = true;
            }
            else {
            
                this.sPresionadaAntes = false;
            }
        
            // ENTER
            if (keys["Enter"]) {
            
                if (!this.enterPresionadoAntes) {
                
                    this.confirmarModoJuego();
                }
            
                this.enterPresionadoAntes = true;
            }
            else {
            
                this.enterPresionadoAntes = false;
            }
        
            return;
        }
        if (!this.barraFuerza || !this.barraAltura) return;
        if (!this.objetoActual) return;

        if (this.esperandoCambioLado) {

            if (keys["e"] || keys["E"]) {

                console.log("E detectada");
            
                this.esperandoCambioLado = false;
            
                this.textoCambioLado.visible = false;
            
                this.cambiarLado();
            }
        
            return;
        }

        const controlesBloqueados =
            this.turnoActual === "tejin" &&
            this.tejinValido;
        
        // ------------------------
        // CARGA FUERZA / ALTURA
        // ------------------------
        
        if (!this.lanzando && !controlesBloqueados && !cpuControlando) {
        
            if (keys["f"] || keys["F"]) {
            
                this.fuerza = Math.min(
                    this.maxCarga,
                    this.fuerza + 1
                );
            }
        
            if (keys["a"] || keys["A"]) {
            
                this.altura = Math.min(
                    this.maxCarga,
                    this.altura + 1
                );
            }
        }
    
        // ------------------------
        // BARRAS
        // ------------------------
    
        this.dibujarBarras();
    
        // ------------------------
        // MOVIMIENTO
        // ------------------------
    
        if (!this.lanzando && !controlesBloqueados && !cpuControlando) {
        
            if (keys["w"] || keys["W"]) {

                this.objetoActual.yPiso -=
                    this.velocidadMovimiento;

                this.objetoActual.y =
                    this.objetoActual.yPiso
                    - (this.objetoActual.alturaVisual || 0);
            }

            if (keys["s"] || keys["S"]) {
            
                this.objetoActual.yPiso +=
                    this.velocidadMovimiento;
            
                this.objetoActual.y =
                    this.objetoActual.yPiso
                    - (this.objetoActual.alturaVisual || 0);
            }
        }
    
        // ------------------------
        // LIMITES
        // ------------------------
    
        if (this.objetoActual.yPiso < this.limiteSuperior) {

            this.objetoActual.yPiso =
                this.limiteSuperior;
        }

        if (this.objetoActual.yPiso > this.limiteInferior) {
        
            this.objetoActual.yPiso =
                this.limiteInferior;
        }

        this.objetoActual.y =
            this.objetoActual.yPiso
            - (this.objetoActual.alturaVisual || 0);
    
        // ------------------------
        // SOLTAR F
        // ------------------------
    
        const fApretada = keys["f"] || keys["F"];
    
        if (this.fPresionadaAntes && !fApretada && !cpuControlando) {
            this.lanzarObjeto();
        }
    
        this.fPresionadaAntes = fApretada;
    
        // ------------------------
        // SOLTAR A
        // ------------------------
    
        const aApretada = keys["a"] || keys["A"];
    
        if (this.aPresionadaAntes && !aApretada && !cpuControlando) {
            this.lanzarObjeto();
        }
    
        this.aPresionadaAntes = aApretada;

        this.moverObjetos();

        this.updateCPU();
    }

    async realizarTiroCPU() {

        let objetivoX;

        // ------------------------
        // SI NO HAY TEJOS
        // ------------------------

        if (
            this.tejosBlancos.length <= 0 &&
            this.tejosRojos.length <= 0
        ) {

            objetivoX = this.tejin.x;
        }
        else {

            // apuntar al tejin
            objetivoX = this.tejin.x;
        }

        // distancia horizontal
        const distancia =
            Math.abs(
                objetivoX - this.objetoActual.x
            );

        // fuerza ideal
        let fuerzaIdeal =
            (distancia / (this.cancha.width * 1.4))
            * this.maxCarga;

        // error según dificultad
        fuerzaIdeal += this.obtenerErrorCPU();

        // clamp
        fuerzaIdeal = Math.max(
            20,
            Math.min(this.maxCarga, fuerzaIdeal)
        );

        this.fuerza = fuerzaIdeal;

        // altura
        this.altura =
            20 + Math.random() * 40;

        // mover verticalmente
        await this.moverCPUVertical();

        await this.esperar(700);

        // lanzar
        this.lanzarObjeto();

        this.fuerza = 0;
        this.altura = 0;
        
        this.dibujarBarras();
    }

    obtenerErrorCPU() {

        switch (this.dificultadCPU) {

            case "facil":
                return obtenerNumeroAleatorio(-35, 35);

            case "normal":
                return obtenerNumeroAleatorio(-18, 18);

            case "dificil":
                return obtenerNumeroAleatorio(-8, 8);
        }

        return 0;
    }

    async moverCPUVertical() {

        const centroLanzamiento =
            this.cancha.y + this.cancha.height * 0.25;

        const objetivoY =
            centroLanzamiento +
            this.obtenerErrorVerticalCPU();

        while (
            Math.abs(
                this.objetoActual.yPiso - objetivoY
            ) > 2
        ) {

            const direccion =
                objetivoY > this.objetoActual.yPiso
                ? 1
                : -1;

            this.objetoActual.yPiso +=
                direccion * 0.7;

            // límites
            if (this.objetoActual.yPiso < this.limiteSuperior) {

                this.objetoActual.yPiso =
                    this.limiteSuperior;
            }

            if (this.objetoActual.yPiso > this.limiteInferior) {

                this.objetoActual.yPiso =
                    this.limiteInferior;
            }

            this.objetoActual.y =
                this.objetoActual.yPiso
                - (this.objetoActual.alturaVisual || 0);

            await this.esperar(25);
        }
    }

    obtenerErrorVerticalCPU() {

        switch (this.dificultadCPU) {

            case "facil":
                return obtenerNumeroAleatorio(-80, 80);

            case "normal":
                return obtenerNumeroAleatorio(-40, 40);

            case "dificil":
                return obtenerNumeroAleatorio(-15, 15);
        }

        return 0;
    }

    tejinSigueValido() {

        let objetivoMinX;
        let objetivoMaxX;

        if (this.ladoActual === "izquierda") {

            objetivoMinX = this.cancha.x;

            objetivoMaxX =
                this.cancha.x + this.cancha.width * 0.45;
        }
        else {

            objetivoMinX =
                this.cancha.x - this.cancha.width * 0.45;

            objetivoMaxX = this.cancha.x;
        }

        return (
            this.tejin.x >= objetivoMinX &&
            this.tejin.x <= objetivoMaxX
        );
    }


    procesarFaltaTejin() {

        if (this.esperandoCambioLado) return;
        if (this.partidaTerminada) return;

        let jugadorQueCometioFalta =
            this.turnoActual;

        let ganador;

        if (jugadorQueCometioFalta === "blanco") {

            ganador = "rojo";

            this.puntosRojo += 3;
        }
        else {

            ganador = "blanco";

            this.puntosBlanco += 3;
        }

        // actualizar UI
        this.textoPuntosBlanco.text =
            `BLANCO: ${this.puntosBlanco}`;

        this.textoPuntosRojo.text =
            `ROJO: ${this.puntosRojo}`;

        // mensaje
        this.textoFalta.text =
            `FALTA DE ${jugadorQueCometioFalta.toUpperCase()} - 3 PUNTOS PARA ${ganador.toUpperCase()}`;

        this.textoFalta.visible = true;

        // terminar partida
        if (this.puntosBlanco >= 15) {

            this.finalizarPartida("BLANCO");
            return;
        }

        if (this.puntosRojo >= 15) {

            this.finalizarPartida("ROJO");
            return;
        }

        // cambio de lado
        this.pedirCambioLado();
    }

    dibujarBarras() {

        if (!this.barraFuerza || !this.barraAltura) return;

        this.barraFuerza.clear();
        this.barraAltura.clear();

        const margenX = this.app.screen.width * 0.03;

        const barraY1 = this.app.screen.height * 0.90;
        const barraY2 = this.app.screen.height * 0.85;

        const alturaBarra = this.app.screen.height * 0.02;

        const anchoMax = this.app.screen.width * 0.25;

        const anchoFuerza =
            (this.fuerza / this.maxCarga) * anchoMax;

        const anchoAltura =
            (this.altura / this.maxCarga) * anchoMax;

        // FUERZA

        this.barraFuerza.beginFill(0xff0000);

        this.barraFuerza.drawRect(
            margenX,
            barraY1,
            anchoFuerza,
            alturaBarra
        );

        this.barraFuerza.endFill();

        // ALTURA

        this.barraAltura.beginFill(0x00ff00);

        this.barraAltura.drawRect(
            margenX,
            barraY2,
            anchoAltura,
            alturaBarra
        );

        this.barraAltura.endFill();
    }

    actualizarTextoTejos() {

        console.log(
            "Actualizando texto:",
            this.tejosRestantesBlanco,
            this.tejosRestantesRojo
        );

        if (!this.textoTejosRestantes) return;

        this.textoTejosRestantes.text =
            `BLANCO: ${this.tejosRestantesBlanco} | ROJO: ${this.tejosRestantesRojo}`;
    }

    distanciaAlTejin(tejo) {

        const dx = tejo.x - this.tejin.x;
        
        const dy =
            tejo.yPiso - this.tejin.yPiso;
        
        return Math.sqrt(dx * dx + dy * dy);
    }

    obtenerColorGanador() {

        let mejorBlanco = Infinity;
        let mejorRojo = Infinity;

        console.log(
            "Mejor blanco:",
            mejorBlanco,
            "Mejor rojo:",
            mejorRojo
        );

        // ------------------------
        // BLANCOS
        // ------------------------

        this.tejosBlancos.forEach(tejo => {

            if (!tejo.valido) return;

            const d =
                this.distanciaAlTejin(tejo);

            if (d < mejorBlanco) {

                mejorBlanco = d;
            }
        });

        // ------------------------
        // ROJOS
        // ------------------------

        this.tejosRojos.forEach(tejo => {

            if (!tejo.valido) return;

            const d =
                this.distanciaAlTejin(tejo);

            if (d < mejorRojo) {

                mejorRojo = d;
            }
        });

        // ------------------------
        // RESULTADO
        // ------------------------

        if (mejorBlanco < mejorRojo) {

            return "blanco";
        }

        if (mejorRojo < mejorBlanco) {

            return "rojo";
        }

        return null;
    }

    async crearNuevoTejo(color) {

        let textura;

        if (color === "blanco") {

            textura =
                await PIXI.Assets.load('assets/tejoBlanco.png');
        }
        else {

            textura =
                await PIXI.Assets.load('assets/tejoRojo.png');
        }

        const tejo = new PIXI.Sprite(textura);

        tejo.tipo = "tejo";

        tejo.anchor.set(0.5);

        
        tejo.x =
        this.ladoActual === "izquierda"
        ? this.cancha.x - this.cancha.width * 0.45
        : this.cancha.x + this.cancha.width * 0.45;
        
        tejo.y =
        this.cancha.y + this.cancha.height * 0.25;
        
        const tamañoDeseado =
        this.app.screen.width * 0.05;
        
        const escala =
        tamañoDeseado / tejo.texture.width;
        
        tejo.scale.set(escala);

        tejo.radioColision = 18;

        tejo.yPiso = tejo.y;
        tejo.alturaVisual = 0;

        tejo.velX = 0;
        tejo.velY = 0;

        tejo.golpeado = false;

        const sombra = new PIXI.Graphics();

        sombra.beginFill(0x000000, 0.25);

        sombra.drawEllipse(0, 0, 20, 8);

        sombra.endFill();

        sombra.x = tejo.x;
        sombra.y = tejo.y + 10;

        this.container.addChild(sombra);

        tejo.sombra = sombra;

        this.container.addChild(tejo);

        // guardar en arrays
        if (color === "blanco") {

            this.tejosBlancos.push(tejo);
        }
        else {

            this.tejosRojos.push(tejo);
        }

        this.objetoActual = tejo;
    }

    salir() {

        this.activo = false;

        this.container.visible = false;

        // ----------------------------
        // RESET BARRAS
        // ----------------------------

        this.cargandoFuerza = false;
        this.cargandoAltura = false;

        this.fuerza = 0;
        this.altura = 0;

        // ----------------------------
        // RESET TEJIN
        // ----------------------------

        this.tejinValido = false;

        this.lanzando = false;

        this.intentosTejin = 3;

        this.ladoActual = "izquierda";

        this.puntosBlanco = 0;
        this.puntosRojo = 0;

        // posición inicial
        if (this.tejin) {

            this.tejin.x =
                this.cancha.x - this.cancha.width * 0.45;

            this.tejin.y =
                this.cancha.y + this.cancha.height * 0.25;

            this.objetoActual = this.tejin;
        }

        // limpiar barras visuales
        if (this.barraFuerza) this.barraFuerza.clear();
        if (this.barraAltura) this.barraAltura.clear();

        this.barraFuerza = null;
        this.barraAltura = null;

        console.log("SALIR", this);
    }
}