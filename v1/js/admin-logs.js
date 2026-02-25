// 가상 로그 데이터
let logsDB = [
    {
        id: 1,
        timestamp: '2026-02-12 14:30:22',
        name: '홍길동',
        birthYear: 1995,
        email: 'hong@example.com',
        correctCount: 15,
        iq: 125,
        timeSpent: 1250,
        paymentStatus: 'paid',
        paymentAmount: 9900,
        ip: '192.168.1.100'
    },
    {
        id: 2,
        timestamp: '2026-02-12 15:20:11',
        name: '김철수',
        birthYear: 1988,
        email: 'kim@example.com',
        correctCount: 18,
        iq: 138,
        timeSpent: 1580,
        paymentStatus: 'paid',
        paymentAmount: 9900,
        ip: '192.168.1.101'
    },
    {
        id: 3,
        timestamp: '2026-02-12 16:05:33',
        name: '이영희',
        birthYear: 2000,
        email: 'lee@example.com',
        correctCount: 12,
        iq: 0,
        timeSpent: 980,
        paymentStatus: 'unpaid',
        paymentAmount: 0,
        ip: '192.168.1.102'
    }
];

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    renderLogs();
    updateStats();
});

// 로그 렌더링
function renderLogs() {
    const tbody = document.getElementById('logsTableBody');
    tbody.innerHTML = logsDB.map(log => {
        const minutes = Math.floor(log.timeSpent / 60);
        const seconds = log.timeSpent % 60;
        const timeDisplay = `${minutes}분 ${seconds}초`;
        
        return `
            <tr>
                <td>${log.timestamp}</td>
                <td>${log.name}</td>
                <td>${log.birthYear}년생</td>
                <td>${log.email}</td>
                <td>${log.correctCount}/20</td>
                <td>${log.paymentStatus === 'paid' ? log.iq : '-'}</td>
                <td>${timeDisplay}</td>
                <td>
                    <span class="status-badge ${log.paymentStatus === 'paid' ? 'status-paid' : 'status-unpaid'}">
                        ${log.paymentStatus === 'paid' ? '완료' : '미결제'}
                    </span>
                </td>
                <td>${log.ip}</td>
                <td>
                    <button class="btn-secondary" style="padding: 5px 15px; font-size: 0.9rem;" onclick="openDetail(${log.id})">상세</button>
                </td>
            </tr>
        `;
    }).join('');
}

// 통계 업데이트
function updateStats() {
    const totalUsers = logsDB.length;
    const paidUsers = logsDB.filter(log => log.paymentStatus === 'paid').length;
    const avgIQ = paidUsers > 0 
        ? Math.round(logsDB.filter(log => log.paymentStatus === 'paid').reduce((sum, log) => sum + log.iq, 0) / paidUsers)
        : 0;
    const totalRevenue = logsDB.filter(log => log.paymentStatus === 'paid').reduce((sum, log) => sum + log.paymentAmount, 0);
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('paidUsers').textContent = paidUsers;
    document.getElementById('avgIQ').textContent = avgIQ > 0 ? avgIQ : '-';
    document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString() + '원';
}

// 필터링
function filterLogs() {
    const paymentFilter = document.getElementById('paymentFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    let filtered = logsDB;
    
    // 결제 상태 필터
    if (paymentFilter !== 'all') {
        filtered = filtered.filter(log => log.paymentStatus === paymentFilter);
    }
    
    // 검색어 필터
    if (searchTerm) {
        filtered = filtered.filter(log => 
            log.name.toLowerCase().includes(searchTerm) || 
            log.email.toLowerCase().includes(searchTerm)
        );
    }
    
    // 날짜 필터 (간단 구현)
    // 실제로는 더 정교한 날짜 비교 필요
    
    // 렌더링
    const tbody = document.getElementById('logsTableBody');
    tbody.innerHTML = filtered.map(log => {
        const minutes = Math.floor(log.timeSpent / 60);
        const seconds = log.timeSpent % 60;
        const timeDisplay = `${minutes}분 ${seconds}초`;
        
        return `
            <tr>
                <td>${log.timestamp}</td>
                <td>${log.name}</td>
                <td>${log.birthYear}년생</td>
                <td>${log.email}</td>
                <td>${log.correctCount}/20</td>
                <td>${log.paymentStatus === 'paid' ? log.iq : '-'}</td>
                <td>${timeDisplay}</td>
                <td>
                    <span class="status-badge ${log.paymentStatus === 'paid' ? 'status-paid' : 'status-unpaid'}">
                        ${log.paymentStatus === 'paid' ? '완료' : '미결제'}
                    </span>
                </td>
                <td>${log.ip}</td>
                <td>
                    <button class="btn-secondary" style="padding: 5px 15px; font-size: 0.9rem;" onclick="openDetail(${log.id})">상세</button>
                </td>
            </tr>
        `;
    }).join('');
}

// 상세 보기
function openDetail(id) {
    const log = logsDB.find(l => l.id === id);
    
    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = `
        <div style="padding: 30px;">
            <h3 style="margin-bottom: 20px;">응시자 상세 정보</h3>
            <div style="background: var(--bg-gray); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 10px;">
                    <strong>응시일시</strong>
                    <span>${log.timestamp}</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 10px;">
                    <strong>이름</strong>
                    <span>${log.name}</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 10px;">
                    <strong>출생연도</strong>
                    <span>${log.birthYear}년생 (${new Date().getFullYear() - log.birthYear}세)</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 10px;">
                    <strong>이메일</strong>
                    <span>${log.email}</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 10px;">
                    <strong>IP 주소</strong>
                    <span>${log.ip}</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 10px;">
                    <strong>정답 수</strong>
                    <span>${log.correctCount} / 20</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 10px;">
                    <strong>소요 시간</strong>
                    <span>${Math.floor(log.timeSpent / 60)}분 ${log.timeSpent % 60}초</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 10px;">
                    <strong>IQ</strong>
                    <span>${log.paymentStatus === 'paid' ? log.iq : '미결제 (확인 불가)'}</span>
                </div>
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px;">
                    <strong>결제 상태</strong>
                    <span class="status-badge ${log.paymentStatus === 'paid' ? 'status-paid' : 'status-unpaid'}">
                        ${log.paymentStatus === 'paid' ? '결제 완료' : '미결제'}
                    </span>
                </div>
            </div>
            <button class="btn-secondary" onclick="closeDetailModal()" style="width: 100%;">닫기</button>
        </div>
    `;
    
    document.getElementById('detailModal').classList.add('active');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// Excel 다운로드
function exportToExcel() {
    alert('Excel 다운로드 기능은 실제 개발 시 구현됩니다.\n(라이브러리: xlsx.js 사용 권장)');
}
