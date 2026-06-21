class Nenes extends Npc{
    constructor(x, y, animacion, i, adulto = null){
        super(x, y, animacion, i)
        this.adulto = adulto;
        this.perdido = false;
        this.resguardado = false;
        this.distanciaMaxAdulto = 10;
        this.distanciaMinAdulto = 10;

        // this.targetNene = {x: this.container.x, y: this.container.y}; // ---> Lo reemplace por una propiedad target que tambien pueden utilizar los adultos
        this.suavizado = 1;
        this.aceleracionMax = 0.05;

        console.log("nenes creados")

        this.mensaje = new PIXI.Text({
          text: "Pulsa E para rescatar",
          style: {
            fill: "white",
            fontSize: 18,
            fontFamily: "PixelFont"
          }
        });
        
        this.mensaje.anchor.set(0.5);
        this.mensaje.y = -50;
        this.mensaje.visible = false;
        
        this.container.addChild(this.mensaje);

        this.sombra.anchor.set(0.5, 1.15);
    }

  estaPerdido(){
    //if (this.adulto == null)
    return this.perdido == true;
  }

  estaResguardado(){
    return this.resguardado == true;
  }

  // REEMPLAZADO POR mantenerCercaDe(alguien) EN NPC
  
  mantenerCercaDe(alguien){
    if (this.estaPerdido() || this.resguardado || !this.adulto) return;

    const targetX = alguien.container.x + this.separacion.x;
    const targetY = alguien.container.y + this.separacion.y;

    this.target.x += (targetX - this.target.x) * this.suavizado;
    this.target.y += (targetY - this.target.y) * this.suavizado;

    const d = distancia(this.container.x, this.target.x, this.container.y, this.target.y);
    if(d === 0) return;

    if(d > this.distanciaMaxAdulto){
      const dX = (this.target.x - this.container.x) / d;
      const dY = (this.target.y - this.container.y) / d;
      let intensidad = (d - this.distanciaMaxAdulto) * 0.05;
      intensidad = Math.min(intensidad, this.aceleracionMax);
      this.sumarAceleracion(dX * intensidad, dY * intensidad);
    }

    else if(d < this.distanciaMinAdulto){
      const dX = (this.container.x - this.target.x) / d;
      const dY = (this.container.y - this.target.y) / d;
      this.sumarAceleracion(dX * 0.05, dY * 0.05);
    }

    else {
      this.sumarAceleracion((alguien.velocidad.x - this.velocidad.x) * 0.05, (alguien.velocidad.y - this.velocidad.y) * 0.05);
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
      this.mantenerCercaDe(this.adulto);
      super.update();
    }
    else if(this.estaResguardado()){
      this.actualizarUltimaDir();
      this.render();
    }
    else{
      this.cambiarAnimacion("cry");
      this.sombra.anchor.set(0.5, 1.5);
      this.sombra.position.set(this.container.position.x, this.container.position.y - 2);
      this.sombra.zIndex = this.container.position.y - 5;
      this.render();
    }
  }

};
