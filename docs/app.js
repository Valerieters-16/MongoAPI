// === CONFIG ===
const API_BASE = "https://mongoapi-hnzx.onrender.com/api"; // or "http://localhost:3000/api" for local dev

// === SEED DATA ===
document.getElementById("seedBtn").addEventListener("click", async () => {
  await fetch(`${API_BASE}/seed`, { method: "POST" });
  loadAll();
});

// === COURSES ===
async function loadCourses() {
  const res = await fetch(`${API_BASE}/courses`);
  const data = await res.json();
  const tbody = document.querySelector("#coursesTable tbody");
  const select = document.getElementById("courseSelect");
  tbody.innerHTML = "";
  select.innerHTML = "<option value=''>Select Course</option>";

  data.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.title}</td>
      <td>${c.code}</td>
      <td><button class="delete-btn" onclick="deleteCourse('${c._id}')">Delete</button></td>
    `;
    tbody.appendChild(tr);

    const opt = document.createElement("option");
    opt.value = c._id;
    opt.textContent = `${c.title} (${c.code})`;
    select.appendChild(opt);
  });
}

async function deleteCourse(id) {
  if (!confirm("Delete this course?")) return;
  await fetch(`${API_BASE}/courses/${id}`, { method: "DELETE" });
  loadAll();
}

// === STUDENTS ===
async function loadStudents() {
  const res = await fetch(`${API_BASE}/students`);
  const data = await res.json();
  const tbody = document.querySelector("#studentsTable tbody");
  const select = document.getElementById("studentSelect");
  tbody.innerHTML = "";
  select.innerHTML = "<option value=''>Select Student</option>";

  data.forEach(s => {
    const courseList = (s.registeredCourses || [])
      .map(rc => `${rc.title} (${rc.code})`)
      .join(", ") || "<i>None</i>";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.email || "-"}</td>
      <td>${courseList}</td>
      <td>
        <button class="edit-btn" data-id="${s._id}" data-name="${s.name}" data-email="${s.email || ""}">Edit</button>
        <button class="delete-btn" onclick="deleteStudent('${s._id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);

    const opt = document.createElement("option");
    opt.value = s._id;
    opt.textContent = s.name;
    select.appendChild(opt);
  });
}

async function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;
  await fetch(`${API_BASE}/students/${id}`, { method: "DELETE" });
  loadAll();
}

document.getElementById("studentForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("studentName").value;
  const email = document.getElementById("studentEmail").value;
  await fetch(`${API_BASE}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email })
  });
  e.target.reset();
  loadAll();
});

// === EDIT STUDENT ===
const modal = document.getElementById("editModal");
const editNameInput = document.getElementById("editName");
const editEmailInput = document.getElementById("editEmail");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let currentEditId = null;

// Open modal on "Edit" button click
document.addEventListener("click", e => {
  if (e.target.classList.contains("edit-btn")) {
    currentEditId = e.target.dataset.id;
    editNameInput.value = e.target.dataset.name;
    editEmailInput.value = e.target.dataset.email;
    modal.style.display = "flex"; // show modal
  }
});

// Save edit
saveEditBtn.addEventListener("click", async () => {
  if (!currentEditId) return;
  const name = editNameInput.value.trim();
  const email = editEmailInput.value.trim();

  if (!name) return alert("Name cannot be empty.");

  try {
    const res = await fetch(`${API_BASE}/student/${currentEditId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });

    if (res.ok) {
      modal.style.display = "none";
      loadStudents();
    } else {
      alert("Failed to update student.");
    }
  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  }
});

// Cancel edit
cancelEditBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", e => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// === REGISTER / UNREGISTER ===
document.getElementById("enrollForm").addEventListener("submit", async e => {
  e.preventDefault();
  const studentId = document.getElementById("studentSelect").value;
  const courseId = document.getElementById("courseSelect").value;
  if (!studentId || !courseId) return alert("Select both student and course");

  const res = await fetch(`${API_BASE}/students/${studentId}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId })
  });

  if (res.status === 409) {
    alert("Already registered in this course");
  } else if (!res.ok) {
    alert("Registration failed");
  }
  loadAll();
});

document.getElementById("unregisterBtn").addEventListener("click", async () => {
  const studentId = document.getElementById("studentSelect").value;
  const courseId = document.getElementById("courseSelect").value;
  if (!studentId || !courseId) return alert("Select both student and course");

  await fetch(`${API_BASE}/students/${studentId}/unregister`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId })
  });
  loadAll();
});

// === LOAD ALL ===
async function loadAll() {
  await loadCourses();
  await loadStudents();
}

loadAll();
