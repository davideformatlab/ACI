
gsap.registerPlugin(ScrollTrigger);

// Progress bar
gsap.to("#progressBar", {
  width: "100%", ease: "none",
  scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 0 }
});

// Parallasse background
gsap.to(".bg-image", {
  yPercent: 20, ease: "none",
  scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: true }
});

// Animazioni page-1
const tl = gsap.timeline();
tl.to("#title-1", { duration: 1.2, opacity: 1, y: 0, ease: "power4.out" })
  .to("#line-1", { duration: 1, width: "150px", ease: "expo.out" }, "-=0.8")
  .to("#sub-1", { duration: 1, opacity: 1 }, "-=0.6");

function animScroll(id, originX) {
  let xVal = window.innerWidth < 768 ? 0 : originX;
  let yVal = window.innerWidth < 768 ? 30 : 0;
  gsap.fromTo(id,
    { opacity: 0, x: xVal, y: yVal },
    {
      scrollTrigger: { trigger: id, start: "top 85%", toggleActions: "play none none reverse" },
      duration: 0.8, opacity: 1, x: 0, y: 0, ease: "power2.out"
    }
  );
}

animScroll("#p1-text-1", -50);
animScroll("#p1-card-1", 50);
animScroll("#p1-text-2", -50);
animScroll("#p1-card-2", 50);
animScroll("#p1-text-3", -50);
animScroll("#p1-card-3", 50);

// Animazione Box Istruzioni (Mascotte)
gsap.to("#instructions", {
  scrollTrigger: {
    trigger: "#instructions", start: "top 85%", toggleActions: "play none none reverse"
  },
  duration: 1, opacity: 1, y: 0, ease: "back.out(1.2)"
});

// -------------------------
// CHART JS LOGIC
// -------------------------
const years = [2000, 2005, 2010, 2015, 2020, 2024];

const datasets = [
  {
    label: "Totale",
    color: "rgba(52, 73, 94, 1)",
    dimColor: "rgba(52, 73, 94, 0.2)",
    tension: 0.3,
    data: [100, 96.3, 97.2, 82.3, 70.5, 77.6]
  },
  {
    label: "Acquisto Auto",
    color: "rgba(46, 204, 113, 1)",
    dimColor: "rgba(46, 204, 113, 0.2)",
    tension: 0.3,
    data: [100, 86.6, 87.1, 82.3, 67.8, 77.6]
  },
  {
    label: "Carburante",
    color: "rgba(241, 196, 15, 1)",
    dimColor: "rgba(241, 196, 15, 0.25)",
    tension: 0.3,
    data: [100, 113.2, 115.3, 92.0, 74.7, 89.0]
  },
  {
    label: "Pedaggi",
    color: "rgba(231, 76, 60, 1)",
    dimColor: "rgba(231, 76, 60, 0.25)",
    tension: 0.3,
    data: [100, 117.0, 131.9, 145.7, 161.2, 149.3]
  }
];

const seriesDescriptions = {
  "Totale": {
    title: "Totale spese di esercizio",
    text: "Il totale delle spese di esercizio, in termini reali, scende rispetto al 2000: l’indice passa da 100 a circa 78 punti nel 2024. Significa che, complessivamente, possedere e usare un’auto pesa meno sul bilancio familiare rispetto a inizio anni Duemila."
  },
  "Acquisto Auto": {
    title: "Acquisto dell’auto (interessi inclusi)",
    text: "La componente di acquisto mostra un calo ancora più netto: dal livello 100 nel 2000 scende a poco meno di 70 punti nel 2020, per poi risalire verso 78 nel 2024. I tassi bassi e le dinamiche di prezzo hanno alleggerito il costo reale di acquisto, anche se l’ultimo triennio segna un’inversione di tendenza."
  },
  "Carburante": {
    title: "Carburante",
    text: "Dopo una fase iniziale di rincaro, il carburante torna su livelli inferiori alla base 2000: nel 2024 l’indice è intorno a 89. Efficienza dei motori, minori percorrenze e una parziale ricalibrazione dei prezzi alla pompa attenuano l’impatto di questa voce sul totale."
  },
  "Pedaggi": {
    title: "Pedaggi autostradali",
    text: "I pedaggi sono la vera eccezione: la curva sale costantemente sopra 130–160 punti, e nel 2024 l’indice è vicino a 150, cioè quasi il 50% in più rispetto al 2000. Per chi usa spesso l’autostrada, questa è la voce che più ha eroso il potere d’acquisto nel tempo."
  }
};

const seriesColorMap = datasets.reduce((acc, ds) => { acc[ds.label] = ds.color; return acc; }, {});

function applyHighlightStylesToArray(dsArray, activeLabel) {
  dsArray.forEach(ds => {
    const isActive = ds.label === activeLabel;
    ds.borderWidth = isActive ? 4 : 2;
    ds.borderColor = isActive ? ds.color : ds.dimColor;
    ds.pointRadius = isActive ? 4 : 1;
    ds.pointHoverRadius = isActive ? 5 : 2;
    ds.pointBackgroundColor = isActive ? ds.color : ds.dimColor;
    ds.pointBorderColor = isActive ? ds.color : ds.dimColor;
  });
}

function withAlpha(rgbaString, alpha) {
  return rgbaString.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[^)]+\)/, (match, r, g, b) => `rgba(${r}, ${g}, ${b}, ${alpha})`);
}

const steps = document.querySelectorAll("#scrolly .step");
const captionEl = document.getElementById("chart-caption");
const ctxChart = document.getElementById("chart").getContext("2d");

let chart;
let currentActiveLabel = "Totale";

function updateHighlight(label) {
  if (!chart) return;
  applyHighlightStylesToArray(chart.data.datasets, label);
  chart.update();
}

function updateCaption(label) {
  const info = seriesDescriptions[label];
  if (info) {
    captionEl.innerHTML = `<div class="caption-label">${label}</div><h3>${info.title}</h3><p>${info.text}</p>`;
    const baseColor = seriesColorMap[label];
    if (baseColor) {
      const glassBg = withAlpha(baseColor, 0.10);
      const borderCol = withAlpha(baseColor, 0.45);
      const shadowCol = withAlpha(baseColor, 0.25);
      captionEl.style.background = glassBg;
      captionEl.style.borderColor = borderCol;
      captionEl.style.boxShadow = `0 10px 25px ${shadowCol}`;
      const captionLabelEl = captionEl.querySelector(".caption-label");
      if (captionLabelEl) captionLabelEl.style.color = borderCol;
    }
  } else {
    captionEl.innerHTML = ""; captionEl.removeAttribute("style");
  }
}

function setActiveFromNarrative(label) {
  currentActiveLabel = label;
  updateHighlight(label);
  updateCaption(label);
}

function setActiveStep(element, { scrollIntoView = false } = {}) {
  const seriesLabel = element.dataset.series;
  steps.forEach(step => {
    step.classList.remove("is-active");
    step.style.borderLeftColor = "#ccc";
  });
  element.classList.add("is-active");
  const activeColor = seriesColorMap[seriesLabel];
  if (activeColor) element.style.borderLeftColor = activeColor;
  setActiveFromNarrative(seriesLabel);
  if (scrollIntoView) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

applyHighlightStylesToArray(datasets, currentActiveLabel);

const chartConfig = {
  type: "line",
  data: { labels: years, datasets: datasets.map(ds => ({ ...ds })) },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true, labels: { boxWidth: 14 },
        onClick: (evt, legendItem, legend) => {
          const label = legendItem.text;
          const targetStep = Array.from(steps).find(step => step.dataset.series === label);
          if (targetStep) setActiveStep(targetStep, { scrollIntoView: true });
          else setActiveFromNarrative(label);
        },
        onHover: (evt) => { if (evt?.native?.target) evt.native.target.style.cursor = "pointer"; },
        onLeave: (evt) => { if (evt?.native?.target) evt.native.target.style.cursor = "default"; }
      },
      title: { display: true, text: "Indice spese auto (2000 = 100)", font: { size: 16 } }
    },
    scales: { y: { beginAtZero: false } }
  }
};

chart = new Chart(ctxChart, chartConfig);

// --- INTERSECTION OBSERVER OTTIMIZZATO ---
const observerOptions = {
  root: null,
  // "rootMargin" crea una linea di attivazione al centro dello schermo.
  // -45% top e -45% bottom significa che l'evento scatta solo nel 10% centrale.
  rootMargin: '-45% 0px -45% 0px',
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setActiveStep(entry.target);
    }
  });
}, observerOptions);

steps.forEach(step => observer.observe(step));

const firstStep = steps[0];
if (firstStep) setActiveStep(firstStep, { scrollIntoView: false });
else setActiveFromNarrative(currentActiveLabel);
