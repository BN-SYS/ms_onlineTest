/* ========================================
   js/metacognition-modal.js 수정 버전
======================================== */

// 모달 표시
function showMetacognitionModal() {
    const modal = document.getElementById('metacognitionModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 스크롤 방지
        
        // 입력 필드 초기화
        document.getElementById('expectedCorrect').value = '';
        document.getElementById('expectedPercentile').value = '';
        
        // 에러 메시지 숨김
        document.getElementById('errorCorrect').style.display = 'none';
        document.getElementById('errorPercentile').style.display = 'none';
    }
}

// 모달 숨김
function hideMetacognitionModal() {
    const modal = document.getElementById('metacognitionModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // 스크롤 복원
    }
}

// 입력 검증
function validateMetacognitionInput() {
    const expectedCorrect = document.getElementById('expectedCorrect').value;
    const expectedPercentile = document.getElementById('expectedPercentile').value;
    
    const errorCorrect = document.getElementById('errorCorrect');
    const errorPercentile = document.getElementById('errorPercentile');
    
    let isValid = true;
    
    // 정답 개수 검증
    if (!expectedCorrect || expectedCorrect === '' || expectedCorrect < 0 || expectedCorrect > 25) {
        errorCorrect.style.display = 'flex';
        isValid = false;
    } else {
        errorCorrect.style.display = 'none';
    }
    
    // 백분위 검증
    if (!expectedPercentile || expectedPercentile === '' || expectedPercentile < 1 || expectedPercentile > 100) {
        errorPercentile.style.display = 'flex';
        isValid = false;
    } else {
        errorPercentile.style.display = 'none';
    }
    
    return isValid;
}

// 메타인지 데이터 제출
function submitMetacognition() {
    console.log('📝 submitMetacognition 호출됨');
    
    // 입력 검증
    if (!validateMetacognitionInput()) {
        console.log('❌ 입력 검증 실패');
        return;
    }
    
    const expectedCorrect = parseInt(document.getElementById('expectedCorrect').value);
    const expectedPercentile = parseInt(document.getElementById('expectedPercentile').value);
    
    // 메타인지 데이터 저장
    const metacognitionData = {
        expectedCorrect: expectedCorrect,
        expectedPercentile: expectedPercentile,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('metacognitionData', JSON.stringify(metacognitionData));
    
    console.log('✅ 메타인지 데이터 저장:', metacognitionData);
    
    // 모달 닫기
    hideMetacognitionModal();
    
    // ✅ testManager의 processSubmission 호출 (전역 변수 사용)
    if (window.testManager && typeof window.testManager.processSubmission === 'function') {
        console.log('✅ testManager.processSubmission() 호출');
        window.testManager.processSubmission();
    } else {
        console.error('❌ testManager를 찾을 수 없습니다!');
        alert('오류가 발생했습니다. 페이지를 새로고침해주세요.');
    }
}

// ESC 키로 모달 닫기 방지 (제출 필수)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('metacognitionModal');
        if (modal && modal.style.display === 'flex') {
            e.preventDefault();
            alert('메타인지 측정은 필수입니다. 입력을 완료해주세요.');
        }
    }
});

// 입력 필드 실시간 검증
document.addEventListener('DOMContentLoaded', function() {
    const expectedCorrectInput = document.getElementById('expectedCorrect');
    const expectedPercentileInput = document.getElementById('expectedPercentile');
    
    if (expectedCorrectInput) {
        expectedCorrectInput.addEventListener('input', function() {
            const errorCorrect = document.getElementById('errorCorrect');
            const value = parseInt(this.value);
            if (this.value && (value < 0 || value > 25)) {
                errorCorrect.style.display = 'flex';
            } else if (this.value) {
                errorCorrect.style.display = 'none';
            }
        });
    }
    
    if (expectedPercentileInput) {
        expectedPercentileInput.addEventListener('input', function() {
            const errorPercentile = document.getElementById('errorPercentile');
            const value = parseInt(this.value);
            if (this.value && (value < 1 || value > 100)) {
                errorPercentile.style.display = 'flex';
            } else if (this.value) {
                errorPercentile.style.display = 'none';
            }
        });
    }
    
    // ✅ Enter 키로 제출 가능하도록
    const modalInputs = document.querySelectorAll('.modal-input');
    modalInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitMetacognition();
            }
        });
    });
});
