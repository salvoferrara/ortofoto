// Seleziona gli elementi HTML necessari
const imageUpload = document.getElementById('imageUpload'); // L'input per caricare il file
const imageElement = document.getElementById('imageToProcess'); // L'elemento <img>
const canvas = document.getElementById('imageCanvas'); // L'elemento <canvas>
const ctx = canvas.getContext('2d'); // Il contesto 2D del canvas per disegnare

let points = []; // Array per memorizzare i punti selezionati

// --- Funzioni di Utilità ---

// Funzione per ridimensionare il canvas in base all'immagine visualizzata
function resizeCanvas() {
    // Solo se l'immagine ha dimensioni valide (è stata caricata)
    if (imageElement.naturalWidth && imageElement.naturalHeight) {
        // Imposta le dimensioni del canvas uguali alle dimensioni attuali dell'elemento <img>
        canvas.width = imageElement.clientWidth;
        canvas.height = imageElement.clientHeight;
        // Ridisegna tutti i punti dopo che il canvas è stato ridimensionato
        drawPoints();
    } else {
        // Se l'immagine non è ancora caricata o valida, imposta il canvas a 0
        canvas.width = 0;
        canvas.height = 0;
        // Pulisci i punti se non c'è immagine
        points = [];
    }
}

// Funzione per disegnare tutti i punti sul canvas
function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Pulisci l'intero canvas

    // Solo se l'immagine è caricata e abbiamo punti da disegnare
    if (!imageElement.naturalWidth || points.length === 0) {
        return;
    }

    // Calcola i fattori di scala per convertire da coordinate originali a quelle visualizzate sul canvas
    const originalImageWidth = imageElement.naturalWidth;
    const originalImageHeight = imageElement.naturalHeight;
    const displayedImageWidth = imageElement.clientWidth;
    const displayedImageHeight = imageElement.clientHeight;

    const displayScaleFactorX = displayedImageWidth / originalImageWidth;
    const displayScaleFactorY = displayedImageHeight / originalImageHeight;

    ctx.fillStyle = 'red';     // Colore di riempimento per i punti
    ctx.strokeStyle = 'white'; // Colore del contorno per i punti
    ctx.lineWidth = 2;         // Spessore del contorno

    points.forEach(point => {
        // Converte le coordinate del punto (memorizzate sull'immagine originale)
        // in coordinate per la visualizzazione sul canvas scalato
        const displayX = point.x * displayScaleFactorX;
        const displayY = point.y * displayScaleFactorY;

        ctx.beginPath();
        ctx.arc(displayX, displayY, 5, 0, Math.PI * 2); // Disegna un cerchio (raggio 5px)
        ctx.fill();   // Riempi il cerchio
        ctx.stroke(); // Disegna il contorno
    });
}

// --- Gestione Caricamento Immagine ---

// Event listener per l'input del file: si attiva quando l'utente seleziona un file
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Prende il primo file selezionato

    if (file) {
        const reader = new FileReader(); // Crea un oggetto FileReader per leggere il contenuto del file

        // Funzione che si attiva quando il FileReader ha finito di leggere il file
        reader.onload = (e) => {
            imageElement.src = e.target.result; // Imposta la sorgente dell'elemento <img> all'URL del file
            points = []; // Resetta i punti ogni volta che una nuova immagine viene caricata
            // `imageElement.onload` gestirà il ridimensionamento del canvas e il disegno
        };

        // Legge il contenuto del file come un URL di dati (Base64)
        reader.readAsDataURL(file);
    }
});

// --- Gestione Eventi Immagine e Finestra ---

// Event listener per quando l'immagine è completamente caricata nell'elemento <img>
imageElement.onload = () => {
    resizeCanvas(); // Ridimensiona il canvas per adattarsi alla nuova immagine
    // Se ci sono punti memorizzati, verranno ridisegnati da resizeCanvas
    // Se non ci sono, il canvas sarà pulito
};

// Se per qualche motivo l'immagine è già caricata (es. da cache del browser),
// chiama resizeCanvas immediatamente per inizializzare.
if (imageElement.complete && imageElement.naturalWidth > 0) {
    resizeCanvas();
}


// Event listener per il ridimensionamento della finestra
// Questo assicura che il canvas si adatti se l'utente cambia la dimensione della finestra del browser
window.addEventListener('resize', resizeCanvas);

// --- Gestione Click sul Canvas ---

// Event listener per il click sul canvas
canvas.addEventListener('click', (event) => {
    // Se l'immagine non è ancora caricata, non fare nulla
    if (!imageElement.naturalWidth) {
        console.log("Nessuna immagine caricata. Impossibile selezionare il punto.");
        return;
    }

    // Ottieni la posizione e le dimensioni del canvas rispetto al viewport
    const rect = canvas.getBoundingClientRect();
    // Calcola le coordinate del click relative all'elemento canvas
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Ottieni le dimensioni originali dell'immagine
    const originalImageWidth = imageElement.naturalWidth;
    const originalImageHeight = imageElement.naturalHeight;
    // Ottieni le dimensioni attuali visualizzate dell'immagine (che sono le stesse del canvas)
    const displayedImageWidth = imageElement.clientWidth;
    const displayedImageHeight = imageElement.clientHeight;

    // Calcola i fattori di scala per convertire le coordinate visualizzate in coordinate originali
    const scaleFactorX = originalImageWidth / displayedImageWidth;
    const scaleFactorY = originalImageHeight / displayedImageHeight;

    // Applica i fattori di scala alle coordinate del click per ottenere
    // le coordinate sull'immagine originale
    const originalImageCoordX = Math.round(clickX * scaleFactorX);
    const originalImageCoordY = Math.round(clickY * scaleFactorY);

    console.log(`Click sul canvas (visualizzato): (${clickX}, ${clickY})`);
    console.log(`Punto sull'immagine originale: (${originalImageCoordX}, ${originalImageCoordY})`);

    // Aggiungi il punto alla lista e ridisegna sul canvas
    points.push({ x: originalImageCoordX, y: originalImageCoordY });
    drawPoints();
});