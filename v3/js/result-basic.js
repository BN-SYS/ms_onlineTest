/* ========================================
   js/result-basic.js - 진위확인코드 수정
======================================== */

document.addEventListener('DOMContentLoaded', () => {
    loadBasicResult();
});

function loadBasicResult() {
    // localStorage에서 데이터 가져오기
    let stage1 = JSON.parse(localStorage.getItem('stage1Result') || 'null');
    let stage2 = JSON.parse(localStorage.getItem('stage2Result') || 'null');
    let stage3 = JSON.parse(localStorage.getItem('stage3Result') || 'null');
    let userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // 데이터 없으면 샘플 데이터 사용
    if (!stage1) stage1 = createSampleStage1();
    if (!stage2) stage2 = createSampleStage2();
    if (!stage3) stage3 = createSampleStage3();
    if (!userData || Object.keys(userData).length === 0) {
        userData = createSampleUser();
    }
    
    console.log('📊 베이직 결과 로드:', { stage1, stage2, stage3, userData });
    
    // 날짜 표시
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    const dateElem = document.getElementById('testDate');
    if (dateElem) {
        dateElem.textContent = dateStr;
        console.log('✅ 날짜 표시:', dateStr);
    }
    
    // 인증번호 및 진위확인코드 생성
    const certNumber = `MENSA-2026-${Date.now().toString().slice(-6)}`;
    const verifyCode = generateVerifyCode(userData.sessionId || userData.email || Date.now().toString());
    
    console.log('🔑 생성된 인증정보:', { certNumber, verifyCode });
    
    // 개인정보 표시
    const userNameElem = document.getElementById('userName');
    const userBirthElem = document.getElementById('userBirth');
    const certNumberElem = document.getElementById('certNumber');
    const verifyCodeElem = document.getElementById('verifyCode');
    
    if (userNameElem) {
        userNameElem.textContent = userData.name || '홍길동';
        console.log('✅ 이름 표시:', userNameElem.textContent);
    } else {
        console.error('❌ userName 요소를 찾을 수 없습니다.');
    }
    
    if (userBirthElem) {
        userBirthElem.textContent = (userData.birthYear || '1995') + '년생';
        console.log('✅ 생년월일 표시:', userBirthElem.textContent);
    } else {
        console.error('❌ userBirth 요소를 찾을 수 없습니다.');
    }
    
    if (certNumberElem) {
        certNumberElem.textContent = certNumber;
        console.log('✅ 인증번호 표시:', certNumberElem.textContent);
    } else {
        console.error('❌ certNumber 요소를 찾을 수 없습니다.');
    }
    
    if (verifyCodeElem) {
        verifyCodeElem.textContent = verifyCode;
        console.log('✅ 진위확인코드 표시:', verifyCodeElem.textContent);
    } else {
        console.error('❌ verifyCode 요소를 찾을 수 없습니다.');
        // ID가 다를 수 있으니 다른 이름으로도 시도
        const altVerifyCode = document.getElementById('verificationCode');
        if (altVerifyCode) {
            altVerifyCode.textContent = verifyCode;
            console.log('✅ 진위확인코드 표시 (대체 ID):', verifyCode);
        }
    }
    
    // IQ 점수 계산
    const iqResult = calculateIQ(stage1, stage2, stage3, userData.birthYear);
    
    // 총 점수 표시
    const totalScoreElem = document.getElementById('totalScore');
    const percentileElem = document.getElementById('percentile');
    
    if (totalScoreElem) {
        totalScoreElem.textContent = iqResult.totalIQ;
        console.log('✅ 총점 표시:', iqResult.totalIQ);
    }
    if (percentileElem) {
        percentileElem.textContent = iqResult.percentile;
        console.log('✅ 백분위 표시:', iqResult.percentile);
    }
    
    // 해석 표시
    displayInterpretation(iqResult);
    
    // 이메일 발송 (선택적)
    sendEmailNotification();
}

/* ========================================
   샘플 데이터 생성
======================================== */
function createSampleUser() {
    const timestamp = Date.now();
    return {
        name: '홍길동',
        email: `test${timestamp}@example.com`,
        birthYear: '1995',
        sessionId: `session_${timestamp}`
    };
}

function createSampleStage1() {
    return { 
        stage: 1, 
        correctCount: 12, 
        totalQuestions: 15, 
        correctRate: 80, 
        totalTime: 450, 
        avgTimePerQuestion: 30 
    };
}

function createSampleStage2() {
    return { 
        stage: 2, 
        correctCount: 4, 
        totalQuestions: 5, 
        correctRate: 80, 
        totalTime: 200, 
        avgTimePerQuestion: 40 
    };
}

function createSampleStage3() {
    return { 
        stage: 3, 
        correctCount: 5, 
        totalQuestions: 5, 
        correctRate: 100, 
        totalTime: 225, 
        avgTimePerQuestion: 45 
    };
}

/* ========================================
   진위확인 코드 생성 (개선 버전)
======================================== */
function generateVerifyCode(input) {
    // input이 없거나 빈 문자열이면 랜덤 생성
    if (!input || input.length === 0) {
        input = Date.now().toString() + Math.random().toString();
    }
    
    console.log('🔐 진위확인코드 생성 입력값:', input);
    
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32bit 정수 변환
    }
    
    // 음수를 양수로 변환하고 16진수로 변환
    const hexCode = Math.abs(hash).toString(16).toUpperCase();
    
    // 최소 8자리 보장
    const paddedCode = hexCode.padStart(8, '0').slice(0, 8);
    const verifyCode = `${paddedCode.slice(0, 4)}-${paddedCode.slice(4, 8)}`;
    
    console.log('✅ 생성된 진위확인코드:', verifyCode);
    
    return verifyCode;
}

/* ========================================
   IQ 계산 (연령 보정 포함)
======================================== */
function calculateIQ(stage1, stage2, stage3, birthYear) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(birthYear || 1995);
    
    // 연령 보정 계수
    let ageCorrection = 0;
    if (age < 20) {
        ageCorrection = 5;
    } else if (age >= 20 && age < 30) {
        ageCorrection = 0;
    } else if (age >= 30 && age < 40) {
        ageCorrection = 1;
    } else if (age >= 40 && age < 50) {
        ageCorrection = 2;
    } else if (age >= 50 && age < 60) {
        ageCorrection = 3;
    } else {
        ageCorrection = 5;
    }
    
    // 각 단계별 IQ 계산
    const stage1IQ = calculateStageIQ(stage1.correctCount, stage1.totalQuestions, ageCorrection);
    const stage2IQ = calculateStageIQ(stage2.correctCount, stage2.totalQuestions, ageCorrection);
    const stage3IQ = calculateStageIQ(stage3.correctCount, stage3.totalQuestions, ageCorrection);
    
    // 종합 IQ (가중 평균: 1단계 60%, 2단계 20%, 3단계 20%)
    const totalIQ = Math.round(stage1IQ * 0.6 + stage2IQ * 0.2 + stage3IQ * 0.2);
    
    return {
        totalIQ: totalIQ,
        percentile: getPercentile(totalIQ),
        correctRate: ((stage1.correctCount + stage2.correctCount + stage3.correctCount) / 
                     (stage1.totalQuestions + stage2.totalQuestions + stage3.totalQuestions) * 100).toFixed(1),
        stage1IQ: stage1IQ,
        stage1Percentile: getPercentile(stage1IQ),
        stage2IQ: stage2IQ,
        stage2Percentile: getPercentile(stage2IQ),
        stage3IQ: stage3IQ,
        stage3Percentile: getPercentile(stage3IQ)
    };
}

/* ========================================
   단계별 IQ 계산
======================================== */
function calculateStageIQ(correctCount, totalQuestions, ageCorrection) {
    const correctRate = (correctCount / totalQuestions) * 100;
    
    // IQ 환산 (평균 100, 표준편차 15 기준)
    const baseIQ = 100 + ((correctRate - 50) * 0.6);
    const adjustedIQ = Math.round(baseIQ + ageCorrection);
    
    // IQ 범위 제한 (70~145)
    return Math.min(145, Math.max(70, adjustedIQ));
}

/* ========================================
   백분위 계산
======================================== */
function getPercentile(iq) {
    if (iq >= 145) return 0.1;
    if (iq >= 140) return 0.5;
    if (iq >= 135) return 1;
    if (iq >= 130) return 2;
    if (iq >= 125) return 5;
    if (iq >= 120) return 10;
    if (iq >= 115) return 16;
    if (iq >= 110) return 25;
    if (iq >= 105) return 37;
    if (iq >= 100) return 50;
    if (iq >= 95) return 63;
    if (iq >= 90) return 75;
    if (iq >= 85) return 84;
    return 90;
}

/* ========================================
   해석 표시
======================================== */
function displayInterpretation(iqResult) {
    const container = document.getElementById('interpretationBox');
    if (!container) {
        console.error('❌ interpretationBox 요소를 찾을 수 없습니다.');
        return;
    }

    let level = '';
    let emoji = '';
    let description = '';

    if (iqResult.totalIQ >= 135) {
        level = '천재 수준';
        emoji = '🏆';
        description = `귀하의 IQ 점수는 <strong>${iqResult.totalIQ}점</strong>으로 전 세계 인구의 상위 ${iqResult.percentile}% 이내에 해당합니다. 매우 뛰어난 추론 능력과 문제 해결 능력을 보유하고 있으며, 멘사 공식 입회 테스트 합격 가능성이 매우 높습니다.`;
    } else if (iqResult.totalIQ >= 130) {
        level = '매우 우수';
        emoji = '🎯';
        description = `귀하의 IQ 점수는 <strong>${iqResult.totalIQ}점</strong>으로 상위 ${iqResult.percentile}%에 해당합니다. 멘사 가입 자격 기준(상위 2%)을 충족하며, 멘사 공식 입회 테스트에 도전하실 경우 합격 가능성이 상당히 높습니다.`;
    } else if (iqResult.totalIQ >= 120) {
        level = '우수';
        emoji = '✨';
        description = `귀하의 IQ 점수는 <strong>${iqResult.totalIQ}점</strong>으로 상위 ${iqResult.percentile}%에 해당합니다. 평균보다 훨씬 높은 인지 능력을 보유하고 있으며, 논리적 사고와 문제 해결 능력이 뛰어납니다.`;
    } else if (iqResult.totalIQ >= 110) {
        level = '평균 상';
        emoji = '👍';
        description = `귀하의 IQ 점수는 <strong>${iqResult.totalIQ}점</strong>으로 상위 ${iqResult.percentile}%에 해당합니다. 평균 이상의 우수한 지능을 보유하고 있으며, 꾸준한 학습과 훈련을 통해 더욱 발전할 수 있습니다.`;
    } else if (iqResult.totalIQ >= 90) {
        level = '평균';
        emoji = '💪';
        description = `귀하의 IQ 점수는 <strong>${iqResult.totalIQ}점</strong>으로 평균 수준입니다. 일반적인 인지 능력을 가지고 있으며, 충분한 휴식 후 재응시하시면 더 좋은 결과를 얻으실 수 있습니다.`;
    } else {
        level = '평균 하';
        emoji = '🌱';
        description = `귀하의 IQ 점수는 <strong>${iqResult.totalIQ}점</strong>입니다. 테스트 환경이나 컨디션이 좋지 않았을 가능성이 있으니, 충분한 준비와 휴식 후 재도전을 권장합니다.`;
    }

    container.innerHTML = `
        <h4>${emoji} ${level}</h4>
        <p>${description}</p>
    `;
    
    console.log('✅ 해석 표시 완료:', { level, totalIQ: iqResult.totalIQ });
}

/* ========================================
   이메일 발송
======================================== */
function sendEmailNotification() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!userData || !userData.email) {
        console.log('ℹ️ 이메일 정보가 없습니다.');
        return;
    }
    
    console.log('📧 이메일 발송 대상:', userData.email);
}

/* ========================================
   공유 기능
======================================== */
function shareResult() {
    const totalScoreElem = document.getElementById('totalScore');
    const percentileElem = document.getElementById('percentile');
    
    if (!totalScoreElem || !percentileElem) {
        alert('점수 정보를 찾을 수 없습니다.');
        return;
    }
    
    const iqScore = totalScoreElem.textContent;
    const percentile = percentileElem.textContent;
    const text = `나의 IQ는 ${iqScore}점! (상위 ${percentile}%) 멘사 온라인 테스트로 확인하세요!`;
    
    if (navigator.share) {
        navigator.share({
            title: '멘사 IQ 테스트 결과',
            text: text,
            url: window.location.origin
        }).catch(err => console.log('공유 취소:', err));
    } else {
        navigator.clipboard.writeText(text + '\n' + window.location.origin)
            .then(() => alert('📋 클립보드에 복사되었습니다!'))
            .catch(() => alert('❌ 복사 실패'));
    }
}

/* ========================================
   업그레이드
======================================== */
function upgradeToDetail() {
    if (confirm('5,000원을 추가 결제하시면 상세 리포트를 확인하실 수 있습니다.\n결제하시겠습니까?')) {
        setTimeout(() => {
            alert('✅ 결제가 완료되었습니다!');
            
            const paymentInfo = {
                type: 'detail',
                amount: 5000,
                upgraded: true,
                upgradeTimestamp: new Date().toISOString(),
                certificateNumber: `MENSA-2026-${Date.now().toString().slice(-6)}`,
                verificationCode: generateVerifyCode(Date.now().toString())
            };
            localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));
            
            location.href = 'result-detail.html';
        }, 1000);
    }
}
