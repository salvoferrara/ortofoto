// Seleziona gli elementi HTML necessari usando il loro ID
const imageUpload = document.getElementById('imageUpload');     // L'input per caricare il file immagine
const imageElement = document.getElementById('imageToProcess'); // L'elemento <img> dove verrà mostrata l'immagine
const canvas = document.getElementById('imageCanvas');         // L'elemento <canvas> che si sovrapporrà all'immagine
const ctx = canvas.getContext('2d');                           // Il contesto 2D del canvas, usato per disegnare

// Variabile per memorizzare i punti selezionati dall'utente
let points = []; 

// --- Funzioni di Utilità ---

/**
 * Ridimensiona il canvas per adattarsi esattamente alle dimensioni visualizzate dell'immagine.
 * Questo è cruciale per far corrispondere i click del mouse all'immagine.
 */
function resizeCanvas() {
    // Aggiungiamo un piccolo ritardo (50ms) per dare al browser il tempo di renderizzare
    // completamente l'immagine dopo che il suo 'src' è stato impostato.
    // Questo aiuta a ottenere valori affidabili per naturalWidth/Height e clientWidth/Height.
    setTimeout(() => {
        // Controlla se l'immagine è stata caricata e ha dimensioni valide.
        // naturalWidth/Height sono le dimensioni originali del file immagine.
        if (imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
            // Log per debug: mostra le dimensioni dell'immagine così come sono nel browser
            console.log(`[DEBUG] Immagine caricata - Dimensioni Naturali: ${imageElement.naturalWidth}x${imageElement.naturalHeight}`);
            console.log(`[DEBUG] Immagine caricata - Dimensioni Visualizzate (clientWidth/Height): ${imageElement.clientWidth}x${imageElement.clientHeight}`);

            // Imposta la larghezza e l'altezza del canvas per corrispondere esattamente
            // alle dimensioni attuali (visualizzate) dell'elemento <img>.
            canvas.width = imageElement.clientWidth;
            canvas.height = imageElement.clientHeight;

            // Ridisegna tutti i punti sul canvas dopo che è stato ridimensionato.
            drawPoints();
        } else {
            // Se l'immagine non è ancora caricata o non ha dimensioni valide,
            // imposta il canvas a 0x0 per pulirlo e svuota la lista dei punti.
            canvas.width = 0;
            canvas.height = 0;
            points = [];
            console.warn("[DEBUG] L'immagine non ha dimensioni naturali valide (ancora da caricare o errore nel caricamento).");
        }
    }, 50); // Il ritardo in millisecondi
}

/**
 * Disegna tutti i punti memorizzati sull'immagine sul canvas.
 * Le coordinate dei punti vengono convertite dalle dimensioni originali dell'immagine
 * alle dimensioni attuali visualizzate sul canvas.
 */
function drawPoints() {
    // Pulisce l'intero canvas prima di disegnare nuovi punti
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Non disegnare se non c'è un'immagine o se non ci sono punti
    if (!imageElement.naturalWidth || points.length === 0) {
        return;
    }

    // Ottiene le dimensioni originali del file immagine
    const originalImageWidth = imageElement.naturalWidth;
    const originalImageHeight = imageElement.naturalHeight;
    // Ottiene le dimensioni con cui l'immagine è attualmente visualizzata (e il canvas è ridimensionato)
    const displayedImageWidth = imageElement.clientWidth;
    const displayedImageHeight = imageElement.clientHeight;

    // Calcola i fattori di scala per convertire le coordinate da "originali" a "visualizzate"
    const displayScaleFactorX = displayedImageWidth / originalImageWidth;
    const displayScaleFactorY = displayedImageHeight / originalImageHeight;

    // Imposta lo stile per i punti da disegnare (rosso con bordo bianco)
    ctx.fillStyle = 'red';     
    ctx.strokeStyle = 'white'; 
    ctx.lineWidth = 2;         

    // Per ogni punto memorizzato, calcola la posizione sul canvas e disegnalo
    points.forEach(point => {
        // Converte le coordinate del punto (che sono sull'immagine originale)
        // nelle coordinate corrette per il disegno sul canvas scalato.
        const displayX = point.x * displayScaleFactorX;
        const displayY = point.y * displayScaleFactorY;

        ctx.beginPath(); // Inizia un nuovo percorso di disegno
        ctx.arc(displayX, displayY, 5, 0, Math.PI * 2); // Disegna un cerchio (raggio 5 pixel)
        ctx.fill();   // Riempi il cerchio di rosso
        ctx.stroke(); // Disegna il bordo bianco del cerchio
    });
}

// --- Gestione Caricamento Immagine ---

/**
 * Gestisce l'evento di selezione di un file immagine dall'input.
 * Legge il file e lo imposta come sorgente per l'elemento <img>.
 */
imageUpload.addEventListener('change', (event) => {
    // Prende il primo file selezionato dall'utente
    const file = event.target.files[0]; 

    if (file) {
        // Crea un oggetto FileReader per leggere il contenuto del file
        const reader = new FileReader(); 

        // Definisce cosa fare quando il FileReader ha finito di leggere il file
        reader.onload = (e) => {
            // Imposta l'attributo 'src' dell'elemento <img> all'URL dei dati del file letto.
            // Questo fa sì che il browser carichi e visualizzi l'immagine.
            imageElement.src = e.target.result; 
            // Resetta l'array dei punti ogni volta che viene caricata una nuova immagine.
            points = []; 
            // La funzione 'imageElement.onload' (definita più in basso) si attiverà
            // automaticamente dopo che l'immagine è stata caricata e visualizzata.
        };

        // Avvia la lettura del file come un URL di dati (stringa Base64).
        reader.readAsDataURL(file);
    }
});

// --- Gestione Eventi Immagine e Finestra ---

/**
 * Event listener che si attiva quando l'immagine nell'elemento <img> è stata
 * completamente caricata e decodificata dal browser.
 */
imageElement.onload = () => {
    console.log("[DEBUG] Evento imageElement.onload attivato.");
    // Quando l'immagine è pronta, ridimensiona il canvas per adattarsi.
    resizeCanvas(); 
};

/**
 * Questo blocco gestisce il caso in cui lo script venga caricato e l'immagine
 * sia già presente nella cache del browser o sia stata impostata rapidamente.
 * Assicura che resizeCanvas venga chiamato anche in questi scenari.
 */
if (imageElement.complete && imageElement.naturalWidth > 0) {
    console.log("[DEBUG] Immagine già completa al caricamento dello script.");
    resizeCanvas();
}


/**
 * Event listener per il ridimensionamento della finestra del browser.
 * Questo assicura che il canvas e la posizione dei punti si adattino
 * se l'utente cambia la dimensione della finestra.
 */
window.addEventListener('resize', resizeCanvas);

// --- Gestione Click sul Canvas (Selezione Punti) ---

/**
 * Gestisce l'evento di click del mouse sul canvas.
 * Calcola la posizione del click e la converte in coordinate sull'immagine originale.
 */
canvas.addEventListener('click', (event) => {
    // Impedisce la selezione di punti se non c'è un'immagine valida caricata.
    if (!imageElement.naturalWidth || imageElement.naturalWidth === 0) {
        console.log("[DEBUG] Nessuna immagine caricata o dimensioni non valide. Impossibile selezionare il punto.");
        // Logga le dimensioni attuali per debug
        console.log(`[DEBUG] Dim. al click (natural): ${imageElement.naturalWidth}x${imageElement.naturalHeight}`);
        console.log(`[DEBUG] Dim. al click (client): ${imageElement.clientWidth}x${imageElement.clientHeight}`);
        return;
    }

    // Ottiene la posizione e le dimensioni del canvas rispetto alla finestra del browser.
    const rect = canvas.getBoundingClientRect();
    
    // Calcola le coordinate X e Y del click, relative all'angolo superiore sinistro del canvas.
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Log per debug: mostra le coordinate raw del click e le dimensioni del canvas.
    console.log(`[DEBUG] Click Raw su Canvas: (${event.clientX}, ${event.clientY})`);
    console.log(`[DEBUG] Canvas Rect: left=${rect.left}, top=${rect.top}, width=${rect.width}, height=${rect.height}`);
    console.log(`[DEBUG] Click su Canvas (relative al canvas): (${clickX}, ${clickY})`);


    // Ottiene le dimensioni originali (intrinseche) dell'immagine.
    const originalImageWidth = imageElement.naturalWidth;
    const originalImageHeight = imageElement.naturalHeight;
    // Ottiene le dimensioni con cui l'immagine è attualmente visualizzata nel browser.
    const displayedImageWidth = imageElement.clientWidth;
    const displayedImageHeight = imageElement.clientHeight;

    // Log per debug: mostra le dimensioni dell'immagine usate per il calcolo.
    console.log(`[DEBUG] Immagine Originale: ${originalImageWidth}x${originalImageHeight}`);
    console.log(`[DEBUG] Immagine Visualizzata: ${displayedImageWidth}x${displayedImageHeight}`);


    // Calcola i fattori di scala. Usiamo un controllo per evitare la divisione per zero.
    // Questi fattori convertono una coordinata dalla dimensione visualizzata a quella originale.
    const scaleFactorX = (displayedImageWidth > 0) ? originalImageWidth / displayedImageWidth : 0;
    const scaleFactorY = (displayedImageHeight > 0) ? originalImageHeight / displayedImageHeight : 0;

    // Log per debug: mostra i fattori di scala calcolati.
    console.log(`[DEBUG] Fattori di Scala: X=${scaleFactorX}, Y=${scaleFactorY}`);

    // Applica i fattori di scala alle coordinate del click (relative al canvas)
    // per ottenere le coordinate corrispondenti sull'immagine originale.
    const originalImageCoordX = Math.round(clickX * scaleFactorX);
    const originalImageCoordY = Math.round(clickY * scaleFactorY);

    // Log finale per il punto selezionato
    console.log(`[INFO] Click sul canvas (visualizzato): (${clickX}, ${clickY})`);
    console.log(`[INFO] Punto selezionato sull'immagine originale: (${originalImageCoordX}, ${originalImageCoordY})`);

    // Aggiunge il nuovo punto alla lista dei punti selezionati
    points.push({ x: originalImageCoordX, y: originalImageCoordY });
    
    // Ridisegna tutti i punti sul canvas, inclusi il nuovo punto
    drawPoints();
});