const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let desenhando = false;
let botaoAtual = 0; // 0 = esquerdo, 2 = direito

canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('mousedown', (e) => {
    desenhando = true;
    botaoAtual = e.button;
});
canvas.addEventListener('mouseup', () => desenhando = false);
canvas.addEventListener('mousemove', desenhar);

function desenhar(event) {
    if (!desenhando) return;

    if (botaoAtual === 0) {
        ctx.fillStyle = 'white'; // botão esquerdo = desenha
    } else if (botaoAtual === 2) {
        ctx.fillStyle = 'black'; // botão direito = apaga
    }

    ctx.beginPath();
    ctx.arc(event.offsetX, event.offsetY, 10, 0, Math.PI * 2);
    ctx.fill();

    atualizarMiniCanvas();
}

function realcarMaiorProbabilidade() {
    const paragrafos = document.querySelectorAll('#resultado-container p');

    // 1) Descobrir quem tem o maior número
    let maxValor = -Infinity;
    let pMaior = null;

    paragrafos.forEach(p => {
        const valor = parseFloat(
            p.querySelector('span').textContent.replace('%', '')
        );                     // "87.52%" → 87.52
        if (valor > maxValor) {
            maxValor = valor;
            pMaior = p;
        }
    });

    // 2) Tirar a classe de todos, deixar só no maior
    paragrafos.forEach(p => p.classList.remove('maior'));
    if (pMaior) pMaior.classList.add('maior');
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    atualizarMiniCanvas();
    for (i = 0; i < 10; i++) {
        document.getElementById(`chance-${i}`).innerText = '0.00%';
    }
}

function atualizarMiniCanvas() {
    const miniCanvas = document.getElementById('mini-canvas');
    const miniCtx = miniCanvas.getContext('2d');

    const img = new Image();
    img.src = canvas.toDataURL();

    img.onload = () => {
        miniCtx.clearRect(0, 0, 28, 28);
        miniCtx.drawImage(img, 0, 0, 28, 28);
    };
}

function enviar() {
    const img = canvas.toDataURL(); // base64
    fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: img })
    })
        .then(res => res.json())
        .then(data => {
            for (i = 0; i < 10; i++) {
                document.getElementById(`chance-${i}`).innerText = data[`chance-${i}`].toFixed(2) + '%';
            }
            realcarMaiorProbabilidade();
        });
}

clearCanvas();

document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        clearCanvas();
    }
});

setInterval(() => {
    enviar();
}, 50);