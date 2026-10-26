/* Funções auxiliares de gráfico (as mesmas do painel original), usadas só se a página não as definir. */
(function () {
  if (window.piK) return;
  const root = document.querySelector('.pi');
  const el = (t, c, x) => { const o = document.createElement(t); if (c) o.className = c; if (x != null) o.textContent = x; return o; };
  const link = (t, u) => { if (!/^https?:\/\//.test(String(u || ''))) return document.createTextNode(t || ''); const a = el('a', null, t); a.href = u; a.target = '_blank'; a.rel = 'noopener'; return a; };
  const tipFor = (box) => { let t = box.querySelector('.tip'); if (!t) { t = el('div', 'tip'); t.hidden = true; box.appendChild(t); } return t; };
  const showTip = (box, tip, linhas, x, y) => {
    tip.replaceChildren();
    linhas.forEach(([k, v, c]) => { const d = el('div'); if (k) d.appendChild(el('span', 't-k', k + ' ')); d.appendChild(el('span', c || 't-v', v)); tip.appendChild(d); });
    tip.hidden = false;
    const W = box.clientWidth, w = tip.offsetWidth, h = tip.offsetHeight;
    let l = x + 12; if (l + w > W) l = Math.max(0, x - w - 12);
    let t = y - h - 10; if (t < 0) t = y + 14;
    tip.style.left = l + 'px'; tip.style.top = t + 'px';
  };
  const textW = (box, txt, size) => { const s = d3.create('svg'), t = s.append('text').text(txt); if (size) t.style('font-size', size); box.appendChild(s.node()); const w = t.node().getComputedTextLength(); s.remove(); return w; };
  const ruim = (st) => st === 'error' || st === 'connect' || st === 'declined';
  const estado = (box, ...ids) => {
    const ds = ids.map((i) => dash.data(i));
    if (box) box.classList.toggle('dash-skeleton', ds.some((d) => d.status === 'loading'));
    if (ds.some((d) => ruim(d.status))) { if (box) { box.replaceChildren(); box.appendChild(el('div', 'fail', 'Não foi possível carregar os dados')); } return null; }
    if (ds.some((d) => d.status !== 'ok')) { if (box) box.replaceChildren(); return null; }
    return ds.map((d) => d.data);
  };
  window.piK = { el, link, tipFor, showTip, textW, estado };
  void root;
})();
(function () {
  dash.calc('prorrog_peso', {
    title: 'Votos depois das 17h × vantagem de Lula',
    description: 'Votos para presidente registrados depois das 17h como porcentagem da diferença de votos entre Lula e Flávio no 2º turno.',
    inputs: ['prorrog_numeros'],
    fn: (prorrog_numeros) => {
      const v = (id) => Number((prorrog_numeros.find((r) => r.id === id) || {}).valor);
      const vantagem = v('lula_votos') - v('flavio_votos');
      return [{ id: 'peso', vantagem, votos_apos_17h: v('votos_apos_17h'), pct: (v('votos_apos_17h') / vantagem) * 100 }];
    },
  });

  dash.calc('prorrog_tab', {
    title: 'Cidades dos pedidos, 1º e 2º turno',
    description: 'Votos válidos de Flávio e Lula e abstenção em cada cidade citada nos pedidos, com a diferença entre os candidatos e a variação do 1º para o 2º turno.',
    inputs: ['prorrog_cidades'],
    fn: (prorrog_cidades) => prorrog_cidades.map((c) => {
      const f1 = Number(c.flavio_1t), l1 = Number(c.lula_1t), f2 = Number(c.flavio_2t), l2 = Number(c.lula_2t);
      return {
        id: c.id, cidade: c.cidade, uf: c.uf, pedido: c.pedido,
        flavio_1t: f1, lula_1t: l1, flavio_2t: f2, lula_2t: l2,
        d_flavio: f2 - f1, d_lula: l2 - l1,
        margem_1t: l1 - f1, margem_2t: l2 - f2,
        abst_1t: Number(c.abst_1t), abst_2t: Number(c.abst_2t), d_abst: Number(c.abst_2t) - Number(c.abst_1t),
        vencedor_1t: l1 > f1 ? 'Lula' : 'Flávio', vencedor_2t: l2 > f2 ? 'Lula' : 'Flávio',
        fonte: c.fonte, fonte_url: c.fonte_url,
      };
    }),
  });


  dash.calc('prorrog_totais', {
    title: 'Soma das cidades dos pedidos',
    description: 'Soma, no 2º turno, dos eleitores aptos, do comparecimento e dos votos de Flávio, Lula, brancos e nulos nas cidades citadas nos pedidos: todas, só as do pedido de Flávio e só as do pedido de Lula (São Paulo entra nos dois).',
    inputs: ['prorrog_cidades'],
    fn: (prorrog_cidades) => [['todas', () => true], ['Flávio', (c) => c.pedido === 'Flávio' || c.pedido === 'Ambos'], ['Lula', (c) => c.pedido === 'Lula' || c.pedido === 'Ambos']].map(([id, ok]) => {
      const cs = prorrog_cidades.filter(ok);
      const soma = (k) => cs.reduce((t, c) => t + Number(c[k]), 0);
      const aptos = soma('aptos_2t'), comp = soma('comparecimento_2t'), fl = soma('flavio_votos_2t'), lu = soma('lula_votos_2t'), br = soma('brancos_2t'), nu = soma('nulos_2t');
      const val = fl + lu;
      return { id, cidades: cs.length, aptos, comparecimento: comp, abstencao: aptos - comp, flavio: fl, lula: lu, brancos: br, nulos: nu, validos: val,
        flavio_pct_validos: (fl / val) * 100, lula_pct_validos: (lu / val) * 100,
        flavio_pct_total: (fl / comp) * 100, lula_pct_total: (lu / comp) * 100, brancos_pct_total: (br / comp) * 100, nulos_pct_total: (nu / comp) * 100,
        comparecimento_pct: (comp / aptos) * 100, abstencao_pct: ((aptos - comp) / aptos) * 100 };
    }),
  });

  const K = () => window.piK;
  const nf = (c) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
  const f = (v, c) => (v == null || isNaN(v) ? '—' : (v < 0 ? '−' : '') + nf(c).format(Math.abs(v)));
  const fs = (v, c) => (v == null || isNaN(v) ? '—' : (v > 0 ? '+' : v < 0 ? '−' : '') + nf(c).format(Math.abs(v)));
  const seguro = (fn) => { try { fn(); } catch (e) { console.error('[prorrogacao]', e); } };
  const cls = (ator) => (ator === 'Lula' ? 'l' : ator === 'Flávio' ? 'f' : ator === 'Regra' ? 'r' : 'j');
  let filtro = 'todas';

  function marcas(scope) {
    scope.querySelectorAll('[data-source][data-field][data-where]').forEach((b) => {
      if (b.tagName === 'TH' || b.tagName === 'TABLE') return;
      const src = dash.data(b.getAttribute('data-source'));
      const [k, v] = b.getAttribute('data-where').split('=');
      const r = src.status === 'ok' ? src.data.find((x) => String(x[k]) === v) : null;
      const val = r ? r[b.getAttribute('data-field')] : null;
      if (val == null || val === '') { b.textContent = '—'; return; }
      const fm = b.dataset.fmt || 'c0';
      b.textContent = fm === 'txt' ? String(val) : f(Number(val), Number(fm.slice(1)));
    });
  }

  function desenharCrono() {
    const box = document.getElementById('pr-crono');
    const r = K().estado(box, 'prorrog_cronologia'); if (!r) return;
    const { el, link } = K();
    box.replaceChildren(...r[0].slice().sort((a, b) => Number(a.ordem) - Number(b.ordem)).map((e) => {
      const li = el('li', 'pr-ev');
      const c = cls(e.ator);
      const corpo = el('div');
      corpo.append(el('span', 'pr-ator ' + c, e.ator === 'Regra' ? 'Horário oficial' : e.ator === 'Lula' ? 'Campanha de Lula' : e.ator === 'Flávio' ? 'Campanha de Flávio' : e.ator));
      corpo.append(el('p', null, e.evento));
      const s = el('p', 'note'); s.append('Fonte: ', link(e.fonte, e.fonte_url)); corpo.append(s);
      li.append(el('span', 'pr-hora', e.hora), el('span', 'pr-dot ' + c), corpo);
      return li;
    }));
  }

  function desenharPedidos() {
    const box = document.getElementById('pr-ped');
    const r = K().estado(box, 'prorrog_pedidos'); if (!r) return;
    const { el, link } = K();
    box.replaceChildren(...[['Lula', 'l', 'Campanha de Lula'], ['Flávio', 'f', 'Campanha de Flávio Bolsonaro']].map(([camp, c, tit]) => {
      const col = el('div', 'pr-col ' + c); col.append(el('h4', null, tit));
      r[0].filter((p) => p.campanha === camp).sort((a, b) => Number(a.ordem) - Number(b.ordem)).forEach((p) => {
        const it = el('div', 'pr-ped');
        it.append(el('span', 'pr-ator ' + c, p.hora + ' · pedido ao ' + p.tribunal + ' · até as ' + p.ate));
        const linha = (k, v) => { if (!v) return; const q = el('p'); q.append(el('span', 'pr-k', k + ': '), v); it.append(q); };
        linha('Onde', p.onde); linha('Motivo', p.motivo); linha('Pediu também', p.extra); linha('O que aconteceu', p.resultado);
        const s = el('p', 'note'); s.append('Fonte: ', link(p.fonte, p.fonte_url)); it.append(s);
        col.append(it);
      });
      return col;
    }));
  }

  function textoEfeito() {
    const pe = dash.data('prorrog_peso'), nu = dash.data('prorrog_numeros');
    const p = document.getElementById('pr-txt-efeito');
    if (pe.status !== 'ok' || nu.status !== 'ok') { p.textContent = '—'; return; }
    const v = (id) => Number(nu.data.find((r) => r.id === id).valor);
    const w = pe.data[0];
    p.textContent = `Lula venceu por ${f(w.vantagem, 0)} votos (${f(v('lula_pct'), 2)}% a ${f(v('flavio_pct'), 2)}%). Os ${f(w.votos_apos_17h, 0)} votos registrados depois das 17h, se fossem todos para um só candidato, mudariam a diferença em ${f(w.pct, 1)}%. A apuração ficou parada das 17h06 às 19h; quando foi suspensa, ${f(v('secoes_suspensao'), 0)} das ${f(v('secoes_total'), 0)} seções já tinham sido apuradas. A abstenção nacional caiu de ${f(v('abst1'), 2)}% no 1º turno para ${f(v('abst2'), 2)}%.`;
  }

  const visiveis = (rows) => rows.filter((r) => filtro === 'todas' || r.pedido === filtro || r.pedido === 'Ambos');

  function textoCidades(rows) {
    const p = document.getElementById('pr-txt-cid');
    const g = (lista) => ({
      n: lista.length,
      f: lista.filter((r) => r.vencedor_2t === 'Flávio').length,
      l: lista.filter((r) => r.vencedor_2t === 'Lula').length,
      virou: lista.filter((r) => r.vencedor_1t !== r.vencedor_2t),
      cresceuMais: lista.filter((r) => r.d_lula > r.d_flavio).length,
      abstCaiu: lista.filter((r) => r.d_abst < 0).length,
      abstSubiu: lista.filter((r) => r.d_abst > 0),
    });
    const fl = g(rows.filter((r) => r.pedido === 'Flávio' || r.pedido === 'Ambos'));
    const lu = g(rows.filter((r) => r.pedido === 'Lula' || r.pedido === 'Ambos'));
    const t = g(rows);
    const nomes = (l) => l.map((r) => r.cidade).join(', ');
    const partes = [];
    if (filtro !== 'Lula') partes.push(`Das ${fl.n} cidades no pedido de Flávio, ele venceu em ${fl.f} e Lula em ${fl.l}.`);
    if (filtro !== 'Flávio') partes.push(`Lula venceu nas ${lu.l} de ${lu.n} cidades citadas pela campanha dele.`);
    const sel = filtro === 'todas' ? t : filtro === 'Flávio' ? fl : lu;
    if (sel.virou.length) partes.push(`Mudaram de vencedor do 1º para o 2º turno: ${nomes(sel.virou)}.`);
    partes.push(`Lula cresceu mais que Flávio entre os turnos em ${sel.cresceuMais} de ${sel.n}, como no resultado nacional.`);
    partes.push(`A abstenção caiu em ${sel.abstCaiu} de ${sel.n}` + (sel.abstSubiu.length ? `; subiu em ${nomes(sel.abstSubiu)}.` : '.'));
    p.textContent = partes.join(' ');
  }

  function labelsLayout(box, rows, W) {
    const lw = Math.max(...rows.map((r) => K().textW(box, r.rot)));
    const stack = lw > W * 0.36;
    return { stack, lw: stack ? 0 : lw + 12 };
  }

  function desenharMargem(rowsAll) {
    const box = document.getElementById('pr-ch-margem');
    const rows = visiveis(rowsAll).map((r) => Object.assign({ rot: r.cidade + ' (' + r.uf + ')' }, r)).sort((a, b) => b.flavio_2t - a.flavio_2t);
    if (!rows.length) { box.replaceChildren(); return; }
    const W = Math.max(280, box.clientWidth);
    const { stack, lw } = labelsLayout(box, rows, W);
    const bh = 22, gap = stack ? 24 : 8, top = 24;
    const H = top + rows.length * (bh + gap) + 4;
    const x = d3.scaleLinear([0, 100], [lw, W]);
    const svg = d3.create('svg').attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img').attr('aria-label', 'Resultado do 2º turno em cada cidade, em % dos votos válidos de Flávio e de Lula');
    svg.append('text').attr('x', x(0)).attr('y', 14).style('fill', 'var(--dir)').style('font-weight', 600).text('Flávio');
    svg.append('text').attr('x', x(100)).attr('y', 14).attr('text-anchor', 'end').style('fill', 'var(--esq)').style('font-weight', 600).text('Lula');
    svg.append('text').attr('x', x(50)).attr('y', 14).attr('text-anchor', 'middle').text('50%');
    const cabe = (txt, larg) => K().textW(box, txt) + 12 <= larg;
    const hits = [];
    rows.forEach((r, i) => {
      const y = top + i * (bh + gap) + (stack ? 16 : 0);
      svg.append('text').attr('x', stack ? lw : lw - 8).attr('y', stack ? y - 5 : y + bh / 2 + 4).attr('text-anchor', stack ? 'start' : 'end').style('fill', 'var(--color-fg)').text(r.rot);
      const xs = x(r.flavio_2t);
      svg.append('rect').attr('x', x(0)).attr('y', y).attr('width', Math.max(0, xs - x(0))).attr('height', bh).attr('fill', 'var(--dir)');
      svg.append('rect').attr('x', xs).attr('y', y).attr('width', Math.max(0, x(100) - xs)).attr('height', bh).attr('fill', 'var(--esq)');
      [[r.flavio_2t, x(0), xs, 'start', 'Flávio', r.vencedor_2t === 'Flávio'], [r.lula_2t, xs, x(100), 'end', 'Lula', r.vencedor_2t === 'Lula']].forEach(([v, a, b, anc, nome, venceu]) => {
        const larg = b - a, curto = f(v, 1) + '%';
        const txt = cabe(curto, larg) ? curto : '';
        if (!txt) return;
        svg.append('text').attr('x', anc === 'start' ? a + 6 : b - 6).attr('y', y + bh / 2 + 4).attr('text-anchor', anc).style('fill', 'var(--color-bg)').style('font-weight', venceu ? 700 : 500).text(txt);
      });
      hits.push({ r, y });
    });
    svg.append('line').attr('x1', x(50)).attr('x2', x(50)).attr('y1', top - 4).attr('y2', H - 2).attr('stroke', 'var(--color-fg)').attr('stroke-dasharray', '3 3').attr('stroke-width', 1.5);
    const hit = svg.append('g').selectAll('rect').data(hits).join('rect').attr('x', 0).attr('width', W).attr('y', (d) => d.y - (stack ? 18 : 4)).attr('height', bh + (stack ? 22 : 8)).attr('fill', 'transparent');
    box.replaceChildren(svg.node());
    const tip = K().tipFor(box);
    hit.on('pointerenter pointermove', (ev, d) => {
      const r = d.r; const [bx, by] = d3.pointer(ev, box);
      K().showTip(box, tip, [
        [r.cidade + ' (' + r.uf + ')', ''],
        ['Pedido:', r.pedido === 'Ambos' ? 'das duas campanhas' : 'de ' + r.pedido],
        ['2º turno:', 'Flávio ' + f(r.flavio_2t, 2) + '% · Lula ' + f(r.lula_2t, 2) + '%'],
        ['1º turno:', 'Flávio ' + f(r.flavio_1t, 2) + '% · Lula ' + f(r.lula_1t, 2) + '%'],
        ['Venceu:', r.vencedor_2t],
      ], bx, by);
    }).on('pointerleave', () => { tip.hidden = true; });
  }

  function desenharAbst(rowsAll) {
    const box = document.getElementById('pr-ch-abst');
    const rows = visiveis(rowsAll).map((r) => Object.assign({ rot: r.cidade + ' (' + r.uf + ')' }, r)).sort((a, b) => a.d_abst - b.d_abst);
    if (!rows.length) { box.replaceChildren(); return; }
    const W = Math.max(280, box.clientWidth);
    const { stack, lw } = labelsLayout(box, rows, W);
    const rh = stack ? 34 : 20, top = 6;
    const H = top + rows.length * rh + 22;
    const lo = Math.floor(d3.min(rows, (r) => Math.min(r.abst_1t, r.abst_2t)) - 1), hi = Math.ceil(d3.max(rows, (r) => Math.max(r.abst_1t, r.abst_2t)) + 1);
    const x = d3.scaleLinear([lo, hi], [lw + 6, W - 52]);
    const svg = d3.create('svg').attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img').attr('aria-label', 'Abstenção por cidade no 1º e no 2º turno');
    const ticks = x.ticks(W < 460 ? 4 : 7);
    svg.append('g').selectAll('line').data(ticks).join('line').attr('x1', x).attr('x2', x).attr('y1', top).attr('y2', H - 20).attr('stroke', 'var(--cds-chart-grid)');
    svg.append('g').selectAll('text').data(ticks).join('text').attr('x', x).attr('y', H - 6).attr('text-anchor', 'middle').text((d) => f(d, 0) + '%');
    const hits = [];
    rows.forEach((r, i) => {
      const yb = top + i * rh, y = yb + (stack ? 22 : rh / 2);
      svg.append('text').attr('x', stack ? lw + 6 : lw - 4).attr('y', stack ? yb + 11 : y + 4).attr('text-anchor', stack ? 'start' : 'end').style('fill', 'var(--color-fg)').text(r.rot);
      const cor = r.d_abst <= 0 ? 'var(--seq)' : 'var(--color-bad)';
      svg.append('line').attr('x1', x(r.abst_1t)).attr('x2', x(r.abst_2t)).attr('y1', y).attr('y2', y).attr('stroke', cor).attr('stroke-width', 3);
      svg.append('circle').attr('cx', x(r.abst_1t)).attr('cy', y).attr('r', 4.5).attr('fill', 'var(--color-panel)').attr('stroke', cor).attr('stroke-width', 2);
      svg.append('circle').attr('cx', x(r.abst_2t)).attr('cy', y).attr('r', 5).attr('fill', cor);
      svg.append('text').attr('x', x(Math.max(r.abst_1t, r.abst_2t)) + 9).attr('y', y + 4).style('fill', 'var(--color-fg)').style('font-weight', 600).text(fs(r.d_abst, 1));
      hits.push({ r, yb });
    });
    const hit = svg.append('g').selectAll('rect').data(hits).join('rect').attr('x', 0).attr('width', W).attr('y', (d) => d.yb).attr('height', rh).attr('fill', 'transparent');
    box.replaceChildren(svg.node());
    const tip = K().tipFor(box);
    hit.on('pointerenter pointermove', (ev, d) => {
      const r = d.r; const [bx, by] = d3.pointer(ev, box);
      K().showTip(box, tip, [[r.cidade + ' (' + r.uf + ')', ''], ['Abstenção no 1º turno:', f(r.abst_1t, 2) + '%'], ['Abstenção no 2º turno:', f(r.abst_2t, 2) + '%'], ['Variação:', fs(r.d_abst, 2) + ' pontos']], bx, by);
    }).on('pointerleave', () => { tip.hidden = true; });
  }

  function desenharTabela(rowsAll) {
    const tb = document.querySelector('#pr-tab tbody');
    const { el, link } = K();
    const rows = visiveis(rowsAll).slice().sort((a, b) => (a.pedido === b.pedido ? a.margem_2t - b.margem_2t : a.pedido < b.pedido ? -1 : 1));
    tb.replaceChildren(...rows.map((r) => {
      const tr = el('tr'); tr.dataset.key = r.id;
      tr.append(el('td', null, r.cidade), el('td', null, r.uf));
      const tdp = el('td'); tdp.append(el('span', 'pr-tag ' + (r.pedido === 'Lula' ? 'l' : r.pedido === 'Flávio' ? 'f' : ''), r.pedido)); tr.append(tdp);
      [r.flavio_1t, r.lula_1t].forEach((v) => tr.append(el('td', null, f(v, 2))));
      tr.append(el('td', r.vencedor_2t === 'Flávio' ? 'pr-pos' : null, f(r.flavio_2t, 2)));
      tr.append(el('td', r.vencedor_2t === 'Lula' ? 'pr-pos' : null, f(r.lula_2t, 2)));
      tr.append(el('td', null, fs(r.d_flavio, 1)), el('td', null, fs(r.d_lula, 1)));
      tr.append(el('td', null, f(r.abst_1t, 2)), el('td', null, f(r.abst_2t, 2)));
      const tdf = el('td'); tdf.append(link(r.fonte, r.fonte_url)); tr.append(tdf);
      tr.querySelectorAll('td')[r.vencedor_2t === 'Flávio' ? 5 : 6].style.fontWeight = '700';
      return tr;
    }));
  }

  function desenharTotal() {
    const box = document.getElementById('pr-ch-total');
    const r = K().estado(box, 'prorrog_totais'); if (!r) return;
    const t = r[0].find((x) => x.id === filtro); if (!t) { box.replaceChildren(); return; }
    const { el } = K();
    const W = Math.max(280, box.clientWidth), bh = 30;
    const segs = [
      { nome: 'Flávio', v: t.flavio, pt: t.flavio_pct_total, cor: 'var(--dir)', txt: 'var(--color-bg)', pv: t.flavio_pct_validos },
      { nome: 'Lula', v: t.lula, pt: t.lula_pct_total, cor: 'var(--esq)', txt: 'var(--color-bg)', pv: t.lula_pct_validos },
      { nome: 'Brancos', v: t.brancos, pt: t.brancos_pct_total, cor: 'var(--cds-chart-grid, #d0d0d0)', txt: 'var(--color-fg)' },
      { nome: 'Nulos', v: t.nulos, pt: t.nulos_pct_total, cor: 'var(--neutro)', txt: 'var(--color-bg)' },
    ];
    const x = d3.scaleLinear([0, t.comparecimento], [0, W]);
    const svg = d3.create('svg').attr('width', '100%').attr('viewBox', `0 0 ${W} ${bh + 18}`).attr('role', 'img').attr('aria-label', 'Todos os votos do 2º turno somados nas cidades dos pedidos, divididos entre Flávio, Lula, brancos e nulos');
    let acc = 0;
    segs.forEach((s) => {
      const a = x(acc), b = x(acc + s.v); acc += s.v;
      svg.append('rect').attr('x', a).attr('y', 0).attr('width', Math.max(0, b - a)).attr('height', bh).attr('fill', s.cor).attr('stroke', 'var(--color-panel)').attr('stroke-width', 1);
      const lab = f(s.pt, 1) + '%';
      if (K().textW(box, lab) + 10 <= b - a) svg.append('text').attr('x', (a + b) / 2).attr('y', bh / 2 + 5).attr('text-anchor', 'middle').style('fill', s.txt).style('font-weight', 600).text(lab);
    });
    const vMeio = t.comparecimento / 2;
    svg.append('line').attr('x1', x(vMeio)).attr('x2', x(vMeio)).attr('y1', -2).attr('y2', bh + 4).attr('stroke', 'var(--color-fg)').attr('stroke-dasharray', '3 3');
    svg.append('text').attr('x', x(vMeio)).attr('y', bh + 16).attr('text-anchor', 'middle').text('metade dos votos');
    const leg = el('div', 'pr-tot-leg');
    segs.forEach((s) => {
      const it = el('div', 'pr-tot-it');
      const sw = el('i', 'pr-tot-sw'); sw.style.background = s.cor; it.append(sw);
      const d = el('div');
      d.append(el('div', 'pr-tot-n', s.nome), el('div', 'pr-tot-v', f(s.v, 0) + ' votos'));
      d.append(el('div', 'note', s.pv != null ? f(s.pv, 2) + '% dos votos válidos · ' + f(s.pt, 1) + '% do total' : f(s.pt, 2) + '% do total de votos'));
      it.append(d); leg.append(it);
    });
    const venc = t.lula > t.flavio ? 'Lula' : 'Flávio', dif = Math.abs(t.lula - t.flavio);
    const res = el('p', 'pr-tot-res');
    res.append(el('b', null, venc + ' venceria nessas ' + t.cidades + ' cidades'), ', com ' + f(Math.max(t.lula_pct_validos, t.flavio_pct_validos), 2) + '% dos votos válidos e ' + f(dif, 0) + ' votos de diferença.');
    const nota = el('p', 'note', `Eleitores aptos: ${f(t.aptos, 0)}. Compareceram ${f(t.comparecimento, 0)} (${f(t.comparecimento_pct, 2)}%); abstenção de ${f(t.abstencao, 0)} (${f(t.abstencao_pct, 2)}%). Votos válidos (só Flávio e Lula): ${f(t.validos, 0)}.`);
    box.replaceChildren(res, svg.node(), leg, nota);
    document.getElementById('pr-tot-tit').textContent = 'Resultado somando as ' + t.cidades + ' cidades' + (filtro === 'todas' ? '' : ' do pedido de ' + filtro) + ' (2º turno)';
  }

  const unicas = (...listas) => { const m = new Map(); listas.flat().forEach((r) => { if (r && r.fonte && !m.has(r.fonte)) m.set(r.fonte, r.fonte_url); }); return [...m]; };
  function linhaFontes(p, rot, pares) {
    const { link } = K();
    p.replaceChildren(rot);
    pares.forEach(([t, u], i) => { if (i) p.append('; '); p.append(link(t, u)); });
    p.append('.');
  }

  function fontesCidades(rowsCid, turnos) {
    const { link } = K();
    const vis = visiveis(rowsCid).slice().sort((a, b) => a.cidade.localeCompare(b.cidade, 'pt-BR'));
    ['pr-src-tot', 'pr-src-mar', 'pr-src-abs'].forEach((id) => {
      const p = document.getElementById(id); if (!p) return;
      p.replaceChildren('Fonte: TSE, ' + turnos[id] + ', 100% das seções apuradas, consultado no Ouviram em cada página de cidade: ');
      vis.forEach((c, i) => { if (i) p.append(', '); p.append(link(c.cidade + ' (' + c.uf + ')', c.fonte_url)); });
      p.append('.');
    });
  }

  function desenharFontes() {
    const box = document.getElementById('pr-fontes');
    const r = K().estado(box, 'prorrog_cronologia', 'prorrog_pedidos', 'prorrog_numeros', 'prorrog_cidades'); if (!r) return;
    const [cro, ped, nu, cid] = r;
    const { el, link } = K();
    const bloco = (tit, nota, pares) => {
      const d = el('div'); d.append(el('h4', null, tit));
      const ul = el('ul');
      pares.forEach(([t, u]) => { const li = el('li'); li.append(link(t, u)); ul.append(li); });
      d.append(ul); if (nota) d.append(el('p', 'note', nota));
      return d;
    };
    box.replaceChildren(
      bloco('Cronologia e pedidos das campanhas', 'Horários, cidades e motivos de cada pedido; decisões do STF, do TSE e do TRE-SP.', unicas(cro, ped)),
      bloco('Números do efeito da prorrogação', 'Votos depois das 17h, resultado nacional, seções apuradas, urnas já fechadas e abstenção.', unicas(nu)),
      bloco('Resultados por cidade (TSE, via Ouviram)', 'Usados no resultado somado, no gráfico por cidade, no de abstenção e na tabela: votos e percentuais do 1º e do 2º turno, brancos, nulos, aptos e comparecimento.',
        cid.slice().sort((a, b) => a.cidade.localeCompare(b.cidade, 'pt-BR')).map((c) => [c.cidade + ' (' + c.uf + ')', c.fonte_url])),
    );
  }

  function desenharCidades() {
    const r = K().estado(document.getElementById('pr-ch-margem'), 'prorrog_tab');
    K().estado(document.getElementById('pr-ch-abst'), 'prorrog_tab');
    if (!r) { document.querySelector('#pr-tab tbody').replaceChildren(); document.getElementById('pr-txt-cid').textContent = '—'; return; }
    const rows = r[0];
    const cidOk = dash.data('prorrog_cidades');
    if (cidOk.status === 'ok') seguro(() => fontesCidades(cidOk.data, { 'pr-src-tot': 'resultado do 2º turno', 'pr-src-mar': 'resultado do 2º turno', 'pr-src-abs': 'abstenção do 1º e do 2º turno' }));
    seguro(() => textoCidades(rows)); seguro(desenharTotal); seguro(() => desenharMargem(rows)); seguro(() => desenharAbst(rows)); seguro(() => desenharTabela(rows));
  }

  document.querySelectorAll('#pr-chips .chip').forEach((c) => c.addEventListener('click', () => {
    filtro = c.dataset.v;
    document.querySelectorAll('#pr-chips .chip').forEach((b) => b.setAttribute('aria-pressed', String(b === c)));
    seguro(desenharCidades);
  }));

  let chave = null;
  window.piProrrog = function () {
    const sec = document.getElementById('prorrogacao'); if (!sec || sec.hidden || !window.piK) return;
    const ids = ['prorrog_cronologia', 'prorrog_pedidos', 'prorrog_numeros', 'prorrog_cidades', 'prorrog_peso', 'prorrog_tab', 'prorrog_totais'];
    const k = sec.clientWidth + '|' + ids.map((i) => dash.data(i).status).join('|');
    if (k === chave) return;
    chave = ids.every((i) => dash.data(i).status === 'ok') ? k : null;
    marcas(sec);
    seguro(desenharCrono); seguro(desenharPedidos); seguro(textoEfeito); seguro(desenharCidades); seguro(desenharFontes);
    seguro(() => { const nu = dash.data('prorrog_numeros'); const p = document.getElementById('pr-src-efeito'); if (nu.status === 'ok') linhaFontes(p, 'Fontes: ', unicas(nu.data)); else p.replaceChildren(); });
  };
  dash.onData(() => { if (window.piProrrog) window.piProrrog(); });
})();
