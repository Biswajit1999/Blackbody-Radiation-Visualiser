const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const tempSlider = document.getElementById("temperature");
const tempValue = document.getElementById("tempValue");
const peakValue = document.getElementById("peakValue");
const colourTrend = document.getElementById("colourTrend");

const B = 2.897771955e6; // Wien constant in nm K

const referenceCurves = [
  { T: 3000, label: "3000 K", colour: "#ef4444" },
  { T: 5000, label: "5000 K", colour: "#f97316" },
  { T: 8000, label: "8000 K", colour: "#e5e7eb" }
];

function planckRelative(lambdaNm, T) {
  const lambda = lambdaNm * 1e-9;
  const h = 6.62607015e-34;
  const c = 2.99792458e8;
  const k = 1.380649e-23;

  const exponent = (h * c) / (lambda * k * T);
  return (1 / Math.pow(lambda, 5)) / (Math.exp(exponent) - 1);
}

function wavelengthToX(lambda) {
  const min = 100;
  const max = 3000;
  return 80 + ((lambda - min) / (max - min)) * 840;
}

function intensityToY(value) {
  return 450 - value * 330;
}

function getStarColour(T) {
  if (T < 3700) return "#ff7b3d";
  if (T < 5200) return "#ffb347";
  if (T < 6500) return "#fff4bf";
  if (T < 8500) return "#dbeafe";
  return "#93c5fd";
}

function getColourText(T) {
  if (T < 3700) return "Red-orange";
  if (T < 5200) return "Orange-yellow";
  if (T < 6500) return "Yellow-white";
  if (T < 8500) return "White-blue";
  return "Blue-white";
}

function drawStarsBackground() {
  for (let i = 0; i < 150; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.55})`;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1.1, 1.1);
  }
}

function drawVisibleSpectrum() {
  const x0 = wavelengthToX(380);
  const x1 = wavelengthToX(750);

  const grad = ctx.createLinearGradient(x0, 0, x1, 0);
  grad.addColorStop(0, "#4f46e5");
  grad.addColorStop(0.2, "#2563eb");
  grad.addColorStop(0.4, "#22c55e");
  grad.addColorStop(0.65, "#facc15");
  grad.addColorStop(0.82, "#f97316");
  grad.addColorStop(1, "#ef4444");

  ctx.fillStyle = grad;
  ctx.fillRect(x0, 470, x1 - x0, 24);

  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.strokeRect(x0, 470, x1 - x0, 24);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "14px Arial";
  ctx.fillText("Visible light: 380–750 nm", x0 + 75, 512);
}

function drawCurve(T, colour, lineWidth = 3, alpha = 1) {
  const values = [];
  let maxI = 0;

  for (let lambda = 100; lambda <= 3000; lambda += 5) {
    const I = planckRelative(lambda, T);
    values.push({ lambda, I });
    if (I > maxI) maxI = I;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  values.forEach((p, i) => {
    const x = wavelengthToX(p.lambda);
    const y = intensityToY(p.I / maxI);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
  ctx.restore();
}

function drawPeakMarker(T, colour, labelPrefix = "") {
  const peak = B / T;
  const x = wavelengthToX(peak);

  ctx.save();
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);

  ctx.beginPath();
  ctx.moveTo(x, 160);
  ctx.lineTo(x, 450);
  ctx.stroke();

  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.arc(x, 160, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "13px Arial";
  ctx.fillText(`${labelPrefix}${T} K`, x + 8, 155);
  ctx.fillText(`λmax ≈ ${peak.toFixed(0)} nm`, x + 8, 172);

  ctx.restore();
}

function drawStar(T) {
  const cx = 500;
  const cy = 95;
  const colour = getStarColour(T);

  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 85);
  glow.addColorStop(0, "#ffffff");
  glow.addColorStop(0.18, colour);
  glow.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 85, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "16px Arial";
  ctx.fillText("User-selected stellar temperature", 390, 30);
}

function drawAxes() {
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(80, 450);
  ctx.lineTo(920, 450);
  ctx.moveTo(80, 450);
  ctx.lineTo(80, 160);
  ctx.stroke();

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "15px Arial";
  ctx.fillText("Wavelength (nm)", 430, 540);

  ctx.save();
  ctx.translate(30, 350);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Normalised relative intensity", 0, 0);
  ctx.restore();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px Arial";

  const ticks = [100, 380, 750, 1500, 3000];
  ticks.forEach(tick => {
    const x = wavelengthToX(tick);
    ctx.beginPath();
    ctx.moveTo(x, 450);
    ctx.lineTo(x, 458);
    ctx.stroke();
    ctx.fillText(`${tick}`, x - 14, 474);
  });
}

function drawLegend(userT) {
  const x = 720;
  const y = 80;

  ctx.fillStyle = "rgba(2,6,23,0.75)";
  ctx.strokeStyle = "rgba(148,163,184,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x - 18, y - 28, 210, 130, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "14px Arial";
  ctx.fillText("Reference curves", x, y - 8);

  const items = [
    { label: "3000 K", colour: "#ef4444" },
    { label: "5000 K", colour: "#f97316" },
    { label: "8000 K", colour: "#e5e7eb" },
    { label: `User: ${userT} K`, colour: getStarColour(userT) }
  ];

  items.forEach((item, i) => {
    const yy = y + 18 + i * 22;
    ctx.strokeStyle = item.colour;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, yy);
    ctx.lineTo(x + 32, yy);
    ctx.stroke();

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "13px Arial";
    ctx.fillText(item.label, x + 42, yy + 4);
  });
}

function drawTemperatureArrow() {
  ctx.strokeStyle = "#93c5fd";
  ctx.fillStyle = "#93c5fd";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(640, 135);
  ctx.lineTo(410, 135);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(400, 135);
  ctx.lineTo(420, 125);
  ctx.lineTo(420, 145);
  ctx.fill();

  ctx.font = "14px Arial";
  ctx.fillText("Hotter stars peak at shorter wavelengths", 360, 122);
}

function update() {
  const T = Number(tempSlider.value);
  const peak = B / T;

  tempValue.textContent = T.toFixed(0);
  peakValue.textContent = `${peak.toFixed(1)} nm`;
  colourTrend.textContent = getColourText(T);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStarsBackground();
  drawStar(T);
  drawAxes();
  drawVisibleSpectrum();

  referenceCurves.forEach(curve => {
    drawCurve(curve.T, curve.colour, 2.5, 0.65);
    drawPeakMarker(curve.T, curve.colour);
  });

  drawCurve(T, getStarColour(T), 5, 1);
  drawPeakMarker(T, getStarColour(T), "User ");

  drawTemperatureArrow();
  drawLegend(T);
}

document.querySelectorAll("button[data-t]").forEach(button => {
  button.addEventListener("click", () => {
    tempSlider.value = button.dataset.t;
    update();
  });
});

tempSlider.addEventListener("input", update);
update();
