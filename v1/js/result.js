// 페이지 로드 시
document.addEventListener('DOMContentLoaded', () => {
    loadTestResult();
    setupPaymentForm();
});

// 테스트 결과 로드
function loadTestResult() {
    const resultData = JSON.parse(localStorage.getItem('testResult'));
    
    if (!resultData) {
        alert('테스트 결과를 찾을 수 없습니다.');
        location.href = 'index.html';
        return;
    }
    
    // 기본 정보 표시
    document.getElementById('correctCount').textContent = 
        `${resultData.correctCount}문제`;
    document.getElementById('totalQuestions').textContent = 
        `${resultData.totalQuestions}문제`;
    
    const minutes = Math.floor(resultData.timeSpent / 60);
    const seconds = resultData.timeSpent % 60;
    document.getElementById('timeSpent').textContent = 
        `${minutes}분 ${seconds}초`;
}

// 결제 폼 설정
function setupPaymentForm() {
    document.getElementById('userInfoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('name'),
            birthYear: parseInt(formData.get('birthYear')),
            email: formData.get('email'),
            ip: '127.0.0.1', // 실제로는 서버에서 받음
            timestamp: new Date().toISOString()
        };
        
        // 연령 계산
        const age = new Date().getFullYear() - userData.birthYear;
        
        // 테스트 결과 + 사용자 정보 결합
        const testResult = JSON.parse(localStorage.getItem('testResult'));
        const finalData = {
            ...testResult,
            ...userData,
            age: age
        };
        
        // 채점 로직 (연령 보정 포함)
        const iq = calculateIQ(testResult.correctCount, age);
        finalData.iq = iq;
        
        // 로컬에 저장 (실제로는 서버 전송)
        localStorage.setItem('userTestData', JSON.stringify(finalData));
        
        // PG 결제 시뮬레이션
        simulatePayment(finalData);
    });
}

// IQ 계산 (연령 보정 포함)
function calculateIQ(correctCount, age) {
    // 기본 점수
    const baseScore = (correctCount / 20) * 100;
    
    // 연령 보정 계수 (임시 로직)
    let ageCorrection = 0;
    if (age < 18) {
        ageCorrection = 5;
    } else if (age >= 18 && age < 30) {
        ageCorrection = 0;
    } else if (age >= 30 && age < 50) {
        ageCorrection = -3;
    } else {
        ageCorrection = -8;
    }
    
    // IQ 환산 (100 기준, 표준편차 15)
    const iq = Math.round(100 + (baseScore - 50) * 0.6 + ageCorrection);
    
    return iq;
}

// 결제 시뮬레이션
function simulatePayment(userData) {
    // 실제로는 이니시스 PG 연동
    if (confirm('결제를 진행하시겠습니까?\n금액: 9,900원')) {
        // 결제 성공 시뮬레이션
        setTimeout(() => {
            alert('결제가 완료되었습니다!');
            
            // 결제 정보 추가
            userData.paymentStatus = 'completed';
            userData.paymentAmount = 9900;
            userData.paymentDate = new Date().toISOString();
            
            localStorage.setItem('userTestData', JSON.stringify(userData));
            
            // 상세 결과 페이지로 이동
            showDetailedResult(userData);
        }, 1000);
    }
}

// 상세 결과 표시
function showDetailedResult(data) {
    // blur 제거
    document.querySelector('.blur-content').classList.remove('blur-content');
    
    // IQ 표시
    document.querySelector('.score-display').textContent = `IQ ${data.iq}`;
    
    // 해석 추가
    let interpretation = '';
    if (data.iq >= 130) {
        interpretation = '상위 2% 이내의 매우 우수한 지능입니다. 멘사 입회 자격을 충족합니다.';
    } else if (data.iq >= 120) {
        interpretation = '상위 10% 이내의 우수한 지능입니다.';
    } else if (data.iq >= 110) {
        interpretation = '평균 이상의 지능입니다.';
    } else if (data.iq >= 90) {
        interpretation = '평균 수준의 지능입니다.';
    } else {
        interpretation = '평균 이하의 지능입니다.';
    }
    
    document.querySelector('.blur-content p').textContent = interpretation;
    
    // 결제 섹션 숨김
    document.querySelector('.payment-section').style.display = 'none';
    
    // 추가 분석 정보 표시
    const additionalInfo = document.createElement('div');
    additionalInfo.className = 'result-info';
    additionalInfo.style.marginTop = '30px';
    additionalInfo.innerHTML = `
        <h3 style="margin-bottom: 20px;">📊 상세 분석</h3>
        <div class="info-row">
            <span>연령대</span>
            <strong>${data.age}세</strong>
        </div>
        <div class="info-row">
            <span>정답률</span>
            <strong>${Math.round((data.correctCount / 20) * 100)}%</strong>
        </div>
        <div class="info-row">
            <span>등급</span>
            <strong>${getGrade(data.iq)}</strong>
        </div>
        <div class="info-row">
            <span>전체 응시자 중 순위</span>
            <strong>상위 ${getPercentile(data.iq)}%</strong>
        </div>
    `;
    
    document.querySelector('.blur-content').appendChild(additionalInfo);
}

// 등급 계산
function getGrade(iq) {
    if (iq >= 140) return 'S (천재)';
    if (iq >= 130) return 'A+ (매우 우수)';
    if (iq >= 120) return 'A (우수)';
    if (iq >= 110) return 'B+ (평균 상)';
    if (iq >= 90) return 'B (평균)';
    return 'C (평균 하)';
}

// 백분위 계산
function getPercentile(iq) {
    if (iq >= 145) return 0.1;
    if (iq >= 140) return 0.5;
    if (iq >= 130) return 2;
    if (iq >= 120) return 10;
    if (iq >= 110) return 25;
    if (iq >= 90) return 50;
    return 75;
}
