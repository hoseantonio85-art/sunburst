/* details.js - renders right panel widgets given an aggregated info object.
   Exposes function renderDetails(node, periodInfo)
*/

(function(global){
  function formatMoney(n){
    if (n == null) return "—";
    return n.toLocaleString('ru-RU') + ' ₽';
  }

  function pct(part, total){
    if (!total) return "—";
    return Math.round(part / total * 100) + '%';
  }

  function createCard() {
    const div = document.createElement('div');
    div.className = 'card';
    return div;
  }

  function clearDetails(){
    const root = document.getElementById('details');
    root.innerHTML = '';
  }

  function renderEmpty(){
    clearDetails();
    const root = document.getElementById('details');
    const c = createCard();
    c.innerHTML = `<div class="muted">Выберите сегмент слева, чтобы увидеть агрегированные показатели.</div>`;
    root.appendChild(c);
  }

  function renderDetails(agg){
    // agg: { name, subtitle, level, lossesDirect, lossesIndirect, incidentsList[], covered, totalRisks, news[], drivers[], ai, periodText }
    const root = document.getElementById('details');
    root.innerHTML = '';

    // Utilization card
    const util = createCard();
    util.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
        <div>
          <div class="muted">Утилизация лимита</div>
          <div style="font-weight:600;margin-top:6px">${agg.name}</div>
          <div class="muted" style="font-size:13px;margin-top:4px">${agg.periodText || ''}</div>
        </div>
        <div style="text-align:right">
          <div class="muted">Уровень: <strong>${agg.level || '—'}</strong></div>
        </div>
      </div>

      <div style="margin-top:12px" class="util-row">
        <div style="display:flex;justify-content:space-between;">
          <div class="muted">Прямые потери</div>
          <div class="loss-num">${formatMoney(agg.lossesDirect)}</div>
        </div>
        <div class="progress-wrap" style="margin-top:6px">
          <div class="progress" title="Прямые потери">
            <div class="bar" style="width:${Math.min(100, agg.lossesDirectPct || 0)}%; background:linear-gradient(90deg,#ef4444,#b91c1c);"></div>
          </div>
          <div class="muted" style="min-width:54px;text-align:right">${agg.lossesDirectPct || 0}%</div>
        </div>

        <div style="display:flex;justify-content:space-between;margin-top:8px">
          <div class="muted">Косвенные потери</div>
          <div class="loss-num">${formatMoney(agg.lossesIndirect)}</div>
        </div>
        <div class="progress-wrap" style="margin-top:6px">
          <div class="progress" title="Косвенные потери">
            <div class="bar" style="width:${Math.min(100, agg.lossesIndirectPct || 0)}%; background:linear-gradient(90deg,#f59e0b,#facc15);"></div>
          </div>
          <div class="muted" style="min-width:54px;text-align:right">${agg.lossesIndirectPct || 0}%</div>
        </div>
      </div>
    `;
    root.appendChild(util);

    // Coverage + forecast row
    const cov = createCard();
    cov.innerHTML = `
      <div class="widget-row" style="align-items:center;">
        <div>
          <div class="muted">Покрытие мер</div>
          <div style="font-weight:600;margin-top:6px">${agg.covered || 0} / ${agg.totalRisks || 0} (${agg.coveragePct || 0}%)</div>
          <div class="muted" style="margin-top:6px;font-size:13px">Покрытие рисков мерами</div>
        </div>
        <div style="text-align:right">
          <div class="muted">Прогноз</div>
          <div style="font-weight:600;margin-top:6px">${agg.forecast || '—'}</div>
          <div class="muted" style="margin-top:6px;font-size:13px">${agg.trendText || ''}</div>
        </div>
      </div>
    `;
    root.appendChild(cov);

    // Drivers
    const drv = createCard();
    let driversHTML = '';
    if (agg.drivers && agg.drivers.length) {
      driversHTML = '<div class="tags">' + agg.drivers.slice(0,10).map(t=>`<span class="tag">${t}</span>`).join('') + '</div>';
    } else driversHTML = '<div class="muted">—</div>';
    drv.innerHTML = `<div class="muted">Драйверы / теги</div><div style="margin-top:8px">${driversHTML}</div>`;
    root.appendChild(drv);

    // Incidents top-3
    const inc = createCard();
    let incHtml = '';
    if (agg.incidentsList && agg.incidentsList.length) {
      const top = agg.incidentsList.slice(0,3);
      incHtml = '<div class="incidents-list">';
      top.forEach(it=>{
        const pct = Math.min(100, Math.round((it.loss || 0) / (agg.totalLosses || 1) * 100));
        incHtml += `<div class="incident"><div style="min-width:160px">${it.title}</div><div style="display:flex;align-items:center;gap:8px"><div class="muted">${formatMoney(it.loss)}</div><div class="mini-bar"><div class="fill" style="width:${pct}%; background:linear-gradient(90deg,#ef4444,#f97316)"></div></div></div></div>`;
      });
      incHtml += `<div class="muted" style="margin-top:8px">Всего инцидентов: ${agg.incidentsList.length}</div>`;
      incHtml += '</div>';
    } else incHtml = '<div class="muted">Нет инцидентов за период</div>';
    inc.innerHTML = `<div class="muted">Топ инцидентов (вклад в потери)</div><div style="margin-top:8px">${incHtml}</div>`;
    root.appendChild(inc);

    // News
    const nw = createCard();
    let newsHtml = '';
    if (agg.news && agg.news.length) {
      newsHtml = '<div style="display:flex;flex-direction:column;gap:6px">';
      agg.news.slice(0,5).forEach(n => newsHtml += `<div>• ${n}</div>`);
      newsHtml += '</div>';
    } else newsHtml = '<div class="muted">—</div>';
    nw.innerHTML = `<div class="muted">Инфоповоды</div><div style="margin-top:8px">${newsHtml}</div>`;
    root.appendChild(nw);

    // AI card
    const ai = createCard();
    ai.innerHTML = `<div class="muted">AI: вывод</div><div class="ai" style="margin-top:8px">${agg.ai || '—'}</div>`;
    root.appendChild(ai);
  }

  // Export to global
  global.Details = {
    renderEmpty,
    renderDetails,
    clearDetails
  };
})(window);
