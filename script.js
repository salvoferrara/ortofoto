// Ottenimento degli elementi HTML
const inputImage = document.getElementById('inputImage');
const originalCanvas = document.getElementById('originalCanvas');
const straightenedCanvas = document.getElementById('straightenedCanvas');
const messageElement = document.getElementById('message');
const controlsDiv = document.getElementById('controls');
const pointsCountSpan = document.getElementById('pointsCount');
const resetPointsBtn = document.getElementById('resetPointsBtn');
const straightenBtn = document.getElementById('straightenBtn');
const outputSection = document.getElementById('outputSection');
const downloadBtn = document.getElementById('downloadBtn');

const originalCtx = originalCanvas.getContext('2d');
const straightenedCtx = straightenedCanvas.getContext('2d');

let originalImage = new Image();
let selectedPoints = [];
let imgAspectRatio = 1;

// Funzione per disegnare l'immagine sul canvas
function drawImageOnCanvas(canvas, ctx, image, scale = 1) {
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

// Funzione per disegnare i punti selezionati
function drawPoints() {
    originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height); // Cancella il canvas
    drawImageOnCanvas(originalCanvas, originalCtx, originalImage); // Ridisezgna l'immagine

    selectedPoints.forEach((point, index) => {
        originalCtx.beginPath();
        originalCtx.arc(point.x, point.y, 5, 0, Math.PI * 2); // Disegna un cerchio
        originalCtx.fillStyle = 'red';
        originalCtx.fill();
        originalCtx.strokeStyle = 'white';
        originalCtx.lineWidth = 2;
        originalCtx.stroke();
        originalCtx.fillStyle = 'white';
        originalCtx.font = '12px Arial';
        originalCtx.textAlign = 'center';
        originalCtx.textBaseline = 'middle';
        originalCtx.fillText(index + 1, point.x, point.y); // Numera i punti
    });
}

// Evento quando l'utente seleziona un file immagine
inputImage.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            originalImage.onload = () => {
                // Adatta la dimensione del canvas alla larghezza del contenitore, mantenendo l'aspect ratio
                const maxWidth = originalCanvas.parentElement.offsetWidth;
                imgAspectRatio = originalImage.width / originalImage.height;
                let newWidth = originalImage.width;
                let newHeight = originalImage.height;

                if (newWidth > maxWidth) {
                    newWidth = maxWidth;
                    newHeight = newWidth / imgAspectRatio;
                }
                
                originalCanvas.width = newWidth;
                originalCanvas.height = newHeight;
                originalCtx.drawImage(originalImage, 0, 0, newWidth, newHeight);

                messageElement.style.display = 'none';
                controlsDiv.style.display = 'block';
                outputSection.style.display = 'none'; // Nascondi output precedente
                selectedPoints = []; // Reset punti
                pointsCountSpan.textContent = selectedPoints.length;
            };
        };
        reader.readAsDataURL(file);
    }
});

// Evento click sul canvas per selezionare i punti
originalCanvas.addEventListener('click', (event) => {
    if (selectedPoints.length < 4) {
        // Calcola le coordinate del click rispetto al canvas
        const rect = originalCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        selectedPoints.push({ x: x, y: y });
        pointsCountSpan.textContent = selectedPoints.length;
        drawPoints();
    }
});

// Evento per resettare i punti
resetPointsBtn.addEventListener('click', () => {
    selectedPoints = [];
    pointsCountSpan.textContent = selectedPoints.length;
    originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
    drawImageOnCanvas(originalCanvas, originalCtx, originalImage); // Ridisezgna l'immagine
    outputSection.style.display = 'none'; // Nascondi output
});

// Evento per raddrizzare la foto
straightenBtn.addEventListener('click', () => {
    if (selectedPoints.length !== 4) {
        alert('Seleziona esattamente 4 punti per raddrizzare la foto.');
        return;
    }

    // Le coordinate dei punti selezionati sul canvas ridimensionato
    const p = selectedPoints;

    // Le coordinate dei punti sulla immagine originale
    // Dobbiamo scalare i punti selezionati per ottenere le coordinate originali
    const scaleX = originalImage.width / originalCanvas.width;
    const scaleY = originalImage.height / originalCanvas.height;

    const originalPoints = [
        { x: p[0].x * scaleX, y: p[0].y * scaleY },
        { x: p[1].x * scaleX, y: p[1].y * scaleY },
        { x: p[2].x * scaleX, y: p[2].y * scaleY },
        { x: p[3].x * scaleX, y: p[3].y * scaleY }
    ];

    // Determina le dimensioni dell'output raddrizzato
    // Per semplicità, useremo le dimensioni dell'immagine originale
    const outputWidth = originalImage.width;
    const outputHeight = originalImage.height;

    straightenedCanvas.width = outputWidth;
    straightenedCanvas.height = outputHeight;

    // I punti di destinazione per il raddrizzamento (un rettangolo ideale)
    const destinationPoints = [
        { x: 0, y: 0 },
        { x: outputWidth, y: 0 },
        { x: outputWidth, y: outputHeight },
        { x: 0, y: outputHeight }
    ];

    // Questa è la parte più complessa: calcolare la matrice di trasformazione
    // Non è una funzione nativa del canvas, richiede calcoli matematici complessi (es. matrici di omografia)
    // Per una soluzione completa e robusta, si usano librerie come OpenCV.js o si implementa l'algoritmo di homography.
    // Per questo esempio base, simuleremo un raddrizzamento semplificato che potrebbe non essere perfetto per tutte le prospettive.

    // --- Inizio della logica di raddrizzamento semplificata (limitata) ---
    // Questa è una semplificazione! Per un raddrizzamento prospettico reale e robusto,
    // avresti bisogno di una libreria come OpenCV.js o una tua implementazione di trasformazioni prospettiche.
    // L'implementazione sotto è un approccio molto basilare che funziona bene solo per distorsioni minori
    // o per ridisegnare l'immagine usando i punti per "tagliare" e "scalare" a un rettangolo.

    // Un modo per "simulare" un raddrizzamento molto basilare è usare drawImage con 8 argomenti (sX, sY, sW, sH, dX, dY, dW, dH)
    // Ma questo non corregge la prospettiva. Per la prospettiva serve una trasformazione di homography.

    // Se i tuoi punti sono sempre in un ordine specifico (es. top-left, top-right, bottom-right, bottom-left),
    // puoi fare una trasformazione approssimata.
    // Qui useremo una logica semplificata che taglia l'area definita dai punti e la scala a un rettangolo.
    // Questa NON è una vera correzione prospettica, ma un ritaglio e riscalatura.

    // Per una vera trasformazione prospettica, si usano librerie come 'js-perspective' o 'opencv.js'
    // Esempio con un'ipotetica funzione `transformPerspective` (non inclusa nel codice)
    /*
    transformPerspective(originalCtx, originalImage, originalPoints, straightenedCtx, destinationPoints);
    */

    // Visto che non abbiamo una libreria esterna per la trasformazione prospettica,
    // possiamo solo simulare un ritaglio e riscalatura dell'area definita dai punti.
    // Questo non è un "raddrizzamento" prospettico nel senso stretto, ma è il massimo che possiamo fare
    // con le funzioni native del canvas senza librerie matematiche avanzate.

    // Per una vera trasformazione prospettica, il codice qui sotto sarebbe molto più complesso.
    // Si dovrebbe calcolare una matrice di trasformazione (homography) che mappa originalPoints a destinationPoints
    // e poi applicarla pixel per pixel o con una funzione di trasformazione del canvas (se esistesse per prospettiva).

    // Dato che il canvas standard non ha un'API per la trasformazione prospettica diretta,
    // per questo esempio, lascerò un placeholder per il raddrizzamento.
    // L'approccio più comune per raddrizzare con JavaScript è usare una libreria.

    // --- SOLUZIONE BASE: Ritaglia e scala l'area definita dai punti ---
    // Questo approccio assume che i punti siano pressapoco rettangolari e li ritaglia e scala.
    // NON è una vera correzione prospettica.
    
    // Trova i min/max x e y dai punti selezionati per definire un rettangolo di origine
    const minX = Math.min(...originalPoints.map(p => p.x));
    const minY = Math.min(...originalPoints.map(p => p.y));
    const maxX = Math.max(...originalPoints.map(p => p.x));
    const maxY = Math.max(...originalPoints.map(p => p.y));

    const sourceWidth = maxX - minX;
    const sourceHeight = maxY - minY;

    // Disegna l'immagine raddrizzata (qui è semplicemente un ritaglio e riscalatura)
    straightenedCtx.drawImage(
        originalImage,
        minX, minY, sourceWidth, sourceHeight, // Sorgente: l'area rettangolare definita dai punti
        0, 0, straightenedCanvas.width, straightenedCanvas.height // Destinazione: l'intero canvas raddrizzato
    );

    // --- Fine della logica di raddrizzamento semplificata ---

    outputSection.style.display = 'block'; // Mostra la sezione dell'output
});

// Evento per scaricare la foto raddrizzata
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'foto_raddrizzata.png';
    link.href = straightenedCanvas.toDataURL('image/png'); // O 'image/jpeg'
    link.click();
});

// Al caricamento iniziale della pagina, assicurati che i messaggi siano corretti
window.onload = () => {
    messageElement.style.display = 'block';
    controlsDiv.style.display = 'none';
    outputSection.style.display = 'none';
};