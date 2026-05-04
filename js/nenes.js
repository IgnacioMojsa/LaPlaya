class Nenes extends Npc{
    constructor(x, y, animacion, i, adulto = null){
        super(x, y, animacion, i)
        this.adulto = adulto;
        this.perdido = false;
        this.separacion = {x: 50, y: 50};
        this.distanciaMaxAdulto = 10;
        this.distanciaMinAdulto = 10;

        this.targetNene = {x: this.container.x, y: this.container.y};
        this.suavizado = 1;
        this.aceleracionMax = 0.05;

        console.log("nenes creados")
    }

  estaPerdido(){
    //if (this.adulto == null)
    return this.perdido == true;
  }

mantenerCercaDeAdulto(){
  if (this.estaPerdido()) return;

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

  render(){
    if(this.estaPerdido()){
      this.aceleracion.x = 0;
      this.aceleracion.y = 0;
      return;
    }
    super.render();
  }

  update(){
    if (!this.estaPerdido()){
      this.cambiarDeSpriteDeDireccion();
      this.mantenerCercaDeAdulto();
      super.update();
    }
    else{
      this.cambiarAnimacion("cry");
      this.render();
    }
  }
};
