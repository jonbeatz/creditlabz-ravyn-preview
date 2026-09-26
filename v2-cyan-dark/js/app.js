const moneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function sumMoney(values) {
  const cents = values.reduce((total, value) => total + Math.round(Number(value) * 100), 0);
  return cents / 100;
}

function formatMoney(amount) {
  return moneyFormat.format(amount);
}

function formatStamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown dummy time";
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} · ${hours}:${minutes} UTC`;
}

function formatDay(isoDate) {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return `${day} ${months[month - 1]} ${year}`;
}

function daysBetween(asOfIso, deadline) {
  const start = String(asOfIso).slice(0, 10);
  const from = Date.parse(`${start}T00:00:00Z`);
  const to = Date.parse(`${deadline}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return null;
  return Math.round((to - from) / 86400000);
}

function countdownBits(days) {
  if (days === null) return { num: "—", unit: "unset" };
  if (days < 0) return { num: String(Math.abs(days)), unit: days === -1 ? "day overdue" : "days overdue" };
  if (days === 0) return { num: "0", unit: "today" };
  if (days === 1) return { num: "1", unit: "day" };
  return { num: String(days), unit: "days" };
}

function smoothLine(points) {
  const n = points.length;
  if (n < 2) return "";
  const fmt = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`;
  if (n === 2) return `M${fmt(points[0][0], points[0][1])} L${fmt(points[1][0], points[1][1])}`;

  const slope = [];
  const dx = [];
  for (let i = 0; i < n - 1; i += 1) {
    const deltaX = points[i + 1][0] - points[i][0] || 1;
    dx.push(deltaX);
    slope.push((points[i + 1][1] - points[i][1]) / deltaX);
  }

  const tangent = new Array(n);
  tangent[0] = slope[0];
  tangent[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i += 1) {
    tangent[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  }
  for (let i = 0; i < n - 1; i += 1) {
    if (Math.abs(slope[i]) < 1e-6) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const a = tangent[i] / slope[i];
    const b = tangent[i + 1] / slope[i];
    const hypot = a * a + b * b;
    if (hypot > 9) {
      const scale = 3 / Math.sqrt(hypot);
      tangent[i] = scale * a * slope[i];
      tangent[i + 1] = scale * b * slope[i];
    }
  }

  let path = `M${fmt(points[0][0], points[0][1])}`;
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const c1x = p0[0] + dx[i] / 3;
    const c1y = p0[1] + (tangent[i] * dx[i]) / 3;
    const c2x = p1[0] - dx[i] / 3;
    const c2y = p1[1] - (tangent[i + 1] * dx[i]) / 3;
    path += ` C${fmt(c1x, c1y)} ${fmt(c2x, c2y)} ${fmt(p1[0], p1[1])}`;
  }
  return path;
}

function sparkline(values, id) {
  if (!Array.isArray(values) || values.length < 2) return "";
  const width = 300;
  const height = 64;
  const baselineY = height - 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const plotTop = 14;
  const plotBottom = baselineY - 4;
  const coords = values.map((value, index) => {
    const x = (index / (values.length - 1)) * (width - 8) + 4;
    const y = plotBottom - ((value - min) / span) * (plotBottom - plotTop);
    return [x, y];
  });
  const line = smoothLine(coords);
  const first = coords[0];
  const last = coords[coords.length - 1];
  const area = `${line} L${last[0].toFixed(2)} ${baselineY.toFixed(2)} L${first[0].toFixed(2)} ${baselineY.toFixed(2)} Z`;
  const peakY = Math.min(...coords.map((point) => point[1]));
  const falling = values[values.length - 1] < values[0];
  const accent = falling ? "var(--violet)" : "var(--cyan)";
  const uid = `spark-${String(id || "trace").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "trace"}`;
  const trend = falling ? "lower" : "higher or level";
  return `
    <div class="trace">
      <p class="trace-label">
        Sample trace
        <span class="sr">Dummy series ends ${trend} than it starts.</span>
      </p>
      <svg class="spark ${falling ? "down" : "up"}" viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="${uid}-fill" gradientUnits="userSpaceOnUse" x1="0" y1="${peakY.toFixed(2)}" x2="0" y2="${baselineY.toFixed(2)}">
            <stop offset="0%" stop-color="${accent}" stop-opacity="0.4"></stop>
            <stop offset="100%" stop-color="${accent}" stop-opacity="0"></stop>
          </linearGradient>
          <linearGradient id="${uid}-edge" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${width}" y2="0">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.2"></stop>
            <stop offset="9%" stop-color="#ffffff" stop-opacity="1"></stop>
            <stop offset="93%" stop-color="#ffffff" stop-opacity="1"></stop>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.45"></stop>
          </linearGradient>
          <filter id="${uid}-glow" x="-25%" y="-90%" width="150%" height="280%" color-interpolation-filters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.4" result="wide"></feGaussianBlur>
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="tight"></feGaussianBlur>
            <feMerge>
              <feMergeNode in="wide"></feMergeNode>
              <feMergeNode in="tight"></feMergeNode>
            </feMerge>
          </filter>
          <mask id="${uid}-mask">
            <rect width="${width}" height="${height}" fill="url(#${uid}-edge)"></rect>
          </mask>
        </defs>
        <g mask="url(#${uid}-mask)">
          <line class="baseline" x1="2" y1="${baselineY.toFixed(2)}" x2="${width - 2}" y2="${baselineY.toFixed(2)}"></line>
          <path class="spark-area" d="${area}" fill="url(#${uid}-fill)"></path>
          <path class="spark-glow" d="${line}" filter="url(#${uid}-glow)"></path>
          <path class="spark-line" d="${line}"></path>
        </g>
        <circle class="spark-halo" cx="${last[0].toFixed(2)}" cy="${last[1].toFixed(2)}" r="6"></circle>
        <circle class="spark-dot" cx="${last[0].toFixed(2)}" cy="${last[1].toFixed(2)}" r="2.2"></circle>
      </svg>
    </div>`;
}

function badge(manual) {
  return manual
    ? '<span class="badge badge-manual">Manual</span>'
    : '<span class="badge">Live</span>';
}

function updatedLine(iso, status) {
  const statusClass = status && status !== "ok" ? "status-bad" : "status-ok";
  const statusText = status ? `<span class="${statusClass}">Status ${esc(status)}</span>` : "";
  return `<p class="card-foot"><time datetime="${esc(iso)}">Last updated ${esc(formatStamp(iso))}</time>${statusText}</p>`;
}

function renderSummary(data) {
  const liveTotal = sumMoney(data.live.map((item) => item.balance));
  const monthly = data.subscriptions.filter((item) => item.cadence === "monthly" && item.amount != null);
  const monthlyTotal = sumMoney(monthly.map((item) => item.amount));
  const flag = data.flags[0];
  const countdown = flag ? countdownBits(daysBetween(data.as_of, flag.deadline)) : null;
  const alertCard = flag
    ? `<a class="card summary-card summary-alert" href="#alerts">
        <p class="eyebrow">${esc(flag.urgency === "use_or_lose" ? "Use or lose" : flag.urgency)}</p>
        <p class="hero-figure">${esc(countdown.num)} <span class="unit">${esc(countdown.unit)}</span></p>
        <p class="meta">${esc(flag.label)} · ${esc(formatDay(flag.deadline))}</p>
      </a>`
    : `<article class="card summary-card">
        <p class="eyebrow">Alerts</p>
        <p class="hero-figure dim">None</p>
        <p class="meta">No dummy flags in the file.</p>
      </article>`;

  document.getElementById("summary").innerHTML = `
    <article class="card summary-card">
      <p class="eyebrow">Live float · USD</p>
      <p class="hero-figure" id="live-total">${esc(formatMoney(liveTotal))}</p>
      <p class="meta">${data.live.length} sample provider ${data.live.length === 1 ? "balance" : "balances"}</p>
    </article>
    <article class="card summary-card">
      <p class="eyebrow">Known monthly</p>
      <p class="hero-figure" id="monthly-total">${esc(formatMoney(monthlyTotal))}</p>
      <p class="meta">${monthly.length} priced subscription${monthly.length === 1 ? "" : "s"} · unlisted rows excluded</p>
    </article>
    ${alertCard}`;

  document.getElementById("asof").textContent = `Dummy as-of ${formatStamp(data.as_of)}`;
}

function renderLive(items) {
  const host = document.getElementById("live-grid");
  if (!items.length) {
    host.innerHTML = '<p class="empty">No dummy live balances.</p>';
    return;
  }
  host.innerHTML = items.map((item, index) => `
    <article class="card live-card">
      <div class="card-top">
        <h3 class="service">${esc(item.label)}</h3>
        ${badge(false)}
      </div>
      <div class="figure-row">
        <p class="figure">${esc(formatMoney(item.balance))}</p>
        <span class="currency">${esc(item.currency || "USD")}</span>
      </div>
      ${sparkline(item.spark, `${item.id || "trace"}-${index}`)}
      ${updatedLine(item.updated_at, item.status)}
    </article>
  `).join("");
}

function manualFigure(item) {
  if (item.amount == null) {
    const label = /tbd/i.test(item.note || "") ? "TBD" : "—";
    return `<p class="amount"><span class="figure dim">${label}</span></p>`;
  }
  const cadence = item.cadence === "monthly" ? '<span class="cadence">/mo</span>' : "";
  return `<p class="amount"><span class="figure">${esc(formatMoney(item.amount))}</span>${cadence}</p>`;
}

function manualNote(item) {
  const parts = [];
  if (item.renew_day != null) parts.push(`Renews on day ${item.renew_day}`);
  if (item.note) parts.push(item.note);
  if (!parts.length) return "";
  return `<p class="note">${esc(parts.join(" · "))}</p>`;
}

function renderManual(items) {
  const host = document.getElementById("manual-list");
  if (!items.length) {
    host.innerHTML = '<p class="empty">No dummy subscriptions.</p>';
    return;
  }
  host.innerHTML = items.map((item) => `
    <article class="card ledger">
      ${badge(true)}
      <h3 class="service">${esc(item.label)}</h3>
      ${manualNote(item)}
      ${manualFigure(item)}
      ${updatedLine(item.updated_at, null)}
    </article>
  `).join("");
}

function renderAlerts(data) {
  const host = document.getElementById("alert-list");
  if (!data.flags.length) {
    host.innerHTML = '<p class="empty">No dummy alerts.</p>';
    return;
  }
  host.innerHTML = data.flags.map((flag, index) => {
    const days = daysBetween(data.as_of, flag.deadline);
    const countdown = countdownBits(days);
    const count = countdown.num;
    const unit = days != null && days > 0 ? `${countdown.unit} left` : countdown.unit;
    const ticks = days > 0
      ? `<div class="ticks" aria-hidden="true">${"<span></span>".repeat(Math.min(days, 12))}</div>`
      : "";
    const urgent = flag.urgency === "use_or_lose";
    return `
      <article class="card alert-card">
        <div class="alert-count">
          <p class="eyebrow">${urgent ? "Use or lose" : esc(flag.urgency || "Flag")}</p>
          <p class="hero-figure"${index === 0 ? ' id="alert-days"' : ""}>${esc(count)}</p>
          <p class="eyebrow">${esc(unit)}</p>
          ${ticks}
        </div>
        <div class="alert-copy">
          <span class="badge ${urgent ? "badge-urgent" : "badge-manual"}">${esc(urgent ? "Use or lose" : (flag.urgency || "flag"))}</span>
          <h3>${esc(flag.label)}</h3>
          <p class="deadline">Deadline ${esc(formatDay(flag.deadline))}</p>
          <p>${esc(flag.detail || "Dummy flag.")} Counted from the fake as-of timestamp, not from a live clock.</p>
        </div>
      </article>`;
  }).join("");
}

function fail(message) {
  const summary = document.getElementById("summary");
  if (summary) summary.innerHTML = `<p class="error">${esc(message)}</p>`;
}

async function init() {
  try {
    const response = await fetch("data/balances.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load data/balances.json");
    const data = await response.json();
    if (!data.prototype) throw new Error("Refusing to render because prototype is not true");
    if (!Array.isArray(data.live) || !Array.isArray(data.subscriptions) || !Array.isArray(data.flags)) {
      throw new Error("Dummy ledger is missing live, subscriptions, or flags");
    }
    renderSummary(data);
    renderLive(data.live);
    renderManual(data.subscriptions);
    renderAlerts(data);
    document.body.classList.add("ready");
  } catch (error) {
    fail(`${error.message}. Serve this folder over HTTP so the dummy JSON can load.`);
  }
}

init();
