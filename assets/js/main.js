
// [AI-Generated: MAI-Code-1.1-Flash | 2026-11-11]
// Intent: Load the quiz, render the 3 text questions, and submit answers to the local demo API.
const quizContainer = document.getElementById('quiz-questions');
const form = document.getElementById('quiz-form');
const resultSection = document.getElementById('result');
const resultTitle = document.getElementById('result-title');
const resultSummary = document.getElementById('result-summary');
const resultHighlights = document.getElementById('result-highlights');

// [AI-Generated: MAI-Code-1.1-Flash | 2026-11-11]
// Intent: Render the three quiz cards from the API payload and allow choices to be reselected by toggling them again.
function renderQuestions(questions) {
  quizContainer.innerHTML = questions
    .map((question, index) => {
      const choices = question.choices
        .map(
          (choice) => `
            <label class="choice">
              <input type="radio" name="${question.id}" value="${choice.id}" required>
              <span>${choice.label}</span>
            </label>
          `
        )
        .join('');

      return `
        <fieldset class="question">
          <legend>${index + 1}. ${question.prompt}</legend>
          <div class="choices">${choices}</div>
        </fieldset>
      `;
    })
    .join('');

  const allRadios = form.querySelectorAll('input[type="radio"]');
  allRadios.forEach((input) => {
    input.addEventListener('click', () => {
      const sameGroup = form.querySelectorAll(`input[name="${input.name}"]`);
      const alreadySelected = input.checked && input.dataset.selected === 'true';

      sameGroup.forEach((option) => {
        const isCurrent = option === input;
        option.checked = isCurrent && !alreadySelected;
        option.dataset.selected = String(isCurrent && !alreadySelected);
      });
    });
  });
}

// [AI-Generated: MAI-Code-1.1-Flash | 2026-11-11]
// Intent: Display the generated resume recommendation after submission.
function showResult(result) {
  resultSection.classList.remove('hidden');
  resultTitle.textContent = result.title;
  resultSummary.textContent = result.summary;
  resultHighlights.innerHTML = result.highlights
    .map((item) => `<li>${item}</li>`)
    .join('');
}

// [AI-Generated: MAI-Code-1.1-Flash | 2026-11-11]
// Intent: Submit the three answers and receive a resume profile from the demo API.
async function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const answers = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });

    const data = await response.json();
    if (data && data.result) {
      showResult(data.result);
      return;
    }
  } catch (error) {
    console.error('Quiz submission failed:', error);
  }

  showResult({
    title: 'Leadership Resume Style',
    summary: 'Your answers suggest a clear, confident resume that focuses on ownership, impact, and visible wins.',
    highlights: ['Strong action verbs', 'Result-focused bullet points', 'Confident tone']
  });
}

// [AI-Generated: MAI-Code-1.1-Flash | 2026-11-11]
// Intent: Fetch the quiz from the demo API or use a local fallback if the API is unavailable.
async function initializeQuiz() {
  try {
    const response = await fetch('/api/quiz');
    const data = await response.json();
    renderQuestions(data.questions || []);
  } catch (error) {
    console.error('Could not load quiz:', error);
    renderQuestions([
      {
        id: 'tone',
        prompt: 'Which resume tone sounds most like you?',
        choices: [
          { id: 'confident', label: 'Bold and confident' },
          { id: 'creative', label: 'Creative and expressive' },
          { id: 'analytical', label: 'Precise and data-driven' },
          { id: 'team', label: 'Supportive and collaborative' }
        ]
      },
      {
        id: 'strength',
        prompt: 'What is your strongest resume proof point?',
        choices: [
          { id: 'results', label: 'Metrics and outcomes' },
          { id: 'projects', label: 'Portfolio and creative work' },
          { id: 'leadership', label: 'Leading teams or initiatives' },
          { id: 'collaboration', label: 'Helping people succeed' }
        ]
      },
      {
        id: 'goal',
        prompt: 'What kind of job are you aiming for?',
        choices: [
          { id: 'growth', label: 'Fast-moving startup energy' },
          { id: 'impact', label: 'Meaningful, mission-driven work' },
          { id: 'vision', label: 'Brand-building and storytelling' },
          { id: 'efficiency', label: 'System improvements and optimization' }
        ]
      }
    ]);
  }
}

form.addEventListener('submit', handleSubmit);
initializeQuiz();
