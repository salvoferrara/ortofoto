// Seleziona l'elemento dell'immagine e un canvas per disegnare i punti
const imageElement = document.getElementById('imageToProcess');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');

let points = []; // Array per memorizzare i punti selezionati

// Funzione per ridimensionare il canvas in base all'immagine
function resizeCanvas() {
    if (imageElement.naturalWidth && imageElement.naturalHeight) {
        // Imposta le dimensioni del canvas uguali alle dimensioni visualizzate dell'immagine
        canvas.width = imageElement.clientWidth;
        canvas.height = imageElement.clientHeight;
        // Ridisegna i punti dopo il ridimensionamento del canvas
        drawPoints();
    }
}

// Assicurati che l'immagine sia completamente caricata prima di fare calcoli
imageElement.onload = () => {
    resizeCanvas();
    // Aggiungi un event listener per ridimensionare il canvas se la finestra cambia dimensione
    window.addEventListener('resize', resizeCanvas);
};

// Se l'immagine è già nel cache del browser, onload potrebbe non scattare.
// Chiamiamo resizeCanvas comunque per sicurezza.
if (imageElement.complete) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}


// Aggiungi un listener per l'evento click sul canvas
canvas.addEventListener('click', (event) => {
    // Ottieni le coordinate del click relative all'elemento canvas
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Calcola le dimensioni attuali visualizzate dell'immagine
    const displayedImageWidth = imageElement.clientWidth;
    const displayedImageHeight = imageElement.clientHeight;

    // Ottieni le dimensioni originali dell'immagine
    const originalImageWidth = imageElement.naturalWidth;
    const originalImageHeight = imageElement.naturalHeight;

    // Calcola i fattori di scala per la larghezza e l'altezza
    const scaleFactorX = originalImageWidth / displayedImageWidth;
    const scaleFactorY = originalImageHeight / displayedImageHeight;

    // Applica i fattori di scala alle coordinate del click per ottenere
    // le coordinate sull'immagine originale
    const originalImageCoordX = Math.round(clickX * scaleFactorX);
    const originalImageCoordY = Math.round(clickY * scaleFactorY);

    console.log(`Click sul canvas (visualizzato): (${clickX}, ${clickY})`);
    console.log(`Punto sull'immagine originale: (${originalImageCoordX}, ${originalImageCoordY})`);

    // Aggiungi il punto alla lista e ridisegna
    points.push({ x: originalImageCoordX, y: originalImageCoordY });
    drawPoints();
});

// Funzione per disegnare tutti i punti sul canvas
function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Pulisci il canvas

    // Calcola i fattori di scala inversi per disegnare i punti nella posizione corretta
    const displayedImageWidth = imageElement.clientWidth;
    const displayedImageHeight = imageElement.clientHeight;
    const originalImageWidth = imageElement.naturalWidth;
    const originalImageHeight = imageElement.naturalHeight;

    // Fattori di scala per convertire da coordinate originali a quelle visualizzate
    const displayScaleFactorX = displayedImageWidth / originalImageWidth;
    const displayScaleFactorY = displayedImageHeight / originalImageHeight;


    ctx.fillStyle = 'red'; // Colore del punto
    ctx.strokeStyle = 'white'; // Colore del bordo del punto
    ctx.lineWidth = 2; // Spessore del bordo

    points.forEach(point => {
        // Converte le coordinate del punto dall'immagine originale a quelle visualizzate sul canvas
        const displayX = point.x * displayScaleFactorX;
        const displayY = point.y * displayScaleFactorY;

        ctx.beginPath();
        ctx.arc(displayX, displayY, 5, 0, Math.PI * 2); // Disegna un cerchio (raggio 5px)
        ctx.fill(); // Riempi il cerchio
        ctx.stroke(); // Disegna il bordo
    });
}