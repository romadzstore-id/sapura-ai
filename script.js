let state = {
  user: {},
  package: null,
  payment: null
};

function showStep(id) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function generatePassword() {
  return Math.random().toString(36).slice(-12) + "@#";
}

function nextToPackage() {
  const username = username.value.trim();
  if (!username || username.includes(" ")) return alert("Username invalid");

  state.user.username = username;
  state.user.password = password.value || generatePassword();

  renderPackages();
  showStep("step-2");
}

function renderPackages() {
  const list = document.getElementById("package-list");
  list.innerHTML = "";
  CONFIG.packages.forEach(p => {
    const div = document.createElement("div");
    div.className = "package";
    div.innerHTML = `<b>${p.nama}</b><br>RAM: ${p.ram || "Unlimited"}<br>Harga: ${p.harga}`;
    div.onclick = () => selectPackage(p, div);
    list.appendChild(div);
  });
}

function selectPackage(pkg, el) {
  document.querySelectorAll(".package").forEach(p => p.classList.remove("active"));
  el.classList.add("active");
  state.package = pkg;
  payBtn.disabled = false;
}

async function createPayment() {
  showStep("step-3");

  const res = await fetch(CONFIG.apiBase + "/create-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state)
  });

  const data = await res.json();
  state.payment = data;

  qrisImg.src = data.qr;
  totalPay.innerText = data.amount;

  startCountdown(300);
  pollPayment();
}

function startCountdown(sec) {
  const cd = document.getElementById("countdown");
  const timer = setInterval(() => {
    sec--;
    cd.innerText = `Sisa waktu: ${sec}s`;
    if (sec <= 0) {
      clearInterval(timer);
      cancelTransaction();
    }
  }, 1000);
}

async function pollPayment() {
  const interval = setInterval(async () => {
    const res = await fetch(CONFIG.apiBase + "/check-payment?id=" + state.payment.id);
    const data = await res.json();
    if (data.status === "PAID") {
      clearInterval(interval);
      activatePanel();
    }
  }, 5000);
}

async function activatePanel() {
  showStep("step-4");

  const res = await fetch(CONFIG.apiBase + "/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state)
  });

  const data = await res.json();
  result.innerText = JSON.stringify(data, null, 2);
  panelLink.href = CONFIG.panel.domain;

  showStep("step-5");
}

function cancelTransaction() {
  location.reload();
}