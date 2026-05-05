const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const tempSlider = document.getElementById("temperature");
const tempValue = document.getElementById("tempValue");
const peakValue = document.getElementById("peakValue");
const colourTrend = document.getElementById("colourTrend");

const B = 2.897771955e6;

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

function drawStars() {
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

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Arial";
  ctx.fillText("Visible light", x0 + 110, 512);
}

function drawCurve(T) {
  const values = [];
  let maxI = 0;

  for (let lambda = 100; lambda <= 3000; lambda += 5) {
    const I = planckRelative(lambda, T);
    values.push({ lambda, I });
    if (I > maxI) maxI = I;
  }

  ctx.strokeStyle = getStarColour(T);
  ctx.lineWidth = 4;
  ctx.beginPath();

  values.forEach((p, i) => {
    const x = wavelengthToX(p.lambda);
    const y = intensityToY(p.I / maxI);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

function drawStar(T) {
  const cx = 500;
  const cy = 105;
  const colour = getStarColour(T);

  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 90);
  glow.addColorStop(0, "#ffffff");
  glow.addColorStop(0.18, colour);
  glow.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 90, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(cx, cy, 36, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "16px Arial";
  ctx.fillText("Stellar colour changes with temperature", 370, 32);
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
  ctx.fillText("Relative intensity", 0, 0);
  ctx.restore();

  ctx.fillStyle = "#94a3b8";
  ctx.fillText("100 nm", 70, 468);
  ctx.fillText("3000 nm", 870, 468);
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

  drawStars();
  drawStar(T);
  drawAxes();
  drawVisibleSpectrum();
  drawCurve(T);

  const peakX = wavelengthToX(peak);
  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(peakX, 160);
  ctx.lineTo(peakX, 450);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#facc15";
  ctx.font = "15px Arial";
  ctx.fillText(`Peak: ${peak.toFixed(1)} nm`, peakX + 10, 185);
}

document.querySelectorAll("button[data-t]").forEach(button => {
  button.addEventListener("click", () => {
    tempSlider.value = button.dataset.t;
    update();
  });
});

tempSlider.addEventListener("input", update);
update();
