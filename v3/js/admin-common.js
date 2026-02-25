/* ========================================
   관리자 페이지 공통 함수
   js/admin-common.js
   ======================================== */

// 사이드바 토글
document.addEventListener('DOMContentLoaded', function() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
    });
  }

  // 서브메뉴 토글
  const navItems = document.querySelectorAll('.nav-item.has-submenu > .nav-link');
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = this.parentElement;
      parent.classList.toggle('active');
    });
  });
});

// 로그아웃
function logout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    localStorage.removeItem('adminToken');
    location.href = '../index.html';
  }
}

// 숫자 포맷팅 (천 단위 콤마)
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 날짜 포맷팅 (YYYY-MM-DD HH:mm)
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

// 금액 포맷팅
function formatCurrency(amount) {
  return `${formatNumber(amount)}원`;
}

// API 호출 공통 함수
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`/api/admin${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '요청 실패');
    }
    
    return result;
  } catch (error) {
    console.error('API 호출 에러:', error);
    alert(error.message);
    throw error;
  }
}

// 파일 업로드
async function uploadFile(file, type = 'question') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  try {
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '파일 업로드 실패');
    }
    
    return result.url; // 업로드된 파일 URL 반환
  } catch (error) {
    console.error('파일 업로드 에러:', error);
    alert(error.message);
    throw error;
  }
}

// 로딩 표시
function showLoading() {
  const loading = document.createElement('div');
  loading.id = 'loadingOverlay';
  loading.innerHTML = `
    <div style="
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5); z-index: 9999;
      display: flex; justify-content: center; align-items: center;
    ">
      <div style="
        background: white; padding: 30px; border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      ">
        <p style="margin: 0; font-size: 1.2rem; font-weight: 600;">처리 중...</p>
      </div>
    </div>
  `;
  document.body.appendChild(loading);
}

function hideLoading() {
  const loading = document.getElementById('loadingOverlay');
  if (loading) {
    loading.remove();
  }
}
