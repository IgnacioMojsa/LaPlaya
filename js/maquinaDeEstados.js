const estadosDelJugador = {
    SWIM: new SwimState(miJuego.jugador),
    DEFAULT: new DefaultState(miJuego.jugador),
    WITH_CHILD: new WithChildState(miJuego.jugador)
}

class MaquinaDeEstados {
    constructor(estadoInicial, estados){
        this.estadoActual = null;
        this.estados = estados;

        this.cambiarA(estadoInicial);
    } 

    cambiarA(nuevoEstado){
        if(this.estadoActual && this.estadoActual.exit){
            this.estadoActual.exit;
        }

        this.estadoActual = nuevoEstado
        
        if(this.estadoActual && this.estadoActual.enter){
            this.estadoActual.enter; 
        }
    }

    update(){
        if(this.estadoActual && this.estadoActual.update){
            this.estadoActual.update()
        }
    }
}

class SwimState{
    constructor(jugador){
        this.jugador = jugador;
        //this.subEstadoActual = null;
    }   

    enter(){
        console.log("Entrando al estado Swim");

        this.cambiarDireccionYMovimiento();
    }

    update(){
        this.cambiarDireccionYMovimiento();
        
        if(this.jugador.estaCargandoUnNene()){
            this.jugador.maquinaDeEstados.cambiarA(estadosDelJugador.WITH_CHILD)
        }
        else if(!this.jugador.estaCargandoUnNene() && !this.jugador.estaNadando()){
            this.jugador.maquinaDeEstados.cambiarA(estadosDelJugador.DEFAULT);
        }
    }

    exit(){
        console.log("Saliendo del estado Swim")
    }

    cambiarDireccionYMovimiento(){
        if(!this.jugador.estaQuieto() && this.jugador.ultimaDir == "der"){
            this.jugador.cambiarAnimacion("swim_der")
        }
        else if(!this.jugador.estaQuieto() && this.jugador.ultimaDir == "izq"){
            this.jugador.cambiarAnimacion("swim_izq")
        }
        else if(this.jugador.estaQuieto() && this.jugador.ultimaDir == "der"){
            this.jugador.cambiarAnimacion("swim_idle_der")
        }
        else if(this.jugador.estaQuieto() && this.jugador.ultimaDir == "izq"){
            this.jugador.cambiarAnimacion("swim_idle_izq")
        }
    }
}

class WithChildState{
    constructor(jugador){
        this.jugador = jugador;
    }

    enter(){
        console.log("Entrando al estado WithChild");
    }

    update(){
        this.jugador.evitarQueEntreAlAguaConNene();

        this.cambiarDireccionYMovimiento();
        
        if(this.jugador.estaNadando()){
            this.jugador.maquinaDeEstados.cambiarA(estadosDelJugador.SWIM)
        }
        else if(!this.jugador.estaCargandoUnNene() && !this.jugador.estaNadando()){
            this.jugador.maquinaDeEstados.cambiarA(estadosDelJugador.DEFAULT);
        }
    }

    exit(){
        console.log("Saliendo del estado WithChild")
    }

    cambiarDireccionYMovimiento(){
        if(!this.jugador.estaQuieto() && this.jugador.ultimaDir == "der"){
            this.jugador.cambiarAnimacion("der_con_nene")
        }
        else if(!this.jugador.estaQuieto() && this.jugador.ultimaDir == "izq"){
            this.jugador.cambiarAnimacion("izq_con_nene")
        }
        else if(this.jugador.estaQuieto() && this.jugador.ultimaDir == "der"){
            this.jugador.cambiarAnimacion("idle_con_nene_der")
        }
        else if(this.jugador.estaQuieto() && this.jugador.ultimaDir == "izq"){
            this.jugador.cambiarAnimacion("idle_con_nene_izq")
        }
    }
}

class DefaultState{
    constructor(jugador){
        this.jugador = jugador;
    }

    enter(){
        console.log("Entrando al estado Default")
    }

    update(){
        this.cambiarDireccionYMovimiento();

        if(this.jugador.estaNadando()){
            this.jugador.maquinaDeEstados.cambiarA(estadosDelJugador.SWIM)
        }
        else if(this.jugador.estaCargandoUnNene()){
            this.jugador.maquinaDeEstados.cambiarA(estadosDelJugador.WITH_CHILD)
        }
    }

    exit(){
        console.log("Entrando en el estado Default")
    }

    cambiarDireccionYMovimiento(){
        if(!this.jugador.estaQuieto() && this.jugador.ultimaDir == "der"){
            this.jugador.cambiarAnimacion("der")
        }
        else if(!this.jugador.estaQuieto() && this.jugador.ultimaDir == "izq"){
            this.jugador.cambiarAnimacion("izq")
        }
        else if(this.jugador.estaQuieto() && this.jugador.ultimaDir == "der"){
            this.jugador.cambiarAnimacion("idle_der")
        }
        else if(this.jugador.estaQuieto() && this.jugador.ultimaDir == "izq"){
            this.jugador.cambiarAnimacion("idle_izq")
        }
    }
}

class IdleState {
    constructor(jugador, estadoPadre){
        this.jugador = jugador;
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
    constructor(jugador, estadoPadre){
        this.jugador = jugador;
        this.estadoPadre = estadoPadre;
    }

    enter(){

    }

    update(){
        
    }

    exit(){
        
    }
}
