const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const state = {
  data: null,
  selectedId: null,
};

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

function formatMoney(amount, digits) {
  const value = Number(amount);
  const places = digits == null ? (Math.round(value * 100) % 100 === 0 ? 0 : 2) : digits;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  }).format(value);
}

function parts(iso) {
  const [year, month, day] = String(iso).slice(0, 10).split("-").map(Number);
  return { year, month, day };
}

function formatLong(iso) {
  const { year, month, day } = parts(iso);
  if (!year || !month || !day) return String(iso);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

function formatRange(startIso, endIso) {
  const start = parts(startIso);
  const end = parts(endIso);
  if (start.year === end.year && start.month === end.month) {
    return `${MONTHS[start.month - 1]} ${start.day}–${end.day}, ${end.year}`;
  }
  return `${formatLong(startIso)} – ${formatLong(endIso)}`;
}

function formatStamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown dummy time";
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${formatLong(iso)} · ${hours}:${minutes} UTC`;
}

function addDays(iso, days) {
  const { year, month, day } = parts(iso);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function accountsOf(data) {
  return [...data.live, ...data.manual];
}

function findAccount(id) {
  return accountsOf(state.data).find((item) => item.id === id) || null;
}

function markHtml(item) {
  const wide = String(item.monogram || "").length > 1 ? " mark-wide" : "";
  return `<span class="mark${wide}" aria-hidden="true">${esc(item.monogram || "")}</span>`;
}

function identityClass(item) {
  return item.identity === "grokbot" ? " is-grokbot" : "";
}

function resetLines(item) {
  const lines = [];
  if (item.renews_on) lines.push(`Renews ${formatLong(item.renews_on)}`);
  if (item.resets_on) lines.push(`Resets ${formatLong(item.resets_on)}`);
  if (item.weekly_resets_on) lines.push(`Resets ${formatLong(item.weekly_resets_on)}`);
  if (item.ondemand_resets_on) lines.push(`Resets ${formatLong(item.ondemand_resets_on)}`);
  if (item.cashback) lines.push(`${item.cashback.label} ${formatLong(item.cashback.date)}`);
  return lines;
}

function renderMetrics(data) {
  const liveTotal = sumMoney(data.live.map((item) => item.balance));
  const usageTotal = sumMoney(data.live.flatMap((item) => item.usage));
  const monthly = data.manual.filter((item) => item.cadence === "monthly" && item.amount != null);
  const monthlyTotal = sumMoney(monthly.map((item) => item.amount));
  const configured = accountsOf(data).filter((item) => item.configured).length;
  const total = accountsOf(data).length;
  const connCaption = configured === 0
    ? "None authenticated · sample slots only"
    : "Authenticated sample slots";

  document.getElementById("metrics").innerHTML = `
    <article class="metric">
      <p class="eyebrow">Available API credit</p>
      <p class="figure" id="metric-credit">${esc(formatMoney(liveTotal, 2))}</p>
      <p class="meta">Across ${data.live.length} sample live-capable accounts</p>
    </article>
    <article class="metric">
      <p class="eyebrow">September API usage</p>
      <p class="figure" id="metric-usage">${esc(formatMoney(usageTotal, 2))}</p>
      <p class="meta">Illustrative 12-day window</p>
    </article>
    <article class="metric">
      <p class="eyebrow">Known subscriptions</p>
      <p class="figure" id="metric-subs">${esc(formatMoney(monthlyTotal))}<span class="per">/mo</span></p>
      <p class="meta">${monthly.length} priced plans · Muse (Trinity) and GrokBot (Ravyn) excluded</p>
    </article>
    <article class="metric">
      <p class="eyebrow">Configured connections</p>
      <p class="figure" id="metric-connections"><span>${configured}</span><span class="of">/${total}</span></p>
      <p class="meta">${esc(connCaption)}</p>
    </article>`;

  document.getElementById("snapshot").textContent = `Sample snapshot · ${formatLong(data.as_of)}`;
  document.getElementById("conn-count").textContent = `${configured} of ${total} configured. Sample slots only.`;
}

function usageBars(values) {
  const max = Math.max(...values.map(Number), 0.01);
  return values.map((value, index) => {
    const height = Math.max(3, Math.round((Number(value) / max) * 36));
    const latest = index === values.length - 1 ? " is-latest" : "";
    return `<span class="bar${latest}" style="height:${height}px"></span>`;
  }).join("");
}

function renderLive(items) {
  const host = document.getElementById("live-grid");
  if (!items.length) {
    host.innerHTML = '<p class="empty">No dummy live balances.</p>';
    return;
  }
  host.innerHTML = items.map((item) => {
    const delta = Number(item.delta_vs_12d_avg);
    const arrow = delta >= 0 ? "▲" : "▼";
    return `
      <article class="card live-card" id="live-${esc(item.id)}">
        <div class="account-top">
          ${markHtml(item)}
          <div>
            <h3>${esc(item.label)}</h3>
            <p class="blurb">${esc(item.blurb || "")}</p>
          </div>
        </div>
        <div>
          <p class="eyebrow">Balance</p>
          <p class="figure">${esc(formatMoney(item.balance, 2))}</p>
        </div>
        <div>
          <p class="eyebrow">12-day usage</p>
          <div class="bars" role="img" aria-label="${esc(item.label)} sample usage across 12 days. Latest day highlighted.">${usageBars(item.usage)}</div>
        </div>
        <p class="delta">
          <span class="sr">${esc(item.label)} sample delta versus 12-day average</span>
          <span class="delta-val">${arrow} ${esc(formatMoney(Math.abs(delta), 2))}</span>
          <span class="delta-note">vs 12-day average</span>
        </p>
        <p class="card-foot">Last sample ${esc(formatStamp(item.updated_at))}</p>
      </article>`;
  }).join("");
}

function renderWeek(data) {
  const end = data.usage_end || String(data.as_of).slice(0, 10);
  const series = data.live.map((item) => item.usage.slice(-7));
  const days = series[0] ? series[0].length : 0;
  const start = addDays(end, -(days - 1));
  const sums = [];
  for (let index = 0; index < days; index += 1) {
    sums.push(sumMoney(series.map((row) => row[index])));
  }
  const max = Math.max(...sums, 0.01);
  const host = document.getElementById("week-chart");
  host.innerHTML = sums.map((total, index) => {
    const height = Math.max(8, Math.round((total / max) * 112));
    const latest = index === sums.length - 1;
    const iso = addDays(start, index);
    const day = parts(iso).day;
    return `
      <div class="week-col${latest ? " is-latest" : ""}">
        <span class="week-bar${latest ? " is-latest" : ""}" style="height:${height}px"></span>
        <span class="week-label">${esc(day)}</span>
      </div>`;
  }).join("");
  host.setAttribute("role", "img");
  host.setAttribute("aria-label", `Seven day sample usage, ${formatRange(start, end)}. Latest day highlighted.`);
  document.getElementById("week-range").textContent = `${formatRange(start, end)} · sample daily spend across the live balances.`;
}

function manualFigure(item) {
  if (item.weekly_used_pct != null) {
    return `<p class="account-figure"><span class="over">${esc(formatMoney(item.ondemand_spent, 2))}</span><span class="per"> / ${esc(formatMoney(item.ondemand_cap))}</span></p>`;
  }
  if (item.used_pct != null) {
    return `<p class="account-figure">${esc(item.used_pct)}%</p>`;
  }
  if (item.amount == null) return '<p class="account-figure dim">—</p>';
  const per = item.cadence === "monthly" ? '<span class="per">/mo</span>' : "";
  return `<p class="account-figure">${esc(formatMoney(item.amount))}${per}</p>`;
}

function manualBody(item) {
  if (item.weekly_used_pct != null) {
    const weekly = Math.max(0, Math.min(100, Number(item.weekly_used_pct)));
    return `
      <div class="split-stats">
        <div>
          <p class="eyebrow">Weekly usage</p>
          <p class="stat">${esc(weekly)}%</p>
          <div class="meter" role="meter" aria-valuenow="${esc(weekly)}" aria-valuemin="0" aria-valuemax="100" aria-label="Weekly usage ${esc(weekly)} percent">
            <span style="width:${weekly}%"></span>
          </div>
          <p class="meta-line">Resets ${esc(formatLong(item.weekly_resets_on))}</p>
        </div>
        <div>
          <p class="eyebrow">On-demand</p>
          <p class="stat over">Over limit</p>
          <div class="meter meter-over" role="meter" aria-valuemin="0" aria-valuemax="${esc(item.ondemand_cap)}" aria-valuenow="${esc(item.ondemand_spent)}" aria-label="On-demand ${esc(formatMoney(item.ondemand_spent, 2))} of ${esc(formatMoney(item.ondemand_cap))} cap, over limit">
            <span style="width:100%"></span>
          </div>
          <p class="meta-line">Resets ${esc(formatLong(item.ondemand_resets_on))}</p>
        </div>
      </div>`;
  }
  if (item.used_pct != null) {
    const used = Math.max(0, Math.min(100, Number(item.used_pct)));
    return `
      <div class="meter" role="meter" aria-valuenow="${esc(used)}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(item.plan || "Plan")} ${esc(used)} percent used">
        <span style="width:${used}%"></span>
      </div>
      <p class="meta-line">${esc(item.tokens_left)} tokens left</p>
      <p class="meta-line">Resets ${esc(formatLong(item.resets_on))}</p>`;
  }
  const bits = [];
  if (item.renews_on) bits.push(`<p class="meta-line">Renews ${esc(formatLong(item.renews_on))}</p>`);
  if (item.cashback) {
    bits.push(`<p class="flag-line"><span class="flag-label">${esc(item.cashback.label)}</span><span class="meta-line">${esc(formatLong(item.cashback.date))}</span></p>`);
    if (item.cashback.detail) bits.push(`<p class="blurb">${esc(item.cashback.detail)}</p>`);
  }
  return bits.join("");
}

function renderManual(items) {
  const host = document.getElementById("manual-grid");
  if (!items.length) {
    host.innerHTML = '<p class="empty">No dummy manual accounts.</p>';
    return;
  }
  host.innerHTML = items.map((item) => `
    <article class="card account${identityClass(item)}" id="manual-${esc(item.id)}">
      <div class="account-top">
        ${markHtml(item)}
        <div>
          <h3>${esc(item.label)}</h3>
          <p class="blurb">${esc(item.plan ? `${item.plan} plan` : (item.blurb || "Manual account"))}</p>
        </div>
        ${manualFigure(item)}
      </div>
      ${manualBody(item)}
    </article>`).join("");
}

function renderAlerts(items) {
  const flags = items.filter((item) => item.cashback);
  const host = document.getElementById("alert-list");
  if (!flags.length) {
    host.innerHTML = "";
    return;
  }
  host.innerHTML = flags.map((item) => `
    <article class="card alert">
      <div>
        <p class="flag-label">${esc(item.cashback.label)}</p>
        <h3>${esc(item.label)} cashback</h3>
        <p class="alert-copy">${esc(item.cashback.detail || "Dummy deadline.")} This page is not watching a live account.</p>
      </div>
      <p class="alert-date">Closes ${esc(formatLong(item.cashback.date))}</p>
    </article>`).join("");
}

function connectionBlurb(item) {
  if (item.access === "live") return `Live-capable · sample balance ${formatMoney(item.balance, 2)}`;
  if (item.weekly_used_pct != null) {
    return `Manual · weekly ${item.weekly_used_pct}% · on-demand ${formatMoney(item.ondemand_spent, 2)} / ${formatMoney(item.ondemand_cap)} · over limit`;
  }
  if (item.used_pct != null) return `Manual · ${item.plan} plan · ${item.used_pct}% used · ${item.tokens_left} tokens left`;
  if (item.amount != null) {
    const price = item.cadence === "monthly" ? `${formatMoney(item.amount)}/mo` : formatMoney(item.amount);
    return `Manual · ${price}`;
  }
  if (item.cashback) return `Manual · ${item.cashback.label} ${formatLong(item.cashback.date)}`;
  return "Manual";
}

function renderConnections(data) {
  const host = document.getElementById("conn-list");
  host.innerHTML = accountsOf(data).map((item) => {
    const dates = resetLines(item);
    const dateHtml = dates.length
      ? dates.map((line) => `<p>${esc(line)}</p>`).join("")
      : "<p>No reset on file</p>";
    const stateLabel = item.configured ? "Configured" : "Not configured";
    return `
      <article class="conn${identityClass(item)}" id="conn-${esc(item.id)}">
        ${markHtml(item)}
        <div>
          <h3>${esc(item.label)}</h3>
          <p class="blurb">${esc(connectionBlurb(item))}</p>
        </div>
        <div class="conn-date">${dateHtml}</div>
        <p class="conn-state">${esc(stateLabel)}</p>
        <button type="button" class="btn-text" data-edit="${esc(item.id)}">Edit</button>
      </article>`;
  }).join("");
}

function renderAccess(blocks) {
  document.getElementById("access-model").innerHTML = blocks.map((block) => {
    const list = block.accounts && block.accounts.length
      ? `<ul>${block.accounts.map((name) => `<li>${esc(name)}</li>`).join("")}</ul>`
      : "";
    return `
      <article class="model">
        <h3>${esc(block.title)}</h3>
        <p>${esc(block.detail)}</p>
        ${list}
      </article>`;
  }).join("");
}

function renderBuild(steps) {
  document.getElementById("build-list").innerHTML = steps.map((step) => `
    <article class="plan">
      <p class="plan-n">${esc(step.n)}</p>
      <div>
        <h3>${esc(step.title)}</h3>
        <p>${esc(step.detail)}</p>
      </div>
    </article>`).join("");
}

function factRows(item) {
  const rows = [
    ["Access", item.access === "live" ? "Live-capable" : "Manual"],
    ["State", item.configured ? "Configured" : "Not configured"],
  ];
  if (item.balance != null) rows.push(["Sample balance", formatMoney(item.balance, 2)]);
  if (item.delta_vs_12d_avg != null) {
    const delta = Number(item.delta_vs_12d_avg);
    const arrow = delta >= 0 ? "▲" : "▼";
    rows.push(["Vs 12-day average", `${arrow} ${formatMoney(Math.abs(delta), 2)}`]);
  }
  if (item.amount != null) {
    rows.push(["Amount", item.cadence === "monthly" ? `${formatMoney(item.amount)}/mo` : formatMoney(item.amount)]);
  }
  if (item.plan) rows.push(["Plan", item.plan]);
  if (item.used_pct != null) rows.push(["Used", `${item.used_pct}%`]);
  if (item.tokens_left) rows.push(["Tokens left", item.tokens_left]);
  if (item.weekly_used_pct != null) rows.push(["Weekly usage", `${item.weekly_used_pct}%`]);
  if (item.ondemand_spent != null) {
    rows.push(["On-demand", `${formatMoney(item.ondemand_spent, 2)} / ${formatMoney(item.ondemand_cap)}`, item.over_limit ? "over" : ""]);
  }
  if (item.over_limit) rows.push(["Status", "Over limit", "over"]);
  if (item.renews_on) rows.push(["Renewal", formatLong(item.renews_on)]);
  if (item.resets_on) rows.push(["Resets", formatLong(item.resets_on)]);
  if (item.weekly_resets_on) rows.push(["Weekly reset", formatLong(item.weekly_resets_on)]);
  if (item.ondemand_resets_on) rows.push(["On-demand reset", formatLong(item.ondemand_resets_on)]);
  if (item.cashback) rows.push(["Cashback", `${item.cashback.label} · ${formatLong(item.cashback.date)}`]);
  return rows;
}

function renderDialog(data) {
  const dialog = document.getElementById("config-dialog");
  const buttons = accountsOf(data).map((item) => `
    <button type="button" class="pick${identityClass(item)}" role="option" data-account="${esc(item.id)}" aria-selected="false">
      ${markHtml(item)}
      <span>${esc(item.label)}</span>
    </button>`).join("");
  dialog.innerHTML = `
    <div class="dialog-inner">
      <div class="dialog-head">
        <div>
          <p class="eyebrow">Prototype shell</p>
          <h2 id="config-title">Configure prototype</h2>
        </div>
        <button type="button" class="btn" id="config-close">Close</button>
      </div>
      <p class="dialog-note">Disabled fields. This shell does not accept or store API keys. GrokBot (Ravyn) is a manual account.</p>
      <div class="dialog-layout">
        <div class="dialog-list" role="listbox" aria-label="Accounts">${buttons}</div>
        <div class="dialog-detail" id="config-detail"></div>
      </div>
    </div>`;
  document.getElementById("config-close").addEventListener("click", () => dialog.close());
}

function selectAccount(id) {
  const item = findAccount(id) || accountsOf(state.data)[0];
  if (!item) return;
  state.selectedId = item.id;
  document.querySelectorAll("[data-account]").forEach((button) => {
    button.setAttribute("aria-selected", button.getAttribute("data-account") === item.id ? "true" : "false");
  });
  const rows = factRows(item).map((row) => `
    <dt>${esc(row[0])}</dt>
    <dd class="${row[2] === "over" ? "over" : ""}">${esc(row[1])}</dd>`).join("");
  const keySlot = item.access === "live"
    ? `<label class="field"><span>API key</span><input type="text" value="" placeholder="Not accepted" disabled autocomplete="off" /></label>`
    : `<p class="detail-note">No key slot on a manual account.</p>`;
  document.getElementById("config-detail").innerHTML = `
    <p class="eyebrow">Edit disabled</p>
    <h3>${esc(item.label)}</h3>
    <dl class="facts">${rows}</dl>
    ${keySlot}`;
}

function openConfig(id) {
  if (!state.data) return;
  selectAccount(id);
  const dialog = document.getElementById("config-dialog");
  if (!dialog.open) dialog.showModal();
  const selected = dialog.querySelector('.pick[aria-selected="true"]');
  if (selected) selected.scrollIntoView({ block: "nearest" });
}

function sanitizedExport(data) {
  const configured = accountsOf(data).filter((item) => item.configured).length;
  const total = accountsOf(data).length;
  const accounts = accountsOf(data).map((item) => {
    const record = {
      id: item.id,
      label: item.label,
      access: item.access,
      configured: Boolean(item.configured),
    };
    if (item.balance != null) record.balance = item.balance;
    if (item.amount != null) record.amount = item.amount;
    if (item.cadence) record.cadence = item.cadence;
    if (item.currency) record.currency = item.currency;
    if (item.delta_vs_12d_avg != null) record.delta_vs_12d_avg = item.delta_vs_12d_avg;
    if (item.plan) record.plan = item.plan;
    if (item.used_pct != null) record.used_pct = item.used_pct;
    if (item.tokens_left) record.tokens_left = item.tokens_left;
    if (item.resets_on) record.resets_on = item.resets_on;
    if (item.renews_on) record.renews_on = item.renews_on;
    if (item.weekly_used_pct != null) record.weekly_used_pct = item.weekly_used_pct;
    if (item.weekly_resets_on) record.weekly_resets_on = item.weekly_resets_on;
    if (item.ondemand_spent != null) record.ondemand_spent = item.ondemand_spent;
    if (item.ondemand_cap != null) record.ondemand_cap = item.ondemand_cap;
    if (item.ondemand_resets_on) record.ondemand_resets_on = item.ondemand_resets_on;
    if (item.over_limit) record.over_limit = true;
    if (item.cashback) {
      record.cashback = {
        label: item.cashback.label,
        date: item.cashback.date,
      };
    }
    return record;
  });
  return {
    prototype: true,
    sanitized: true,
    contains_credentials: false,
    notice: "Dummy export for the CreditLabz prototype. Credential-shaped fields are omitted. No provider was contacted.",
    as_of: data.as_of,
    configured_connections: `${configured}/${total}`,
    accounts,
  };
}

function downloadExport() {
  if (!state.data) return;
  const payload = sanitizedExport(state.data);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "creditlabz-prototype-export.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function selectTab(tab) {
  document.querySelectorAll("[role='tab']").forEach((el) => {
    const on = el === tab;
    el.setAttribute("aria-selected", on ? "true" : "false");
    el.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(el.getAttribute("aria-controls"));
    if (panel) panel.hidden = !on;
  });
  const hash = tab.getAttribute("data-tab");
  if (hash && location.hash !== `#${hash}`) {
    history.replaceState(null, "", `#${hash}`);
  }
}

function bindChrome() {
  document.getElementById("export-btn").addEventListener("click", downloadExport);
  document.getElementById("configure-btn").addEventListener("click", () => openConfig(state.selectedId));
  document.getElementById("config-dialog").addEventListener("click", (event) => {
    if (event.target.tagName === "DIALOG") event.currentTarget.close();
  });
  document.body.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]");
    if (edit) {
      openConfig(edit.getAttribute("data-edit"));
      return;
    }
    const pick = event.target.closest("[data-account]");
    if (pick) selectAccount(pick.getAttribute("data-account"));
  });
  document.getElementById("filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    document.getElementById("panel-overview").dataset.filter = button.getAttribute("data-filter");
    document.querySelectorAll("#filters [data-filter]").forEach((el) => {
      el.setAttribute("aria-pressed", el === button ? "true" : "false");
    });
  });
  const tabs = [...document.querySelectorAll("[role='tab']")];
  const tablist = document.querySelector("[role='tablist']");
  tabs.forEach((tab) => tab.addEventListener("click", () => selectTab(tab)));
  tablist.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    let next = null;
    if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === "Home") next = tabs[0];
    if (event.key === "End") next = tabs[tabs.length - 1];
    if (!next) return;
    event.preventDefault();
    selectTab(next);
    next.focus();
  });
  const hash = location.hash.replace("#", "");
  const initial = tabs.find((tab) => tab.getAttribute("data-tab") === hash);
  if (initial) selectTab(initial);
}

function fail(message) {
  const summary = document.getElementById("metrics");
  if (summary) summary.innerHTML = `<p class="error">${esc(message)}</p>`;
}

async function init() {
  bindChrome();
  try {
    const response = await fetch("data/balances.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load data/balances.json");
    const data = await response.json();
    if (!data.prototype) throw new Error("Refusing to render because prototype is not true");
    if (!Array.isArray(data.live) || !Array.isArray(data.manual)) {
      throw new Error("Dummy ledger is missing live or manual accounts");
    }
    state.data = data;
    renderMetrics(data);
    renderLive(data.live);
    renderWeek(data);
    renderManual(data.manual);
    renderAlerts(data.manual);
    renderConnections(data);
    renderAccess(data.access_model || []);
    renderBuild(data.build_plan || []);
    renderDialog(data);
    const footer = document.getElementById("footer-note");
    if (footer && data.notice) {
      footer.innerHTML = `${esc(data.notice)} The desk reads <code>data/balances.json</code>.`;
    }
    document.body.classList.add("ready");
  } catch (error) {
    fail(`${error.message}. Serve this folder over HTTP so the dummy JSON can load.`);
  }
}

init();
