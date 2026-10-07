const slides = [...document.querySelectorAll('.slide')];
const phaseButtons = [...document.querySelectorAll('.phase-btn[data-target]')];
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentIndicator = document.getElementById('currentIndicator');
const totalIndicator = document.getElementById('totalIndicator');
const progressFill = document.getElementById('progressFill');
const phaseNameDisplay = document.getElementById('phaseNameDisplay');
const toast = document.getElementById('toast');
const modal = document.getElementById('referenceModal');
const referenceBtn = document.querySelector('[data-reference-modal]');
const closeModalBtn = document.querySelector('.close-modal');

const totalSlides = slides.length - 1;
let currentSlide = 0;
let toastTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 1200);
}

function updateProgress() {
  const displayIndex = currentSlide === 0 ? 0 : currentSlide;
  const percent = totalSlides === 0 ? 0 : (displayIndex / totalSlides) * 100;

  currentIndicator.textContent = String(displayIndex).padStart(2, '0');
  totalIndicator.textContent = String(totalSlides).padStart(2, '0');
  progressFill.style.width = `${percent}%`;

  phaseNameDisplay.textContent = currentSlide === 0 ? 'MISSÃO 00' : `FASE ${String(currentSlide).padStart(2, '0')}`;

  phaseButtons.forEach((button) => {
    const target = Number(button.dataset.target);
    button.classList.toggle('active', target === currentSlide);
  });

  prevBtn.disabled = currentSlide === 0;
  prevBtn.style.opacity = currentSlide === 0 ? '0.45' : '1';
  prevBtn.style.cursor = currentSlide === 0 ? 'not-allowed' : 'pointer';

  nextBtn.textContent = currentSlide === slides.length - 1 ? 'VOLTAR AO INÍCIO' : 'PRÓXIMO →';
}

function setActiveSlide(index) {
  const safeIndex = Math.min(Math.max(index, 0), slides.length - 1);
  currentSlide = safeIndex;

  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === currentSlide);
  });

  updateProgress();

  const message = currentSlide === 0
    ? 'MISSÃO INICIADA'
    : `FASE ${String(currentSlide).padStart(2, '0')} DESBLOQUEADA`;

  showToast(message);
}

function nextSlide() {
  if (currentSlide < slides.length - 1) {
    setActiveSlide(currentSlide + 1);
  } else {
    setActiveSlide(0);
  }
}

function previousSlide() {
  if (currentSlide > 0) {
    setActiveSlide(currentSlide - 1);
  }
}

phaseButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = Number(button.dataset.target);
    if (!Number.isNaN(target)) {
      setActiveSlide(target);
    }
  });
});

prevBtn.addEventListener('click', previousSlide);
nextBtn.addEventListener('click', nextSlide);

document.querySelector('.cta')?.addEventListener('click', () => setActiveSlide(1));

document.addEventListener('keydown', (event) => {
  const activeTag = document.activeElement?.tagName || '';
  const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag);

  if (isTyping) return;

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    nextSlide();
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    previousSlide();
  }

  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
});

function openModal() {
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
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

const quizApp = document.getElementById('quizApp');
const quizState = {
  currentIndex: 0,
  score: 0,
  answered: false
};

function renderQuizSummary() {
  const score = quizState.score;
  let title = 'O CARBONO AINDA VAI TE DAR TRABALHO...';
  let message = 'Revise os principais conceitos e tente novamente.';

  if (score === 5) {
    title = 'QUÍMICO(A) ORGÂNICO(A) EM TREINAMENTO';
    message = 'Excelente! Você dominou os temas centrais da apresentação.';
  } else if (score >= 3) {
    title = 'VOCÊ ESTÁ NO CAMINHO';
    message = 'Você acertou bastante. Há bons avanços na sua missão.';
  }

  quizApp.innerHTML = `
    <div class="score-summary">
      <div class="score-card">
        <strong>${score}/5</strong>
        <p>${title}</p>
      </div>
      <p class="score-result">${message}</p>
      <button class="try-again" type="button" id="restartQuizBtn">[ TENTAR NOVAMENTE ]</button>
    </div>
  `;

  document.getElementById('restartQuizBtn')?.addEventListener('click', () => {
    quizState.currentIndex = 0;
    quizState.score = 0;
    quizState.answered = false;
    renderQuizQuestion();
  });
}

function renderQuizQuestion() {
  const currentQuestion = quizQuestions[quizState.currentIndex];

  if (!currentQuestion) {
    renderQuizSummary();
    return;
  }

  quizApp.innerHTML = `
    <div class="quiz-topbar">
      <span>PONTUAÇÃO ${quizState.score} / 5</span>
      <span>QUESTÃO ${quizState.currentIndex + 1} / ${quizQuestions.length}</span>
    </div>
    <h3 class="quiz-question">${currentQuestion.question}</h3>
    <div class="quiz-options">
      ${currentQuestion.options
        .map((option, index) => `<button class="answer-option" type="button" data-index="${index}">${option}</button>`)
        .join('')}
    </div>
    <div class="quiz-feedback" aria-live="polite"></div>
    <button class="quiz-next hidden" type="button">PRÓXIMA PERGUNTA →</button>
  `;

  const feedback = quizApp.querySelector('.quiz-feedback');
  const nextButton = quizApp.querySelector('.quiz-next');
  const options = [...quizApp.querySelectorAll('.answer-option')];

  options.forEach((option) => {
    option.addEventListener('click', () => {
      if (quizState.answered) return;

      quizState.answered = true;
      const selectedIndex = Number(option.dataset.index);
      const isCorrect = selectedIndex === currentQuestion.answer;

      if (isCorrect) {
        quizState.score += 1;
      }

      options.forEach((item) => {
        const itemIndex = Number(item.dataset.index);
        item.disabled = true;
        item.classList.toggle('correct', itemIndex === currentQuestion.answer);
        item.classList.toggle('incorrect', itemIndex === selectedIndex && !isCorrect);
      });

      feedback.textContent = isCorrect
        ? `Correto! ${currentQuestion.explanation}`
        : `Incorreto. ${currentQuestion.explanation}`;

      nextButton.classList.remove('hidden');
    });
  });

  nextButton.addEventListener('click', () => {
    quizState.currentIndex += 1;
    quizState.answered = false;
    renderQuizQuestion();
  });
}

function initializeApp() {
  renderQuizQuestion();
  updateProgress();
  setActiveSlide(0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
