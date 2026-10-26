
const SAMPLE_EXAM = {
  title: "Forest Knowledge Check",
  questions: [
    {
      question: "Which part of a plant usually absorbs water from the soil?",
      choices: ["Flower", "Roots", "Leaves", "Fruit"],
      answer: 1,
      explanation: "Roots absorb water and minerals from the soil."
    },
    {
      question: "What do frogs need to keep their skin moist?",
      choices: ["Dry sand", "Oil", "Moist surroundings", "Sunlight only"],
      answer: 2,
      explanation: "Frogs generally need moist surroundings."
    },
    {
      question: "Which action helps protect a local forest?",
      choices: [
        "Throwing rubbish into streams",
        "Cutting every tree",
        "Burning dry leaves in the forest",
        "Keeping the area clean"
      ],
      answer: 3,
      explanation: "Keeping the forest clean protects wildlife and habitats."
    }
  ]
};

const EXAM_KEY = "frogquiz_exam_v1";
const RESULTS_KEY = "frogquiz_results_v1";

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

let exam = readStorage(EXAM_KEY, SAMPLE_EXAM);
let results = readStorage(RESULTS_KEY, []);
let submitted = false;

const studentView = document.getElementById("studentView");
const teacherView = document.getElementById("teacherView");

function saveResults() {
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

function renderExam() {
  document.getElementById("examTitle").textContent = exam.title;
  document.getElementById("questionCount").textContent =
    `${exam.questions.length} questions`;

  document.getElementById("questions").innerHTML =
    exam.questions.map((question, index) => `
      <div class="question">
        <h3>${index + 1}. ${escapeHTML(question.question)}</h3>
        ${question.choices.map((choice, choiceIndex) => `
          <label class="choice">
            <input type="radio" name="q${index}" value="${choiceIndex}">
            <span>${escapeHTML(choice)}</span>
          </label>
        `).join("")}
      </div>
    `).join("");

  document.getElementById("result").classList.add("hidden");
  document.getElementById("submitExam").disabled = false;
  document.getElementById("submitExam").textContent = "Submit exam";
  submitted = false;
}

function renderResults() {
  const target = document.getElementById("resultsTable");

  if (!results.length) {
    target.innerHTML = '<p class="hint">No results yet.</p>';
    return;
  }

  target.innerHTML = `
    <table>
      <thead>
        <tr><th>Student</th><th>Exam</th><th>Score</th><th>Percent</th></tr>
      </thead>
      <tbody>
        ${results.slice().reverse().map(result => `
          <tr>
            <td>${escapeHTML(result.name)}</td>
            <td>${escapeHTML(result.examTitle)}</td>
            <td>${result.score}/${result.total}</td>
            <td>${result.percent}%</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderForest() {
  const forest = document.getElementById("forest");

  if (!results.length) {
    forest.innerHTML =
      '<div class="forest-empty">Submit a demo exam to grow your frog! 🌱</div>';
    return;
  }

  forest.innerHTML = results.slice(-12).map(result => {
    const size = 26 + Math.round(result.percent * 0.48);
    return `
      <div class="frog-spot" title="Frog growth">
        <span class="frog-emoji" style="font-size:${size}px">🐸</span>
        <span class="lily">🪷</span>
      </div>
    `;
  }).join("");
}

document.querySelectorAll(".nav-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    studentView.classList.toggle("hidden", button.dataset.view !== "student");
    teacherView.classList.toggle("hidden", button.dataset.view !== "teacher");

    if (button.dataset.view === "teacher") {
      document.getElementById("examJson").value =
        JSON.stringify(exam, null, 2);
      renderResults();
    }
  });
});

document.getElementById("submitExam").addEventListener("click", () => {
  if (submitted) return;

  const name = document.getElementById("studentName").value.trim();

  if (!name) {
    alert("Please enter your name first.");
    return;
  }

  const unanswered = exam.questions.findIndex((question, index) =>
    !document.querySelector(`input[name="q${index}"]:checked`)
  );

  if (unanswered !== -1) {
    alert(`Please answer question ${unanswered + 1}.`);
    return;
  }

  let score = 0;

  const review = exam.questions.map((question, index) => {
    const selected = Number(
      document.querySelector(`input[name="q${index}"]:checked`).value
    );
    const correct = selected === question.answer;

    if (correct) score++;

    return `
      <p>
        <strong>${index + 1}. ${correct ? "✅ Correct" : "🌱 Review this one"}</strong><br>
        Your answer: ${escapeHTML(question.choices[selected])}<br>
        Correct answer: ${escapeHTML(question.choices[question.answer])}<br>
        ${escapeHTML(question.explanation || "")}
      </p>
    `;
  }).join("");

  const percent = Math.round(score / exam.questions.length * 100);

  results.push({
    name,
    examTitle: exam.title,
    score,
    total: exam.questions.length,
    percent,
    submittedAt: new Date().toISOString()
  });

  saveResults();
  submitted = true;

  document.getElementById("result").innerHTML = `
    <h3>You scored ${score}/${exam.questions.length} (${percent}%)</h3>
    <p>Your frog is growing! 🐸</p>
    <div class="answer-review"><h4>Answer review</h4>${review}</div>
  `;

  document.getElementById("result").classList.remove("hidden");
  document.getElementById("submitExam").disabled = true;
  document.getElementById("submitExam").textContent = "Submitted";

  renderForest();
  renderResults();
});

document.getElementById("saveExam").addEventListener("click", () => {
  try {
    const next = JSON.parse(document.getElementById("examJson").value);

    if (!next.title || !Array.isArray(next.questions) || !next.questions.length) {
      throw new Error("Provide an exam title and at least one question.");
    }

    next.questions.forEach((question, index) => {
      if (
        !question.question ||
        !Array.isArray(question.choices) ||
        question.choices.length < 2 ||
        !Number.isInteger(question.answer) ||
        question.answer < 0 ||
        question.answer >= question.choices.length
      ) {
        throw new Error(`Please check question ${index + 1}.`);
      }
    });

    exam = next;
    localStorage.setItem(EXAM_KEY, JSON.stringify(exam));
    renderExam();

    document.getElementById("teacherMessage").textContent =
      "Exam saved on this device.";
  } catch (error) {
    document.getElementById("teacherMessage").textContent =
      "Could not save: " + error.message;
  }
});

document.getElementById("resetExam").addEventListener("click", () => {
  exam = JSON.parse(JSON.stringify(SAMPLE_EXAM));
  localStorage.setItem(EXAM_KEY, JSON.stringify(exam));
  document.getElementById("examJson").value = JSON.stringify(exam, null, 2);
  renderExam();

  document.getElementById("teacherMessage").textContent =
    "Sample exam restored.";
});

document.getElementById("clearResults").addEventListener("click", () => {
  if (confirm("Clear all demo results on this device?")) {
    results = [];
    saveResults();
    renderResults();
    renderForest();
  }
});

document.getElementById("exportResults").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(results, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "frogquiz-results.json";
  link.click();
  URL.revokeObjectURL(url);
});

renderExam();
renderResults();
renderForest();


const teacherLoginPanel = document.getElementById("teacherLogin");
const teacherLoginButton = document.getElementById("teacherLoginButton");
const teacherLoginMessage = document.getElementById("teacherLoginMessage");

const teacherWorkspacePanels = [...teacherView.children].filter(
  panel => panel !== teacherLoginPanel
);

teacherWorkspacePanels.forEach(panel => panel.classList.add("hidden"));

if (teacherLoginButton) {
  teacherLoginButton.addEventListener("click", async () => {
    const email = document.getElementById("teacherEmail").value.trim();
    const password = document.getElementById("teacherPassword").value;

    if (!email || !password) {
      teacherLoginMessage.textContent = "Enter your email and password.";
      return;
    }

   if (!window.supabaseClient) {
      teacherLoginMessage.textContent =
        "Supabase configuration is missing.";
      return;
    }

    teacherLoginButton.disabled = true;
    teacherLoginMessage.textContent = "Signing in...";

    try {
      const { error } = await window.supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const { data: isTeacher, error: roleError } =
       await window.supabaseClient.rpc("is_frogquiz_teacher");
      if (roleError) throw roleError;

      if (isTeacher !== true) {
       await window.supabaseClient.auth.signOut();
        throw new Error("This account is not authorized as a teacher.");
      }

      teacherLoginPanel.classList.add("hidden");
      teacherWorkspacePanels.forEach(
        panel => panel.classList.remove("hidden")
      );

      document.getElementById("examJson").value =
        JSON.stringify(exam, null, 2);

      renderResults();
      teacherLoginMessage.textContent = "";
    } catch (error) {
      console.error("Teacher login failed:", error);
      teacherLoginMessage.textContent =
        error.message || "Sign-in failed. Please try again.";
    } finally {
      teacherLoginButton.disabled = false;
    }
  });
}
const saveClassButton = document.getElementById("saveClass");

if (saveClassButton) {
  saveClassButton.addEventListener("click", async () => {
    const className = document.getElementById("className").value.trim();
    const classCode = document.getElementById("classCode").value.trim();
    const message = document.getElementById("classMessage");

    if (!className || !classCode) {
      message.textContent = "Enter a class name and class code.";
      return;
    }

    if (!window.supabaseClient) {
      message.textContent = "Supabase is not connected.";
      return;
    }

    saveClassButton.disabled = true;
    message.textContent = "Saving class...";

    try {
      const { data, error } = await window.supabaseClient.rpc(
        "frogquiz_create_class",
        {
          p_class_name: className,
          p_class_code: classCode
        }
      );

      if (error) throw error;

      message.textContent = "Class saved successfully!";
    } catch (error) {
      console.error("Save class failed:", error);
      message.textContent = error.message || "Could not save class.";
    } finally {
      saveClassButton.disabled = false;
    }
  });
}
async function loadSavedClasses() {
  const classNameInput = document.getElementById("className");
  const classCodeInput = document.getElementById("classCode");
  const message = document.getElementById("classMessage");

  if (!classNameInput || !classCodeInput || !window.supabaseClient) {
    return;
  }

  try {
    const { data, error } = await window.supabaseClient.rpc(
      "frogquiz_get_classes"
    );

    if (error) throw error;

    const classes = Array.isArray(data) ? data : [];

    if (classes.length > 0) {
      classNameInput.value = classes[0].class_name || "";
      classCodeInput.value = classes[0].class_code || "";
      if (message) message.textContent = "Saved class loaded.";
    } else {
      if (message) message.textContent = "No saved classes found.";
    }
  } catch (error) {
    console.error("Load classes failed:", error);
    if (message) message.textContent = "Could not load saved classes.";
  }
}

loadSavedClasses();
