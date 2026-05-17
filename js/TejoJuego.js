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

        this.lanzando = false;

        this.ladoActual = "izquierda";
    }

    async iniciar() {

        // ------------------------
        // RESETEO INPUTS
        // ------------------------
        keys["f"] = false;
        keys["F"] = false;

        keys["a"] = false;
        keys["A"] = false;

        this.activo = true;


        this.fuerza = 0;
        this.altura = 0;

        
        this.container.visible = true;

        this.container.removeChildren();

        
        // FONDO CANCHA
        const texturaCancha = await PIXI.Assets.load('assets/cancha_tejo.png');
        this.cancha = new PIXI.Sprite(texturaCancha);
        
        this.cancha.anchor.set(0.5);
        this.cancha.x = window.innerWidth / 2;
        this.cancha.y = window.innerHeight / 2;

        const anchoDeseado = window.innerWidth * 0.9;

        const escalaCancha = anchoDeseado / this.cancha.width;

        this.cancha.scale.set(escalaCancha);
        
        this.container.addChild(this.cancha);

        // ------------------------
        // INSTRUCCIONES
        // ------------------------
            
        this.textoInstrucciones = new PIXI.Text({
            text:
                "W/S: MOVER | F: FUERZA | A: ALTURA | ESC: SALIR",
            
            style: {
                fill: "#ffffff",
                fontSize: window.innerWidth * 0.018,
                fontFamily: "Arial",
                fontWeight: "bold",
                align: "center"
            }
        });
        
        this.textoInstrucciones.anchor.set(0.5);
        
        // centrado horizontal
        this.textoInstrucciones.x = window.innerWidth / 2;
        
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
                fontSize: window.innerWidth * 0.02,
                fontFamily: "Arial",
                fontWeight: "bold"
            }
        });

        this.textoIntentos.x = window.innerWidth / 2.7;
        this.textoIntentos.y = this.cancha.y - this.cancha.height * 0.33;

        this.container.addChild(this.textoIntentos);

        // ------------------------
        // TEXTO TEJIN VALIDO
        // ------------------------

        this.textoTejinValido = new PIXI.Text({
            text: "TEJIN EN POSICION VALIDA",
            style: {
                fill: "#ffffff",
                fontSize: window.innerWidth * 0.03,
                fontFamily: "Arial",
                fontWeight: "bold"
            }
        });

        this.textoTejinValido.anchor.set(0.5);

        this.textoTejinValido.x = window.innerWidth / 2;
        this.textoTejinValido.y = this.cancha.y - this.cancha.height * 0.42;

        // empieza oculto
        this.textoTejinValido.visible = false;

        this.container.addChild(this.textoTejinValido);    
        
        this.container.addChild(this.textoInstrucciones);

        this.limiteSuperior = this.cancha.height / 2 + 210;
        this.limiteInferior = this.cancha.y + this.cancha.height * 0.365;        
        
        // TEJIN
        const texturaTejin = await PIXI.Assets.load('assets/tejin.png');
        this.tejin = new PIXI.Sprite(texturaTejin);
        
        this.tejin.anchor.set(0.5);
        this.tejin.x = this.cancha.x / 5;
        this.tejin.y = this.cancha.y + this.cancha.height * 0.25;

        const tamañoDeseado = window.innerWidth * 0.05;
        const escala = tamañoDeseado / this.tejin.width;
        this.tejin.scale.set(escala);


        this.container.addChild(this.tejin);

        // BARRAS
        this.barraFuerza = new PIXI.Graphics();
        this.barraAltura = new PIXI.Graphics();

        this.container.addChild(this.barraFuerza);
        this.container.addChild(this.barraAltura);

        /* if (!this.inputsCreados) {
            this.crearInputs();
            this.inputsCreados = true;
        } */

        this.app.stage.addChild(this.container);
    }

    /* crearInputs() {
        window.addEventListener("keydown", (e) => {

        
            if (
                !this.activo ||
                !this.puedeRecibirInput ||
                this.tejinValido
            ) return;

            if (e.key.toLowerCase() === "f") this.cargandoFuerza = true;
            if (e.key.toLowerCase() === "a") this.cargandoAltura = true;
        });

        window.addEventListener("keyup", (e) => {
        
            if (
                !this.activo ||
                !this.puedeRecibirInput ||
                this.tejinValido
            ) return;
        
            if (e.key.toLowerCase() === "f") this.cargandoFuerza = false;
            if (e.key.toLowerCase() === "a") this.cargandoAltura = false;
        
            if (e.key.toLowerCase() === "f" || e.key.toLowerCase() === "a") {
                this.lanzarTejin();
            }
        });
    } */

    lanzarTejin() {

        if (this.lanzando) return;

        if (this.fuerza <= 0 && this.altura <= 0) return;

        this.lanzando = true;

        const inicioX = this.tejin.x;
        const inicioY = this.tejin.y;

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
            * window.innerHeight
            * 0.35;

        // -----------------------------------
        // DURACION
        // -----------------------------------

        const duracion = 90;

        let tiempo = 0;

        const animar = () => {

            tiempo++;

            let t = tiempo / duracion;

            if (t > 1) t = 1;

            // movimiento horizontal
            this.tejin.x = inicioX + (destinoX - inicioX) * t;

            // parábola
            const parabola =
                -4 * alturaParabola * (t - 0.5) * (t - 0.5)
                + alturaParabola;

            this.tejin.y = destinoY - parabola;

            if (t < 1) {
                requestAnimationFrame(animar);
            }
            else {

                this.lanzando = false;

                this.verificarTejin();
            }
        };

        animar();

        this.fuerza = 0;
        this.altura = 0;
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
            this.textoTejinValido.visible = true;

            console.log("TEJIN VALIDO");

            // ACÁ después empieza la ronda de tejos
        }

        // -----------------------------------
        // SI FALLÓ
        // -----------------------------------

        else {

            this.intentosTejin--;

            this.textoIntentos.text =
                `Intentos restantes: ${this.intentosTejin}`;

            console.log("FALLÓ EL TEJIN");

            // reset posición
            if (this.ladoActual === "izquierda") {

                this.tejin.x = this.cancha.x / 5;
            }
            else {

                this.tejin.x =
                    window.innerWidth - (this.cancha.x / 5);
            }

            // si perdió los intentos
            if (this.intentosTejin <= 0) {

                console.log("CAMBIO DE LADO");

                this.cambiarLado();
            }
        }
    }

    cambiarLado() {

        if (this.ladoActual === "izquierda") {

            this.ladoActual = "derecha";

            this.tejin.x =
                window.innerWidth - (this.cancha.x / 5);
        }
        else {

            this.ladoActual = "izquierda";

            this.tejin.x = this.cancha.x / 5;
        }

        this.intentosTejin = 3;

        this.textoIntentos.text =
            `Intentos restantes: ${this.intentosTejin}`;

        this.tejinValido = false;
    }

    update() {
        if (!this.activo) return;
        if (!this.barraFuerza || !this.barraAltura) return;

        if (!this.tejinValido && !this.lanzando) {

            // ------------------------
            // CARGAR FUERZA
            // ------------------------

            if (keys["f"] || keys["F"]) {
                this.fuerza = Math.min(
                    this.maxCarga,
                    this.fuerza + 1
                );
            }
        
            // ------------------------
            // CARGAR ALTURA
            // ------------------------
        
            if (keys["a"] || keys["A"]) {
                this.altura = Math.min(
                    this.maxCarga,
                    this.altura + 1
                );
            }
        }

        this.dibujarBarras();

        if (!this.tejinValido && !this.lanzando) {

            if (keys["w"] || keys["W"]) {
                this.tejin.y -= this.velocidadMovimiento;
            }
        
            if (keys["s"] || keys["S"]) {
                this.tejin.y += this.velocidadMovimiento;
            }
        }

        if (this.tejin.y < this.limiteSuperior) {
            this.tejin.y = this.limiteSuperior;
        }
        
        if (this.tejin.y > this.limiteInferior) {
            this.tejin.y = this.limiteInferior;
        }

        // --------------------------------
        // DETECTAR SOLTAR F
        // --------------------------------

        const fApretada = keys["f"] || keys["F"];

        if (this.fPresionadaAntes && !fApretada) {
            this.lanzarTejin();
        }

        this.fPresionadaAntes = fApretada;

        // --------------------------------
        // DETECTAR SOLTAR A
        // --------------------------------

        const aApretada = keys["a"] || keys["A"];

        if (this.aPresionadaAntes && !aApretada) {
            this.lanzarTejin();
        }

        this.aPresionadaAntes = aApretada;
    }

    dibujarBarras() {
        if (!this.barraFuerza || !this.barraAltura) return;

        this.barraFuerza.clear();
        this.barraAltura.clear();

        this.barraFuerza.beginFill(0xff0000);
        this.barraFuerza.drawRect(50, window.innerHeight - 50, this.fuerza * 2, 20);
        this.barraFuerza.endFill();

        this.barraAltura.beginFill(0x00ff00);
        this.barraAltura.drawRect(50, window.innerHeight - 80, this.altura * 2, 20);
        this.barraAltura.endFill();
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

        // posición inicial
        if (this.tejin) {

            this.tejin.x = this.cancha.x / 5;

            this.tejin.y =
                this.cancha.y + this.cancha.height * 0.25;
        }

        // limpiar barras visuales
        if (this.barraFuerza) this.barraFuerza.clear();
        if (this.barraAltura) this.barraAltura.clear();
    }
}