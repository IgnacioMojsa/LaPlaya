class GameObject {
    constructor(x, y, texture, i){
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;
        this.container.zIndex = y;

        this.id = i;

        this.texture = new PIXI.Sprite(texture);

        this.texture.anchor.set(0.5, 0.92);

        this.container.addChild(this.texture);
    }
    
    haySombrillaCerca(){
        return miJuego.sombrillas.some(sombrilla => {
                if(sombrilla.id === this.id) return false;
                
                return distancia(this.container.x, sombrilla.container.x, this.container.y, sombrilla.container.y) < 80
            }
        )
    }
}

class Comida{
    constructor(cantidad){
        this.compraRequerida = cantidad;

        this.mensaje = "un mensaje de compra";
    }

    cantidadAComprar(){
        return this.compraRequerida
    }
}

class Churro extends Comida{
    constructor(cantidad){
        super(cantidad)

        this.mensajeDeCompra = this.cantidadAComprar() + " de churros";
    }

    cantidadAComprar(){
        if(this.compraRequerida >= 12){
            return "una docena"
        }
        else{
            return "media docena"
        }
    }
}

class Choclo extends Comida{
    constructor(cantidad){
        super(cantidad)

        this.mensajeDeCompra = this.compraRequerida + this.cantidadAComprar();
    }

    cantidadAComprar(){

        if(this.compraRequerida > 1){
            return " choclos"
        }
        else{
            return " choclo"
        }
    }
}

class Agua extends Comida{
    constructor (cantidad){
        super(cantidad)

        this.mensajeDeCompra = this.compraRequerida + this.cantidadAComprar();
    }

    cantidadAComprar(){
        if(this.compraRequerida > 1){
            return " botellas de agua"
        }
        else{
            return " botella de agua"
        }
    }
}

class Helado extends Comida{
    constructor (cantidad){
        super(cantidad)

        this.mensajeDeCompra = this.compraRequerida + this.cantidadAComprar();
    }

    cantidadAComprar(){
        if(this.compraRequerida > 1){
            return " helados"
        }
        else{
            return " helado"
        }
    }
}
