/* ========================================
   js/payment.js
   결제 처리 로직
======================================== */

// 인증번호 생성
function generateCertificateNumber() {
    const year = new Date().getFullYear();
    const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    return `MENSA-${year}-${random}`;
}

// 진위확인코드 생성
function generateVerificationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
        if ((i + 1) % 4 === 0 && i < 11) {
            code += '-';
        }
    }
    return code;
}

// ✅ 선택 효과 (선택사항)
function selectPayment(type) {
    // 모든 카드의 selected 클래스 제거
    document.querySelectorAll('.payment-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 클릭한 카드에 selected 클래스 추가
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('selected');
    }
    
    console.log(`💳 ${type} 카드 선택됨`);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('💳 결제 페이지 로드 완료');
    
    // 테스트 완료 여부 확인
    const stage3Result = localStorage.getItem('stage3Result');
    if (!stage3Result) {
        console.warn('⚠️ 3단계 테스트 미완료');
        // alert('테스트를 먼저 완료해주세요.');
        // location.href = 'index.html';
    }
});
