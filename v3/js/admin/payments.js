import { AdminAPI } from "./admin-api.js";
import { requireAdmin, wireTopbarAuthUI } from "./auth.js";
import { fmtDate, pill, qs } from "./ui.js";

requireAdmin();
wireTopbarAuthUI();

const all = AdminAPI.listPayments().slice().sort((a,b)=> new Date(b.paidAt)-new Date(a.paidAt));
let current = all;

function labelType(t) {
  if (t === "basic") return pill("success","기본");
  if (t === "detail") return pill("success","상세");
  if (t === "upgrade") return pill("warn","차액");
  return pill("warn", t || "-");
}

function sum(rows) {
  return rows.reduce((a,r)=> a + (Number(r.amount)||0), 0);
}

function renderKPIs() {
  const basic = all.filter(x=>x.type==="basic");
  const detail = all.filter(x=>x.type==="detail");
  const upgrade = all.filter(x=>x.type==="upgrade");

  const kpis = [
    { title: "총 결제 건수", value: `${all.length}`, sub: "데모 데이터" },
    { title: "총 결제 금액", value: `${sum(all).toLocaleString()}원`, sub: "합계" },
    { title: "기본", value: `${basic.length}건`, sub: `${sum(basic).toLocaleString()}원` },
    { title: "상세", value: `${detail.length}건`, sub: `${sum(detail).toLocaleString()}원` },
    { title: "차액", value: `${upgrade.length}건`, sub: `${sum(upgrade).toLocaleString()}원` },
    { title: "주의", value: `환불/정산`, sub: "PG 연동 확정 후 구현 권장" }
  ];

  qs("#payKpis").innerHTML = kpis.map(k => `
    <div class="card">
      <h3>${k.title}</h3>
      <div class="kpi" style="font-size:26px;">${k.value}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>
  `).join("");
}

function applyFilter() {
  const type = qs("#typeSel").value;
  const s = qs("#search").value.trim().toLowerCase();

  current = all.filter(r => {
    if (type !== "all" && r.type !== type) return false;
    if (s) {
      const hay = `${r.name} ${r.email} ${r.pgTid} ${r.id}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });

  renderTable();
}

function renderTable() {
  qs("#payTable").innerHTML = current.map(r => `
    <tr>
      <td><b>${r.id}</b></td>
      <td>${fmtDate(r.paidAt)}</td>
      <td>${r.name}</td>
      <td>${r.email}</td>
      <td>${labelType(r.type)}</td>
      <td><b>${Number(r.amount).toLocaleString()}원</b></td>
      <td>${r.pgTid || "-"}</td>
    </tr>
  `).join("");
}

qs("#btnApply").addEventListener("click", applyFilter);

renderKPIs();
renderTable();
