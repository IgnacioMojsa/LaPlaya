class MaquinaDeEstados {
    constructor(personaje){
        this.estadoActual = null;
        this.personaje = personaje;
        this.estados = {};
    } 

    agregarEstado(clave, nuevoEstado) {
        this.estados[clave] = nuevoEstado;
    }

    cambiarA(nombreDeEstado){
        const nuevoEstado = this.estados[nombreDeEstado];
        
        if(this.estadoActual && this.estadoActual.exit){
            this.estadoActual.exit;
        }

        this.estadoActual = nuevoEstado
        
        if(this.estadoActual && this.estadoActual.enter){
            this.estadoActual.enter; 
        }
    }

    update(dt){
        if(this.estadoActual && this.estadoActual.update){
            this.estadoActual.update(dt)
        }
    }
}

class SwimState{
    constructor(personaje){
        this.personaje = personaje;
        //this.subEstadoActual = null;
    }   

    enter(){
        console.log("Entrando al estado Swim");

        this.cambiarDireccionYMovimiento();
    }

    update(){
        this.cambiarDireccionYMovimiento();
        
        this.actualizarSombra();

        //this.personaje.mantenerEnLimites(dt);
        
        if(!this.personaje.estaCargandoUnNene() && !this.personaje.estaNadando()){
            this.personaje.maquinaDeEstados.cambiarA('DEFAULT');
        }
        else if(this.personaje instanceof Npc && this.personaje.ahogandose && !this.personaje.rescatado){
            this.personaje.maquinaDeEstados.cambiarA('DROWN');
        }
    }

    exit(){
        console.log("Saliendo del estado Swim")
    }

    cambiarDireccionYMovimiento(){
        if (this.personaje.velocidad.x > 0) this.personaje.ultimaDireccion = "der";
        if (this.personaje.velocidad.x < 0) this.personaje.ultimaDireccion = "izq";

        if(!this.personaje.estaQuieto() && this.personaje.ultimaDireccion == "der"){
            this.personaje.cambiarAnimacion("swim_der")
        }
        else if(!this.personaje.estaQuieto() && this.personaje.ultimaDireccion == "izq"){
            this.personaje.cambiarAnimacion("swim_izq")
        }
        
        if(this.personaje.estaQuieto() && this.personaje.ultimaDireccion == "der"){
            this.personaje.cambiarAnimacion("idle_swim_der")
        }
        else if(this.personaje.estaQuieto() && this.personaje.ultimaDireccion == "izq"){
            this.personaje.cambiarAnimacion("idle_swim_izq")
        }
    }

    actualizarSombra(){
        this.personaje.sombra.visible = false;
    }
}

class WithChildState{
    constructor(personaje){
        this.personaje = personaje;
    }

    enter(){
        console.log("Entrando al estado WithChild");
    }

    update(){
        this.personaje.evitarQueEntreAlAguaConNene();

        this.cambiarDireccionYMovimiento();

        this.actualizarSombra();
        
        if(this.personaje.estaNadando()){
            this.personaje.maquinaDeEstados.cambiarA('SWIM')
        }
        else if(!this.personaje.estaCargandoUnNene() && !this.personaje.estaNadando()){
            this.personaje.maquinaDeEstados.cambiarA('DEFAULT');
        }
    }

    exit(){
        console.log("Saliendo del estado WithChild")
    }

    cambiarDireccionYMovimiento(){
        if (this.personaje.velocidad.x > 0) this.personaje.ultimaDireccion = "der";
        if (this.personaje.velocidad.x < 0) this.personaje.ultimaDireccion = "izq";
        
        if(!this.personaje.estaQuieto() && this.personaje.ultimaDireccion == "der"){
            this.personaje.cambiarAnimacion("der_con_nene")
        }
        else if(!this.personaje.estaQuieto() && this.personaje.ultimaDireccion == "izq"){
            this.personaje.cambiarAnimacion("izq_con_nene")
        }
        
        if(this.personaje.estaQuieto() && this.personaje.ultimaDireccion == "der"){
            this.personaje.cambiarAnimacion("idle_con_nene_der")
        }
        else if(this.personaje.estaQuieto() && this.personaje.ultimaDireccion == "izq"){
            this.personaje.cambiarAnimacion("idle_con_nene_izq")
        }
    }

    actualizarSombra(){
        this.personaje.sombra.position.set(this.personaje.container.position.x, this.personaje.container.position.y);
        this.personaje.sombra.zIndex = this.personaje.container.position.y - 3;
    }
}

class DefaultState{
    constructor(personaje){
        this.personaje = personaje;
    }

    enter(){
        console.log("Entrando al estado Default")
    }

    update(){
        this.cambiarDireccionYMovimiento();

        this.actualizarSombra();

        if(this.personaje.estaNadando()){
            this.personaje.maquinaDeEstados.cambiarA('SWIM')
        }
        else if(this.personaje.estaCargandoUnNene()){
            this.personaje.maquinaDeEstados.cambiarA('WITH_CHILD')
        }
    }

    exit(){
        console.log("Entrando en el estado Default")
    }

    cambiarDireccionYMovimiento(){
        if (this.personaje.velocidad.x > 0) this.personaje.ultimaDireccion = "der";
        if (this.personaje.velocidad.x < 0) this.personaje.ultimaDireccion = "izq";
        
        if(!this.personaje.estaQuieto() && this.personaje.ultimaDireccion == "der"){
            this.personaje.cambiarAnimacion("der")
        }
        else if(!this.personaje.estaQuieto() && this.personaje.ultimaDireccion == "izq"){
            this.personaje.cambiarAnimacion("izq")
        }

        if(this.personaje.estaQuieto() && this.personaje.ultimaDireccion == "der"){
            this.personaje.cambiarAnimacion("idle_der")
        }
        else if(this.personaje.estaQuieto() && this.personaje.ultimaDireccion == "izq"){
            this.personaje.cambiarAnimacion("idle_izq")
        }
    }

    actualizarSombra(){
        this.personaje.sombra.visible = true;

        this.personaje.sombra.position.set(this.personaje.container.position.x, this.personaje.container.position.y);
        this.personaje.sombra.zIndex = this.personaje.container.position.y - 3;
    }
}

class DrownState{
    constructor(personaje){
        this.personaje = personaje;
    }

    update(dt){
        this.personaje.ahogarse();
        this.personaje.mantenerEnLimites(dt);

        if(this.personaje.rescatado){
            this.personaje.ahogandose = false;

            this.personaje.maquinaDeEstados.cambiarA('RESCUED')
        }
    }
}

class RescuedState{
    constructor(personaje){
        this.personaje = personaje;
    }

    update(dt){
        if(this.personaje instanceof Hombre || this.personaje instanceof Mujer){
            this.cambiarDireccionYMovimiento();
            this.personaje.mantenerEnLimites(dt);
            this.personaje.mantenerCercaDe(miJuego.jugador);
            this.personaje.recuperarse(dt);
        }

        else if (this.personaje instanceof Nenes){
            this.personaje.render();
        }

        if(!this.personaje.ahogandose && !this.personaje.rescatado){
            this.personaje.maquinaDeEstados.cambiarA('DEFAULT')
            if(this.personaje instanceof Hombre || this.personaje instanceof Mujer){miJuego.cantidadDePersonasRescatadas += 1;};
            miJuego.dineroDelJugador += 3000;
            const sfxRecompensa = new Audio("assets/audio/recompensa.mp3");
            sfxRecompensa.volume = 0.5;
            sfxRecompensa.cloneNode(false);
            sfxRecompensa.play()
        }
    }

    cambiarDireccionYMovimiento(){
        if (this.personaje.velocidad.x > 0) this.personaje.ultimaDireccion = "der";
        if (this.personaje.velocidad.x < 0) this.personaje.ultimaDireccion = "izq";

        if(this.personaje.ultimaDireccion == "der"){
            this.personaje.cambiarAnimacion("rescatado_der")
        }
        else if(this.personaje.ultimaDireccion == "izq"){
            this.personaje.cambiarAnimacion("rescatado_izq")
        }
    }
}

class LostState{
    constructor(personaje){
        this.personaje = personaje;
    }

    update(){
        this.cambiarDireccionYMovimiento();
        this.actualizarSombra();

        if(!this.personaje.estaPerdido() && this.personaje.rescatado){
            this.personaje.maquinaDeEstados.cambiarA('RESCUED');
        }
        else if(!this.personaje.estaPerdido() && !this.personaje.estaResguardado()){
            this.personaje.maquinaDeEstados.cambiarA('DEFAULT');
        }
    }

    cambiarDireccionYMovimiento(){
        this.personaje.cambiarAnimacion("cry");
    }

    actualizarSombra(){
        this.personaje.sombra.anchor.set(0.5, 1.5);
        this.personaje.sombra.position.set(this.personaje.container.position.x, this.personaje.container.position.y - 2);
        this.personaje.sombra.zIndex = this.personaje.container.position.y - 5;
    }
}

class IdleState {
    constructor(personaje, estadoPadre){
        this.personaje = personaje;
        this.estadoPadre = estadoPadre;
    }

    enter(){
        console.log("Entrando al estado Idle")
    }

    update(){
        
    }

    exit(){
        console.log("Saliendo del estado Idle")
    }
}

class MoveState {
    constructor(personaje, estadoPadre){
        this.personaje = personaje;
        this.estadoPadre = estadoPadre;
    }

    enter(){

    }

    update(){
        
    }

    exit(){
        
    }
}