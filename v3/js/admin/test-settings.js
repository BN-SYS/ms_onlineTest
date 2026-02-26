
import { AdminAPI } from "./admin-api.js";
import { requireAdmin, wireTopbarAuthUI } from "./auth.js";
import { toast } from "./ui.js";

requireAdmin();
wireTopbarAuthUI();

const form = document.getElementById("settingsForm");

function section(stageKey, title, s) {
  return `
    <div class="panel" style="margin-top:12px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:10px;">
        <div>
          <div class="panel-title">${title}</div>
          <div style="color: rgba(232,238,252,0.72); font-size:12px;">문항/시간/채점 + 비정상 기준</div>
        </div>
      </div>

      <div class="filters" style="margin-top:10px;">
        <div class="field">
          <label>문항 수</label>
          <input class="input" type="number" min="1" data-k="${stageKey}.questionCount" value="${s.questionCount}">
        </div>
        <div class="field">
          <label>제한시간(분)</label>
          <input class="input" type="number" min="1" data-k="${stageKey}.timeLimitMin" value="${s.timeLimitMin}">
        </div>
        <div class="field">
          <label>기본점수</label>
          <input class="input" type="number" min="0" max="100" data-k="${stageKey}.baseScore" value="${s.baseScore}">
        </div>
        <div class="field">
          <label>문항당 배점</label>
          <input class="input" type="number" min="0" max="100" data-k="${stageKey}.pointPerQuestion" value="${s.pointPerQuestion}">
        </div>

        <div class="field">
          <label>검증: 최소 정답률(%)</label>
          <input class="input" type="number" min="0" max="100" data-k="${stageKey}.validation.minCorrectRate" value="${s.validation.minCorrectRate}">
        </div>
        <div class="field">
          <label>검증: 최소 평균응답시간(초)</label>
          <input class="input" type="number" min="0" data-k="${stageKey}.validation.minAvgSec" value="${s.validation.minAvgSec}">
        </div>
        <div class="field">
          <label>검증: 최소 총응시시간(초)</label>
          <input class="input" type="number" min="0" data-k="${stageKey}.validation.minTotalSec" value="${s.validation.minTotalSec}">
        </div>
      </div>
    </div>
  `;
}

function render() {
  const settings = AdminAPI.getTestSettings();
  form.innerHTML =
    section("stage1", "Stage 1 (시각 추론)", settings.stage1) +
    section("stage2", "Stage 2 (논리 사고)", settings.stage2) +
    section("stage3", "Stage 3 (종합 평가)", settings.stage3) +
    `<div style="margin-top:10px; color: rgba(232,238,252,0.65); font-size:12px;">
      * 저장 시 localStorage <code>testSettings</code> 키를 갱신합니다. (사용자 결과 화면도 동일 키를 참조)
    </div>`;
}

function setDeep(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  while (parts.length > 1) {
    const p = parts.shift();
    cur[p] = cur[p] ?? {};
    cur = cur[p];
  }
  cur[parts[0]] = value;
}

document.getElementById("btnSave").addEventListener("click", () => {
  const settings = AdminAPI.getTestSettings();
  document.querySelectorAll("[data-k]").forEach(el => {
    const key = el.getAttribute("data-k");
    const val = Number(el.value);
    setDeep(settings, key, Number.isFinite(val) ? val : el.value);
  });
  AdminAPI.saveTestSettings(settings);
  toast("저장했습니다. (데모: localStorage 반영)");
});

document.getElementById("btnReset").addEventListener("click", () => {
  localStorage.removeItem(AdminAPI.keys.testSettings);
  AdminAPI.seedIfEmpty();
  render();
  toast("초기값으로 되돌렸습니다.");
});

render();
