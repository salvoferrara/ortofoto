// Seleziona gli elementi HTML necessari usando il loro ID
const imageUpload = document.getElementById('imageUpload');     
const imageElement = document.getElementById('imageToProcess'); 
const canvas = document.getElementById('imageCanvas');         
const ctx = canvas.getContext('2d');                           

// Seleziona i nuovi elementi UI (pulsanti e paragrafi di stato)
const resetPointsBtn = document.getElementById('resetPointsBtn');
const processImageBtn = document.getElementById('processImageBtn');
const downloadImageBtn = document.getElementById('downloadImageBtn');
const statusMessage = document.getElementById('statusMessage');
const pointsCounter = document.getElementById('pointsCounter');

// Aggiungiamo un log iniziale per verificare se gli elementi UI vengono trovati al caricamento dello script
console.log("[DEBUG] Inizializzazione script.js:");
console.log(`[DEBUG] imageUpload: ${imageUpload ? 'trovato' : 'NON trovato'}`);
console.log(`[DEBUG] imageElement: ${imageElement ? 'trovato' : 'NON trovato'}`);
console.log(`[DEBUG] canvas: ${canvas ? 'trovato' : 'NON trovato'}`);
console.log(`[DEBUG] resetPointsBtn: ${resetPointsBtn ? 'trovato' : 'NON trovato'}`);
console.log(`[DEBUG] processImageBtn: ${processImageBtn ? 'trovato' : 'NON trovato'}`);
console.log(`[DEBUG] downloadImageBtn: ${downloadImageBtn ? 'trovato' : 'NON trovato'}`);
console.log(`[DEBUG] statusMessage: ${statusMessage ? 'trovato' : 'NON trovato'}`);
console.log(`[DEBUG] pointsCounter: ${pointsCounter ? 'trovato' : 'NON trovato'}`);


// Variabile per memorizzare i punti selezionati dall'utente
let points = []; 
const MAX_POINTS = 4; // Numero massimo di punti da selezionare per il raddrizzamento prospettico

// --- Funzioni di Utilità e UI ---

/**
 * Aggiorna il messaggio di stato, il contatore dei punti e la visibilità dei pulsanti.
 * Questa funzione è il cuore della gestione dell'interfaccia utente.
 */
function updateUIState() {
    // Verifichiamo che tutti gli elementi UI critici siano stati trovati
    // Se anche uno solo manca, significa che c'è un errore nell'HTML (ID sbagliato)
    if (!statusMessage || !pointsCounter || !resetPointsBtn || !processImageBtn || !downloadImageBtn) {
        console.error("[ERROR] updateUIState: Alcuni elementi UI non sono stati trovati! Verificare gli ID in index.html.");
        return; // Esci dalla funzione per evitare errori
    }

    // Se non c'è un'immagine caricata o le sue dimensioni non sono valide, mostra lo stato iniziale
    if (!imageElement.naturalWidth || imageElement.naturalWidth === 0) {
        statusMessage.textContent = "Seleziona un'immagine da caricare.";
        statusMessage.style.color = 'black';
        pointsCounter.style.display = 'none'; // Nasconde il contatore
        resetPointsBtn.style.display = 'none'; // Nasconde Reset
        processImageBtn.style.display = 'none'; // Nasconde Raddrizza
        downloadImageBtn.style.display = 'none'; // Nasconde Scarica
        return;
    }

    // Se l'immagine è caricata, mostra il contatore dei punti e il pulsante Reset
    pointsCounter.textContent = `Punti selezionati: ${points.length} di ${MAX_POINTS}`;
    pointsCounter.style.display = 'block';
    resetPointsBtn.style.display = 'inline-block'; // Mostra il pulsante Reset

    // Gestisce il messaggio di stato e la visibilità dei pulsanti Processa/Scarica
    in base al numero di punti selezionati.
    if (points.length < MAX_POINTS) {
        statusMessage.textContent = `Clicca sull'immagine per selezionare il punto ${points.length + 1}.`;
        statusMessage.style.color = 'blue';
        processImageBtn.style.display = 'none'; 
        downloadImageBtn.style.display = 'none'; 
    } else {
        statusMessage.textContent = `4 punti selezionati. Clicca su 'Raddrizza Immagine' per elaborare.`;
        statusMessage.style.color = 'green';
        processImageBtn.style.display = 'inline-block'; // Ora che abbiamo 4 punti, mostra il pulsante Processa
        downloadImageBtn.style.display = 'none'; // Nascondi Scarica finché non elaborato
    }
}

/**
 * Resetta la selezione dei punti, pulisce il canvas dai disegni e aggiorna l'interfaccia utente.
 */
function resetPoints() {
    points = []; // Svuota l'array dei punti
    drawPoints(); // Ridisegna il canvas (che ora sarà vuoto)
    updateUIState(); // Aggiorna i messaggi e i pulsanti
    console.log("[INFO] Punti di selezione resettati.");
}

/**
 * Ridimensiona il canvas alle dimensioni NATURALI (originali) dell'immagine.
 * Questo è FONDAMENTALE: il canvas avrà le stesse dimensioni del file immagine originale.
 * Il CSS si occuperà poi di scalare VISIVAMENTE sia l'immagine che il canvas.
 */
function resizeCanvasToNaturalSize() {
    // Utilizziamo un piccolo ritardo per assicurarci che il browser abbia avuto il tempo
    // di renderizzare completamente l'immagine e che naturalWidth/Height siano affidabili.
    setTimeout(() => {
        if (imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
            console.log(`[DEBUG] resizeCanvasToNaturalSize - Dimensioni Naturali: ${imageElement.naturalWidth}x${imageElement.naturalHeight}`);
            canvas.width = imageElement.naturalWidth;   // Imposta la larghezza del canvas
            canvas.height = imageElement.naturalHeight; // Imposta l'altezza del canvas
            drawPoints(); // Ridisegna i punti (se presenti) sul canvas ridimensionato
            updateUIState(); // Aggiorna lo stato UI dopo il ridimensionamento
        } else {
            // Se l'immagine non è valida, resetta il canvas e i punti.
            canvas.width = 0;
            canvas.height = 0;
            points = [];
            console.warn("[DEBUG] resizeCanvasToNaturalSize - Immagine non ha dimensioni naturali valide (ancora da caricare o errore).");
            updateUIState(); // Aggiorna lo stato UI anche in caso di non caricamento
        }
    }, 50); 
}

/**
 * Disegna tutti i punti memorizzati sul canvas.
 * Dato che il canvas ha le dimensioni naturali dell'immagine (grazie a resizeCanvasToNaturalSize),
 * i punti possono essere disegnati direttamente alle loro coordinate originali senza bisogno di scaling.
 */
function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Pulisce l'intero canvas prima di ridisegnare

    if (!imageElement.naturalWidth || points.length === 0) {
        return; // Non disegnare se non c'è un'immagine o non ci sono punti
    }

    ctx.fillStyle = 'red';     // Colore per riempire i punti
    ctx.strokeStyle = 'white'; // Colore per il bordo dei punti
    ctx.lineWidth = 2;         // Spessore del bordo

    // Itera su ogni punto memorizzato e disegna un cerchio
    points.forEach(point => {
        ctx.beginPath(); // Inizia un nuovo percorso di disegno
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2); // Disegna un cerchio di raggio 5
        ctx.fill();   // Riempi il cerchio
        ctx.stroke(); // Disegna il bordo
    });
}

// --- Gestione Caricamento Immagine ---

/**
 * Gestisce l'evento 'change' sull'input del file (quando l'utente seleziona un file).
 * Legge il file selezionato e imposta la sua URL come sorgente per l'elemento <img>.
 */
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Prende il primo file selezionato dall'utente

    if (file) {
        const reader = new FileReader(); // Crea un oggetto FileReader per leggere il contenuto del file

        reader.onload = (e) => {
            // Quando il file è stato letto, imposta l'URL risultante come sorgente dell'immagine.
            // Questo farà sì che il browser carichi e visualizzi l'immagine.
            imageElement.src = e.target.result; 
            points = []; // Resetta l'array dei punti per la nuova immagine
            // L'evento 'imageElement.onload' si attiverà automaticamente dopo che l'immagine
            // sarà stata caricata dal browser, e chiamerà resizeCanvasToNaturalSize() e updateUIState().
        };

        reader.readAsDataURL(file); // Legge il file come un URL di dati (Base64)
    }
});

// --- Gestione Eventi Immagine e Finestra ---

/**
 * Questo listener si attiva quando l'immagine nell'elemento <img> è stata
 * completamente caricata e decodificata dal browser.
 */
imageElement.onload = () => {
    console.log("[DEBUG] Evento imageElement.onload attivato.");
    // Una volta caricata l'immagine, ridimensioniamo il canvas alle sue dimensioni naturali.
    resizeCanvasToNaturalSize(); 
    // updateUIState() è già chiamato all'interno di resizeCanvasToNaturalSize,
    // quindi non è necessario chiamarlo esplicitamente anche qui.
};

/**
 * Questo blocco gestisce un caso particolare: se lo script viene caricato e
 * l'immagine è già presente nella cache del browser o è stata impostata molto rapidamente.
 * Assicura che `resizeCanvasToNaturalSize` e `updateUIState` vengano chiamate anche in questi scenari.
 */
if (imageElement.complete && imageElement.naturalWidth > 0) {
    console.log("[DEBUG] Immagine già completa al caricamento dello script.");
    resizeCanvasToNaturalSize();
    // updateUIState() è già chiamato all'interno di resizeCanvasToNaturalSize
}

/**
 * Event listener per il ridimensionamento della finestra del browser.
 * Quando la finestra viene ridimensionata, il CSS scala l'immagine e il canvas.
 * Dobbiamo solo ridisegnare i punti sul canvas per assicurarci che siano al posto giusto.
 */
window.addEventListener('resize', () => {
    drawPoints(); // Ridisegna i punti sul canvas scalato
    updateUIState(); // Aggiorna lo stato UI (es. i messaggi potrebbero aver bisogno di aggiornarsi)
});

// --- Gestione Click sul Canvas (Selezione Punti) ---

/**
 * Gestisce l'evento di click del mouse sul canvas.
 * Calcola la posizione del click, la converte in coordinate sull'immagine originale,
 * aggiunge il punto e aggiorna l'UI.
 */
canvas.addEventListener('click', (event) => {
    // Impedisce la selezione di punti se non c'è un'immagine valida caricata.
    if (!imageElement.naturalWidth || imageElement.naturalWidth === 0) {
        console.log("[DEBUG] Nessuna immagine caricata o dimensioni non valide. Impossibile selezionare il punto.");
        console.log(`[DEBUG] Dim. al click (natural): ${imageElement.naturalWidth}x${imageElement.naturalHeight}`);
        console.log(`[DEBUG] Dim. al click (client): ${imageElement.clientWidth}x${imageElement.clientHeight}`);
        return;
    }

    // Se abbiamo già selezionato il numero massimo di punti, impedisce ulteriori selezioni.
    if (points.length >= MAX_POINTS) {
        statusMessage.textContent = "Hai già selezionato 4 punti. Clicca su 'Raddrizza Immagine' o 'Reset Punti'.";
        statusMessage.style.color = 'orange';
        return; 
    }

    // Ottiene la posizione e le dimensioni del canvas rispetto alla finestra (viewport).
    const rect = canvas.getBoundingClientRect();
    
    // Calcola le coordinate X e Y del click, relative all'angolo superiore sinistro del canvas.
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    console.log(`[DEBUG] Click su Canvas (relative al canvas): (${clickX}, ${clickY})`);

    // Ottiene le dimensioni originali (intrinseche) dell'immagine.
    const originalImageWidth = imageElement.naturalWidth;
    const originalImageHeight = imageElement.naturalHeight;
    // Ottiene le dimensioni con cui l'immagine è attualmente visualizzata (scalata dal CSS).
    const displayedImageWidth = imageElement.clientWidth;
    const displayedImageHeight = imageElement.clientHeight;

    console.log(`[DEBUG] Immagine Originale: ${originalImageWidth}x${originalImageHeight}`);
    console.log(`[DEBUG] Immagine Visualizzata: ${displayedImageWidth}x${displayedImageHeight}`);


    // Calcola i fattori di scala per convertire le coordinate del click (sulla dimensione visualizzata)
    // alle coordinate corrispondenti sull'immagine originale.
    const scaleFactorX = (displayedImageWidth > 0) ? originalImageWidth / displayedImageWidth : 0;
    const scaleFactorY = (displayedImageHeight > 0) ? originalImageHeight / displayedImageHeight : 0;

    console.log(`[DEBUG] Fattori di Scala: X=${scaleFactorX}, Y=${scaleFactorY}`);

    // Applica i fattori di scala per ottenere le coordinate originali
    const originalImageCoordX = Math.round(clickX * scaleFactorX);
    const originalImageCoordY = Math.round(clickY * scaleFactorY);

    console.log(`[INFO] Punto selezionato sull'immagine originale: (${originalImageCoordX}, ${originalImageCoordY})`);

    // Aggiunge il nuovo punto alla lista
    points.push({ x: originalImageCoordX, y: originalImageCoordY });
    
    // Ridisegna tutti i punti e aggiorna lo stato dell'interfaccia utente
    drawPoints();
    updateUIState(); 
});

// --- Gestione Eventi Pulsanti ---

// Aggiunge un listener al pulsante "Reset Punti"
// Controllo che l'elemento esista prima di aggiungere l'event listener, per prevenire errori.
if (resetPointsBtn) {
    resetPointsBtn.addEventListener('click', resetPoints);
} else {
    console.error("[ERROR] Elemento 'resetPointsBtn' non trovato. Assicurarsi che l'ID in index.html sia corretto.");
}

// Aggiunge un listener al pulsante "Raddrizza Immagine"
if (processImageBtn) {
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
                // In un'implementazione reale, qui imposteresti l'URL dell'immagine raddrizzata per il download
            }, 2000); // Simula 2 secondi di elaborazione
        } else {
            statusMessage.textContent = "Seleziona esattamente 4 punti per raddrizzare l'immagine.";
            statusMessage.style.color = 'red';
        }
    });
} else {
    console.error("[ERROR] Elemento 'processImageBtn' non trovato. Assicurarsi che l'ID in index.html sia corretto.");
}

// Aggiunge un listener al pulsante "Scarica Immagine"
if (downloadImageBtn) {
    downloadImageBtn.addEventListener('click', () => {
        // *** QUI DOVRÀ ESSERE INSERITA LA LOGICA PER IL DOWNLOAD REALE DELL'IMMAGINE ELABORATA ***
        statusMessage.textContent = "Funzionalità di download non ancora implementata. (Simulazione)";
        statusMessage.style.color = 'orange';
    });
} else {
    console.error("[ERROR] Elemento 'downloadImageBtn' non trovato. Assicurarsi che l'ID in index.html sia corretto.");
}


// --- Inizializzazione ---
// Questa chiamata iniziale imposta lo stato corretto dell'interfaccia utente
// non appena la pagina viene caricata, prima che qualsiasi immagine sia selezionata.
// Aggiungiamo un piccolo ritardo per maggiore robustezza, assicurandoci che il DOM sia pronto.
setTimeout(() => {
    updateUIState();
}, 100);
