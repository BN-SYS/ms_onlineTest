import { AdminAPI } from "./admin-api.js";
import { requireAdmin, wireTopbarAuthUI } from "./auth.js";
import { fmtDate, pill, toast, openDrawer, closeDrawer, qs } from "./ui.js";

requireAdmin();
wireTopbarAuthUI();

const allLogs = AdminAPI.listLogs().slice().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
let current = allLogs;

function parseDateOnly(iso) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

function applyFilter() {
  const from = qs("#fromDate").value;
  const to = qs("#toDate").value;
  const paid = qs("#paidSel").value;
  const status = qs("#statusSel").value;
  const ab = qs("#abSel").value;
  const s = qs("#search").value.trim().toLowerCase();

  current = allLogs.filter(r => {
    const day = parseDateOnly(r.createdAt);
    if (from && day < from) return false;
    if (to && day > to) return false;

    if (paid === "paid" && !r.paid) return false;
    if (paid === "unpaid" && r.paid) return false;

    if (status !== "all" && r.status !== status) return false;

    const abFlag = r.abnormalFlag ? "Y" : "N";
    if (ab !== "all" && abFlag !== ab) return false;

    if (s) {
      const hay = `${r.name} ${r.email} ${r.ip}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });

  render();
}

function render() {
  const tbody = qs("#logTable");
  tbody.innerHTML = current.map(r => `
    <tr>
      <td>${r.logId}</td>
      <td>${fmtDate(r.createdAt)}</td>
      <td>${r.name}</td>
      <td>${r.email}</td>
      <td><b>${r.totalScore}</b> (${r.percentile})</td>
      <td>${r.paid ? pill("success", `${r.paidAmount.toLocaleString()}원`) : pill("warn", "미결제")}</td>
      <td>${r.status === "완료" ? pill("success", "완료") : pill("warn", "중간 이탈")}</td>
      <td>${r.abnormalFlag ? pill("danger","Y") : pill("success","N")}</td>
      <td><button class="btn" data-open="${r.logId}">상세</button></td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => openDetail(Number(btn.getAttribute("data-open"))));
  });
}

function openDetail(logId) {
  const r = allLogs.find(x => x.logId === logId);
  if (!r) return;

  qs("#drawerBody").innerHTML = `
    <div class="panel">
      <div class="panel-title">기본 정보</div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; color: rgba(232,238,252,0.82); font-size:13px;">
        <div><b>로그ID</b><div>${r.logId}</div></div>
        <div><b>일시</b><div>${fmtDate(r.createdAt)}</div></div>
        <div><b>이름</b><div>${r.name}</div></div>
        <div><b>이메일</b><div>${r.email}</div></div>
        <div><b>출생연도</b><div>${r.birthYear}</div></div>
        <div><b>IP</b><div>${r.ip}</div></div>
      </div>
    </div>

    <div class="panel" style="margin-top:12px;">
      <div class="panel-title">점수 요약</div>
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;">
        <div class="card" style="grid-column: span 1;">
          <h3>Stage 1</h3><div class="kpi" style="font-size:22px;">${r.stage1Score}</div>
        </div>
        <div class="card" style="grid-column: span 1;">
          <h3>Stage 2</h3><div class="kpi" style="font-size:22px;">${r.stage2Score}</div>
        </div>
        <div class="card" style="grid-column: span 1;">
          <h3>Stage 3</h3><div class="kpi" style="font-size:22px;">${r.stage3Score}</div>
        </div>
      </div>
      <div style="margin-top:10px;">
        <b>총점</b>: ${r.totalScore}점 (${r.percentile})<br/>
        <b>평균 응답시간</b>: ${r.avgTimePerQuestionSec}s<br/>
        <b>비정상 플래그</b>: ${r.abnormalFlag ? "Y" : "N"}
      </div>
    </div>

    <div class="panel" style="margin-top:12px;">
      <div class="panel-title">결제</div>
      <div>${r.paid ? pill("success","결제") : pill("warn","미결제")} 
           ${r.paid ? ` / ${r.paidAmount.toLocaleString()}원 / ${r.paymentType}` : ""}</div>
      <div style="margin-top:8px; color: rgba(232,238,252,0.65); font-size:12px;">
        * 실제 운영에서는 PG 거래ID/결제수단/정산 상태까지 연동이 필요합니다.
      </div>
    </div>
  `;

  openDrawer("logDrawer");
}

qs("#btnCloseDrawer").addEventListener("click", () => closeDrawer("logDrawer"));
qs("#btnApply").addEventListener("click", applyFilter);
qs("#btnCSV").addEventListener("click", () => {
  if (!current.length) return toast("다운로드할 데이터가 없습니다.");
  AdminAPI.exportLogsCSV(current);
  toast("CSV 다운로드를 시작했습니다.");
});

render();
