// ----------------------------
// SETTINGS
// ----------------------------
const QUESTIONS_PER_ROW = 3;

// ----------------------------
// FULL QUESTION POOL (14 questions)
// ----------------------------
const INLINE_TEST_QUESTIONS = [

  { q: "En quelle année le canton de Genève entre-t-il dans la Confédération suisse (suite à l'entrée des troupes armées suisses au Port Noir) ?",
    a: ["1815", "1745", "1917"],
    correct: 0 },

  { q: "Quel événement a encouragé Henri Dunant à créer en 1864 ce qui sera la future Croix-Rouge ?",
    a: ["La bataille d'Austerlitz", "La bataille de Morgarten", "La bataille de Solferino"],
    correct: 2 },

  { q: "Les femmes suisses obtiennent le droit de vote fédéral en :",
    a: ["1971", "1914", "1935"],
    correct: 0 },

  { q: "Quelle étape intervient après l’adoption d’une loi par le Grand Conseil ?",
    a: ["La promulgation par le Conseil d’État", "La ratification obligatoire par toutes les communes", "La validation du Parlement fédéral"],
    correct: 0 },

  { q: "Combien de temps dure un mandat au Conseil national ?",
    a: ["4 ans", "6 ans", "2 ans"],
    correct: 0 },

  { q: "Comment les membres du Conseil fédéral sont-ils élus ?",
    a: ["Par l’Assemblée fédérale réunie", "Par un vote populaire direct", "Par les gouvernements cantonaux"],
    correct: 0 },

  { q: "Comment s'appelle la commune la moins peuplée du canton de Genève ?",
    a: ["Gy", "Rivaz", "Satigny"],
    correct: 0 },

  { q: "Quand auront lieu les prochaines élections fédérales ?",
    a: ["Octobre 2027", "Novembre 2028", "Septembre 2026"],
    correct: 0 },

  { q: "Le point le plus haut du canton de Genève se trouve à :",
    a: ["Jussy", "Bernex", "Pointe Dufour"],
    correct: 0 },

  { q: "Qui était Élie Ducommun ?",
    a: ["Journaliste et homme politique genevois", "Un pionnier de l’aviation suisse", "Un célèbre musicien suisse"],
    correct: 0 },

  { q: "Dans le drapeau du canton de Genève, que représente la clé dorée sur le fond rouge ?",
    a: ["Les clés du Paradis – attribut de Saint-Pierre", "Les clés de la ville remises au Maire", "La puissance financière de Genève"],
    correct: 0 },

  { q: "Quelle était la raison technique et industrielle initiale de la construction du premier Jet d’Eau en 1886 ?",
    a: ["Soulager la pression du réseau hydraulique", "Servir de station de pompage pour l’eau potable", "Créer un repère visuel pour la navigation"],
    correct: 0 },

  { q: "Quelle autorité politique est responsable de nommer le Chef de l'Armée (CdA) en temps de paix ?",
    a: ["Le Conseil fédéral, agissant collectivement", "Le peuple suisse par initiative", "Le chef du DDPS"],
    correct: 0 },

  { q: "Quel événement majeur du XVIe siècle a transformé Genève en république indépendante et influencé son identité politique et culturelle ?",
    a: ["La Réforme protestante (Calvin, Farel)", "Le Congrès de Vienne (1815)", "L’Escalade de 1602"],
    correct: 0 }
];

// ----------------------------
// STATE
// ----------------------------
let correctCount = 0;
let wrongCount = 0;
let answeredCount = 0;
let totalQuestions = INLINE_TEST_QUESTIONS.length;

let currentRow = 0;

// ----------------------------
// UI TARGETS
// ----------------------------
const container = document.getElementById("inline-test-questions");
const expandBtn = document.getElementById("inline-test-expand");

// ----------------------------
// PROGRESS DISPLAY
// ----------------------------
function updateProgressDisplay() {
  document.getElementById("inline-progress-text").textContent =
    `Progression : ${answeredCount} / ${totalQuestions}`;
}

function updateProgressBar() {
  const pct = (answeredCount / totalQuestions) * 100;
  document.getElementById("inline-progressbar").style.width = pct + "%";
}

// ----------------------------
// UTILITIES
// ----------------------------
function shuffleAnswers(question) {
  const combined = question.a.map((opt, index) => ({
    text: opt,
    isCorrect: index === question.correct
  }));

  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  question.a = combined.map(i => i.text);
  question.correct = combined.findIndex(i => i.isCorrect);
}

function createDonutChart() {
  const pct = Math.round((correctCount / totalQuestions) * 100);
  const C = 2 * Math.PI * 40;

  return `
    <div class="donut-wrapper">
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="#ebe6ff" stroke-width="12" fill="none"></circle>
        <circle cx="50" cy="50" r="40" stroke="#6d4aff" stroke-width="12" fill="none"
          stroke-dasharray="${(pct / 100) * C} ${(1 - pct / 100) * C}"
          transform="rotate(-90 50 50)" stroke-linecap="round"></circle>
      </svg>
      <div class="donut-center">${pct}%</div>
    </div>
  `;
}

// ----------------------------
// END CARD (now appended INSIDE the last question card's row)
// ----------------------------
function createEndCard() {
  const pct = Math.round((correctCount / totalQuestions) * 100);

  const card = document.createElement("div");
  card.className = "inline-question-card end-card";

  let title =
    pct >= 80 ? "Félicitations !" :
    pct >= 50 ? "Très bien !" :
    pct >= 25 ? "Bon début !" :
    "Peut encore s'améliorer";

  card.innerHTML = `
    <h3>${title}</h3>
    ${createDonutChart()}
    <p>Vous avez terminé les questions gratuites. Dans la version complète, vous trouverez une préparation approfondie pour l’entretien.</p>
    <a href="https://civiclearn.com/geneve/checkout.html" class="hero-primary-btn">Obtenir l’accès complet</a>
  `;

  return card;
}

// ----------------------------
// BUILD ROWS
// ----------------------------
const rows = [];
for (let i = 0; i < totalQuestions; i += QUESTIONS_PER_ROW) {
  rows.push(INLINE_TEST_QUESTIONS.slice(i, i + QUESTIONS_PER_ROW));
}

INLINE_TEST_QUESTIONS.forEach(q => shuffleAnswers(q));

// ----------------------------
// RENDERING
// ----------------------------
function renderRow(rowIndex) {
  if (!rows[rowIndex]) return;

  rows[rowIndex].forEach((q, offset) => {
    const absoluteIndex = rowIndex * QUESTIONS_PER_ROW + offset;
    container.appendChild(createQuestionCard(q, absoluteIndex));
  });
}

function createQuestionCard(questionObj, absoluteIndex) {
  const card = document.createElement("div");
  card.className = "inline-question-card";

  const title = document.createElement("h3");
  title.textContent = questionObj.q;

  const feedback = document.createElement("div");
  feedback.className = "inline-feedback";

  card.append(title);

  questionObj.a.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "inline-option-btn";
    btn.textContent = opt;

    btn.onclick = () => {
      answeredCount++;
      updateProgressDisplay();
      updateProgressBar();

      if (i === questionObj.correct) {
        correctCount++;
        feedback.textContent = "Correct !";
        feedback.classList.add("inline-correct");
      } else {
        wrongCount++;
        feedback.textContent = "Bonne réponse : " + questionObj.a[questionObj.correct];
        feedback.classList.add("inline-wrong");
      }

      card.querySelectorAll("button").forEach(b => b.disabled = true);
      card.appendChild(feedback);

      const isLastQuestion = (absoluteIndex === totalQuestions - 1);

      if (isLastQuestion) {
        // END CARD inserted in SAME ROW, directly after the last question card
        card.after(createEndCard());
      }

      const isLastInRow =
        (absoluteIndex + 1) % QUESTIONS_PER_ROW === 0 &&
        absoluteIndex !== totalQuestions - 1;

      if (isLastInRow) {
        currentRow++;
        renderRow(currentRow);
      }
    };

    card.appendChild(btn);
  });

  return card;
}

// ----------------------------
// INITIAL RENDER
// ----------------------------
renderRow(0);
updateProgressDisplay();
updateProgressBar();

// ----------------------------
// CONTINUE BUTTON
// ----------------------------
expandBtn.onclick = () => {
  currentRow = 1;
  renderRow(currentRow);
  expandBtn.style.display = "none";
};
