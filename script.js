const colors = [
    ["Verde hoja", "#88b04b", "Espinaca", "Tritura espinaca con muy poquita agua y cuela. ¡Usa el líquido como tinta fresca! 🌿"],
    ["Amarillo Sol", "#f6d55c", "Cúrcuma", "Mezcla cúrcuma en polvo con unas gotitas de agua hasta hacer una pasta suave ✨"],
    ["Rosa Floral", "#ff8b94", "Jamaica", "Hierve flores de jamaica en poca agua, cuela y deja enfriar. ¡Queda un rosa precioso! 🌸"],
    ["Café Cacao", "#8d5b4c", "Cacao", "Mezcla cacao sin azúcar con un poco de agua hasta formar una cremita para pintar 🍫"],
    ["Morado Mágico", "#a288e3", "Col morada", "Calienta hojitas de col morada en agua y cuela. ¡Es un color lavanda hermoso! 💜✨"],
    ["Naranja Dulce", "#ffaaa5", "Achiote", "Deja semillas de achiote en un poquito de aceite o agua tibia para liberar su color 🍊"],
    ["Gris Nube", "#555555", "Carbón vegetal", "Tritura carbón vegetal súper bien y mézclalo con agua para tonos sombreados ☁️"]
];

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let color = colors[0][1];
let tool = "brush";
let drawing = false;
let strokePoints = [];

ctx.lineCap = "round";
ctx.lineJoin = "round";

function openPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    window.scrollTo(0, 0);
}

function setTool(t) {
    tool = t;
    document.getElementById("brush").classList.toggle("active", t === "brush");
    document.getElementById("eraser").classList.toggle("active", t === "eraser");
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    strokePoints = [];
}

function saveCanvas() {
    const link = document.createElement("a");
    link.download = "mi-arte-cute-ods12.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

function getPoint(e) {
    const r = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - r.left) * canvas.width / r.width,
        y: (e.clientY - r.top) * canvas.height / r.height
    };
}

canvas.addEventListener("pointerdown", e => {
    drawing = true;
    const p = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", e => {
    if(!drawing) return;
    const p = getPoint(e);
    const opacity = document.getElementById("brushOpacity").value;
    
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = tool === "eraser" ? "white" : color;
    ctx.lineWidth = document.getElementById("brushSize").value;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);

    if(tool === "brush") {
        strokePoints.push({ x: p.x, y: p.y });
    }
});

canvas.addEventListener("pointerup", () => { drawing = false; ctx.globalAlpha = 1.0; });
canvas.addEventListener("pointercancel", () => { drawing = false; ctx.globalAlpha = 1.0; });

function startScanMelody() {
    if (strokePoints.length === 0) {
        alert("( 737 ) ¡Dibuja algo bonito primero para escuchar su melodía angelical!");
        return;
    }

    const scannerLine = document.getElementById("scanner-line");
    scannerLine.style.display = "block";

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    let scanX = 0;
    const maxwidth = canvas.width;
    const scanSpeed = 1.8; 

    const celestialFrequencies = [
        261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99  
    ];

    const scanInterval = setInterval(() => {
        scanX += scanSpeed;
        
        let percent = (scanX / maxwidth) * 100;
        scannerLine.style.left = percent + "%";

        let activePoints = strokePoints.filter(p => Math.abs(p.x - scanX) <= scanSpeed * 1.5);

        if (activePoints.length > 0) {
            let avgY = activePoints.reduce((sum, p) => sum + p.y, 0) / activePoints.length;
            
            let index = Math.floor(((canvas.height - avgY) / canvas.height) * celestialFrequencies.length);
            index = Math.max(0, Math.min(index, celestialFrequencies.length - 1));
            let freq = celestialFrequencies[index];

            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();

            osc.type = "sine"; 
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.08); 
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6); 

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.6);
        }

        if (scanX >= maxwidth) {
            clearInterval(scanInterval);
            scannerLine.style.display = "none";
        }
    }, 25);
}

function selectColor(c) {
    color = c[1];
    setTool("brush");
    document.getElementById("info").innerHTML = 
        "<h3>" + c[0] + " (◕‿◕✿)</h3>" +
        "<div class='swatch' style='background:" + c[1] + "'></div>" +
        "<p><b>Material:</b> " + c[2] + "</p>" +
        "<p class='recipe'>" + c[3] + "</p>" +
        "<p>♻️ <i>Recuerda preparar solo lo que vayas a usar.</i></p>";
}

function makeColorButton(c) {
    const b = document.createElement("button");
    b.className = "colorBtn";
    b.innerHTML = "<span class='dot' style='background:" + c[1] + "'></span>" + c[0];
    b.onclick = () => selectColor(c);
    return b;
}

colors.forEach(c => {
    document.getElementById("palette").appendChild(makeColorButton(c));
});

clearCanvas();

/* --- LÓGICA REVISADA DEL LABORATORIO DE ALQUIMIA --- */
let selectedIngredients = [];
const draggables = document.querySelectorAll(".draggable-item");
const mixingZone = document.getElementById("mixingZone");
const cauldronLiquid = document.getElementById("cauldronLiquid");
const droppedItemsDiv = document.getElementById("droppedItems");
const labMessage = document.getElementById("labMessage");

draggables.forEach(item => {
    item.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", JSON.stringify({
            name: item.dataset.name,
            type: item.dataset.type,
            color: item.dataset.color
        }));
    });
});

mixingZone.addEventListener("dragover", e => {
    e.preventDefault();
    mixingZone.classList.add("hovered");
});

mixingZone.addEventListener("dragleave", () => {
    mixingZone.classList.remove("hovered");
});

mixingZone.addEventListener("drop", e => {
    e.preventDefault();
    mixingZone.classList.remove("hovered");
    
    if(selectedIngredients.length >= 2) return;

    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    selectedIngredients.push(data);
    updateLabUI();
});

function createBubbles() {
    const container = document.getElementById("bubbles");
    container.innerHTML = "";
    for(let i = 0; i < 6; i++) {
        const b = document.createElement("div");
        b.className = "bubble";
        b.style.left = (20 + i * 12) + "px";
        b.style.width = (6 + Math.random() * 8) + "px";
        b.style.height = b.style.width;
        b.style.animationDelay = (Math.random() * 1.5) + "s";
        container.appendChild(b);
    }
}

function updateLabUI() {
    droppedItemsDiv.innerHTML = "";
    selectedIngredients.forEach(item => {
        const tag = document.createElement("span");
        tag.className = "tag-item";
        tag.textContent = "✨ " + item.name;
        droppedItemsDiv.appendChild(tag);
    });

    if(selectedIngredients.length === 1) {
        labMessage.innerHTML = "<h3>¡Agrega un segundo ingrediente! 🫧</h3><p>(⁠✿⁠^⁠‿⁠^⁠) Falta un modificador o vegetal para iniciar el cambio de pH...</p>";
    } else if(selectedIngredients.length === 2) {
        processMix();
    }
}

function processMix() {
    createBubbles();
    labMessage.innerHTML = "<h3>🧪 Reaccionando... ✨</h3><p>(๑˃̵ᴗ˂̵)b ¡Calculando estructura química y pigmentación!</p>";

    setTimeout(() => {
        const item1 = selectedIngredients[0];
        const item2 = selectedIngredients[1];
        const names = [item1.name, item2.name];
        const types = [item1.type, item2.type];

        let finalColor = "#ffe5ec";
        let colorName = "Mezcla Neutra Botánica";
        let desc = "Una infusión equilibrada sin variación extrema de pH.";

        // MATRIZ EXACTA DE REACCIONES DE pH (CIENTÍFICAMENTE COMPROBADA)
        if (names.includes("Cúrcuma")) {
            if (types.includes("alcalino")) { // Cúrcuma + Bicarbonato
                finalColor = "#c83232";
                colorName = "Rojo Rubí Alquímico (Álcali)";
                desc = "¡La curcumina de la cúrcuma cambia de amarillo a un rojo intenso al reaccionar con un medio básico (pH > 8)! 🌾✨";
            } else { // Cúrcuma + Ácido/Neutro
                finalColor = "#f6d55c";
                colorName = "Amarillo Sol Brillante (Ácido/Neutro)";
                desc = "La curcumina conserva su pigmento amarillo natural en ambientes neutros o ácidos. ☀️✨";
            }
        } 
        else if (names.includes("Col Morada")) {
            if (types.includes("acido")) { // Col + Limón / Vinagre
                finalColor = "#ff3366";
                colorName = "Rosa Fucsia Ácido (pH < 4)";
                desc = "¡Las antocianinas de la col morada reaccionan con los protones del ácido virando a fucsia brillante! 🌸✨";
            } else if (types.includes("alcalino")) { // Col + Bicarbonato
                finalColor = "#00a896";
                colorName = "Azul Turquesa Alcalino (pH > 8)";
                desc = "¡El medio básico alcaliniza la mezcla haciendo que la antocianina tome un tono turquesa/verde místico! 🌊✨";
            } else {
                finalColor = "#a288e3";
                colorName = "Morado Lavanda Mágico";
                desc = "La col morada pura en agua neutra mantiene su tono violáceo natural. 💜✨";
            }
        }
        else if (names.includes("Jamaica")) {
            if (types.includes("acido")) { // Jamaica + Limón / Vinagre
                finalColor = "#ff6b8b";
                colorName = "Rosa Coral Neón (Ácido)";
                desc = "¡La acidez del cítrico intensifica el brillo carmesí de los cálices de jamaica a un rosa radiante! 🌺✨";
            } else if (types.includes("alcalino")) { // Jamaica + Bicarbonato
                finalColor = "#5a189a";
                colorName = "Morado Noche Profundo (Álcali)";
                desc = "¡Los minerales alcalinos alteran las antocianinas del hibisco tornándolo púrpura oscuro! 🌌✨";
            } else {
                finalColor = "#ff8b94";
                colorName = "Rojo Jamaica Clásico";
                desc = "Infusión botánica pura en su nivel de concentración original. 🔴✨";
            }
        }
        else if (names.includes("Espinaca")) {
            if (types.includes("acido") || types.includes("alcalino")) {
                finalColor = "#556b2f";
                colorName = "Verde Olivo Místico";
                desc = "La alteración del pH desgasta ligeramente el magnesio de la clorofila creando un tono verde tierra. 🍃✨";
            } else {
                finalColor = "#88b04b";
                colorName = "Verde Hoja Orgánico";
                desc = "Clorofila vegetal pura sin alteración de pH. 🌿✨";
            }
        }
        else if (names.includes("Carbón Vegetal")) {
            finalColor = "#4a4a4a";
            colorName = "Tinta Carbonosa Gris Nube";
            desc = "El carbón es un pigmento inerte: mantiene su color sombreado sin importar el pH. ☁️✨";
        }

        cauldronLiquid.style.fill = finalColor;
        
        labMessage.innerHTML = 
            "<h3 style='color:" + (finalColor === '#ffe5ec' ? '#ff6b8b' : finalColor) + "; font-size:20px;'>✨ ¡Color Obtendo: " + colorName + "! ✨</h3>" +
            "<p class='recipe'>" + desc + "</p>" +
            "<p>🧪 <b>¡Tono listo y sintetizado en tu caldero ecofriendly!</b> (੭˃ᴗ˂)੭</p>";
    }, 700);
}

function resetLab() {
    selectedIngredients = [];
    cauldronLiquid.style.fill = "#ffe5ec";
    document.getElementById("bubbles").innerHTML = "";
    droppedItemsDiv.innerHTML = "";
    labMessage.innerHTML = "<h3>¡Arrastra aquí tus ingredientes! ✨</h3><p>(๑˃̵ᴗ˂̵)b Suelta 2 insumos dentro del caldero alquímico...</p>";
}

function createMandala(type) {
    const c = document.createElement("canvas");
    c.className = "mandala";
    c.width = 500;
    c.height = 500;
    const x = c.getContext("2d");
    
    x.fillStyle = "white";
    x.fillRect(0, 0, 500, 500);
    x.strokeStyle = "#b58dae";
    x.lineWidth = 3;

    for(let ring = 0; ring < 4; ring++) {
        let radius = 50 + ring * 45;
        for(let i = 0; i < 12; i++) {
            let a = i * Math.PI * 2 / 12;
            x.save();
            x.translate(250, 250);
            x.rotate(a);
            x.beginPath();

            if(type === 0) x.ellipse(radius, 0, 30 - ring * 4, 14, 0, 0, Math.PI * 2);
            if(type === 1) {
                x.moveTo(radius + 27, 0);
                x.quadraticCurveTo(radius, -25, radius - 27, 0);
                x.quadraticCurveTo(radius, 25, radius + 27, 0);
            }
            if(type === 2) {
                x.arc(radius, 0, 17, 0, Math.PI * 2);
                x.moveTo(radius - 12, 0);
                x.quadraticCurveTo(radius, 20, radius + 12, 0);
            }
            if(type === 3) {
                x.arc(radius, 0, 20, 0, Math.PI * 2);
                x.moveTo(radius - 12, -12);
                x.lineTo(radius + 12, 12);
            }

            x.stroke();
            x.restore();
        }
    }

    x.beginPath();
    x.arc(250, 250, 42, 0, Math.PI * 2);
    x.stroke();

    x.beginPath();
    x.arc(250, 250, 14, 0, Math.PI * 2);
    x.stroke();

    return c;
}

const names = [
    "Bosque Encantado 🌿",
    "Gotitas de Agua 💧",
    "Semillitas Mágicas 🌱",
    "Espirales Dulces ✨"
];

names.forEach((name, i) => {
    appendMandalaCard(name, createMandala(i));
});

function appendMandalaCard(title, mandalaCanvas) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = "<h3>" + title + "</h3>";
    
    card.appendChild(mandalaCanvas);

    const b = document.createElement("button");
    b.className = "choose";
    b.textContent = "🎨 ¡Colorear esta mandala! ( 737 )";

    b.onclick = () => {
        openPage("taller");
        setTimeout(() => {
            clearCanvas();
            ctx.drawImage(mandalaCanvas, 0, 0, canvas.width, canvas.height);
        }, 50);
    };

    card.appendChild(b);
    document.getElementById("mandalasGrid").appendChild(card);
}

function addRandomMandala() {
    const randomType = Math.floor(Math.random() * 4);
    const count = document.querySelectorAll(".card").length + 1;
    appendMandalaCard("Mandala Generativa Random #" + count + " ✨", createMandala(randomType));
}
