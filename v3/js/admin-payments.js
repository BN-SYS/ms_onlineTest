/* ========================================
   결제 내역 스크립트
   js/admin-payments.js
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
  loadPaymentStats();
  loadPayments();
});

// 결제 통계 로드
async function loadPaymentStats() {
  try {
    // const stats = await apiCall('/payments/stats');
    
    const stats = {
      totalPayments: 524,
      totalAmount: 6235000,
      avgAmount: 11900
    };
    
    document.getElementById('totalPayments').textContent = formatNumber(stats.totalPayments);
    document.getElementById('totalAmount').textContent = formatCurrency(stats.totalAmount);
    document.getElementById('avgAmount').textContent = formatCurrency(stats.avgAmount);
    
  } catch (error) {
    console.error('통계 로드 실패:', error);
  }
}

// 결제 내역 로드
async function loadPayments() {
  try {
    // const payments = await apiCall('/payments');
    
    const payments = [
      {
        paymentId: 'PAY-2026-001',
        sessionId: 'MENSA-2026-045',
        name: '홍길동',
        product: '상세 리포트',
        amount: 5000,
        method: '카드',
        createdAt: '2026-02-23 10:30',
        status: '완료'
      },
      {
        paymentId: 'PAY-2026-002',
        sessionId: 'MENSA-2026-046',
        name: '김영희',
        product: '기본 결과',
        amount: 3000,
        method: '카카오페이',
        createdAt: '2026-02-23 09:15',
        status: '완료'
      }
    ];
    
    const tbody = document.getElementById('paymentList');
    tbody.innerHTML = '';
    
    payments.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${p.paymentId}</strong></td>
        <td>${p.sessionId}</td>
        <td>${p.name}</td>
        <td>${p.product}</td>
        <td><strong>${formatCurrency(p.amount)}</strong></td>
        <td>${p.method}</td>
        <td>${p.createdAt}</td>
        <td><span class="badge badge-success">${p.status}</span></td>
      `;
      tbody.appendChild(tr);
    });
    
  } catch (error) {
    console.error('결제 내역 로드 실패:', error);
  }
}

// 엑셀 다운로드
function exportPayments() {
  alert('엑셀 다운로드 기능은 백엔드 구현 후 활성화됩니다.');
  // 실제로는 /api/admin/payments/export 호출
}
