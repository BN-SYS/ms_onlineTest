import { AdminAPI } from "./admin-api.js";
import { requireAdmin, wireTopbarAuthUI } from "./auth.js";
import { toast, openModal, closeModal, qs } from "./ui.js";

requireAdmin();
wireTopbarAuthUI();

let editingId = null;

function getStage() {
  return Number(qs("#stageSel").value);
}

function loadList() {
  const stage = getStage();
  const search = qs("#qSearch").value.trim().toLowerCase();
  const list = AdminAPI.getQuestionBank(stage);

  const filtered = search ? list.filter(q => (q.id || "").toLowerCase().includes(search)) : list;

  const tbody = qs("#qTable");
  tbody.innerHTML = filtered.map(q => `
    <tr>
      <td><img class="thumb" src="${q.questionImage || ""}" onerror="this.style.opacity=.35" /></td>
      <td><b>${q.id}</b></td>
      <td>${q.choices?.length ?? 0}</td>
      <td>${q.correctChoiceId ?? "-"}</td>
      <td>${q.updatedAt ? new Date(q.updatedAt).toLocaleString() : "-"}</td>
      <td>
        <div class="row-actions">
          <button class="btn" data-act="edit" data-id="${q.id}">수정</button>
          <button class="btn danger" data-act="del" data-id="${q.id}">삭제</button>
        </div>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.act;
      const id = btn.dataset.id;
      if (act === "edit") openEdit(stage, id);
      if (act === "del") delOne(stage, id);
    });
  });
}

function renderChoices(choices) {
  const wrap = qs("#choicesWrap");
  wrap.innerHTML = (choices || []).map((c, idx) => `
    <div class="filters" style="margin: 10px 0; border-bottom: 1px solid rgba(232,238,252,0.12); padding-bottom: 10px;">
      <div class="field">
        <label>보기ID</label>
        <input class="input" data-choice="id" data-idx="${idx}" type="number" value="${c.id ?? (idx + 1)}" />
      </div>
      <div class="field" style="grid-column: span 7;">
        <label>이미지 URL</label>
        <input class="input" data-choice="image" data-idx="${idx}" value="${c.image ?? ""}" placeholder="./image/.. 또는 https://..." />
      </div>
      <div class="field">
        <label>정답?</label>
        <select class="select" data-choice="isCorrect" data-idx="${idx}">
          <option value="false" ${c.isCorrect ? "" : "selected"}>오답</option>
          <option value="true" ${c.isCorrect ? "selected" : ""}>정답</option>
        </select>
      </div>
      <div class="field">
        <label>&nbsp;</label>
        <button class="btn danger" type="button" data-remove="${idx}">삭제</button>
      </div>
    </div>
  `).join("");

  wrap.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-remove"));
      const cur = readModalData().choices;
      cur.splice(idx, 1);
      renderChoices(cur);
    });
  });
}

function openNew() {
  editingId = null;
  qs("#modalTitle").textContent = "문제 등록";
  qs("#mStage").value = String(getStage());
  qs("#mId").value = "";
  qs("#mQImg").value = "";
  renderChoices([{ id: 1, image: "", isCorrect: true }, { id: 2, image: "", isCorrect: false }, { id: 3, image: "", isCorrect: false }, { id: 4, image: "", isCorrect: false }]);
  openModal("qModal");
}

function openEdit(stage, id) {
  const list = AdminAPI.getQuestionBank(stage);
  const q = list.find(x => x.id === id);
  if (!q) return;

  editingId = id;
  qs("#modalTitle").textContent = "문제 수정";
  qs("#mStage").value = String(stage);
  qs("#mId").value = q.id;
  qs("#mQImg").value = q.questionImage || "";
  renderChoices(q.choices || []);
  openModal("qModal");
}

function readModalData() {
  const stage = Number(qs("#mStage").value);
  const id = qs("#mId").value.trim();
  const questionImage = qs("#mQImg").value.trim();

  const choices = [];
  qs("#choicesWrap").querySelectorAll("[data-idx]").forEach(el => {
    const idx = Number(el.getAttribute("data-idx"));
    choices[idx] = choices[idx] || { id: idx + 1, image: "", isCorrect: false };

    const key = el.getAttribute("data-choice");
    let val = el.value;

    if (key === "id") val = Number(val);
    if (key === "isCorrect") val = (val === "true");

    choices[idx][key] = val;
  });

  // correctChoiceId 계산
  const correct = choices.find(c => c.isCorrect);
  const correctChoiceId = correct ? correct.id : null;

  return { stage, id, questionImage, choices, correctChoiceId };
}

function saveModal() {
  const payload = readModalData();
  if (!payload.id) return toast("문제ID는 필수입니다.");
  if (!payload.questionImage) return toast("문제 이미지 URL은 필수입니다.");
  if (!payload.choices.length) return toast("보기는 최소 1개 이상 필요합니다.");
  if (!payload.correctChoiceId) return toast("정답 보기(isCorrect=true)를 1개 지정해주세요.");

  const list = AdminAPI.getQuestionBank(payload.stage);

  // 정답은 1개만 허용(나머지는 false로 정리)
  payload.choices = payload.choices.map(c => ({ ...c, isCorrect: c.id === payload.correctChoiceId }));

  const now = new Date().toISOString();
  const item = {
    id: payload.id,
    questionImage: payload.questionImage,
    choices: payload.choices,
    correctChoiceId: payload.correctChoiceId,
    updatedAt: now
  };

  if (editingId) {
    const idx = list.findIndex(x => x.id === editingId);
    if (idx === -1) return toast("수정 대상이 없습니다.");
    list[idx] = item;
  } else {
    if (list.some(x => x.id === payload.id)) return toast("동일한 문제ID가 이미 존재합니다.");
    list.unshift(item);
  }

  AdminAPI.saveQuestionBank(payload.stage, list);
  closeModal("qModal");
  toast("저장했습니다.");
  loadList();
}

function delOne(stage, id) {
  if (!confirm(`문제 "${id}"를 삭제할까요?`)) return;
  const list = AdminAPI.getQuestionBank(stage).filter(x => x.id !== id);
  AdminAPI.saveQuestionBank(stage, list);
  toast("삭제했습니다.");
  loadList();
}

function exportJSON() {
  const stage = getStage();
  const list = AdminAPI.getQuestionBank(stage);
  const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `questionBank_stage${stage}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error("배열 JSON이 아닙니다.");
      const stage = getStage();
      AdminAPI.saveQuestionBank(stage, data);
      toast("Import 완료");
      loadList();
    } catch (e) {
      toast(`Import 실패: ${e.message}`);
    }
  };
  reader.readAsText(file);
}

qs("#btnNew").addEventListener("click", openNew);
qs("#btnModalClose").addEventListener("click", () => closeModal("qModal"));
qs("#btnModalSave").addEventListener("click", saveModal);
qs("#btnAddChoice").addEventListener("click", () => {
  const cur = readModalData().choices;
  cur.push({ id: cur.length + 1, image: "", isCorrect: false });
  renderChoices(cur);
});
qs("#btnClearChoices").addEventListener("click", () => renderChoices([]));
qs("#btnFilter").addEventListener("click", loadList);
qs("#stageSel").addEventListener("change", loadList);

qs("#btnExport").addEventListener("click", exportJSON);
qs("#btnImport").addEventListener("click", () => qs("#importFile").click());
qs("#importFile").addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (file) importJSON(file);
  e.target.value = "";
});

loadList();
