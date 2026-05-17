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

        window.addEventListener("resize", () => {
            if (this.activo) {
                this.resize();
            }
        });
        this.app.stage.addChild(this.container);
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
        
            if (this.ladoActual === "izquierda") {
            
                this.tejin.x = this.cancha.x / 5;
            }
            else {
            
                this.tejin.x =
                    this.app.screen.width - (this.cancha.x / 5);
            }
        
            this.tejin.y =
                this.cancha.y + this.cancha.height * 0.25;
        }


        // ------------------------
        // LIMITES
        // ------------------------

        this.limiteSuperior =
            this.cancha.y + this.cancha.height * 0.05;

        this.limiteInferior =
            this.cancha.y + this.cancha.height * 0.36;
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
                fontFamily: "Arial",
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
                fontFamily: "Arial",
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
                fontFamily: "Arial",
                fontWeight: "bold"
            }
        });
        
        this.textoTejinValido.anchor.set(0.5);
        
        this.textoTejinValido.x = this.app.screen.width / 2;
        this.textoTejinValido.y = this.cancha.y - this.cancha.height * 0.42;
        
        // empieza oculto
        this.textoTejinValido.visible = false;
        
        this.container.addChild(this.textoTejinValido);    
        
        this.container.addChild(this.textoInstrucciones);
              
        
        // TEJIN
        const texturaTejin = await PIXI.Assets.load('assets/tejin.png');
        this.tejin = new PIXI.Sprite(texturaTejin);
        
        this.tejin.anchor.set(0.5);
        this.tejin.x = this.cancha.x / 5;
        this.tejin.y = this.cancha.y + this.cancha.height * 0.25;
        
        const tamañoDeseado = this.app.screen.width * 0.05;
        const escala =
            tamañoDeseado / this.tejin.texture.width;
        this.tejin.scale.set(escala);
        
        
        this.container.addChild(this.tejin);
        
        // BARRAS
        this.barraFuerza = new PIXI.Graphics();
        this.barraAltura = new PIXI.Graphics();
        
        this.container.addChild(this.barraFuerza);
        this.container.addChild(this.barraAltura);
        
        this.resize();
    }


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
            * this.app.screen.height
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

            this.tejin.x =
                inicioX + (destinoX - inicioX) * t;

            const parabola =
                -4 * alturaParabola * (t - 0.5) * (t - 0.5)
                + alturaParabola;

            this.tejin.y = destinoY - parabola;

            if (t >= 1) {
            
                this.app.ticker.remove(animar);
            
                this.lanzando = false;
            
                this.verificarTejin();
            }
        };

        this.app.ticker.add(animar);


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
            this.textoIntentos.visible = false;

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

                this.tejin.x = this.cancha.x / 5;
            }
            else {

                this.tejin.x =
                    this.app.screen.width - (this.cancha.x / 5);
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
                this.app.screen.width - (this.cancha.x / 5);
        }
        else {

            this.ladoActual = "izquierda";

            this.tejin.x = this.cancha.x / 5;
        }

        this.intentosTejin = 3;

        this.textoIntentos.text =
            `Intentos de tejín restantes: ${this.intentosTejin}`;

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