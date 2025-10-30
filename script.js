/* script.js - constructs the sunburst, handles drill-down and aggregations,
   connects selection to Details.renderDetails(...)
*/

(async function(){
  // Data is in global riskData (from data.js)
  const data = window.riskData || window.riskData || riskData;

  // DOM refs
  const wrap = document.getElementById('chart-wrap');
  const tooltip = document.getElementById('tooltip');
  const backBtn = document.getElementById('back-btn');
  const detailTitle = document.getElementById('detail-title');
  const detailSubtitle = document.getElementById('detail-subtitle');

  // Dimensions responsive
  const containerW = Math.min(980, Math.max(600, Math.floor(wrap.clientWidth * 0.98)));
  const width = containerW;
  const height = width;
  const radius = Math.min(width, height) / 3.8;

  // Color by level mapping
  const colorLevel = {
    "Низкий": "#9ca3af",
    "Средний": "#facc15",
    "Высокий": "#ef4444",
    "Очень высокий": "#b91c1c"
  };

  // fallback color for top-level segments
  const fallback = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

  // build hierarchy + partition
  const hierarchy = d3.hierarchy(data)
    .sum(d => (d.losses ? ((d.losses.direct||0)+(d.losses.indirect||0)) : (d.value || 1)))
    .sort((a,b) => (b.value || 0) - (a.value || 0));

  const root = d3.partition().size([2 * Math.PI, hierarchy.height + 1])(hierarchy);
  root.each(d => d.current = d);

  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

  // create svg
  const svg = d3.create("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, width])
    .style("font", "11px Inter, sans-serif");

  const g = svg.append("g");

  // draw paths
  const path = g.selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
      .attr("fill", d => {
        // if node or its children declare level, prefer that; else fallback by top parent name
        const lvl = d.data.level;
        if (lvl && colorLevel[lvl]) return colorLevel[lvl];
        // find descendant with level if any
        let found = null;
        d.each(node => {
          if (!found && node.data && node.data.level && colorLevel[node.data.level]) found = node.data.level;
        });
        if (found) return colorLevel[found];
        // fallback by top-level ancestor name
        let top = d;
        while (top.depth > 1) top = top.parent;
        return fallback(top.data.name);
      })
      .attr("fill-opacity", d => (d.depth === 1 ? (d.children ? 0.8 : 0.6) : 0))
      .attr("pointer-events", d => (d.depth === 1 ? "auto" : "none"))
      .attr("d", d => arc(d.current));

  // pointer cursor for clickable
  path.filter(d => d.children).style("cursor", "pointer").on("click", clicked);

  // tooltip titles for accessibility
  path.append("title").text(d => `${d.ancestors().map(a=>a.data.name).reverse().join(" / ")}\n${d.value}`);

  // labels
  const label = svg.append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
      .attr("dy","0.35em")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(d => d.data.name);

  // parent circle area
  const parent = svg.append("circle")
    .datum(root)
    .attr("r", radius)
    .attr("fill","none")
    .attr("pointer-events","all")
    .on("click", clicked);

  wrap.innerHTML = '';
  wrap.appendChild(svg.node());

  // current focused
  let currentNode = root;

  // initial details empty
  Details.renderEmpty();

  // interactions: tooltip on hover
  path.on("mousemove", (event, d) => {
    const [mx,my] = d3.pointer(event, wrap);
    const name = d.data.name;
    const lvl = d.data.level || dominantLevel(d) || '—';
    const losses = sumLosses(d);
    tooltip.style.display = 'block';
    tooltip.style.left = (event.clientX + 12) + 'px';
    tooltip.style.top = (event.clientY + 12) + 'px';
    tooltip.innerHTML = `<div style="font-weight:600">${name}</div><div class="muted" style="margin-top:6px">Уровень: ${lvl}</div><div style="margin-top:6px;font-weight:600">${losses.toLocaleString('ru-RU')} ₽</div>`;
  });
  path.on("mouseleave", ()=> tooltip.style.display = 'none');

  function sumLosses(node){
    let s = 0;
    node.each(d=>{
      if (d.data && d.data.losses) s += (d.data.losses.direct || 0) + (d.data.losses.indirect || 0);
    });
    return s;
  }

  function dominantLevel(node){
    const order = {"Низкий":1,"Средний":2,"Высокий":3,"Очень высокий":4};
    let best = null;
    node.descendants().forEach(d=>{
      if (d.data && d.data.level){
        if (!best || (order[d.data.level] > order[best])) best = d.data.level;
      }
    });
    return best;
  }

  // click handler - zoom / drill down
  function clicked(event, p){
    if (!p) return;
    currentNode = p;
    // show back button if not root
    backBtn.style.display = (p === root ? 'none' : 'inline-block');

    // update detail panel with aggregated info
    const agg = aggregateForNode(p);
    Details.renderDetails(agg);

    parent.datum(p.parent || root);

    root.each(d => d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    });

    const t = svg.transition().duration(event && event.altKey ? 7500 : 750);

    path.transition(t)
      .tween("data", d => {
        const i = d3.interpolate(d.current, d.target);
        return t => d.current = i(t);
      })
      .filter(function(d){
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.8 : 0.6) : 0)
        .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
        .attrTween("d", d => () => arc(d.current));

    label.filter(function(d){
      return +this.getAttribute("fill-opacity") || labelVisible(d.target);
    }).transition(t)
      .attr("fill-opacity", d => +labelVisible(d.target))
      .attrTween("transform", d => () => labelTransform(d.current));
  }

  function arcVisible(d){
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }
  function labelVisible(d){
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }
  function labelTransform(d){
    const x = (d.x0 + d.x1)/2 * 180 / Math.PI;
    const y = (d.y0 + d.y1)/2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

  // aggregate data for details panel
  function aggregateForNode(node){
    // collect leaves
    const leaves = [];
    node.each(d=>{
      if ((!d.children || d.children.length===0) && d.data) leaves.push(d.data);
    });

    let lossesDirect = 0, lossesIndirect = 0;
    let incidentsAccum = [];
    let covered = 0, totalRisks = 0;
    let news = [], drivers = [], ai = null;
    leaves.forEach(l=>{
      if (l.losses){
        lossesDirect += (l.losses.direct || 0);
        lossesIndirect += (l.losses.indirect || 0);
      }
      if (l.incidents) incidentsAccum = incidentsAccum.concat(l.incidents);
      if (l.covered) covered += l.covered;
      if (l.totalRisks) totalRisks += l.totalRisks;
      if (l.news) news = news.concat(l.news);
      if (l.drivers) drivers = drivers.concat(l.drivers);
      if (l.ai) ai = ai || l.ai;
    });

    const totalLosses = lossesDirect + lossesIndirect;
    const lossesDirectPct = totalLosses ? Math.round(lossesDirect / totalLosses * 100) : 0;
    const lossesIndirectPct = totalLosses ? Math.round(lossesIndirect / totalLosses * 100) : 0;
    const coveragePct = totalRisks ? Math.round(covered / totalRisks * 100) : 0;

    const periodText = document.querySelector('.period-toggle .period.active')?.textContent || '';
    const level = node.data.level || dominantLevel(node) || '—';

    // determine forecast simple heuristic (for prototype): if recent incidents total loss increased — "Рост", else "Стабильно"
    // since we don't have historical slices, we randomize a bit for demo
    const trend = (Math.random() > 0.6) ? 'Рост' : 'Падение';
    const forecast = (trend === 'Рост') ? 'Вероятен рост потерь' : 'Потери стабилизуются';

    return {
      name: node.data.name,
      subtitle: node.ancestors().map(a=>a.data.name).reverse().join(' / '),
      level,
      lossesDirect,
      lossesIndirect,
      totalLosses,
      lossesDirectPct,
      lossesIndirectPct,
      incidentsList: incidentsAccum,
      covered,
      totalRisks,
      coveragePct,
      news: Array.from(new Set(news)),
      drivers: Array.from(new Set(drivers)),
      ai,
      periodText,
      forecast,
      trendText: `${trend} (прототип)`,
      forecastText: forecast
    };
  }

  // back button
  backBtn.addEventListener('click', () => {
    const parentNode = currentNode.parent || root;
    if (parentNode === root) {
      // show root (reset)
      clicked({altKey:false}, root);
      Details.renderEmpty();
      backBtn.style.display = 'none';
      detailTitle.textContent = 'Выберите сегмент';
      detailSubtitle.textContent = 'Кликните сегмент слева';
      currentNode = root;
    } else {
      clicked({altKey:false}, parentNode);
    }
  });

  // period toggles handler
  document.querySelectorAll('.period').forEach(btn => {
    btn.addEventListener('click', (e)=>{
      document.querySelectorAll('.period').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      // optional: update details period text
      if (currentNode && currentNode !== root) {
        const agg = aggregateForNode(currentNode);
        Details.renderDetails(agg);
      }
    });
  });

  // apply filters button (demo: just updates subtitle)
  document.getElementById('apply-filters').addEventListener('click', ()=>{
    const f = document.getElementById('date-from').value;
    const t = document.getElementById('date-to').value;
    const periodText = f || t ? `${f || '—'} — ${t || '—'}` : '';
    document.getElementById('detail-subtitle').textContent = periodText ? `Фильтр: ${periodText}` : 'Кликните сегмент слева';
    // real app: would filter incidents by date and re-aggregate
    if (currentNode && currentNode !== root) {
      const agg = aggregateForNode(currentNode);
      agg.periodText = periodText;
      Details.renderDetails(agg);
    }
  });

  // helper: hide tooltip on general click
  document.addEventListener('click', ()=> tooltip.style.display = 'none');

  // done
})();
