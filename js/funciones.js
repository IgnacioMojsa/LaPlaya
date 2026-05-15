function distancia(x1, x2, y1, y2){
    // Calcula la distancia total entre dos objetos a partir de sus posiciones en X y en Y,
    // esto lo hace a traves del teorema de pitagoras
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function obtenerNumeroAleatorio(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}