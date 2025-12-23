let order = {};

function showStep(id) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function nextToPackage() {
  const user = username.value.trim();
  if (!user || user.includes(" ")) return alert("Username tidak valid");

  order.username = user;
  order.password = password.value || randomPass();

  renderPackages();
  showStep("step-package");
}

function renderPackages() {
  packageList.innerHTML = "";
  CONFIG.packages.forEach(p => {
    const el = document.createElement("div");
    el.className = "pkg";
    el.innerHTML = `
      <b>${p.name}</b><br>
      RAM: ${p.ram || "Unlimited"}<br>
      CPU: ${p.cpu || "Unlimited"}<br>
      Disk: ${p.disk || "Unlimited"}<br>
      Harga: Rp ${p.price.toLocaleString()}
    `;
    el.onclick = () => selectPackage(p);
    packageList.appendChild(el);
  });
}

async function selectPackage(pkg) {
  order.package = pkg;

  const res = await fetch(CONFIG.payment.qrisEndpoint, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ amount: pkg.price })
  }).then(r => r.json());

  order.paymentId = res.id;
  qrisImg.src = res.qr;
  totalPay.textContent = "Rp " + res.total.toLocaleString();

  startTimer(CONFIG.payment.expiredMinutes * 60);
  checkPayment();
  showStep("step-payment");
}

function startTimer(sec) {
  const t = setInterval(() => {
    timer.textContent = `Sisa waktu: ${sec--} detik`;
    if (sec < 0) clearInterval(t);
  }, 1000);
}

async function checkPayment() {
  const i = setInterval(async () => {
    const res = await fetch(CONFIG.payment.checkEndpoint + "?id=" + order.paymentId).then(r => r.json());
    if (res.status === "paid") {
      clearInterval(i);
      provision();
    }
  }, 4000);
}

async function provision() {
  const res = await fetch(CONFIG.provisioning.createEndpoint, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(order)
  }).then(r => r.json());

  resultData.textContent = JSON.stringify(res, null, 2);
  panelLink.href = CONFIG.panel.domain;
  showStep("step-result");
}

function cancelPayment() {
  location.reload();
}

function randomPass() {
  return Math.random().toString(36).slice(-10) + "A!";
}