const supabaseClient =
  window.supabase?.createClient &&
  window.FROGQUIZ_SUPABASE_URL &&
  window.FROGQUIZ_SUPABASE_PUBLISHABLE_KEY
    ? window.supabase.createClient(
        window.FROGQUIZ_SUPABASE_URL,
        window.FROGQUIZ_SUPABASE_PUBLISHABLE_KEY
      )
    : null;
const SAMPLE_EXAM = {
  "title": "Forest Knowledge Check",
  "questions": [
    {"question":"Which part of a plant usually absorbs water from the soil?","choices":["Flower","Roots","Leaves","Fruit"],"answer":1,"explanation":"Roots absorb water and minerals from the soil."},
    {"question":"What do frogs need to keep their skin moist?","choices":["Dry sand","Oil","Moist surroundings","Sunlight only"],"answer":2,"explanation":"Frogs have permeable skin and generally need moist surroundings."},
    {"question":"Which action helps protect a local forest?","choices":["Throwing rubbish into streams","Cutting every tree","Burning dry leaves in the forest","Keeping the area clean"],"answer":3,"explanation":"Keeping the forest clean helps protect wildlife and habitats."}
  ]
};
const EXAM_KEY = "frogquiz_exam_v1";
const RESULTS_KEY = "frogquiz_results_v1";
let exam = loadExam();
let submittedThisView = false;

function loadExam(){
  try { return JSON.parse(localStorage.getItem(EXAM_KEY)) || structuredClone(SAMPLE_EXAM); }
  catch(e){ return JSON.parse(JSON.stringify(SAMPLE_EXAM)); }
}
function saveExamData(value){ localStorage.setItem(EXAM_KEY, JSON.stringify(value)); exam=value; }
function getResults(){ try{return JSON.parse(localStorage.getItem(RESULTS_KEY))||[]}catch(e){return []} }
function setResults(value){localStorage.setItem(RESULTS_KEY,JSON.stringify(value))}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

const studentView=document.getElementById("studentView");
const teacherView=document.getElementById("teacherView");
document.querySelectorAll(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b===btn));
  studentView.classList.toggle("hidden",btn.dataset.view!=="student");
  teacherView.classList.toggle("hidden",btn.dataset.view!=="teacher");
  if(btn.dataset.view==="teacher"){document.getElementById("examJson").value=JSON.stringify(exam,null,2);renderResults();}
  renderForest();
}));
function renderExam(){
  document.getElementById("examTitle").textContent=exam.title;
  document.getElementById("questionCount").textContent=`${exam.questions.length} questions`;
  document.getElementById("result").classList.add("hidden");
  document.getElementById("questions").innerHTML=exam.questions.map((q,i)=>`
    <div class="question"><h3>${i+1}. ${esc(q.question)}</h3>
    ${q.choices.map((choice,j)=>`<label class="choice"><input type="radio" name="q${i}" value="${j}"><span>${esc(choice)}</span></label>`).join("")}
    </div>`).join("");
  submittedThisView=false;
}
document.getElementById("submitExam").addEventListener("click",()=>{
  if(submittedThisView){alert("You have already submitted this exam in this view. Reloading will let you try the demo again; the production version will prevent duplicate submissions.");return}
  const name=document.getElementById("studentName").value.trim();
  if(!name){alert("Please enter your name first.");document.getElementById("studentName").focus();return}
  const unanswered=exam.questions.findIndex((q,i)=>!document.querySelector(`input[name="q${i}"]:checked`));
  if(unanswered!==-1){alert(`Please answer question ${unanswered+1} before submitting.`);return}
  let score=0;
  const review=exam.questions.map((q,i)=>{
    const selected=Number(document.querySelector(`input[name="q${i}"]:checked`).value);
    const correct=selected===q.answer;if(correct)score++;
    return `<p><strong>${i+1}. ${correct?"✅ Correct":"🌱 Review this one"}</strong><br>Your answer: ${esc(q.choices[selected])}<br>Correct answer: <strong>${esc(q.choices[q.answer])}</strong>${q.explanation?`<br>${esc(q.explanation)}`:""}</p>`;
  }).join("");
  const percent=Math.round(score/exam.questions.length*100);
  const result={name,examTitle:exam.title,score,total:exam.questions.length,percent,submittedAt:new Date().toISOString()};
  const results=getResults();results.push(result);setResults(results);
  submittedThisView=true;
  document.getElementById("result").innerHTML=`<h3>You scored ${score} / ${exam.questions.length} (${percent}%)</h3><p>Your frog is growing! 🐸</p><div class="answer-review"><h4>Answer review</h4>${review}</div>`;
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("submitExam").textContent="Submitted";
  document.getElementById("submitExam").disabled=true;
  renderForest();renderResults();
});
function renderForest(){
  const forest=document.getElementById("forest"),results=getResults();
  if(!results.length){forest.innerHTML='<div class="forest-empty">Submit a demo exam to grow your frog! 🌱</div>';return}
  const bestByName={};
  results.forEach(r=>{if(!bestByName[r.name]||r.percent>bestByName[r.name].percent)bestByName[r.name]=r});
  const frogs=Object.values(bestByName).sort((a,b)=>b.percent-a.percent).slice(0,12);
  forest.innerHTML=frogs.map((r,i)=>{
    const size=26+Math.round(r.percent*.48);
    return `<div class="frog-spot" title="Frog size represents score; names and marks are hidden"><span class="frog-emoji" style="font-size:${size}px">🐸</span><span class="lily">🪷</span></div>`;
  }).join("");
}
function renderResults(){
  const target=document.getElementById("resultsTable"),results=getResults();
  if(!results.length){target.innerHTML='<p class="hint">No results yet.</p>';return}
  target.innerHTML=`<table><thead><tr><th>Student</th><th>Exam</th><th>Score</th><th>Percent</th><th>Date</th></tr></thead><tbody>${results.slice().reverse().map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.examTitle)}</td><td>${r.score}/${r.total}</td><td>${r.percent}%</td><td>${new Date(r.submittedAt).toLocaleDateString()}</td></tr>`).join("")}</tbody></table>`;
}
document.getElementById("saveExam").addEventListener("click",()=>{
  try{
    const next=JSON.parse(document.getElementById("examJson").value);
    if(!next.title||!Array.isArray(next.questions)||!next.questions.length)throw new Error("Exam needs a title and at least one question.");
    next.questions.forEach((q,i)=>{if(!q.question||!Array.isArray(q.choices)||q.choices.length<2||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.choices.length)throw new Error(`Check question ${i+1}: question, choices, and a valid zero-based answer are required.`)});
    saveExamData(next);renderExam();document.getElementById("teacherMessage").textContent="Exam saved on this device. Switch to Student to try it.";
  }catch(e){document.getElementById("teacherMessage").textContent="Could not save: "+e.message}
});
document.getElementById("resetExam").addEventListener("click",()=>{
  saveExamData(JSON.parse(JSON.stringify(SAMPLE_EXAM)));
  document.getElementById("examJson").value=JSON.stringify(exam,null,2);renderExam();
  document.getElementById("teacherMessage").textContent="Sample exam restored.";
});
document.getElementById("clearResults").addEventListener("click",()=>{
  if(confirm("Clear all demo results saved in this browser?")){setResults([]);renderResults();renderForest()}
});
document.getElementById("exportResults").addEventListener("click",()=>{
  const data=getResults();
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="frogquiz-results.json";a.click();URL.revokeObjectURL(url);
});
renderExam();renderForest();renderResults();
if("serviceWorker" in navigator && location.protocol.startsWith("http")){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
