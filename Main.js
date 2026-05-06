/* ── script.js ─────────────────────────────────────────────
   Quiz interativo — tema retro-futurista laranja × roxo
   ─────────────────────────────────────────────────────── */

/* ═══════════════════════════════════════════
   RESPOSTAS CORRETAS
═══════════════════════════════════════════ */
const ANSWERS = {
  p1: 'HTML',
  p2: 'domínio',
  p5: ['javaScript', 'java'],
  p7: 'type',
  p8: 'python',
};

let score = 0;
let verified = {};

/* ═══════════════════════════════════════════
   CURSOR PERSONALIZADO
═══════════════════════════════════════════ */





/* ═══════════════════════════════════════════
   CANVAS HEADER — partículas
═══════════════════════════════════════════ */
function initHeaderCanvas() {
  const header = document.querySelector('header');
  const canvas = document.createElement('canvas');
  canvas.id = 'header-canvas';
  header.insertBefore(canvas, header.firstChild);

  const ctx = canvas.getContext('2d');
  canvas.width  = header.offsetWidth;
  canvas.height = header.offsetHeight;

  const particles = Array.from({length: 60}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + .3,
    vx: (Math.random() - .5) * .4,
    vy: (Math.random() - .5) * .4,
    alpha: Math.random() * .6 + .2,
    color: Math.random() > .5 ? '#ff6a00' : '#9b30ff',
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Linhas entre partículas próximas
    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(155,48,255,${(.6 - d/100) * .3})`;
          ctx.lineWidth = .5;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      });
    });

    // Pontos
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2,'0');
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => { canvas.width = header.offsetWidth; canvas.height = header.offsetHeight; });
}

/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
const toastEl = document.createElement('div');
toastEl.className = 'toast';
document.body.appendChild(toastEl);
let toastTimer;
function toast(msg, type = 'info') {
  toastEl.textContent = msg;
  toastEl.style.borderColor = type === 'ok' ? '#00ff88' : type === 'err' ? '#ff2d78' : 'var(--orange)';
  toastEl.style.color = type === 'ok' ? '#00ff88' : type === 'err' ? '#ff2d78' : 'var(--orange2)';
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

/* ═══════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════ */
const progressWrap = document.createElement('div');
progressWrap.id = 'quiz-progress-wrap';
progressWrap.innerHTML = `
  <span>PROGRESSO</span>
  <div id="quiz-progress-bar"><div id="quiz-progress-fill"></div></div>
  <div id="quiz-score-badge">SCORE: <span id="score-live">0</span>/8</div>
`;
document.querySelector('main').before(progressWrap);
const fill  = () => document.getElementById('quiz-progress-fill');
const score_ = () => document.getElementById('score-live');

function updateProgress() {
  const done = Object.keys(verified).length;
  const pct  = Math.round((done / 8) * 100);
  fill().style.width = pct + '%';
  score_().textContent = score;
}

/* ═══════════════════════════════════════════
   SCORE MODAL
═══════════════════════════════════════════ */
const overlay = document.createElement('div'); overlay.id = 'score-overlay';
overlay.innerHTML = `
  <div id="score-box">
    <h3>▶ Resultado Final</h3>
    <div id="score-number">0</div>
    <div id="score-msg"></div>
    <button class="btn" id="score-close">↺ Tentar novamente</button>
  </div>
`;
document.body.appendChild(overlay);

overlay.addEventListener('click', e => { if(e.target === overlay) overlay.classList.remove('open'); });
document.getElementById('score-close').addEventListener('click', () => {
  overlay.classList.remove('open');
  location.reload();
});

function showScoreModal() {
  const msgs = [
    [0,2, '⚡ Continue tentando! A prática leva à perfeição.'],
    [3,4, '🔥 Bom começo! Revise os conceitos e tente novamente.'],
    [5,7, '💫 Muito bom! Seu conhecimento está sólido.'],
    [8,8, '🏆 Perfeito! Você domina programação web!'],
  ];
  const msg = msgs.find(([a,b]) => score >= a && score <= b);
  document.getElementById('score-number').textContent = score + '/8';
  document.getElementById('score-msg').textContent = msg ? msg[2] : '';

  // Animação do número
  let n = 0;
  const tgt = score;
  const anim = setInterval(() => {
    n += .5;
    if(n >= tgt) { n = tgt; clearInterval(anim); }
    document.getElementById('score-number').textContent = Math.ceil(n) + '/8';
  }, 60);

  overlay.classList.add('open');
}

/* ═══════════════════════════════════════════
   REESTRUTURAR O HTML
═══════════════════════════════════════════ */
function buildQuiz() {
  const main = document.querySelector('main');
  const sections = [...main.querySelectorAll('section')];

  // === SEÇÃO INTRO (primeira) ===
  sections[0].classList.add('intro');

  // === PERGUNTAS RADIO (seções 1 e 2 do HTML original) ===
  // Remover seção vazia (comentário <!-- Pergunta 1: Múltipla escolha -->)
  sections.forEach(s => { if(!s.innerHTML.trim() || s.innerHTML.trim().startsWith('<!--')) s.remove(); });

  // Reprocessar seções após remoção
  const fresh = [...document.querySelectorAll('main section')];

  fresh.forEach((sec, idx) => {
    const radios    = sec.querySelectorAll('input[type="radio"]');
    const checkboxes = sec.querySelectorAll('input[type="checkbox"]');
    const form      = sec.querySelector('form');

    // Label de numeração
    if(idx > 0) {
      const ql = document.createElement('div');
      ql.className = 'q-label';
      ql.textContent = `◈ Pergunta ${idx < 9 ? '0'+idx : idx}`;
      sec.insertBefore(ql, sec.firstChild);
    }

    // Alterar h2 para classe
    const h2 = sec.querySelector('h2');
    if(h2 && idx > 0) h2.className = 'qh';

    /* ── Radio ── */
    if(radios.length) {
      const div = document.createElement('div');
      div.className = 'options';
      div.dataset.type = 'radio';
      div.dataset.qid  = 'p1';

      const letters = ['A','B','C','D'];
      radios.forEach((r, i) => {
        const lbl  = sec.querySelector(`label[for="${r.id}"]`) || r.nextElementSibling;
        const text = lbl ? lbl.textContent.trim() : r.value;
        const opt  = document.createElement('div');
        opt.className = 'opt radio';
        opt.dataset.value = r.value;
        opt.innerHTML = `
          <div class="opt-marker"></div>
          <span class="opt-letter">${letters[i]}</span>
          <span class="opt-text">${text}</span>
        `;
        opt.addEventListener('click', () => selectOpt(div, opt));
        div.appendChild(opt);
      });
      form.replaceWith(div);
      addVerifyBtn(sec, div, 'radio');
    }

    /* ── Checkboxes ── */
    if(checkboxes.length) {
      const div = document.createElement('div');
      div.className = 'options';
      div.dataset.type = 'checkbox';
      div.dataset.qid  = 'p5';

      checkboxes.forEach(cb => {
        const lbl  = sec.querySelector(`label[for="${cb.id}"]`) || cb.nextElementSibling;
        const text = lbl ? lbl.textContent.trim() : cb.value;
        const opt  = document.createElement('div');
        opt.className = 'opt checkbox';
        opt.dataset.value = cb.value;
        opt.innerHTML = `
          <div class="opt-marker"></div>
          <span class="opt-text">${text}</span>
        `;
        opt.addEventListener('click', () => toggleOpt(opt));
        div.appendChild(opt);
      });
      form.replaceWith(div);
      addVerifyBtn(sec, div, 'checkbox');
    }

    /* ── File input ── */
    const fileIn = sec.querySelector('input[type="fyle"], input[type="file"]');
    if(fileIn) {
      fileIn.type = 'file';
      fileIn.accept = '.html';
      fileIn.id = 'p6-input';
      fileIn.style.display = 'none';

      const drop = document.createElement('div');
      drop.className = 'file-drop';
      drop.innerHTML = '<span class="fi">📁</span>Arraste um arquivo .html aqui<br>ou clique para selecionar';
      drop.addEventListener('click', () => fileIn.click());
      drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drag'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
      drop.addEventListener('drop', e => {
        e.preventDefault();
        drop.classList.remove('drag');
        const file = e.dataTransfer.files[0];
        if(file) handleFile(file, drop);
      });
      fileIn.addEventListener('change', () => { if(fileIn.files[0]) handleFile(fileIn.files[0], drop); });

      const wrap = fileIn.parentElement || sec;
      if(form) form.innerHTML = '';
      (form || sec).appendChild(fileIn);
      (form || sec).appendChild(drop);
    }

    /* ── Inputs de texto com estilo e verificação ── */
    const textInputs = sec.querySelectorAll('input[type="text"]');
    textInputs.forEach(inp => {
      inp.className = 'styled-input';
      if(inp.id === 'p2' || inp.id === 'p8') {
        addTextVerify(sec, inp);
      }
    });

    /* ── Password ── */
    const pwdIn = sec.querySelector('input[type="password"]');
    if(pwdIn) {
      pwdIn.className = 'styled-input';
      pwdIn.placeholder = 'Digite uma senha forte...';
      addPasswordStrength(sec, pwdIn);
    }

    /* ── Date ── */
    const dateIn = sec.querySelector('input[type="date"]');
    if(dateIn) {
      dateIn.className = 'styled-input';
      addDateVerify(sec, dateIn);
    }

    /* ── Select ── */
    const sel = sec.querySelector('select');
    if(sel) addVerifyBtn(sec, sel, 'select');

    /* ── Feedback form ── */
    const btn = sec.querySelector('button');
    if(btn && btn.getAttribute('onclick')) {
      btn.removeAttribute('onclick');
      btn.className = 'btn';
      btn.addEventListener('click', e => {
        e.preventDefault();
        const nome  = document.getElementById('nome')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const comt  = document.getElementById('comentários')?.value.trim();
        if(!nome || !email || !comt) { toast('⚠ Preencha todos os campos!', 'err'); return; }
        toast('✓ Feedback enviado! Obrigado, ' + nome + '!', 'ok');
        btn.textContent = '✓ Enviado!';
        setTimeout(() => {
          btn.textContent = 'Enviar feedback';
          document.getElementById('nome').value = '';
          document.getElementById('email').value = '';
          document.getElementById('comentários').value = '';
        }, 3000);
      });

      // Estilizar labels de feedback
      sec.querySelectorAll('label').forEach(l => {
        const span = document.createElement('span');
        span.className = 'field-label';
        span.textContent = l.textContent;
        l.replaceWith(span);
      });
      sec.querySelectorAll('input[type="text"], input[type="email"]').forEach(i => i.className = 'styled-input');

      // Botão de ver resultado geral
      const showResultBtn = document.createElement('button');
      showResultBtn.className = 'btn-ghost';
      showResultBtn.style.marginLeft = '10px';
      showResultBtn.textContent = '▶ Ver minha pontuação';
      showResultBtn.addEventListener('click', e => { e.preventDefault(); showScoreModal(); });
      btn.insertAdjacentElement('afterend', showResultBtn);
    }
  });
}

/* ═══════════════════════════════════════════
   OPÇÕES RADIO
═══════════════════════════════════════════ */
function selectOpt(container, opt) {
  if(container.dataset.locked) return;
  container.querySelectorAll('.opt').forEach(o => o.classList.remove('selected'));
  opt.classList.add('selected');
  opt.querySelector('.opt-marker').textContent = '◆';
}

/* ═══════════════════════════════════════════
   OPÇÕES CHECKBOX
═══════════════════════════════════════════ */
function toggleOpt(opt) {
  if(opt.parentElement.dataset.locked) return;
  opt.classList.toggle('selected');
  opt.querySelector('.opt-marker').textContent = opt.classList.contains('selected') ? '✓' : '';
}

/* ═══════════════════════════════════════════
   VERIFICAR BOTÃO (radio / checkbox / select)
═══════════════════════════════════════════ */
function addVerifyBtn(sec, target, type) {
  const qid = target.dataset?.qid || (sec.querySelector('select') ? 'p7' : null);
  if(!qid) return;

  const btn = document.createElement('button');
  btn.className = 'verify-btn';
  btn.textContent = '◈ Verificar resposta';

  const result = document.createElement('div');
  result.className = 'verify-result';

  btn.addEventListener('click', () => {
    if(verified[qid]) return;
    let ok = false;

    if(type === 'radio') {
      const sel = target.querySelector('.opt.selected');
      if(!sel) { toast('Selecione uma opção!', 'err'); return; }
      ok = sel.dataset.value === ANSWERS[qid];
      target.querySelectorAll('.opt').forEach(o => {
        if(o.dataset.value === ANSWERS[qid]) o.classList.add('correct');
        else if(o.classList.contains('selected') && !ok) o.classList.add('wrong');
        o.classList.remove('selected');
      });
    }

    if(type === 'checkbox') {
      const sels = [...target.querySelectorAll('.opt.selected')].map(o => o.dataset.value.toLowerCase());
      const correct = ANSWERS[qid].map(a => a.toLowerCase());
      ok = sels.length === correct.length && correct.every(c => sels.includes(c));
      target.querySelectorAll('.opt').forEach(o => {
        if(correct.includes(o.dataset.value.toLowerCase())) o.classList.add('correct');
        else if(o.classList.contains('selected')) o.classList.add('wrong');
        o.classList.remove('selected');
      });
    }

    if(type === 'select') {
      const sel = target.value;
      ok = sel === ANSWERS[qid];
      target.style.borderColor = ok ? '#00ff88' : '#ff2d78';
    }

    finalize(qid, ok, result, btn, target);
  });

  sec.appendChild(btn);
  sec.appendChild(result);
}

/* ═══════════════════════════════════════════
   VERIFICAR TEXTO
═══════════════════════════════════════════ */
function addTextVerify(sec, inp) {
  const qid = inp.id;
  const btn = document.createElement('button');
  btn.className = 'verify-btn';
  btn.textContent = '◈ Verificar resposta';
  btn.style.marginTop = '12px';

  const result = document.createElement('div');
  result.className = 'verify-result';

  btn.addEventListener('click', () => {
    if(verified[qid]) return;
    const val = inp.value.trim().toLowerCase();
    if(!val) { toast('Digite uma resposta!', 'err'); return; }
    const ok = val.includes(ANSWERS[qid].toLowerCase());
    inp.style.borderColor = ok ? '#00ff88' : '#ff2d78';
    finalize(qid, ok, result, btn, inp);
  });

  // Enter para verificar
  inp.addEventListener('keydown', e => { if(e.key === 'Enter') btn.click(); });

  sec.appendChild(btn);
  sec.appendChild(result);
}

/* ═══════════════════════════════════════════
   VERIFICAR DATA
═══════════════════════════════════════════ */
function addDateVerify(sec, inp) {
  const btn = document.createElement('button');
  btn.className = 'verify-btn';
  btn.textContent = '◈ Verificar resposta';
  btn.style.marginTop = '12px';

  const result = document.createElement('div');
  result.className = 'verify-result';

  btn.addEventListener('click', () => {
    if(verified['p4']) return;
    if(!inp.value) { toast('Selecione uma data!', 'err'); return; }
    const year = new Date(inp.value).getFullYear() + 1; // +1 por fuso UTC
    const ok = year === 1991 || year === 1993; // HTML 1.0 ~1991/1993
    inp.style.borderColor = ok ? '#00ff88' : '#ff2d78';
    finalize('p4', ok, result, btn, inp);
  });

  sec.appendChild(btn);
  sec.appendChild(result);
}

/* ═══════════════════════════════════════════
   FORÇA DA SENHA
═══════════════════════════════════════════ */
function addPasswordStrength(sec, inp) {
  const bar = document.createElement('div');
  bar.style.cssText = 'margin-top:10px;height:4px;background:var(--border);border-radius:4px;overflow:hidden;';
  const fill = document.createElement('div');
  fill.style.cssText = 'height:100%;width:0%;transition:width .4s,background .4s;border-radius:4px;';
  const label = document.createElement('div');
  label.style.cssText = 'margin-top:6px;font-size:.65rem;font-family:var(--font-display);letter-spacing:2px;color:var(--muted);';
  bar.appendChild(fill);
  inp.after(bar);
  bar.after(label);

  inp.addEventListener('input', () => {
    const v = inp.value;
    let strength = 0;
    if(v.length >= 8)  strength++;
    if(/[A-Z]/.test(v)) strength++;
    if(/[0-9]/.test(v)) strength++;
    if(/[^A-Za-z0-9]/.test(v)) strength++;

    const levels = [
      {pct:'20%', color:'#ff2d78', txt:'FRACA'},
      {pct:'40%', color:'#ff6a00', txt:'RAZOÁVEL'},
      {pct:'70%', color:'#ff9e42', txt:'BOA'},
      {pct:'100%', color:'#00ff88', txt:'FORTE'},
    ];
    const l = levels[Math.max(0, strength - 1)] || levels[0];
    fill.style.width = v ? l.pct : '0%';
    fill.style.background = l.color;
    label.textContent = v ? l.txt : '';
    label.style.color = l.color;
  });
}

/* ═══════════════════════════════════════════
   FILE HANDLER
═══════════════════════════════════════════ */
function handleFile(file, drop) {
  const isHtml = file.name.endsWith('.html') || file.name.endsWith('.htm');
  if(!isHtml) { toast('⚠ Envie apenas arquivos .html!', 'err'); return; }
  drop.classList.add('loaded');
  drop.innerHTML = `<span class="fi">✅</span>${file.name}<br><span style="opacity:.5;font-size:.55rem;">${(file.size/1024).toFixed(1)} KB</span>`;
  toast('✓ Arquivo carregado!', 'ok');
  if(!verified['p6']) { verified['p6'] = true; score++; updateProgress(); }
}

/* ═══════════════════════════════════════════
   FINALIZAR VERIFICAÇÃO
═══════════════════════════════════════════ */
function finalize(qid, ok, resultEl, btn, input) {
  if(verified[qid]) return;
  verified[qid] = true;

  if(ok) {
    score++;
    toast('✓ Correto!', 'ok');
    resultEl.className = 'verify-result correct';
    resultEl.textContent = '✓ CORRETO!';
  } else {
    const ans = ANSWERS[qid];
    const ansText = Array.isArray(ans) ? ans.join(', ') : ans;
    toast('✗ Errado!', 'err');
    resultEl.className = 'verify-result wrong';
    resultEl.textContent = `✗ ERRADO — Resposta: ${ansText}`;
  }
  resultEl.style.display = 'block';
  btn.disabled = true;
  btn.style.opacity = '.4';
  btn.style.cursor = 'not-allowed';

  // Bloquear container
  if(input.dataset) input.dataset.locked = 'true';

  updateProgress();

  // Quando todas verificadas, mostrar modal automaticamente
  if(Object.keys(verified).length === 8) {
    setTimeout(showScoreModal, 600);
  }
}

/* ═══════════════════════════════════════════
   TYPING NO H1
═══════════════════════════════════════════ */
function typeH1() {
  const h1 = document.querySelector('header h1');
  if(!h1) return;
  const txt = h1.textContent;
  h1.textContent = '';
  h1.style.setProperty('-webkit-text-fill-color', 'inherit');

  let i = 0;
  const type = () => {
    if(i < txt.length) {
      h1.textContent += txt[i++];
      setTimeout(type, 38);
    } else {
      h1.style.setProperty('-webkit-text-fill-color', 'transparent');
    }
  };
  setTimeout(type, 400);
}

/* ═══════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════ */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; }
    });
  }, { threshold: .08 });
  document.querySelectorAll('main section').forEach(s => obs.observe(s));
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  buildQuiz();
  initHeaderCanvas();
  typeH1();
  initScrollReveal();
  updateProgress();
  toast('◈ Bem-vindo ao Quiz!');
});