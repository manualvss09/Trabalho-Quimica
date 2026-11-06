const slides = [...document.querySelectorAll('.slide')];
const phaseButtons = [...document.querySelectorAll('.phase-btn[data-target]')];
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slideControls = document.querySelector('.controls');
const currentIndicator = document.getElementById('currentIndicator');
const totalIndicator = document.getElementById('totalIndicator');
const progressFill = document.getElementById('progressFill');
const phaseNameDisplay = document.getElementById('phaseNameDisplay');
const gamepadStatus = document.getElementById('gamepadStatus');
const toast = document.getElementById('toast');
const modal = document.getElementById('referenceModal');
const referenceBtn = document.querySelector('[data-reference-modal]');
const closeModalBtn = document.querySelector('.close-modal');
const quizApp = document.getElementById('quizApp');
const gamepadStatus = document.getElementById('gamepadStatus');
const totalSlides = slides.length - 1;
let currentSlide = 0;
let toastTimer = null;
let gamepadFrame = null;
let gamepadDirection = '';
let nextDirectionRepeat = 0;
const previousGamepadButtons = new Map();

const quizQuestions = [
  {
    question: 'Qual é o elemento central da Química Orgânica?',
    options: ['Oxigênio', 'Carbono', 'Nitrogênio', 'Hidrogênio'],
    answer: 1,
    explanation: 'O carbono é a base dos compostos orgânicos.'
  },
  {
    question: 'Qual experimento ajudou a enfraquecer o vitalismo?',
    options: ['Síntese da ureia', 'Separação do ar', 'Fermentação do açúcar', 'Eletrólise do sal'],
    answer: 0,
    explanation: 'Wöhler sintetizou ureia em laboratório, mostrando que um composto orgânico podia ser produzido fora dos seres vivos.'
  },
  {
    question: 'Qual área está diretamente ligada aos carboidratos, lipídios e proteínas?',
    options: ['Geologia', 'Alimentação', 'Astronomia', 'Eletricidade'],
    answer: 1,
    explanation: 'Esses compostos orgânicos são fundamentais para a nutrição e para a vida.'
  },
  {
    question: 'Qual é uma aplicação importante da Química Orgânica na proteção ambiental?',
    options: ['Produção de bioplásticos e biocombustíveis', 'Criação de moedas digitais', 'Evacuação de rios', 'Construção de casas sem cimento'],
    answer: 0,
    explanation: 'A Química Orgânica pode criar alternativas mais sustentáveis e reduzir impactos ambientais.'
  },
  {
    question: 'Qual função dos compostos orgânicos na área da saúde?',
    options: ['Apenas decorar fórmulas', 'Produzir medicamentos e anestésicos', 'Substituir todos os alimentos', 'Aumentar a pressão atmosférica'],
    answer: 1,
    explanation: 'Muitos remédios e anestésicos são compostos orgânicos usados no cuidado à saúde.'
  }
];

const quizState = {
  currentIndex: 0,
  score: 0,
  answered: false,
  selectedAnswer: 0,
  complete: false
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 1800);
}

function updateProgress() {
  const percent = totalSlides === 0 ? 0 : (currentSlide / totalSlides) * 100;

  currentIndicator.textContent = String(currentSlide).padStart(2, '0');
  totalIndicator.textContent = String(totalSlides).padStart(2, '0');
  progressFill.style.width = `${percent}%`;
  phaseNameDisplay.textContent = currentSlide === 0
    ? 'MENU DA MISSÃO'
    : `FASE ${String(currentSlide).padStart(2, '0')}`;

  phaseButtons.forEach((button) => {
    const target = Number(button.dataset.target);
    button.classList.toggle('active', target === currentSlide);
    button.setAttribute('aria-current', target === currentSlide ? 'step' : 'false');
  });

  prevBtn.disabled = currentSlide === 0;
<<<<<<< HEAD
  if (currentSlide === 7) {
    nextBtn.textContent = quizState.complete ? 'CONCLUIR MISSÃO →' : 'QUIZ EM ANDAMENTO';
    nextBtn.disabled = !quizState.complete;
  } else {
    nextBtn.disabled = false;
    nextBtn.textContent = currentSlide === slides.length - 1 ? 'VOLTAR AO MENU' : 'PRÓXIMA FASE →';
  }
=======
  prevBtn.style.opacity = currentSlide === 0 ? '0.45' : '1';
  prevBtn.style.cursor = currentSlide === 0 ? 'not-allowed' : 'pointer';

  nextBtn.textContent = currentSlide === slides.length - 1 ? 'VOLTAR AO INÍCIO' : 'PRÓXIMO →';
  slideControls.classList.toggle('hidden', currentSlide === 0);
>>>>>>> 5fa7841 (Slide finalizado)
}

function getNavigableElements() {
  const activeSlide = slides[currentSlide];
  const candidates = [
    ...(activeSlide ? activeSlide.querySelectorAll('button:not(:disabled)') : []),
    prevBtn,
    nextBtn
  ];

  return candidates.filter((element) => (
    element
    && !element.classList.contains('hidden')
    && element.getClientRects().length > 0
    && !element.disabled
  ));
}

function focusElement(element) {
  if (!element) return;
  element.focus({ preventScroll: true });
  element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  element.classList.add('controller-focus');
}

document.addEventListener('focusin', (event) => {
  document.querySelectorAll('.controller-focus').forEach((element) => {
    if (element !== event.target) element.classList.remove('controller-focus');
  });
});

function focusFirstInSlide() {
  const firstButton = slides[currentSlide].querySelector('button:not(:disabled):not(.hidden)');
  focusElement(firstButton || (currentSlide > 0 ? prevBtn : null));
}

function moveFocus(direction) {
  const elements = getNavigableElements();
  if (elements.length === 0) return false;

  const activeElement = document.activeElement;
  const currentIndex = elements.indexOf(activeElement);
  if (currentIndex === -1) {
    focusElement(elements[0]);
    return true;
  }

  if (currentSlide === 7 && activeElement.classList.contains('answer-option')) {
    const options = [...slides[currentSlide].querySelectorAll('.answer-option:not(:disabled)')];
    const optionIndex = options.indexOf(activeElement);
    const horizontal = direction === 'left' || direction === 'right';
    const delta = direction === 'left' || direction === 'up' ? -1 : 1;
    const targetIndex = horizontal
      ? (optionIndex + delta + options.length) % options.length
      : optionIndex + delta;

    if (options[targetIndex]) {
      focusElement(options[targetIndex]);
      return true;
    }
  }

  const currentRect = activeElement.getBoundingClientRect();
  const currentX = currentRect.left + currentRect.width / 2;
  const currentY = currentRect.top + currentRect.height / 2;
  const horizontal = direction === 'left' || direction === 'right';
  const directionSign = direction === 'right' || direction === 'down' ? 1 : -1;
  const candidates = elements
    .filter((element) => element !== activeElement)
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const primary = horizontal ? (x - currentX) * directionSign : (y - currentY) * directionSign;
      const secondary = horizontal ? Math.abs(y - currentY) : Math.abs(x - currentX);
      return { element, primary, secondary };
    });

  const forward = candidates
    .filter((candidate) => candidate.primary > 4)
    .sort((a, b) => (a.primary + a.secondary * 1.4) - (b.primary + b.secondary * 1.4));

  if (forward[0]) {
    focusElement(forward[0].element);
    return true;
  }

  const wrapped = candidates.sort((a, b) => {
    const aEdge = a.primary;
    const bEdge = b.primary;
    return aEdge - bEdge || a.secondary - b.secondary;
  });
  focusElement(wrapped[0]?.element);
  return Boolean(wrapped[0]);
}

function setActiveSlide(index, announce = true) {
  const safeIndex = Math.min(Math.max(index, 0), slides.length - 1);
  currentSlide = safeIndex;
  document.querySelector('.app-shell').classList.toggle('is-home', currentSlide === 0);

  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === currentSlide;
    slide.classList.toggle('active', isActive);
    slide.setAttribute('aria-hidden', String(!isActive));
    slide.inert = !isActive;
  });

  updateProgress();
  focusFirstInSlide();

  const message = currentSlide === 0
    ? 'MENU DA MISSÃO'
    : `FASE ${String(currentSlide).padStart(2, '0')} DESBLOQUEADA`;
  if (announce) showToast(message);
}

function resetQuiz() {
  quizState.currentIndex = 0;
  quizState.score = 0;
  quizState.answered = false;
  quizState.selectedAnswer = 0;
  quizState.complete = false;
  renderQuizQuestion();
}

function nextSlide() {
  if (currentSlide === 7) {
    if (quizState.complete) {
      setActiveSlide(8);
    }
    return;
  }

  if (currentSlide < slides.length - 1) {
    setActiveSlide(currentSlide + 1);
  } else {
    resetQuiz();
    setActiveSlide(0);
  }
}

function previousSlide() {
  if (currentSlide > 0) {
    setActiveSlide(currentSlide - 1);
  }
}

function advanceQuiz() {
  if (!quizState.answered || quizState.complete) return;

  quizState.currentIndex += 1;
  quizState.answered = false;
  quizState.selectedAnswer = 0;
  renderQuizQuestion();
}

phaseButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = Number(button.dataset.target);
    if (!Number.isNaN(target)) setActiveSlide(target);
  });
});

prevBtn.addEventListener('click', previousSlide);
nextBtn.addEventListener('click', nextSlide);

document.querySelector('.cta').addEventListener('click', () => {
  resetQuiz();
  setActiveSlide(1);
});

document.addEventListener('keydown', (event) => {
<<<<<<< HEAD
  const activeTag = document.activeElement?.tagName || '';
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

  if (event.key === 'Escape') {
    if (!modal.classList.contains('hidden')) {
      closeModal();
    } else {
      previousSlide();
    }
    return;
=======
  const target = event.target instanceof Element ? event.target : null;

  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
    return;
  }

  if (event.repeat || !modal.classList.contains('hidden')) return;

  const isTyping = target?.matches('input, textarea, select, [contenteditable="true"]') || target?.isContentEditable;
  const isSlideControlFocused = document.activeElement?.closest('.slide.active button, .slide.active a');
  const isInteractiveControlFocused = document.activeElement?.closest('button, a, input, textarea, select, [contenteditable="true"]');
  if (isTyping || isSlideControlFocused) return;

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    nextSlide();
>>>>>>> 5fa7841 (Slide finalizado)
  }

  const directions = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right'
  };
  const direction = directions[event.key];
  if (direction) {
    event.preventDefault();
    if (event.repeat) return;
    const moved = moveFocus(direction);
    if (!moved && direction === 'right') nextSlide();
    if (!moved && direction === 'left') previousSlide();
    return;
  }

<<<<<<< HEAD
  if (event.key === 'Enter' && currentSlide === 0 && document.activeElement === document.body) {
    document.querySelector('.cta').click();
=======
  if (currentSlide === 0 && !isInteractiveControlFocused && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    setActiveSlide(1);
>>>>>>> 5fa7841 (Slide finalizado)
  }
});

function openModal() {
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  focusElement(closeModalBtn);
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  focusElement(referenceBtn);
}

referenceBtn?.addEventListener('click', openModal);
closeModalBtn?.addEventListener('click', closeModal);
modal?.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

const previousGamepadButtons = new Map();
const previousGamepadAxes = new Map();

function updateGamepadStatus(message) {
  if (gamepadStatus && gamepadStatus.textContent !== message) {
    gamepadStatus.textContent = message;
  }
}

function getGamepadTargets() {
  const scope = modal.classList.contains('hidden') ? slides[currentSlide] : modal;
  return [...scope.querySelectorAll('button:not(:disabled), a[href]')]
    .filter((element) => element.getClientRects().length > 0);
}

function moveGamepadFocus(direction) {
  const targets = getGamepadTargets();
  if (targets.length === 0) return;

  const current = targets.indexOf(document.activeElement);
  if (current === -1) {
    targets[direction === 'left' || direction === 'up' ? targets.length - 1 : 0].focus();
    return;
  }

  const currentRect = targets[current].getBoundingClientRect();
  const horizontal = direction === 'left' || direction === 'right';
  const currentCenter = horizontal
    ? (currentRect.left + currentRect.right) / 2
    : (currentRect.top + currentRect.bottom) / 2;
  const currentCross = horizontal
    ? (currentRect.top + currentRect.bottom) / 2
    : (currentRect.left + currentRect.right) / 2;
  const sign = direction === 'right' || direction === 'down' ? 1 : -1;

  const rankedTargets = targets
    .map((element, index) => {
      if (index === current) return null;
      const rect = element.getBoundingClientRect();
      const center = horizontal ? (rect.left + rect.right) / 2 : (rect.top + rect.bottom) / 2;
      const cross = horizontal ? (rect.top + rect.bottom) / 2 : (rect.left + rect.right) / 2;
      const distance = (center - currentCenter) * sign;
      return distance > 1 ? { element, score: distance + Math.abs(cross - currentCross) * 1.5 } : null;
    })
    .filter(Boolean)
    .sort((first, second) => first.score - second.score);

  const nextTarget = rankedTargets[0]?.element || targets[
    direction === 'left' || direction === 'up' ? targets.length - 1 : 0
  ];
  nextTarget.focus();
}

function activateGamepadTarget() {
  if (currentSlide === 0 && modal.classList.contains('hidden')) {
    setActiveSlide(1);
    return;
  }

  const targets = getGamepadTargets();
  if (targets.includes(document.activeElement)) {
    document.activeElement.click();
  } else {
    targets[0]?.focus();
  }
}

function pollGamepads() {
  if (typeof navigator.getGamepads !== 'function') {
    updateGamepadStatus('Gamepad API indisponível; use o teclado');
    return;
  }

  const connectedGamepads = [...navigator.getGamepads()].filter((gamepad) => gamepad?.connected);
  const connectedIndexes = new Set(connectedGamepads.map((gamepad) => gamepad.index));
  const activeGamepad = connectedGamepads[0];
  updateGamepadStatus(activeGamepad ? `Controle conectado: ${activeGamepad.id}` : 'Controle não conectado');

  connectedGamepads.forEach((gamepad) => {
    const pressedButtons = gamepad.buttons.map((button) => Boolean(button?.pressed));
    const previousButtons = previousGamepadButtons.get(gamepad.index);
    const pressedNow = (buttonIndex) => pressedButtons[buttonIndex] && !previousButtons?.[buttonIndex];

    if (!previousButtons) {
      previousGamepadButtons.set(gamepad.index, pressedButtons);
      previousGamepadAxes.set(gamepad.index, {});
      return;
    }

    let changedSlide = false;
    if (modal.classList.contains('hidden') && pressedNow(4)) {
      previousSlide();
      changedSlide = true;
    } else if (modal.classList.contains('hidden') && pressedNow(5)) {
      nextSlide();
      changedSlide = true;
    }

    const directions = [
      [12, 'up'],
      [13, 'down'],
      [14, 'left'],
      [15, 'right']
    ];

    if (!changedSlide) {
      const dpadDirection = directions.find(([buttonIndex]) => pressedNow(buttonIndex));
      if (dpadDirection) {
        moveGamepadFocus(dpadDirection[1]);
      } else {
        const horizontalAxis = gamepad.axes[0] || 0;
        const verticalAxis = gamepad.axes[1] || 0;
        const axes = {
          left: horizontalAxis < -0.6,
          right: horizontalAxis > 0.6,
          up: verticalAxis < -0.6,
          down: verticalAxis > 0.6
        };
        const previousAxes = previousGamepadAxes.get(gamepad.index) || {};
        const axisDirection = Object.keys(axes).find((direction) => axes[direction] && !previousAxes[direction]);
        if (axisDirection) moveGamepadFocus(axisDirection);
        previousGamepadAxes.set(gamepad.index, axes);
      }

      if (pressedNow(0)) activateGamepadTarget();
    }

    previousGamepadButtons.set(gamepad.index, pressedButtons);
  });

  previousGamepadButtons.forEach((_, index) => {
    if (!connectedIndexes.has(index)) {
      previousGamepadButtons.delete(index);
      previousGamepadAxes.delete(index);
    }
  });

  window.requestAnimationFrame(pollGamepads);
}

window.addEventListener('gamepadconnected', (event) => {
  previousGamepadButtons.delete(event.gamepad.index);
  updateGamepadStatus(`Controle conectado: ${event.gamepad.id}`);
});

window.addEventListener('gamepaddisconnected', (event) => {
  previousGamepadButtons.delete(event.gamepad.index);
  previousGamepadAxes.delete(event.gamepad.index);
  updateGamepadStatus('Controle não conectado');
});

const miniCards = [...document.querySelectorAll('.mini-card')];
const infoPanels = [...document.querySelectorAll('.info-panel')];
miniCards.forEach((card) => {
  card.addEventListener('click', () => {
    const target = card.dataset.panel;
    miniCards.forEach((item) => item.classList.toggle('active', item === card));
    infoPanels.forEach((panel) => panel.classList.toggle('active', panel.dataset.group === target));
  });
});

const areaButtons = [...document.querySelectorAll('.area-btn')];
const detailPanels = [...document.querySelectorAll('.detail-panel')];
areaButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.panel;
    areaButtons.forEach((item) => item.classList.toggle('active', item === button));
    detailPanels.forEach((panel) => panel.classList.toggle('active', panel.dataset.group === target));
  });
});

const envCards = [...document.querySelectorAll('.env-card')];
const envPanels = [...document.querySelectorAll('.env-panel')];
envCards.forEach((card) => {
  card.addEventListener('click', () => {
    const target = card.dataset.panel;
    envCards.forEach((item) => item.classList.toggle('active', item === card));
    envPanels.forEach((panel) => panel.classList.toggle('active', panel.dataset.group === target));
  });
});

const futureButtons = [...document.querySelectorAll('.future-btn')];
const futurePanels = [...document.querySelectorAll('.future-panel')];
futureButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.tech;
    futureButtons.forEach((item) => item.classList.toggle('active', item === button));
    futurePanels.forEach((panel) => panel.classList.toggle('active', panel.dataset.techPanel === target));
  });
});

<<<<<<< HEAD
function returnToMenu() {
  resetQuiz();
  setActiveSlide(0);
}
=======
const quizQuestions = [
  {
    question: 'Uma amostra contém CO₂. Só a presença de carbono basta para classificá-la como orgânica?',
    options: [
      'Sim. Todo composto que contém carbono pertence à Química Orgânica.',
      'Não. O CO₂ é um óxido de carbono geralmente tratado como inorgânico; a presença de carbono, sozinha, não basta.',
      'Não. Apenas moléculas com mais de dois átomos de carbono podem ser orgânicas.',
      'Sim, desde que o CO₂ esteja dissolvido em água.'
    ],
    answer: 1,
    explanation: 'Embora o carbono seja central na Química Orgânica, alguns compostos que o contêm, como CO₂ e carbonatos, são classificados como inorgânicos.'
  },
  {
    question: 'Cianato de amônio (NH₄OCN) e ureia (CO(NH₂)₂) têm a mesma fórmula molecular, mas estruturas diferentes. O que isso indica sobre a experiência de Wöhler?',
    options: [
      'Os dois nomes descrevem a mesma substância, pois fórmulas moleculares iguais implicam estruturas iguais.',
      'São isômeros: a reorganização dos átomos formou ureia em laboratório e enfraqueceu o vitalismo, sem provar que todo composto orgânico tenha origem inorgânica.',
      'A reação criou átomos de carbono e nitrogênio que não existiam no reagente.',
      'A experiência mostrou que a ureia só pode ser produzida por células vivas.'
    ],
    answer: 1,
    explanation: 'As fórmulas moleculares iguais e estruturas diferentes caracterizam isômeros. A síntese demonstrou que a ureia podia ser obtida sem um organismo vivo.'
  },
  {
    question: 'Em uma análise, a hidrólise da amostra A libera glicose; a da B libera glicerol e ácidos graxos; e a da C libera aminoácidos. Qual identificação é coerente?',
    options: [
      'A é carboidrato, B é lipídio e C é proteína.',
      'A é proteína, B é carboidrato e C é lipídio.',
      'A é lipídio, B é proteína e C é carboidrato.',
      'A, B e C são proteínas, pois todos liberam moléculas menores.'
    ],
    answer: 0,
    explanation: 'O amido é formado por unidades de glicose; lipídios podem liberar glicerol e ácidos graxos; proteínas são formadas por aminoácidos.'
  },
  {
    question: 'Um biocombustível emite menos CO₂ no escapamento que um combustível fóssil, mas sua lavoura pode substituir uma floresta. Qual avaliação é mais adequada?',
    options: [
      'Considerar apenas as emissões no escapamento, pois as etapas anteriores não fazem parte do impacto do combustível.',
      'Considerar o ciclo de vida, incluindo mudança no uso da terra, cultivo, processamento e transporte, antes de comparar as emissões totais.',
      'Classificar o biocombustível como neutro em carbono apenas por ser renovável.',
      'Desconsiderar a floresta, pois a captura de carbono pelas plantas sempre compensa qualquer emissão.'
    ],
    answer: 1,
    explanation: 'Menores emissões no escapamento não garantem menor impacto total. Mudanças no uso da terra e as demais etapas podem alterar o balanço ambiental.'
  },
  {
    question: 'Uma molécula candidata reduz a multiplicação de um microrganismo em laboratório, mas também danifica células humanas na mesma concentração. Qual conclusão é mais defensável?',
    options: [
      'Ela já é um medicamento eficaz, pois apresentou atividade contra o microrganismo.',
      'Ela não tem qualquer atividade biológica, pois também afeta células humanas.',
      'Há atividade biológica, mas a baixa seletividade é um problema; segurança, dose e eficácia precisam ser investigadas.',
      'A presença de carbono garante que o organismo humano irá metabolizá-la sem efeitos adversos.'
    ],
    answer: 2,
    explanation: 'Um efeito em laboratório não basta para comprovar um tratamento. A diferença entre o efeito desejado e a toxicidade para células humanas é essencial para avaliar a seletividade.'
  }
];

const quizApp = document.getElementById('quizApp');
const quizState = {
  currentIndex: 0,
  score: 0,
  answered: false
};
>>>>>>> 5fa7841 (Slide finalizado)

function renderQuizSummary() {
  quizState.complete = true;
  const score = quizState.score;
  let title = 'O CARBONO AINDA VAI TE DAR TRABALHO...';
  let message = 'Revise os principais conceitos e tente novamente.';

  if (score === quizQuestions.length) {
    title = 'QUÍMICO(A) ORGÂNICO(A) EM TREINAMENTO';
    message = 'Excelente! Você dominou os temas centrais da apresentação.';
  } else if (score >= 3) {
    title = 'VOCÊ ESTÁ NO CAMINHO';
    message = 'Você acertou bastante. Há bons avanços na sua missão.';
  }

  quizApp.innerHTML = `
    <div class="score-summary">
      <div class="score-card">
        <span class="quiz-kicker">MISSÃO CONCLUÍDA</span>
        <strong>${score} / ${quizQuestions.length}</strong>
        <p>${title}</p>
      </div>
      <p class="score-result">${message}</p>
      <div class="quiz-summary-actions">
        <button class="try-again" type="button" id="restartQuizBtn">JOGAR NOVAMENTE</button>
        <button class="quiz-menu" type="button" id="quizMenuBtn">VOLTAR AO MENU</button>
      </div>
    </div>
  `;

  document.getElementById('restartQuizBtn').addEventListener('click', () => {
    resetQuiz();
    focusFirstInSlide();
  });
  document.getElementById('quizMenuBtn').addEventListener('click', returnToMenu);
  updateProgress();
  focusElement(document.getElementById('restartQuizBtn'));
}

function submitQuizAnswer(selectedIndex) {
  const currentQuestion = quizQuestions[quizState.currentIndex];
  if (!currentQuestion || quizState.answered) return;

  quizState.answered = true;
  quizState.selectedAnswer = selectedIndex;
  const isCorrect = selectedIndex === currentQuestion.answer;
  if (isCorrect) quizState.score += 1;

  const options = [...quizApp.querySelectorAll('.answer-option')];
  options.forEach((option) => {
    const optionIndex = Number(option.dataset.index);
    option.disabled = true;
    option.classList.toggle('correct', optionIndex === currentQuestion.answer);
    option.classList.toggle('incorrect', optionIndex === selectedIndex && !isCorrect);
    option.setAttribute('aria-pressed', String(optionIndex === selectedIndex));
    if (optionIndex === currentQuestion.answer || optionIndex === selectedIndex) {
      const status = document.createElement('span');
      status.className = `answer-status ${optionIndex === currentQuestion.answer ? 'correct' : 'incorrect'}`;
      status.textContent = optionIndex === currentQuestion.answer ? 'CORRETA' : 'SUA RESPOSTA';
      option.append(status);
    }
  });

  const feedback = quizApp.querySelector('.quiz-feedback');
  feedback.textContent = isCorrect
    ? `CORRETO! ${currentQuestion.explanation}`
    : `INCORRETO. ${currentQuestion.explanation}`;
  feedback.classList.toggle('is-incorrect', !isCorrect);
  quizApp.querySelector('.quiz-topbar span').textContent = `ACERTOS ${quizState.score} / ${quizQuestions.length}`;
  quizApp.querySelector('.quiz-next').classList.remove('hidden');
  focusElement(quizApp.querySelector('.quiz-next'));
  updateProgress();
}

function renderQuizQuestion() {
  const currentQuestion = quizQuestions[quizState.currentIndex];
  if (!currentQuestion) {
    renderQuizSummary();
    return;
  }

  quizState.complete = false;
  quizApp.innerHTML = `
    <div class="quiz-topbar">
      <span>ACERTOS ${quizState.score} / ${quizQuestions.length}</span>
      <span>PERGUNTA ${quizState.currentIndex + 1} DE ${quizQuestions.length}</span>
    </div>
    <h3 class="quiz-question">${currentQuestion.question}</h3>
    <div class="quiz-options" role="group" aria-label="Alternativas da pergunta ${quizState.currentIndex + 1}">
      ${currentQuestion.options
        .map((option, index) => `<button class="answer-option" type="button" data-index="${index}" aria-pressed="false"><span class="answer-letter">${String.fromCharCode(65 + index)}</span><span>${option}</span></button>`)
        .join('')}
    </div>
    <div class="quiz-feedback" aria-live="polite"></div>
    <button class="quiz-next hidden" type="button">PRÓXIMA PERGUNTA →</button>
  `;

  const options = [...quizApp.querySelectorAll('.answer-option')];
  options.forEach((option) => {
    option.addEventListener('focus', () => {
      if (!quizState.answered) {
        quizState.selectedAnswer = Number(option.dataset.index);
        options.forEach((item) => item.classList.toggle('selected', item === option));
      }
    });
    option.addEventListener('click', () => submitQuizAnswer(Number(option.dataset.index)));
  });

  quizApp.querySelector('.quiz-next').addEventListener('click', advanceQuiz);
  updateProgress();
  if (currentSlide === 7) focusElement(options[quizState.selectedAnswer]);
}

function updateGamepadStatus(connected) {
  gamepadStatus.textContent = connected ? 'CONTROLE CONECTADO' : 'TECLADO ATIVO';
  gamepadStatus.classList.toggle('connected', connected);
}

function moveGamepadFocus(direction) {
  if (!moveFocus(direction)) {
    if (direction === 'right') nextSlide();
    if (direction === 'left') previousSlide();
  }
}

function pollGamepads() {
  gamepadFrame = null;
  const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
  if (pads.length === 0) {
    updateGamepadStatus(false);
    previousGamepadButtons.clear();
    gamepadDirection = '';
    return;
  }

  updateGamepadStatus(true);
  const pad = pads[0];
  const pressed = (index) => Boolean(pad.buttons[index]?.pressed);
  const previousButtons = previousGamepadButtons.get(pad.index) || [];
  const buttonPressed = (index) => pressed(index) && !previousButtons[index];
  const directions = [
    [12, 'up'],
    [13, 'down'],
    [14, 'left'],
    [15, 'right']
  ];
  let direction = directions.find(([buttonIndex]) => pressed(buttonIndex))?.[1] || '';

  if (!direction && pad.axes.length > 1) {
    const [x, y] = pad.axes;
    if (Math.abs(x) > 0.55 || Math.abs(y) > 0.55) {
      direction = Math.abs(x) > Math.abs(y)
        ? (x > 0 ? 'right' : 'left')
        : (y > 0 ? 'down' : 'up');
    }
  }

  const now = performance.now();
  if (direction) {
    if (direction !== gamepadDirection) {
      moveGamepadFocus(direction);
      nextDirectionRepeat = now + 380;
    } else if (now >= nextDirectionRepeat) {
      moveGamepadFocus(direction);
      nextDirectionRepeat = now + 240;
    }
  } else {
    gamepadDirection = '';
  }
  gamepadDirection = direction;

  if (buttonPressed(0)) {
    const target = document.activeElement;
    if (target && getNavigableElements().includes(target)) {
      target.click();
    } else if (currentSlide === 0) {
      document.querySelector('.cta').click();
    } else if (currentSlide === 7 && !quizState.answered) {
      submitQuizAnswer(quizState.selectedAnswer);
    }
  }
  if (buttonPressed(1)) {
    if (!modal.classList.contains('hidden')) closeModal();
    else previousSlide();
  }
  if (buttonPressed(4) && currentSlide !== 7) previousSlide();
  if (buttonPressed(5) && currentSlide !== 7) nextSlide();

  previousGamepadButtons.set(pad.index, pad.buttons.map((button) => button.pressed));
  gamepadFrame = requestAnimationFrame(pollGamepads);
}

function startGamepadPolling() {
  if (gamepadFrame === null && navigator.getGamepads) {
    gamepadFrame = requestAnimationFrame(pollGamepads);
  }
}

window.addEventListener('gamepadconnected', startGamepadPolling);
window.addEventListener('gamepaddisconnected', (event) => {
  previousGamepadButtons.delete(event.gamepad.index);
  if (!navigator.getGamepads?.().some(Boolean)) {
    if (gamepadFrame !== null) cancelAnimationFrame(gamepadFrame);
    gamepadFrame = null;
    gamepadDirection = '';
    updateGamepadStatus(false);
  }
});

function initializeApp() {
  renderQuizQuestion();
  updateProgress();
<<<<<<< HEAD
  setActiveSlide(0, false);
  if (navigator.getGamepads?.().some(Boolean)) startGamepadPolling();
=======
  setActiveSlide(0);
  pollGamepads();
>>>>>>> 5fa7841 (Slide finalizado)
}

window.addEventListener('pagehide', () => {
  if (gamepadFrame !== null) cancelAnimationFrame(gamepadFrame);
  clearTimeout(toastTimer);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp, { once: true });
} else {
  initializeApp();
}
