const sfx = {
  opcion: new Audio("assets/audio/opcion.mp3"),
  error: new Audio("assets/audio/errorcompra.mp3"),
  compra: new Audio("assets/audio/compra.mp3"),
  aplauso: new Audio("assets/audio/aplauso.mp3"),
  sorpresa: new Audio("assets/audio/gasp.mp3"),
  silbato: new Audio("assets/audio/silbato3.mp3"),
  recompensa: new Audio("assets/audio/recompensa.mp3")
  };

sfx.error.volume = 0.2;
sfx.compra.volume = 0.2;
sfx.recompensa.volume = 1;
sfx.opcion.volume = 0.5;
sfx.aplauso.volume = 0.5;
//sfx.sorpresa.volume = 0.5;

function playSfx(audio) {
    audio.currentTime = 0;
    audio.play();
}