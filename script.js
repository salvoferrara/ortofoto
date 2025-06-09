// Seleziona gli elementi HTML necessari usando il loro ID
const imageUpload = document.getElementById('imageUpload');     // L'input per caricare il file immagine
const imageElement = document.getElementById('imageToProcess'); // L'elemento <img> dove verrà mostrata l'immagine
const canvas = document.getElementById('imageCanvas');         // L'elemento <canvas> che si sovrapporrà all'immagine
const ctx = canvas.getContext('2d');                           // Il contesto 2D del canvas, usato per disegnare

// Variabile per memorizzare i punti selezionati dall'utente
let points = []; 

// --- Funzioni di Utilità ---

/**
 * Ridimensiona il canvas alle dimensioni NATURALI (originali) dell'immagine.
 * Questo è il cambiamento chiave. Il CSS si occuperà dello scaling visivo.
 */
function resizeCanvasToNaturalSize() {
    // Il setTimeout rimane per garantire che naturalWidth/Height siano disponibili
    setTimeout(() => {
        if (imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
            console.log(`[DEBUG] resizeCanvasToNaturalSize - Dimensioni Naturali: ${imageElement.naturalWidth}x${imageElement.naturalHeight}`);
            // Imposta le dimensioni del canvas alle dimensioni originali del file immagine
            canvas.width = imageElement.naturalWidth;
            canvas.height = imageElement.naturalHeight;
            drawPoints();
        } else {
            canvas.width = 0;
            canvas.height = 0;
            points = [];
            console.warn("[DEBUG] resizeCanvasToNaturalSize - Immagine non ha dimensioni naturali valide.");
        }
    }, 50); 
}

/**
 * Disegna tutti i punti memorizzati sull'immagine sul canvas.
 * Ora non serve più scalare i punti qui, perché il canvas è già alla dimensione originale.
 */
function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Pulisce l'intero canvas

    if (!imageElement.naturalWidth || points.length === 0) {
        return;
    }

    ctx.fillStyle = 'red';     
    ctx.strokeStyle = 'white'; 
    ctx.lineWidth = 2;         

    // Per ogni punto memorizzato, disegnalo direttamente alle sue coordinate originali.
    // Il canvas ha le dimensioni originali, quindi non serve scaling qui.
    points.forEach(point => {
        ctx.beginPath(); 
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2); // Disegna un cerchio al punto (x,y) originale
        ctx.fill();   
        ctx.stroke(); 
    });
}

// --- Gestione Caricamento Immagine ---

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0]; 

    if (file) {
        const reader = new FileReader(); 

        reader.onload = (e) => {
            imageElement.src = e.target.result; 
            points = []; 
            // `imageElement.onload` gestirà il ridimensionamento del canvas e il disegno
        };

        reader.readAsDataURL(file);
    }
});

// --- Gestione Eventi Immagine e Finestra ---

imageElement.onload = () => {
    console.log("[DEBUG] Evento imageElement.onload attivato.");
    // Chiama la nuova funzione per ridimensionare il canvas alle dimensioni naturali
    resizeCanvasToNaturalSize(); 
};

if (imageElement.complete && imageElement.naturalWidth > 0) {
    console.log("[DEBUG] Immagine già completa al caricamento dello script.");
    resizeCanvasToNaturalSize();
}

// L'evento resize della finestra deve ancora ridimensionare il canvas, ma ora non scalerà i punti
window.addEventListener('resize', () => {
    // Dopo un resize della finestra, il CSS ridimensiona l'immagine.
    // Non dobbiamo ridimensionare il canvas qui, solo ridisegnare i punti.
    // Il canvas mantiene le sue dimensioni naturali.
    drawPoints(); 
});


// --- Gestione Click sul Canvas (Selezione Punti) ---

canvas.addEventListener('click', (event) => {
    if (!imageElement.naturalWidth || imageElement.naturalWidth === 0) {
        console.log("[DEBUG] Nessuna immagine caricata o dimensioni non valide. Impossibile selezionare il punto.");
        console.log(`[DEBUG] Dim. al click (natural): ${imageElement.naturalWidth}x${imageElement.naturalHeight}`);
        console.log(`[DEBUG] Dim. al click (client): ${imageElement.clientWidth}x${imageElement.clientHeight}`);
        return;
    }

    // Ottieni la posizione e le dimensioni del canvas rispetto al viewport
    const rect = canvas.getBoundingClientRect();
    
    // Calcola le coordinate del click relative all'elemento canvas (che è scalato dal CSS)
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Log per debug: verifica le coordinate del click sul canvas
    console.log(`[DEBUG] Click Raw su Canvas: (${event.clientX}, ${event.clientY})`);
    console.log(`[DEBUG] Canvas Rect: left=${rect.left}, top=${rect.top}, width=${rect.width}, height=${rect.height}`);
    console.log(`[DEBUG] Click su Canvas (relative al canvas): (${clickX}, ${clickY})`);


    // Ottieni le dimensioni originali dell'immagine (uguali al canvas.width/height)
    const originalImageWidth = imageElement.naturalWidth;
    const originalImageHeight = imageElement.naturalHeight;
    // Ottieni le dimensioni attuali *visualizzate* dell'immagine (determinate dal CSS)
    const displayedImageWidth = imageElement.clientWidth;
    const displayedImageHeight = imageElement.clientHeight;

    // Log per debug: verifica tutte le dimensioni usate per il calcolo
    console.log(`[DEBUG] Immagine Originale: ${originalImageWidth}x${originalImageHeight}`);
    console.log(`[DEBUG] Immagine Visualizzata: ${displayedImageWidth}x${displayedImageHeight}`);


    // Calcola i fattori di scala per convertire le coordinate del click
    // (che sono relative al canvas visualizzato) alle coordinate dell'immagine originale.
    // Questi fattori riflettono lo scaling applicato dal CSS al contenitore.
    const scaleFactorX = (displayedImageWidth > 0) ? originalImageWidth / displayedImageWidth : 0;
    const scaleFactorY = (displayedImageHeight > 0) ? originalImageHeight / displayedImageHeight : 0;

    // Log per debug: verifica i fattori di scala
    console.log(`[DEBUG] Fattori di Scala: X=${scaleFactorX}, Y=${scaleFactorY}`);


    // Applica i fattori di scala alle coordinate del click per ottenere
    // le coordinate sull'immagine originale
    const originalImageCoordX = Math.round(clickX * scaleFactorX);
    const originalImageCoordY = Math.round(clickY * scaleFactorY);

    console.log(`[INFO] Click sul canvas (visualizzato): (${clickX}, ${clickY})`);
    console.log(`[INFO] Punto selezionato sull'immagine originale: (${originalImageCoordX}, ${originalImageCoordY})`);

    points.push({ x: originalImageCoordX, y: originalImageCoordY });
    drawPoints();
});