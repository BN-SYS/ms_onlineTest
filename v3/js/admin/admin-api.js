// js/admin/admin-api.js
// - MVP: localStorage 기반 (UI 동작/검증용)
// - 차기: 이 파일을 fetch(API)로 교체하면 나머지 화면은 유지 가능

const KEYS = {
  adminSession: "adminSession",
  testSettings: "testSettings",
  qbank1: "questionBank_stage1",
  qbank2: "questionBank_stage2",
  qbank3: "questionBank_stage3",
  logs: "testLogs",
  payments: "paymentRecords",
  system: "systemSettings"
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix = "ID") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function seedIfEmpty() {
  // testSettings: 사용자 결과 페이지에서도 읽는 키명 유지
  const ts = readJSON(KEYS.testSettings, null);
  if (!ts) {
    writeJSON(KEYS.testSettings, {
      stage1: { questionCount: 15, timeLimitMin: 30, baseScore: 40, pointPerQuestion: 4, validation: { minCorrectRate: 20, minAvgSec: 30, minTotalSec: 10 } },
      stage2: { questionCount: 5, timeLimitMin: 10, baseScore: 60, pointPerQuestion: 8, validation: { minCorrectRate: 20, minAvgSec: 2, minTotalSec: 10 } },
      stage3: { questionCount: 5, timeLimitMin: 10, baseScore: 60, pointPerQuestion: 8, validation: { minCorrectRate: 20, minAvgSec: 2, minTotalSec: 10 } }
    });
  }

  // question banks
  if (!readJSON(KEYS.qbank1, null)) writeJSON(KEYS.qbank1, []);
  if (!readJSON(KEYS.qbank2, null)) writeJSON(KEYS.qbank2, []);
  if (!readJSON(KEYS.qbank3, null)) writeJSON(KEYS.qbank3, []);

  // logs
  const logs = readJSON(KEYS.logs, null);
  if (!logs) {
    const sample = [];
    for (let i = 0; i < 12; i++) {
      sample.push({
        logId: 1000 + i,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        name: ["홍길동", "김철수", "이영희", "박민수"][i % 4],
        birthYear: String(1990 + (i % 8)),
        email: `user${i}@example.com`,
        ip: `192.168.0.${10 + i}`,
        stage1Score: 60 + (i % 35),
        stage2Score: 55 + (i % 40),
        stage3Score: 50 + (i % 45),
        totalScore: 60 + (i % 35),
        percentile: ["상위 10%", "상위 25%", "상위 50%", "하위 50%"][i % 4],
        avgTimePerQuestionSec: 8 + (i % 15),
        paid: i % 3 === 0,
        paidAmount: i % 3 === 0 ? (i % 2 === 0 ? 19900 : 24900) : 0,
        paymentType: i % 3 === 0 ? (i % 2 === 0 ? "basic" : "detail") : null,
        status: i % 5 === 0 ? "중간 이탈" : "완료",
        abnormalFlag: i % 7 === 0
      });
    }
    writeJSON(KEYS.logs, sample);
  }

  // payments
  if (!readJSON(KEYS.payments, null)) {
    writeJSON(KEYS.payments, [
      { id: uid("TXN"), paidAt: new Date().toISOString(), name: "홍길동", email: "hong@example.com", amount: 19900, type: "basic", pgTid: "PG_" + Date.now() },
      { id: uid("TXN"), paidAt: new Date(Date.now() - 86400000).toISOString(), name: "김철수", email: "kim@example.com", amount: 24900, type: "detail", pgTid: "PG_" + (Date.now() - 99) }
    ]);
  }

  // system settings
  if (!readJSON(KEYS.system, null)) {
    writeJSON(KEYS.system, {
      inquiryReceiverEmail: "admin@mensa.co.kr",
      pgVendor: "이니시스",
      note: "운영 정책 확정 전 임시값"
    });
  }
}

export const AdminAPI = {
  keys: KEYS,
  seedIfEmpty,

  // auth
  getSession() {
    return readJSON(KEYS.adminSession, null);
  },
  login({ email, password }) {
    // 데모: 하드코딩
    if (email === "admin@example.com" && password === "admin1234") {
      const session = { email, role: "ADMIN", loginAt: new Date().toISOString() };
      writeJSON(KEYS.adminSession, session);
      return { ok: true, session };
    }
    return { ok: false, message: "이메일 또는 비밀번호를 확인해주세요." };
  },
  logout() {
    localStorage.removeItem(KEYS.adminSession);
  },

  // test settings
  getTestSettings() {
    return readJSON(KEYS.testSettings, null);
  },
  saveTestSettings(settings) {
    writeJSON(KEYS.testSettings, settings);
  },

  // question bank
  getQuestionBank(stage) {
    const key = stage === 1 ? KEYS.qbank1 : stage === 2 ? KEYS.qbank2 : KEYS.qbank3;
    return readJSON(key, []);
  },
  saveQuestionBank(stage, list) {
    const key = stage === 1 ? KEYS.qbank1 : stage === 2 ? KEYS.qbank2 : KEYS.qbank3;
    writeJSON(key, list);
  },

  // logs
  listLogs() {
    return readJSON(KEYS.logs, []);
  },
  exportLogsCSV(rows) {
    const header = [
      "logId","createdAt","name","birthYear","email","ip",
      "stage1Score","stage2Score","stage3Score","totalScore","percentile",
      "avgTimePerQuestionSec","paid","paidAmount","paymentType","status","abnormalFlag"
    ];
    const lines = [header.join(",")].concat(
      rows.map(r => header.map(h => JSON.stringify(r[h] ?? "")).join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `test_logs_${todayISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // payments
  listPayments() {
    return readJSON(KEYS.payments, []);
  },
  savePayments(list) {
    writeJSON(KEYS.payments, list);
  },

  // system
  getSystemSettings() {
    return readJSON(KEYS.system, {});
  },
  saveSystemSettings(payload) {
    writeJSON(KEYS.system, payload);
  }
};
