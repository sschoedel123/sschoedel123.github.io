/*
  Maxx's Motor Menagerie - demo data + rendering
  Replace the `motors` array with real data and point images/plots to real files.
*/

function makePlaceholderSVG(width, height, title, subtitle = "") {
  const bg = "#191f26";
  const border = "#26303a";
  const text = "#e6edf3";
  const accent = "#4cc9f0";
  const fontSizeTitle = Math.max(12, Math.floor(width / 8));
  const fontSizeSub = Math.max(10, Math.floor(width / 12));
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0%' stop-color='${bg}' />
          <stop offset='100%' stop-color='#0e141a' />
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)' stroke='${border}'/>
      <g fill='${accent}' opacity='0.18'>
        <circle cx='${width * 0.9}' cy='${height * 0.1}' r='${Math.min(width, height) * 0.3}' />
      </g>
      <text x='50%' y='50%' text-anchor='middle' fill='${text}' font-family='Inter, Segoe UI, Roboto, Arial' font-size='${fontSizeTitle}' font-weight='700'>${title}</text>
      <text x='50%' y='70%' text-anchor='middle' fill='${text}' opacity='0.7' font-family='Inter, Segoe UI, Roboto, Arial' font-size='${fontSizeSub}'>${subtitle}</text>
    </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makePlaceholderPNG(width, height, title, subtitle = "") {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  // background gradient
  const g = ctx.createLinearGradient(0, 0, width, height);
  g.addColorStop(0, "#191f26");
  g.addColorStop(1, "#0e141a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  // accent circle
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#4cc9f0";
  const r = Math.min(width, height) * 0.3;
  ctx.beginPath();
  ctx.arc(width * 0.9, height * 0.2, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // title
  ctx.fillStyle = "#e6edf3";
  ctx.font = `700 ${Math.max(12, Math.floor(width / 8))}px Inter, Segoe UI, Roboto, Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, width / 2, height / 2);
  // subtitle
  ctx.globalAlpha = 0.7;
  ctx.font = `500 ${Math.max(10, Math.floor(width / 12))}px Inter, Segoe UI, Roboto, Arial`;
  ctx.fillText(subtitle, width / 2, height * 0.7);
  ctx.globalAlpha = 1;
  // border
  ctx.strokeStyle = "#26303a";
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  return canvas.toDataURL("image/png");
}

const motors = [
  {
    id: "mm-2205-2300kv",
    name: "MM 2205",
    thumbnail: makePlaceholderSVG(64, 64, "MM 2205"),
    efficiencyPlot: makePlaceholderPNG(180, 110, "Efficiency", "Demo"),
    vendor: "Rev Robotics",
    kv: 2300,
    currentRatingA: 30,
    voltageRatingV: 16.8,
    stallTorqueNm: 0.85,
    noLoadCurrentA: 0.9,
    phaseResistanceOhm: 0.08,
    slotsPoles: "12n14p",
    purchaseUrl: "https://example.com/motors/mm-2205"
  },
  {
    id: "mm-2806-1200kv",
    name: "MM 2806",
    thumbnail: makePlaceholderSVG(64, 64, "MM 2806"),
    efficiencyPlot: makePlaceholderPNG(180, 110, "Efficiency", "Demo"),
    vendor: "Repeat Robotics",
    kv: 1200,
    currentRatingA: 40,
    voltageRatingV: 22.2,
    stallTorqueNm: 1.65,
    noLoadCurrentA: 0.7,
    phaseResistanceOhm: 0.06,
    slotsPoles: "12n14p",
    purchaseUrl: "https://example.com/motors/mm-2806"
  },
  {
    id: "mm-5010-360kv",
    name: "MM 5010",
    thumbnail: makePlaceholderSVG(64, 64, "MM 5010"),
    efficiencyPlot: makePlaceholderPNG(180, 110, "Efficiency", "Demo"),
    vendor: "mjbots",
    kv: 360,
    currentRatingA: 45,
    voltageRatingV: 25.2,
    stallTorqueNm: 3.2,
    noLoadCurrentA: 0.6,
    phaseResistanceOhm: 0.05,
    slotsPoles: "24n28p",
    purchaseUrl: "https://example.com/motors/mm-5010"
  }
];

function formatNumber(value, decimals = 0) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  });
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlightMatches(text, query) {
  if (!query) return escapeHtml(text);
  const source = String(text);
  const lowerSource = source.toLowerCase();
  const lowerQuery = String(query).toLowerCase();
  if (!lowerQuery) return escapeHtml(source);
  let result = "";
  let lastIndex = 0;
  let idx = lowerSource.indexOf(lowerQuery, lastIndex);
  while (idx !== -1) {
    result += escapeHtml(source.slice(lastIndex, idx));
    result += `<mark>${escapeHtml(source.slice(idx, idx + lowerQuery.length))}</mark>`;
    lastIndex = idx + lowerQuery.length;
    idx = lowerSource.indexOf(lowerQuery, lastIndex);
  }
  result += escapeHtml(source.slice(lastIndex));
  return result;
}

// Basic fuzzy subsequence match with simple scoring and contiguous range capture
function fuzzyMatch(source, query) {
  const src = String(source);
  const q = String(query);
  if (!q) return { score: 0, ranges: [] };
  const srcLower = src.toLowerCase();
  const qLower = q.toLowerCase();
  let lastIndex = -1;
  let score = 0;
  const ranges = [];
  let runStart = -1;
  for (let qi = 0; qi < qLower.length; qi += 1) {
    const ch = qLower[qi];
    const foundAt = srcLower.indexOf(ch, lastIndex + 1);
    if (foundAt === -1) {
      return { score: 0, ranges: [] };
    }
    // base score for a match
    score += 1;
    // adjacency bonus and contiguous range grouping
    if (runStart === -1) runStart = foundAt;
    else if (foundAt !== lastIndex + 1) {
      ranges.push([runStart, lastIndex + 1]);
      runStart = foundAt;
    } else {
      score += 2; // adjacency bonus
    }
    // start-of-string/word bonus
    if (foundAt === 0 || /[^a-zA-Z0-9]/.test(srcLower[foundAt - 1])) {
      score += 1;
    }
    lastIndex = foundAt;
  }
  // close final run
  if (runStart !== -1) {
    ranges.push([runStart, lastIndex + 1]);
  }
  return { score, ranges };
}

function highlightRanges(text, ranges) {
  const src = String(text);
  if (!ranges || ranges.length === 0) return escapeHtml(src);
  let out = "";
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (cursor < start) out += escapeHtml(src.slice(cursor, start));
    out += `<mark>${escapeHtml(src.slice(start, end))}</mark>`;
    cursor = end;
  }
  if (cursor < src.length) out += escapeHtml(src.slice(cursor));
  return out;
}

function highlightFuzzy(text, query) {
  if (!query) return escapeHtml(text);
  const { score, ranges } = fuzzyMatch(text, query);
  if (score <= 0) return escapeHtml(text);
  return highlightRanges(text, ranges);
}

function getHighlightHtml(text, rawQuery) {
  if (!rawQuery) return escapeHtml(text);
  const t = String(text);
  const tLower = t.toLowerCase();
  const rawLower = String(rawQuery).toLowerCase();
  const norm = normalizeNumericString(rawQuery).toLowerCase();
  if (rawLower && tLower.includes(rawLower)) {
    return highlightMatches(t, rawQuery);
  }
  if (norm && norm !== rawLower && tLower.includes(norm)) {
    return highlightMatches(t, norm);
  }
  return highlightFuzzy(t, rawQuery);
}

function normalizeNumericString(input) {
  if (input == null) return "";
  let s = String(input).replace(/[,\s]/g, "");
  // quick out: if it doesn't look numeric, return as-is
  if (!/^[-+]?\d*(?:\.\d+)?$/.test(s)) return s;
  // split integer and fractional parts
  const parts = s.split(".");
  if (parts.length === 1) {
    // no decimal
    return String(parseInt(parts[0] || "0", 10));
  }
  const integerPart = parts[0] === "" || parts[0] === "+" || parts[0] === "-" ? (parts[0] === "-" ? "-0" : "0") : String(parseInt(parts[0], 10));
  let fractionalPart = parts[1].replace(/0+$/g, "");
  if (fractionalPart.length === 0) {
    return integerPart;
  }
  return `${integerPart}.${fractionalPart}`;
}

function createCell(label, html) {
  const td = document.createElement("td");
  td.innerHTML = html;
  td.setAttribute("data-label", label);
  return td;
}

function renderTableRows(results) {
  const tbody = document.querySelector("#motorsTable tbody");
  tbody.innerHTML = "";

  results.forEach((row) => {
    const m = row.motor;
    const qUsed = row.queryForHighlight || "";
    const tr = document.createElement("tr");

    // Motor cell: image + name
    const motorCell = document.createElement("td");
    motorCell.className = "motor-cell";
    motorCell.setAttribute("data-label", "Motor");
    const nameHtml = getHighlightHtml(m.name, qUsed);
    const idHtml = getHighlightHtml(m.id, qUsed);
    motorCell.innerHTML = `
      <img class="motor-thumb" src="${m.thumbnail}" alt="${escapeHtml(m.name)} thumbnail" loading="lazy" />
      <div>
        <div class="motor-name">${nameHtml}</div>
        <div class="motor-meta">ID: ${idHtml}</div>
      </div>
    `;
    tr.appendChild(motorCell);

    // Efficiency plot
    tr.appendChild(
      createCell(
        "Efficiency Plot",
        `<img class="plot-img" src="${m.efficiencyPlot}" alt="${escapeHtml(m.name)} efficiency plot" loading="lazy" />`
      )
    );

    // Specs
    tr.appendChild(createCell("KV", `<span class="num">${getHighlightHtml(formatNumber(m.kv), qUsed)}</span>`));
    tr.appendChild(
      createCell("Current (A)", `<span class="num">${getHighlightHtml(formatNumber(m.currentRatingA, 1), qUsed)}</span>`)
    );
    tr.appendChild(
      createCell("Voltage (V)", `<span class="num">${getHighlightHtml(formatNumber(m.voltageRatingV, 1), qUsed)}</span>`)
    );
    tr.appendChild(
      createCell("Stall Torque (Nm)", `<span class="num">${getHighlightHtml(formatNumber(m.stallTorqueNm, 2), qUsed)}</span>`)
    );
    tr.appendChild(
      createCell("Current Draw (A)", `<span class="num">${getHighlightHtml(formatNumber(m.noLoadCurrentA, 2), qUsed)}</span>`)
    );
    tr.appendChild(
      createCell(
        "Phase Resistance (Ω)",
        `<span class="num">${getHighlightHtml(formatNumber(m.phaseResistanceOhm, 3), qUsed)}</span>`
      )
    );
    tr.appendChild(createCell("Slots/Poles", `${getHighlightHtml(m.slotsPoles, qUsed)}`));

    // Vendor
    tr.appendChild(createCell("Vendor", `${getHighlightHtml(m.vendor || "—", qUsed)}`));

    // Purchase
    tr.appendChild(
      createCell(
        "Purchase",
        `<a class="buy-link" href="${m.purchaseUrl}" target="_blank" rel="noopener">Buy →</a>`
      )
    );

    tbody.appendChild(tr);
  });
}

function setupSearch() {
  const input = document.getElementById("searchInput");
  input.addEventListener("input", () => {
    const raw = input.value;
    const q = raw.toLowerCase();
    const qNorm = normalizeNumericString(raw).toLowerCase();
    const results = motors
      .map((m) => {
        const haystack = [
          m.name,
          m.id,
          m.vendor || "",
          String(m.kv),
          String(m.currentRatingA),
          String(m.voltageRatingV),
          String(m.stallTorqueNm),
          String(m.noLoadCurrentA),
          String(m.phaseResistanceOhm),
          m.slotsPoles
        ].join(" ");

        // direct substring or normalized numeric match
        const direct = haystack.toLowerCase();
        const matchesDirect = direct.includes(q) || (qNorm !== q && direct.includes(qNorm));

        // fuzzy score across concatenated haystack
        const fuzzy = fuzzyMatch(direct, q);
        const score = matchesDirect ? fuzzy.score + 100 : fuzzy.score; // strong boost for direct matches

        return { motor: m, score, queryForHighlight: raw };
      })
      .filter((r) => r.score > 0 || !raw) // show all when query empty
      .sort((a, b) => b.score - a.score);

    renderTableRows(raw ? results : motors.map((m) => ({ motor: m, score: 0, queryForHighlight: "" })));
  });
}

window.addEventListener("DOMContentLoaded", () => {
  // initial render without highlights
  renderTableRows(motors.map((m) => ({ motor: m, score: 0, queryForHighlight: "" })));
  setupSearch();
});


