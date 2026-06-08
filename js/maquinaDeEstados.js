class MaquinaDeEstados {
    constructor(estados, estadoInicial){
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
    constructor(jugador, estados){
        this.jugador = jugador;
        this.subEstados = estados;
    }   

    enter(){
        console.log("Entrando al estado Swim")
    }

    update(){
        
    }

    exit(){
        console.log("Saliendo del estado Swim")
    }
}

class WithChildState{
    constructor(jugador, estados){
        this.jugador = jugador;
        this.subEstados = estados;
    }

    enter(){
        console.log("Entrando al estado WithChild")
    }

    update(){
        
    }

    exit(){
        console.log("Saliendo del estado WithChild")
    }
}

class DefaultState{
    constructor(jugador, estados){
        this.jugador = jugador;
        this.subEstados = estados;
    }

    enter(){
        console.log("Entrando al estado Default")
    }

    update(){
        
    }

    exit(){
        console.log("Entrando en el estado Default")
    }
}

class IdleState {
    constructor(jugador){
        this.jugador = jugador;
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
    constructor(jugador){
        this.jugador = jugador;
    }

    enter(){

    }

    update(){
        if(this.estaQuieto() && this.ultimaDir === "der"){
            this.cambiarAnimacion("idle_der");
        } 
        else if(this.estaQuieto() && this.ultimaDir === "izq" ){
            this.cambiarAnimacion("idle_izq");
        }
    }

    exit(){
        
    }
}
