// js/admin/auth.js
import { AdminAPI } from "./admin-api.js";
import { toast } from "./ui.js";

export function requireAdmin() {
  AdminAPI.seedIfEmpty();
  const session = AdminAPI.getSession();
  // if (!session) {
  //   // admin 내부 페이지에서만 사용
  //   location.href = "login.html";
  //   return null;
  // }
  return session;
}

export function wireTopbarAuthUI() {
  const badge = document.getElementById("adminSessionBadge");
  const logoutBtn = document.getElementById("btnLogout");

  const session = AdminAPI.getSession();
  if (badge) {
    badge.textContent = session ? `${session.email} (ADMIN)` : "세션 없음";
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      AdminAPI.logout();
      toast("로그아웃 처리했습니다. (데모 세션 종료)");
      setTimeout(() => location.href = "login.html", 350);
    });
  }
}
