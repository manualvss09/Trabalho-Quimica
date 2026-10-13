const slides = [...document.querySelectorAll('.slide')];
const phaseButtons = [...document.querySelectorAll('.phase-btn[data-target]')];
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
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
  if (currentSlide === 7) {
    nextBtn.textContent = quizState.complete ? 'CONCLUIR MISSÃO →' : 'QUIZ EM ANDAMENTO';
    nextBtn.disabled = !quizState.complete;
  } else {
    nextBtn.disabled = false;
    nextBtn.textContent = currentSlide === slides.length - 1 ? 'VOLTAR AO MENU' : 'PRÓXIMA FASE →';
  }
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
  const activeTag = document.activeElement?.tagName || '';
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

  if (event.key === 'Escape') {
    if (!modal.classList.contains('hidden')) {
      closeModal();
    } else {
      previousSlide();
    }
    return;
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

  if (event.key === 'Enter' && currentSlide === 0 && document.activeElement === document.body) {
    document.querySelector('.cta').click();
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

function returnToMenu() {
  resetQuiz();
  setActiveSlide(0);
}

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
  setActiveSlide(0, false);
  if (navigator.getGamepads?.().some(Boolean)) startGamepadPolling();
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
