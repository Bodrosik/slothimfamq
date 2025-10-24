// app.js (modules) — працює з Firebase v9 modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  update,
  remove,
  child,
  get
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

/* ====== 1) ВСТАВ СВІЙ FIREBASE CONFIG ТУТ ======
   Створи Firebase проєкт → Realtime Database → Get SDK config
   Приклад:
*/
const firebaseConfig = {
  apiKey: "ВАШ_API_KEY",
  authDomain: "ВАШ_PROJECT.firebaseapp.com",
  databaseURL: "https://ВАШ_PROJECT-default-rtdb.firebaseio.com",
  projectId: "ВАШ_PROJECT",
  storageBucket: "ВАШ_PROJECT.appspot.com",
  messagingSenderId: "XXXXX",
  appId: "1:XXXXX:web:XXXXXX"
};
/* ================================================== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

/* ---------- DOM ---------- */
const loginSection = document.getElementById("loginSection");
const journalSection = document.getElementById("journalSection");
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const studentsList = document.getElementById("studentsList");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const filterSelect = document.getElementById("filterSelect");
const addCommentMode = document.getElementById("addCommentMode");

/* ---------- Static default students (10) ----------
   Це список, який можна змінити — при першому запуску буде створено записи у БД,
   пізніше редагуй у UI.
*/
const defaultStudents = [
  "Учень 1","Учень 2","Учень 3","Учень 4","Учень 5",
  "Учень 6","Учень 7","Учень 8","Учень 9","Учень 10"
];

let currentUser = null;
let studentsData = {}; // локальна копія з БД
let addCommentQuick = false;

/* ---------- AUTH ---------- */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const pass = passwordInput.value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    emailInput.value = "";
    passwordInput.value = "";
  } catch (err) {
    alert("Не вдалося увійти: " + err.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

/* слідкуємо за станом авторизації */
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    loginSection.classList.add("hidden");
    journalSection.classList.remove("hidden");
    logoutBtn.hidden = false;
    userInfo.textContent = `Ви: ${user.email}`;
    await ensureStudentsExist();
    listenStudents();
  } else {
    loginSection.classList.remove("hidden");
    journalSection.classList.add("hidden");
    logoutBtn.hidden = true;
    userInfo.textContent = "";
    studentsList.innerHTML = "";
  }
});

/* ---------- Ensure initial data ---------- */
async function ensureStudentsExist(){
  const rootRef = ref(db, 'classes/default/');
  const snap = await get(rootRef);
  if (!snap.exists()){
    // Створюємо стартову структуру
    const data = { students: {} , createdAt: Date.now() };
    defaultStudents.forEach((name, i) => {
      data.students[`s${i+1}`] = {
        name,
        grades: [], // список об'єктів {value,subject,comment,date,by}
        remarks: []
      };
    });
    await set(rootRef, data);
  }
}

/* ---------- Listen for changes ---------- */
function listenStudents(){
  const refClass = ref(db, 'classes/default/students');
  onValue(refClass, (snapshot) => {
    const val = snapshot.val() || {};
    studentsData = val;
    renderStudents();
  });
}

/* ---------- Render ---------- */
function renderStudents(){
  studentsList.innerHTML = "";
  const filter = filterSelect.value;
  Object.entries(studentsData).forEach(([id, s]) => {
    const hasRemarks = (s.remarks && s.remarks.length && s.remarks.length>0) || (s.grades && s.grades.length>0);
    if (filter === "hasRemarks" && !hasRemarks) return;

    const el = document.createElement("div");
    el.className = "student card";
    el.innerHTML = `
      <h3>${escapeHtml(s.name || "—")}</h3>
      <div class="meta">Оцінок: ${s.grades ? s.grades.length : 0} • Зауважень: ${s.remarks ? s.remarks.length : 0}</div>
      <div class="actions">
        <button class="action-btn" data-act="view" data-id="${id}">Перегляд</button>
        <button class="action-btn" data-act="grade" data-id="${id}">Додати оцінку</button>
        <button class="action-btn" data-act="remark" data-id="${id}">Додати зауваження</button>
        <button class="action-btn" data-act="delete" data-id="${id}">Видалити запис</button>
      </div>
    `;
    studentsList.appendChild(el);
  });

  // add handlers
  studentsList.querySelectorAll("[data-act]").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = btn.dataset.id;
      const act = btn.dataset.act;
      if (act === "view") openModalView(id);
      if (act === "grade") openModalAddGrade(id);
      if (act === "remark") openModalAddRemark(id);
      if (act === "delete") {
        if (confirm("Впевнені, що хочете видалити цього учня з бази? (дані втратяться)")){
          await remove(ref(db, `classes/default/students/${id}`));
        }
      }
    });
  });
}

/* ---------- Modal functions ---------- */
function openModalView(id){
  modalTitle.textContent = `Перегляд — ${studentsData[id].name}`;
  modalBody.innerHTML = "";
  const grades = studentsData[id].grades || [];
  const remarks = studentsData[id].remarks || [];

  const gBlock = document.createElement("div");
  gBlock.innerHTML = `<h4>Оцінки (${grades.length})</h4>`;
  if (!grades.length) gBlock.innerHTML += `<div class="muted small">Немає оцінок</div>`;
  grades.slice().reverse().forEach((g, idx) => {
    const d = new Date(g.date).toLocaleString();
    const div = document.createElement("div");
    div.className = "card small";
    div.style.marginBottom = "8px";
    div.innerHTML = `<strong>${escapeHtml(g.subject || "предмет")}: ${escapeHtml(String(g.value))}</strong>
                     <div class="muted small">${escapeHtml(g.comment || '')}</div>
                     <div class="muted small">Додано: ${d} • ${escapeHtml(g.by || '')}</div>`;
    gBlock.appendChild(div);
  });

  const rBlock = document.createElement("div");
  rBlock.innerHTML = `<h4>Зауваження (${remarks.length})</h4>`;
  if (!remarks.length) rBlock.innerHTML += `<div class="muted small">Немає зауважень</div>`;
  remarks.slice().reverse().forEach(r => {
    const d = new Date(r.date).toLocaleString();
    const div = document.createElement("div");
    div.className = "card small";
    div.style.marginBottom = "8px";
    div.innerHTML = `<div>${escapeHtml(r.text || '')}</div>
                     <div class="muted small">Додано: ${d} • ${escapeHtml(r.by || '')}</div>`;
    rBlock.appendChild(div);
  });

  modalBody.appendChild(gBlock);
  modalBody.appendChild(rBlock);
  showModal();
}

function openModalAddGrade(id){
  modalTitle.textContent = `Додати оцінку — ${studentsData[id].name}`;
  modalBody.innerHTML = "";
  const form = document.createElement("form");
  form.innerHTML = `
    <label>Предмет<input name="subject" placeholder="Математика" required></label>
    <label>Оцінка<input name="value" placeholder="5" required></label>
    <label>Коментар<textarea name="comment" placeholder="Коментар (не обов'язково)"></textarea></label>
    <div class="row"><button class="btn">Зберегти оцінку</button></div>
  `;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      subject: form.subject.value.trim() || "предмет",
      value: form.value.value.trim() || "",
      comment: form.comment.value.trim() || "",
      date: Date.now(),
      by: currentUser.email
    };
    // push to DB
    const gradesRef = ref(db, `classes/default/students/${id}/grades`);
    // get current and set appended array (simple approach)
    const snapshot = await get(ref(db, `classes/default/students/${id}/grades`));
    const arr = snapshot.exists() ? snapshot.val() : [];
    arr.push(data);
    await set(ref(db, `classes/default/students/${id}/grades`), arr);
    hideModal();
  });
  modalBody.appendChild(form);
  showModal();
}

function openModalAddRemark(id){
  modalTitle.textContent = `Додати зауваження — ${studentsData[id].name}`;
  modalBody.innerHTML = "";
  const form = document.createElement("form");
  form.innerHTML = `
    <label>Текст зауваження<textarea name="text" placeholder="Наприклад: не виконано ДЗ" required></textarea></label>
    <div class="row"><button class="btn">Зберегти зауваження</button></div>
  `;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      text: form.text.value.trim(),
      date: Date.now(),
      by: currentUser.email
    };
    const snapshot = await get(ref(db, `classes/default/students/${id}/remarks`));
    const arr = snapshot.exists() ? snapshot.val() : [];
    arr.push(data);
    await set(ref(db, `classes/default/students/${id}/remarks`), arr);
    hideModal();
  });
  modalBody.appendChild(form);
  showModal();
}

function showModal(){ modal.classList.remove("hidden"); }
function hideModal(){ modal.classList.add("hidden"); modalBody.innerHTML = ""; }

closeModal.addEventListener("click", hideModal);
modal.addEventListener("click", (e) => { if (e.target === modal) hideModal(); });

/* ---------- Utilities ---------- */
function escapeHtml(s){
  if (!s) return "";
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------- Filters / quick mode ---------- */
filterSelect.addEventListener("change", renderStudents);
addCommentMode.addEventListener("click", () => {
  addCommentQuick = !addCommentQuick;
  addCommentMode.textContent = addCommentQuick ? "Режим: швидке зауваження ВКЛ" : "Додати швидку примітку";
  addCommentMode.classList.toggle("ghost", !addCommentQuick);
  if (addCommentQuick){
    // clicking on student card will open quick remark prompt
    studentsList.querySelectorAll(".student").forEach(card => {
      card.addEventListener("click", quickRemarkHandler);
    });
  } else {
    studentsList.querySelectorAll(".student").forEach(card => {
      card.removeEventListener("click", quickRemarkHandler);
    });
  }
});

async function quickRemarkHandler(e){
  // find dataset id from button
  const btn = e.target.closest("[data-id]");
  if (!btn) return;
  const id = btn.dataset.id;
  const text = prompt("Швидке зауваження (коротко):");
  if (text && text.trim()){
    const data = { text: text.trim(), date: Date.now(), by: currentUser.email };
    const snapshot = await get(ref(db, `classes/default/students/${id}/remarks`));
    const arr = snapshot.exists() ? snapshot.val() : [];
    arr.push(data);
    await set(ref(db, `classes/default/students/${id}/remarks`), arr);
  }
}
