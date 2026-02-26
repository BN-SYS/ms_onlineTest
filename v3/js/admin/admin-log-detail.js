// js/admin-log-detail.js

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("sessionId");

  if (!sessionId) {
    alert("sessionId가 없습니다. 목록에서 다시 접근해주세요.");
    history.back();
    return;
  }

  const logs = JSON.parse(localStorage.getItem("testLogs") || "[]");
  const sessionLogs = logs.filter(l => l.sessionId === sessionId);

  if (!sessionLogs.length) {
    alert("해당 세션 로그를 찾지 못했습니다.");
    history.back();
    return;
  }

  // 사용자 정보는 세션 로그 중 최신 항목 기준
  const latest = sessionLogs.slice().sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  renderUser(latest, sessionId);

  // stage 결과만 추출(보통 stage:1/2/3 + passed 포함)
  const stageLogs = sessionLogs
    .filter(l => typeof l.stage === "number")
    .sort((a,b) => a.stage - b.stage);

  renderStageSummary(stageLogs);

  // 기본: 가장 마지막 stage(있으면 3, 없으면 max) 상세 열기
  const defaultStage = Math.max(...stageLogs.map(s => s.stage));
  openStageDetail(defaultStage, stageLogs);
});

function renderUser(latest, sessionId){
  const grid = document.getElementById("userInfoGrid");
  const age = latest.birthYear ? (new Date().getFullYear() - Number(latest.birthYear)) : "-";

  grid.innerHTML = `
    <div style="display:grid; grid-template-columns: 140px 1fr; gap:10px;">
      <strong>세션ID</strong><span>${sessionId}</span>
      <strong>이름</strong><span>${latest.name || "-"}</span>
      <strong>이메일</strong><span>${latest.userId || latest.email || "-"}</span>
      <strong>출생연도</strong><span>${latest.birthYear ? `${latest.birthYear} (${age}세)` : "-"}</span>
      <strong>IP</strong><span>${latest.ip || "-"}</span>
      <strong>최종 기록 시각</strong><span>${formatDate(latest.timestamp || latest.createdAt || new Date())}</span>
    </div>
  `;
}

function renderStageSummary(stageLogs){
  const tbody = document.getElementById("stageSummaryBody");

  tbody.innerHTML = stageLogs.map(s => {
    const passed = s.passed === true ? "통과" : "실패";
    const rate = (s.correctRate != null) ? `${s.correctRate}%` : "-";
    const avg = (s.avgTimePerQuestion != null) ? `${s.avgTimePerQuestion}` : "-";

    return `
      <tr>
        <td>${s.stage}단계</td>
        <td>${passed}</td>
        <td>${s.correctCount ?? "-"}/${s.totalQuestions ?? "-"}</td>
        <td>${rate}</td>
        <td>${s.totalTime ?? "-"}</td>
        <td>${avg}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="openStageDetail(${s.stage})">보기</button>
        </td>
      </tr>
    `;
  }).join("");

  // 전역 접근(버튼 onclick용)
  window.__stageLogs = stageLogs;
}

window.openStageDetail = function(stage){
  const stageLogs = window.__stageLogs || [];
  const data = stageLogs.find(s => s.stage === Number(stage));
  const wrap = document.getElementById("qaDetailWrap");
  const hint = document.getElementById("detailHint");

  if (!data) {
    wrap.innerHTML = `<div class="form-container">해당 단계 데이터가 없습니다.</div>`;
    return;
  }

  hint.textContent = `${stage}단계 문항별 응답 (선택 보기/소요시간/정답여부)`;

  const answers = Array.isArray(data.answers) ? data.answers : [];

  // ✅ 정답판정은 "스냅샷"이 있을 때만 정확함
  // 아래 test-common.js 보강(질문 스냅샷 저장)을 적용하면 data.questionSnapshots로 판정 가능
  const snapshots = Array.isArray(data.questionSnapshots) ? data.questionSnapshots : [];

  wrap.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>문제ID</th>
          <th>선택</th>
          <th>소요시간</th>
          <th>정답여부</th>
          <th>문제/보기 미리보기</th>
        </tr>
      </thead>
      <tbody>
        ${answers.map((a, idx) => {
          if (!a) {
            return `
              <tr>
                <td>${idx+1}</td>
                <td>${data.questions?.[idx] || "-"}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>미응답</td>
              </tr>
            `;
          }

          const timeSec = (a.endTime && a.startTime) ? Math.round((a.endTime - a.startTime)/1000) + "초" : "-";
          const snap = snapshots.find(s => s.questionId === a.questionId);

          let correctness = "-";
          if (snap && snap.correctChoiceId != null) {
            correctness = (Number(a.choiceId) === Number(snap.correctChoiceId)) ? "정답" : "오답";
          } else {
            correctness = "판정불가(스냅샷없음)";
          }

          return `
            <tr>
              <td>${idx+1}</td>
              <td>${a.questionId}</td>
              <td>${a.choiceId ?? "-"}</td>
              <td>${timeSec}</td>
              <td>${correctness}</td>
              <td>
                ${renderPreview(snap, a.choiceId)}
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
};

function renderPreview(snap, selectedChoiceId){
  if (!snap) return `<span style="color:#888;">스냅샷 없음</span>`;

  const q = snap.questionImage ? `<img src="${snap.questionImage}" style="width:120px;border-radius:8px;border:1px solid #ddd;" />` : "";
  const choices = (snap.choices || []).map(c => {
    const isSel = Number(c.id) === Number(selectedChoiceId);
    const border = isSel ? "2px solid #667eea" : "1px solid #ddd";
    const img = c.image ? `<img src="${c.image}" style="width:56px;height:40px;object-fit:cover;border-radius:6px;border:${border};" />` : "";
    const txt = c.text ? `<div style="font-size:12px;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(c.text)}</div>` : "";
    return `<div style="display:flex;gap:8px;align-items:center;margin:4px 0;">${img}${txt}</div>`;
  }).join("");

  return `<div style="display:flex;gap:10px;align-items:flex-start;">${q}<div>${choices}</div></div>`;
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
