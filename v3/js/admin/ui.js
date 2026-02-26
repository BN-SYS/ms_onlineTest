// js/admin/ui.js

export function qs(sel, parent = document) {
  return parent.querySelector(sel);
}

export function qsa(sel, parent = document) {
  return Array.from(parent.querySelectorAll(sel));
}

export function fmtDate(iso) {
  try {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  } catch {
    return iso;
  }
}

export function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.innerHTML = `<div style="font-weight:900; margin-bottom:6px;">알림</div><div style="color: rgba(232,238,252,0.78); font-size:13px;">${message}</div>`;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

export function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("show");
}
export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("show");
}

export function openDrawer(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("show");
}
export function closeDrawer(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("show");
}

export function pill(kind, text) {
  const map = { success: "success", warn: "warn", danger: "danger" };
  const cls = map[kind] || "";
  return `<span class="pill ${cls}">${text}</span>`;
}
