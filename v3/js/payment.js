/* ========================================
   js/payment.js
   결제 처리 로직
======================================== */

// 결제 처리 함수
function processPayment(type) {
    // 사용자 데이터 확인
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const stage1Result = JSON.parse(localStorage.getItem('stage1Result') || 'null');
    const stage2Result = JSON.parse(localStorage.getItem('stage2Result') || 'null');
    const stage3Result = JSON.parse(localStorage.getItem('stage3Result') || 'null');

    // 테스트 완료 여부 확인
    if (!userData.name || !stage1Result || !stage2Result || !stage3Result) {
        alert('테스트를 먼저 완료해주세요.');
        location.href = 'index.html';
        return;
    }

    // 가격 정보
    const prices = {
        basic: {
            original: 19900,
            discounted: 14900,
            name: '기본 결과'
        },
        detail: {
            original: 39900,
            discounted: 23900,
            name: '상세 리포트'
        }
    };

    const selected = prices[type];

    // 결제 확인
    const confirmMessage = `${selected.name}을(를) 결제하시겠습니까?\n\n할인가: ${selected.discounted.toLocaleString()}원\n(정상가: ${selected.original.toLocaleString()}원)`;

    if (!confirm(confirmMessage)) {
        return;
    }

    // 결제 정보 저장
    const paymentInfo = {
        type: type,
        productName: selected.name,
        originalAmount: selected.original,
        discountedAmount: selected.discounted,
        timestamp: new Date().toISOString(),
        transactionId: 'TXN' + Date.now(),
        certificateNumber: generateCertificateNumber(),
        verificationCode: generateVerificationCode()
    };

    localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));

    console.log('✅ 결제 정보 저장:', paymentInfo);

    // 결제 완료 메시지
    alert('결제가 완료되었습니다!\n결과 페이지로 이동합니다.');

    // 결과 페이지로 이동
    if (type === 'basic') {
        location.href = 'result-basic.html';
    } else {
        location.href = 'result-detail.html';
    }
}

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
    event.currentTarget.classList.add('selected');
    
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
