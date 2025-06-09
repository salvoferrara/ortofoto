// Seleziona gli elementi HTML necessari usando il loro ID
const imageUpload = document.getElementById('imageUpload');     
const imageElement = document.getElementById('imageToProcess'); 
const canvas = document.getElementById('imageCanvas');         
const ctx = canvas.getContext('2d');                           

const resetPointsBtn = document.getElementById('resetPointsBtn');
const processImageBtn = document.getElementById('processImageBtn');
const downloadImageBtn = document.getElementById('downloadImageBtn');
const statusMessage = document.getElementById('statusMessage');
const pointsCounter = document.getElementById('pointsCounter');

// Variabile per memorizzare i punti selezionati dall'utente
let points = []; 
const MAX_POINTS = 4; // Numero massimo di punti da selezionare (per il raddrizzamento prospettico)

// --- Funzioni di Utilità e UI ---

/**
 * Aggiorna il messaggio di stato e il contatore dei punti visibile all'utente,
 * e mostra/nasconde i pulsanti di controllo.
 */
function updateUIState() {
    // Se non c'è un'immagine caricata, mostra lo stato iniziale
    if (!imageElement.naturalWidth || imageElement.naturalWidth === 0) {
        statusMessage.textContent = "Seleziona un'immagine da caricare.";
        statusMessage.style.color = 'black';
        pointsCounter.style.display = 'none';
        resetPointsBtn.style.display = 'none';
        processImageBtn.style.display = 'none';
        downloadImageBtn.style.display = 'none';
        return;
    }

    // L'immagine è caricata, mostra il contatore e il pulsante Reset
    pointsCounter.textContent = `Punti selezionati: ${points.length} di ${MAX_POINTS}`;
    pointsCounter.style.display = 'block';
    resetPointsBtn.style.display = 'inline-block'; 

    // Gestisce lo stato in base al numero di punti selezionati
    if (points.length < MAX_POINTS) {
        statusMessage.textContent = `Clicca sull'immagine per selezionare il punto ${points.length + 1}.`;
        statusMessage.style.color = 'blue';
        processImageBtn.style.display = 'none'; // Nascondi Processa finché non ci sono abbastanza punti
        downloadImageBtn.style.display = 'none'; // Nascondi Scarica
    } else {
        statusMessage.textContent = `4 punti selezionati. Clicca su 'Raddrizza Immagine' per elaborare.`;
        statusMessage.style.color = 'green';
        processImageBtn.style.display = 'inline-block'; // Mostra il pulsante Processa
        downloadImageBtn.style.display = 'none'; // Nascondi Scarica finché non elaborato
    }
}

/**
 * Resetta la selezione dei punti, pulisce il canvas e aggiorna l'interfaccia utente.
 */
function resetPoints() {
    points = [];
    drawPoints(); // Pulisce il canvas
    updateUIState(); // Aggiorna lo stato UI al reset
    console.log("[INFO] Punti di selezione resettati.");
}

/**
 * Ridimensiona il canvas alle dimensioni NATURALI (originali) dell'immagine.
 * Questo è cruciale per la logica di calcolo dei punti. Il CSS si occuperà dello scaling visivo.
 */
function resizeCanvasToNaturalSize() {
    // Aggiungiamo un piccolo ritardo (50ms) per dare al browser il tempo di renderizzare
    // completamente l'immagine e calcolare le sue dimensioni finali.
    setTimeout(() => {
        if (imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
            console.log(`[DEBUG] resizeCanvasToNaturalSize - Dimensioni Naturali: ${imageElement.naturalWidth}x${imageElement.naturalHeight}`);
            // Imposta la larghezza e l'altezza del canvas per corrispondere esattamente
            // alle dimensioni originali del file immagine.
            canvas.width = imageElement.naturalWidth;
            canvas.height = imageElement.naturalHeight;
            drawPoints();
            updateUIState(); // Aggiorna lo stato UI dopo il ridimensionamento
        } else {
            // Se l'immagine non è ancora caricata o non ha dimensioni valide,
            // imposta il canvas a 0x0 per pulirlo e svuota la lista dei punti.
            canvas.width = 0;
            canvas.height = 0;
            points = [];
            console.warn("[DEBUG] resizeCanvasToNaturalSize - Immagine non ha dimensioni naturali valide.");
            updateUIState(); // Aggiorna lo stato UI anche in caso di non caricamento
        }
    }, 50); 
}

/**
 * Disegna tutti i punti memorizzati sul canvas.
 * Poiché il canvas è ridimensionato alle dimensioni naturali dell'immagine (via JS),
 * e poi scalato visivamente dal CSS, i punti possono essere disegnati direttamente
 * senza ulteriore scaling qui.
 */
function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Pulisce l'intero canvas

    // Non disegnare se non c'è un'immagine o se non ci sono punti
    if (!imageElement.naturalWidth || points.length === 0) {
        return;
    }

    ctx.fillStyle = 'red';     // Colore di riempimento per i punti
    ctx.strokeStyle = 'white'; // Colore del contorno per i punti
    ctx.lineWidth = 2;         // Spessore del contorno

    // Per ogni punto memorizzato, disegnalo sul canvas
    points.forEach(point => {
        ctx.beginPath(); // Inizia un nuovo percorso di disegno
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2); // Disegna un cerchio (raggio 5 pixel)
        ctx.fill();   // Riempi il cerchio di rosso
        ctx.stroke(); // Disegna il bordo bianco del cerchio
    });
}

// --- Gestione Caricamento Immagine ---

/**
 * Gestisce l'evento 'change' sull'input del file.
 * Legge il file selezionato dall'utente e lo visualizza nell'elemento <img>.
 */
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Prende il primo file selezionato

    if (file) {
        const reader = new FileReader(); // Crea un oggetto FileReader per leggere il contenuto del file

        // Funzione che si attiva quando il FileReader ha finito di leggere il file
        reader.onload = (e) => {
            imageElement.src = e.target.result; // Imposta la sorgente dell'elemento <img> all'URL del file
            points = []; // Resetta i punti ogni volta che una nuova immagine viene caricata
            // L'evento 'imageElement.onload' si attiverà automaticamente dopo che l'immagine
            // sarà stata completamente caricata e visualizzata dal browser.
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
    resizeCanvasToNaturalSize(); // Ridimensiona il canvas per adattarsi alla nuova immagine
    updateUIState(); // Aggiorna lo stato UI dopo il caricamento dell'immagine
};

/**
 * Questo blocco gestisce il caso in cui lo script venga caricato e l'immagine
 * sia già presente nella cache del browser o sia stata impostata rapidamente.
 * Assicura che resizeCanvasToNaturalSize venga chiamato anche in questi scenari.
 */
if (imageElement.complete && imageElement.naturalWidth > 0) {
    console.log("[DEBUG] Immagine già completa al caricamento dello script.");
    resizeCanvasToNaturalSize();
    updateUIState(); // Aggiorna lo stato UI se l'immagine è già pronta
}

/**
 * Event listener per il ridimensionamento della finestra del browser.
 * Quando la finestra viene ridimensionata, le dimensioni visualizzate del contenitore
 * e dell'immagine cambiano (gestite dal CSS). Dobbiamo solo ridisegnare i punti
 * per assicurarci che siano al posto giusto sul canvas scalato visivamente.
 */
window.addEventListener('resize', () => {
    drawPoints(); 
    updateUIState(); // Aggiorna lo stato UI in caso di ridimensionamento (es. il messaggio)
});

// --- Gestione Click sul Canvas (Selezione Punti) ---

/**
 * Gestisce l'evento di click del mouse sul canvas.
 * Calcola la posizione del click e la converte in coordinate sull'immagine originale,
 * quindi aggiunge il punto e aggiorna l'UI.
 */
canvas.addEventListener('click', (event) => {
    // Impedisce la selezione di punti se non c'è un'immagine valida caricata.
    if (!imageElement.naturalWidth || imageElement.naturalWidth === 0) {
        console.log("[DEBUG] Nessuna immagine caricata o dimensioni non valide. Impossibile selezionare il punto.");
        console.log(`[DEBUG] Dim. al click (natural): ${imageElement.naturalWidth}x${imageElement.naturalHeight}`);
        console.log(`[DEBUG] Dim. al click (client): ${imageElement.clientWidth}x${imageElement.clientHeight}`);
        return;
    }

    // Se abbiamo già selezionato il numero massimo di punti, non permettere altri click per la selezione.
    if (points.length >= MAX_POINTS) {
        statusMessage.textContent = "Hai già selezionato 4 punti. Clicca su 'Raddrizza Immagine' o 'Reset Punti'.";
        statusMessage.style.color = 'orange';
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
    // Queste sono le stesse dimensioni del canvas (canvas.width, canvas.height).
    const originalImageWidth = imageElement.naturalWidth;
    const originalImageHeight = imageElement.naturalHeight;
    // Ottiene le dimensioni con cui l'immagine è attualmente visualizzata nel browser.
    // Queste dimensioni sono quelle che il CSS sta scalando.
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

    console.log(`[INFO] Click sul canvas (visualizzato): (${clickX}, ${clickY})`);
    console.log(`[INFO] Punto selezionato sull'immagine originale: (${originalImageCoordX}, ${originalImageCoordY})`);

    // Aggiunge il nuovo punto alla lista dei punti selezionati
    points.push({ x: originalImageCoordX, y: originalImageCoordY });
    
    // Ridisegna tutti i punti sul canvas, incluso il nuovo punto
    drawPoints();
    // Aggiorna lo stato dell'interfaccia utente (contatore, messaggi, pulsanti)
    updateUIState(); 
});

// --- Gestione Eventi Pulsanti ---

// Listener per il pulsante "Reset Punti"
resetPointsBtn.addEventListener('click', resetPoints);

// Listener per il pulsante "Raddrizza Immagine"
processImageBtn.addEventListener('click', () => {
    if (points.length === MAX_POINTS) {
        statusMessage.textContent = "Elaborazione immagine in corso...";
        statusMessage.style.color = 'purple';
        processImageBtn.disabled = true; // Disabilita il pulsante durante l'elaborazione

        // *** QUI DOVRÀ ESSERE INSERITA LA LOGICA REALE PER IL RADDRIZZAMENTO ***
        // Per ora, simula un ritardo per mostrare il flusso
        setTimeout(() => {
            statusMessage.textContent = "Immagine raddrizzata! Puoi scaricarla.";
            statusMessage.style.color = 'green';
            processImageBtn.disabled = false; // Riabilita il pulsante dopo l'elaborazione
            downloadImageBtn.style.display = 'inline-block'; // Mostra il pulsante "Scarica"
            // Qui dovremmo impostare l'URL dell'immagine raddrizzata per il download
            // Ad esempio: downloadImageBtn.href = "URL_DELL_IMMAGINE_RADRIZZATA";
        }, 2000); // Simula 2 secondi di elaborazione
    } else {
        statusMessage.textContent = "Seleziona esattamente 4 punti per raddrizzare l'immagine.";
        statusMessage.style.color = 'red';
    }
});

// Listener per il pulsante "Scarica Immagine" (al momento non ha una funzionalità di download reale)
downloadImageBtn.addEventListener('click', () => {
    // *** QUI DOVRÀ ESSERE INSERITA LA LOGICA PER IL DOWNLOAD REALE ***
    // Se l'immagine raddrizzata fosse su un canvas separato, potresti fare:
    // const downloadLink = document.createElement('a');
    // downloadLink.href = canvasRaddrizzato.toDataURL('image/png'); // O 'image/jpeg'
    // downloadLink.download = 'immagine_raddrizzata.png';
    // document.body.appendChild(downloadLink);
    // downloadLink.click();
    // document.body.removeChild(downloadLink);
    statusMessage.textContent = "Funzionalità di download non ancora implementata.";
    statusMessage.style.color = 'orange';
});


// --- Inizializzazione ---
// Chiama updateUIState all'inizio per impostare lo stato iniziale corretto della UI
updateUIState();