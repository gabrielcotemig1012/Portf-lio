var botao = document.getElementById("botao-sol-lua");

botao.addEventListener("click", function () {
    document.body.classList.toggle("claro");

    if (document.body.classList.contains("claro")) {
        botao.textContent = "☀️";
    } else {
        botao.textContent = "🌙";
    }
});


var secoes = ["comeco", "quem-sou-eu", "minha-historia", "meus-sites", "fala-comigo"];
var btnRolar = document.getElementById("botao-descer");

function secaoAtual() {
    var atual = 0;

    for (var i = 0; i < secoes.length; i++) {
        var parte = document.getElementById(secoes[i]);
        if (parte.getBoundingClientRect().top <= window.innerHeight / 2) {
            atual = i;
        }
    }

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 5) {
        atual = secoes.length - 1;
    }

    return atual;
}

function atualizarSeta() {
    if (secaoAtual() === secoes.length - 1) {
        btnRolar.textContent = "↑";
    } else {
        btnRolar.textContent = "↓";
    }
}

btnRolar.addEventListener("click", function () {
    var atual = secaoAtual();
    var destino;

    if (atual === secoes.length - 1) {
        destino = document.getElementById(secoes[0]);
    } else {
        destino = document.getElementById(secoes[atual + 1]);
    }

    destino.scrollIntoView();
});

window.addEventListener("scroll", atualizarSeta);
atualizarSeta();


var canvas = document.createElement("canvas");
canvas.id = "fundo-das-bolhas";
document.body.prepend(canvas);
var ctx = canvas.getContext("2d");

var nomes = document.querySelectorAll(".nome h1");

var paletas = {
    dark:  { base: [0, 0, 0],       base2: [0, 20, 50],     bolha: [0, 90, 255],  alpha: 0.35 },
    light: { base: [255, 255, 255], base2: [225, 238, 255], bolha: [40, 120, 255], alpha: 0.28 }
};

var mistura = document.body.classList.contains("claro") ? 1 : 0;

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function misturaCor(c1, c2, t) {
    return c1.map(function (v, i) {
        return Math.round(lerp(v, c2[i], t));
    });
}

function rgb(c) {
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
}

var L, A;
function redimensionar() {
    var dpr = window.devicePixelRatio || 1;
    L = window.innerWidth;
    A = window.innerHeight;
    canvas.width = L * dpr;
    canvas.height = A * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", redimensionar);
redimensionar();

var bolhas = [];
for (var n = 0; n < 7; n++) {
    bolhas.push({
        x: Math.random() * L,
        y: Math.random() * A,
        raio: 150 + Math.random() * 250,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6
    });
}

function desenhar() {
    var alvo = document.body.classList.contains("claro") ? 1 : 0;
    mistura += (alvo - mistura) * 0.05;

    var base  = misturaCor(paletas.dark.base,  paletas.light.base,  mistura);
    var base2 = misturaCor(paletas.dark.base2, paletas.light.base2, mistura);
    var cor   = misturaCor(paletas.dark.bolha, paletas.light.bolha, mistura);
    var alpha = lerp(paletas.dark.alpha, paletas.light.alpha, mistura);

    var corTexto = misturaCor([255, 255, 255], [0, 0, 0], mistura);
    var corNome  = misturaCor([255, 255, 255], [0, 0, 0], mistura);

    document.body.style.color = rgb(corTexto);
    for (var k = 0; k < nomes.length; k++) {
        nomes[k].style.color = rgb(corNome);
    }

    var grad = ctx.createLinearGradient(0, 0, L, A);
    grad.addColorStop(0, rgb(base));
    grad.addColorStop(1, rgb(base2));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, L, A);

    for (var i = 0; i < bolhas.length; i++) {
        var b = bolhas[i];

        b.x += b.vx;
        b.y += b.vy;

        if (b.x < -b.raio) b.x = L + b.raio;
        if (b.x > L + b.raio) b.x = -b.raio;
        if (b.y < -b.raio) b.y = A + b.raio;
        if (b.y > A + b.raio) b.y = -b.raio;

        var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.raio);
        g.addColorStop(0, "rgba(" + cor[0] + "," + cor[1] + "," + cor[2] + "," + alpha + ")");
        g.addColorStop(1, "rgba(" + cor[0] + "," + cor[1] + "," + cor[2] + ",0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.raio, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(desenhar);
}
desenhar();
