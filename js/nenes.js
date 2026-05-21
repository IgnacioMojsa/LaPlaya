class Nenes extends Npc{
    constructor(x, y, animacion, i, adulto = null){
        super(x, y, animacion, i)
        this.adulto = adulto;
        this.perdido = false;
        this.rescatado = false;
        this.resguardado = false;
        this.separacion = {x: 50, y: 50};
        this.distanciaMaxAdulto = 10;
        this.distanciaMinAdulto = 10;

        this.targetNene = {x: this.container.x, y: this.container.y};
        this.suavizado = 1;
        this.aceleracionMax = 0.05;

        console.log("nenes creados")

        this.mensaje = new PIXI.Text({
          text: "Pulsa E para rescatar",
          style: {
            fill: "white",
            fontSize: 18
          }
        });
        
        this.mensaje.anchor.set(0.5);
        this.mensaje.y = -50;
        this.mensaje.visible = false;
        
        this.container.addChild(this.mensaje);
    }

  estaPerdido(){
    //if (this.adulto == null)
    return this.perdido == true;
  }

  estaResguardado(){
    return this.resguardado == true;
  }

  mantenerCercaDeAdulto(){
    if (this.estaPerdido() || this.resguardado || !this.adulto) return;

    const targetX = this.adulto.container.x + this.separacion.x;
    const targetY = this.adulto.container.y + this.separacion.y;

    this.targetNene.x += (targetX - this.targetNene.x) * this.suavizado;
    this.targetNene.y += (targetY - this.targetNene.y) * this.suavizado;

    const d = distancia(this.container.x, this.targetNene.x, this.container.y, this.targetNene.y);
    if(d === 0) return;

    if(d > this.distanciaMaxAdulto){
      const dX = (this.targetNene.x - this.container.x) / d;
      const dY = (this.targetNene.y - this.container.y) / d;
      let intensidad = (d - this.distanciaMaxAdulto) * 0.05;
      intensidad = Math.min(intensidad, this.aceleracionMax);
      this.sumarAceleracion(dX * intensidad, dY * intensidad);
    }

    else if(d < this.distanciaMinAdulto){
      const dX = (this.container.x - this.targetNene.x) / d;
      const dY = (this.container.y - this.targetNene.y) / d;
      this.sumarAceleracion(dX * 0.05, dY * 0.05);
    }

    else {
      this.sumarAceleracion((this.adulto.velocidad.x - this.velocidad.x) * 0.05, (this.adulto.velocidad.y - this.velocidad.y) * 0.05);
    }
  }

  actualizarUltimaDir(){
    if(this.velocidad.x > 0){
      this.ultimaDir = "der"
    }
    else if(this.velocidad.x < 0){
      this.ultimaDir = "izq"
    }
  }

  render(){
    if(this.estaPerdido() || this.estaResguardado()){
      this.container.visible = true; 
      this.aceleracion.x = 0;
      this.aceleracion.y = 0;
      this.velocidad.x = 0;
      this.velocidad.y = 0;
      return;
    }
    else if(this.rescatado){
      this.container.visible = false;
    }
    
    super.render();
  }

  update(){
    if (!this.estaPerdido()){
      this.cambiarDeSpriteDeDireccion();
      this.mantenerCercaDeAdulto();
      super.update();
    }
    else if(this.estaResguardado()){
      this.actualizarUltimaDir();
      this.render();
    }
    else{
      this.cambiarAnimacion("cry");
      this.render();
    }
  }

};
