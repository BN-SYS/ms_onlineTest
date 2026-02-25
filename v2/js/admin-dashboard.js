/* ========================================
   대시보드 스크립트
   js/admin-dashboard.js
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
  loadDashboardData();
});

// 대시보드 데이터 로드
async function loadDashboardData() {
  try {
    // 실제로는 API 호출로 데이터 가져오기
    // const data = await apiCall('/dashboard');
    
    // 샘플 데이터 (실제로는 위 API 호출 결과 사용)
    const data = {
      totalParticipants: 1247,
      totalRevenue: 6235000,
      completionRate: 78.3,
      avgTime: 42
    };
    
    // 통계 카드 업데이트
    document.getElementById('totalParticipants').textContent = formatNumber(data.totalParticipants);
    document.getElementById('totalRevenue').textContent = formatCurrency(data.totalRevenue);
    document.getElementById('completionRate').textContent = `${data.completionRate}%`;
    document.getElementById('avgTime').textContent = `${data.avgTime}분`;
    
    // 최근 응시 로그 로드
    loadRecentLogs();
    
  } catch (error) {
    console.error('대시보드 데이터 로드 실패:', error);
  }
}

// 최근 응시 로그 로드
async function loadRecentLogs() {
  try {
    // const logs = await apiCall('/logs?limit=10');
    
    // 샘플 데이터
    const logs = [
      {
        name: '홍길동',
        birthYear: 1990,
        sessionId: 'MENSA-2026-001',
        score: 145,
        percentile: 98.5,
        paid: true,
        createdAt: '2026-02-23 10:30'
      },
      {
        name: '김영희',
        birthYear: 1985,
        sessionId: 'MENSA-2026-002',
        score: 132,
        percentile: 85.2,
        paid: true,
        createdAt: '2026-02-23 09:15'
      },
      {
        name: '이철수',
        birthYear: 1995,
        sessionId: 'MENSA-2026-003',
        score: 118,
        percentile: 68.7,
        paid: false,
        createdAt: '2026-02-23 08:45'
      }
    ];
    
    const tbody = document.getElementById('recentLogs');
    tbody.innerHTML = '';
    
    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">데이터가 없습니다.</td></tr>';
      return;
    }
    
    logs.forEach(log => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${log.name}</td>
        <td>${log.birthYear}</td>
        <td>${log.sessionId}</td>
        <td><strong>${log.score}</strong></td>
        <td>${log.percentile}%</td>
        <td><span class="badge ${log.paid ? 'badge-success' : 'badge-warning'}">${log.paid ? '완료' : '미결제'}</span></td>
        <td>${log.createdAt}</td>
      `;
      tbody.appendChild(tr);
    });
    
  } catch (error) {
    console.error('로그 로드 실패:', error);
    document.getElementById('recentLogs').innerHTML = '<tr><td colspan="7" class="text-center">데이터 로드 실패</td></tr>';
  }
}
