/* ========================================
   js/result-basic.js - 점수 체계로 변경
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
    let testSettings = JSON.parse(localStorage.getItem('testSettings') || 'null');

    // 데이터 없으면 샘플 데이터 사용
    if (!stage1) stage1 = createSampleStage1();
    if (!stage2) stage2 = createSampleStage2();
    if (!stage3) stage3 = createSampleStage3();
    if (!userData || Object.keys(userData).length === 0) {
        userData = createSampleUser();
    }
    if (!testSettings) {
        testSettings = createSampleTestSettings();
    }

    console.log('베이직 결과 로드:', { stage1, stage2, stage3, userData, testSettings });

    // 날짜 표시
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    const dateElem = document.getElementById('testDate');
    if (dateElem) {
        dateElem.textContent = dateStr;
        console.log('날짜 표시:', dateStr);
    }

    // 이미 저장된 인증번호/코드가 있으면 재사용, 없으면 새로 생성
    let certNumber = localStorage.getItem('certNumber');
    let verifyCode = localStorage.getItem('verifyCode');

    if (!certNumber) {
        certNumber = `MS-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;
        localStorage.setItem('certNumber', certNumber);
    }
    if (!verifyCode) {
        verifyCode = generateVerifyCode(userData.sessionId || userData.email || certNumber);
        localStorage.setItem('verifyCode', verifyCode);
    }

    console.log('생성된 인증정보:', { certNumber, verifyCode });

    // 개인정보 표시
    const userNameElem = document.getElementById('userName');
    const userBirthElem = document.getElementById('userBirth');
    const certNumberElem = document.getElementById('certNumber');
    const verifyCodeElem = document.getElementById('verifyCode');

    if (userNameElem) {
        userNameElem.textContent = userData.name || '홍길동';
        console.log('이름 표시:', userNameElem.textContent);
    } else {
        console.error('userName 요소를 찾을 수 없습니다.');
    }

    if (userBirthElem) {
        userBirthElem.textContent = (userData.birthYear || '1990') + '년생';
        console.log('생년월일 표시:', userBirthElem.textContent);
    } else {
        console.error('userBirth 요소를 찾을 수 없습니다.');
    }

    if (certNumberElem) {
        certNumberElem.textContent = certNumber;
        console.log('인증번호 표시:', certNumberElem.textContent);
    } else {
        console.error('certNumber 요소를 찾을 수 없습니다.');
    }

    if (verifyCodeElem) {
        verifyCodeElem.textContent = verifyCode;
        console.log('진위확인코드 표시:', verifyCodeElem.textContent);
    } else {
        console.error('verifyCode 요소를 찾을 수 없습니다.');
        // ID가 다를 수 있으니 다른 이름으로도 시도
        const altVerifyCode = document.getElementById('verificationCode');
        if (altVerifyCode) {
            altVerifyCode.textContent = verifyCode;
            console.log('진위확인코드 표시 (대체 ID):', verifyCode);
        }
    }

    // 점수 계산 (100점 만점)
    const scoreResult = calculateScore(stage1, stage2, stage3, userData.birthYear, testSettings);

    // 총 점수 표시
    const totalScoreElem = document.getElementById('totalScore');
    const percentileElem = document.getElementById('percentile');

    if (totalScoreElem) {
        totalScoreElem.textContent = scoreResult.totalScore + '점';
        console.log('종합점수 표시:', scoreResult.totalScore);
    }
    if (percentileElem) {
        percentileElem.textContent = scoreResult.percentile;
        console.log('백분위 표시:', scoreResult.percentile);
    }

    // 단계별 점수 표시
    displayStageScores(scoreResult);

    // 해석 표시
    displayInterpretation(scoreResult);

    // 결과 저장 (상세 리포트용)
    localStorage.setItem('scoreResult', JSON.stringify(scoreResult));
    localStorage.setItem('certNumber', certNumber);
    localStorage.setItem('verifyCode', verifyCode);

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
        birthYear: '1990',
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
        correctCount: 3,
        totalQuestions: 5,
        correctRate: 60,
        totalTime: 225,
        avgTimePerQuestion: 45
    };
}

function createSampleTestSettings() {
    return {
        stage1: {
            questionCount: 15,
            baseScore: 40,
            pointPerQuestion: 4
        },
        stage2: {
            questionCount: 5,
            baseScore: 60,
            pointPerQuestion: 8
        },
        stage3: {
            questionCount: 5,
            baseScore: 60,
            pointPerQuestion: 8
        }
    };
}

/* ========================================
   진위확인 코드 생성
======================================== */
function generateVerifyCode(input) {
    if (!input || input.length === 0) {
        input = Date.now().toString() + Math.random().toString();
    }

    // 입력값에 랜덤 솔트 추가해서 '0000-0000' 충돌 방지
    input = input + '_' + input.length + '_salt';

    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    // hash가 0이면 (충돌 방지) 타임스탬프 기반으로 재생성
    if (hash === 0) {
        hash = Date.now();
    }

    const hexCode = Math.abs(hash).toString(16).toUpperCase();
    const paddedCode = hexCode.padStart(8, '0').slice(0, 8);
    const verifyCode = `${paddedCode.slice(0, 4)}-${paddedCode.slice(4, 8)}`;

    console.log('생성된 진위확인코드:', verifyCode);

    return verifyCode;
}
/* ========================================
   점수 계산 (100점 만점 + 연령 보정)
======================================== */
function calculateScore(stage1, stage2, stage3, birthYear, testSettings) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(birthYear || 1990);

    // 연령 보정 점수 계산
    let ageAdjustment = 0;
    if (age < 30) {
        ageAdjustment = 0;
    } else if (age < 40) {
        ageAdjustment = 4;
    } else if (age < 50) {
        ageAdjustment = 8;
    } else if (age < 60) {
        ageAdjustment = 12;
    } else {
        ageAdjustment = 16;
    }

    console.log('연령 정보:', { age, ageAdjustment });

    // 각 단계별 점수 계산
    const stage1Score = calculateStageScore(
        stage1.correctCount,
        testSettings.stage1.baseScore,
        testSettings.stage1.pointPerQuestion,
        ageAdjustment
    );

    const stage2Score = calculateStageScore(
        stage2.correctCount,
        testSettings.stage2.baseScore,
        testSettings.stage2.pointPerQuestion,
        ageAdjustment
    );

    const stage3Score = calculateStageScore(
        stage3.correctCount,
        testSettings.stage3.baseScore,
        testSettings.stage3.pointPerQuestion,
        ageAdjustment
    );

    // 종합 점수 (3단계 평균)
    const totalScore = Math.round((stage1Score + stage2Score + stage3Score) / 3);

    console.log('단계별 점수:', {
        stage1Score,
        stage2Score,
        stage3Score,
        totalScore
    });

    return {
        totalScore: totalScore,
        percentile: getPercentile(totalScore),
        stage1Score: stage1Score,
        stage1Percentile: getPercentile(stage1Score),
        stage2Score: stage2Score,
        stage2Percentile: getPercentile(stage2Score),
        stage3Score: stage3Score,
        stage3Percentile: getPercentile(stage3Score),
        ageAdjustment: ageAdjustment
    };
}

/* ========================================
   단계별 점수 계산
======================================== */
function calculateStageScore(correctCount, baseScore, pointPerQuestion, ageAdjustment) {
    // 점수 = 기본점수 + (정답 개수 × 문제당 배점) + 연령 보정
    const rawScore = baseScore + (correctCount * pointPerQuestion) + ageAdjustment;

    // 100점 초과 방지
    const finalScore = Math.min(100, rawScore);

    console.log('단계 점수 계산:', {
        correctCount,
        baseScore,
        pointPerQuestion,
        ageAdjustment,
        rawScore,
        finalScore
    });

    return finalScore;
}

/* ========================================
   백분위 계산 (100점 만점 기준)
======================================== */
function getPercentile(score) {
    if (score >= 95) return '상위 1%';
    if (score >= 90) return '상위 2%';
    if (score >= 85) return '상위 5%';
    if (score >= 75) return '상위 10%';
    if (score >= 65) return '상위 25%';
    if (score >= 55) return '상위 50%';
    if (score >= 45) return '하위 50%';
    return '하위 75%';
}

/* ========================================
   단계별 점수 표시
======================================== */
function displayStageScores(scoreResult) {
    // 단계별 점수를 표시할 요소들이 있다면 표시
    const stage1ScoreElem = document.getElementById('stage1Score');
    const stage2ScoreElem = document.getElementById('stage2Score');
    const stage3ScoreElem = document.getElementById('stage3Score');

    if (stage1ScoreElem) {
        stage1ScoreElem.textContent = `${scoreResult.stage1Score}점`;
        console.log('1단계 점수 표시:', scoreResult.stage1Score);
    }

    if (stage2ScoreElem) {
        stage2ScoreElem.textContent = `${scoreResult.stage2Score}점`;
        console.log('2단계 점수 표시:', scoreResult.stage2Score);
    }

    if (stage3ScoreElem) {
        stage3ScoreElem.textContent = `${scoreResult.stage3Score}점`;
        console.log('3단계 점수 표시:', scoreResult.stage3Score);
    }
}

/* ========================================
   해석 표시
======================================== */
function displayInterpretation(scoreResult) {
    const container = document.getElementById('interpretationBox');
    if (!container) {
        console.error('interpretationBox 요소를 찾을 수 없습니다.');
        return;
    }

    let level = '';
    let description = '';

    if (scoreResult.totalScore >= 95) {
        level = '최상위 수준';
        description = `귀하의 종합 점수는 <strong>${scoreResult.totalScore}점</strong>으로 전체 응시자 중 <strong>${scoreResult.percentile}</strong>에 해당합니다. 멘사 회원 수준의 뛰어난 지능을 보유하고 계십니다. 공식 멘사 입회 테스트 합격 가능성이 매우 높습니다.`;
    } else if (scoreResult.totalScore >= 90) {
        level = '매우 우수';
        description = `귀하의 종합 점수는 <strong>${scoreResult.totalScore}점</strong>으로 <strong>${scoreResult.percentile}</strong>에 해당합니다. 우수한 인지 능력을 가지고 계십니다. 멘사 공식 테스트에 도전해보시길 권장드립니다.`;
    } else if (scoreResult.totalScore >= 85) {
        level = '우수';
        description = `귀하의 종합 점수는 <strong>${scoreResult.totalScore}점</strong>으로 <strong>${scoreResult.percentile}</strong>에 해당합니다. 평균보다 훨씬 높은 인지 능력을 보유하고 있으며, 논리적 사고와 문제 해결 능력이 뛰어납니다.`;
    } else if (scoreResult.totalScore >= 75) {
        level = '평균 상위';
        description = `귀하의 종합 점수는 <strong>${scoreResult.totalScore}점</strong>으로 <strong>${scoreResult.percentile}</strong>에 해당합니다. 평균 이상의 능력을 보유하고 계십니다. 추가 학습과 훈련을 통해 더욱 발전할 수 있습니다.`;
    } else if (scoreResult.totalScore >= 65) {
        level = '평균 중상';
        description = `귀하의 종합 점수는 <strong>${scoreResult.totalScore}점</strong>으로 <strong>${scoreResult.percentile}</strong>에 해당합니다. 평균 수준의 인지 능력을 가지고 계십니다. 꾸준한 노력으로 향상 가능합니다.`;
    } else if (scoreResult.totalScore >= 55) {
        level = '평균';
        description = `귀하의 종합 점수는 <strong>${scoreResult.totalScore}점</strong>으로 평균 수준입니다. 일반적인 인지 능력을 가지고 있으며, 충분한 휴식 후 재응시하시면 더 좋은 결과를 얻으실 수 있습니다.`;
    } else {
        level = '발전 가능';
        description = `귀하의 종합 점수는 <strong>${scoreResult.totalScore}점</strong>입니다. 아직 발전 가능성이 많습니다. 충분한 휴식 후 재도전을 권장합니다.`;
    }

    container.innerHTML = `
        <h4>${level}</h4>
        <p>${description}</p>
    `;

    console.log('해석 표시 완료:', { level, totalScore: scoreResult.totalScore });
}

/* ========================================
   이메일 발송
======================================== */
function sendEmailNotification() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    if (!userData || !userData.email) {
        console.log('이메일 정보가 없습니다.');
        return;
    }

    console.log('이메일 발송 대상:', userData.email);
    // 실제 이메일 발송 로직은 서버사이드에서 처리
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

    const score = totalScoreElem.textContent;
    const percentile = percentileElem.textContent;
    const text = `나의 멘사 테스트 점수는 ${score}! (${percentile}) 멘사 온라인 테스트로 확인하세요!`;

    if (navigator.share) {
        navigator.share({
            title: '멘사 온라인 테스트 결과',
            text: text,
            url: window.location.origin
        }).catch(err => console.log('공유 취소:', err));
    } else {
        navigator.clipboard.writeText(text + '\n' + window.location.origin)
            .then(() => alert('클립보드에 복사되었습니다!'))
            .catch(() => alert('복사 실패'));
    }
}

/* ========================================
   상세 리포트 업그레이드 (차액 결제)
======================================== */
function upgradeToDetail() {
    // 결제 확인 팝업
    const confirmMsg = `상세 리포트 업그레이드\n\n결제 금액: 5,000원\n\n추가 제공 내용:\n- 표준편차 그래프 4개\n- 단계별 상세 분석\n- 개선 방향 가이드\n- PDF 다운로드\n\n결제를 진행하시겠습니까?`;

    if (confirm(confirmMsg)) {
        // 결제 진행 표시
        showPaymentProcessing();

        // 실제 PG 연동 시 아래 주석 해제
        // initiatePayment();

        // 테스트용: 1.5초 후 결제 완료 처리
        setTimeout(() => {
            processUpgradePayment();
        }, 1500);
    }
}

/* ========================================
   결제 처리 중 표시
======================================== */
function showPaymentProcessing() {
    // 로딩 오버레이 생성
    const overlay = document.createElement('div');
    overlay.id = 'paymentOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;

    overlay.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        ">
            <h3 style="margin-bottom: 10px; color: #333;">결제 진행 중...</h3>
            <p style="color: #666;">잠시만 기다려주세요.</p>
        </div>
    `;

    document.body.appendChild(overlay);
}

/* ========================================
   차액 결제 처리
======================================== */
function processUpgradePayment() {
    // 결제 정보 생성
    const paymentInfo = {
        type: 'upgrade', // 차액 결제
        originalAmount: 19900, // 기본 결과 금액
        upgradeAmount: 5000, // 추가 결제 금액
        totalPaid: 24900, // 총 결제 금액
        upgraded: true,
        paymentTimestamp: new Date().toISOString(),
        paymentMethod: 'card', // 실제로는 PG에서 받아온 정보
        transactionId: 'TXN-' + Date.now(), // 실제로는 PG에서 받아온 거래번호
        certificateNumber: localStorage.getItem('certNumber'),
        verificationCode: localStorage.getItem('verifyCode')
    };

    // localStorage에 결제 정보 저장
    localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));

    // 결제 완료 로그
    console.log('차액 결제 완료:', paymentInfo);

    // 로딩 오버레이 제거
    const overlay = document.getElementById('paymentOverlay');
    if (overlay) {
        overlay.remove();
    }

    // 결제 완료 알림
    alert('결제가 완료되었습니다!\n상세 리포트 페이지로 이동합니다.');

    // 상세 리포트 페이지로 이동
    location.href = 'result-detail.html';
}

/* ========================================
   실제 PG 결제 연동 (이니시스)
======================================== */
function initiatePayment() {
    // 이니시스 PG 연동 예시
    // 실제 구현 시 이 함수를 사용하세요

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const certNumber = localStorage.getItem('certNumber');

    // 이니시스 결제 파라미터 설정
    const paymentParams = {
        // 상점 정보
        mid: 'YOUR_MERCHANT_ID', // 상점 ID (발급받은 ID)
        signKey: 'YOUR_SIGN_KEY', // 서명 키

        // 결제 정보
        goodsName: '멘사 테스트 상세 리포트 업그레이드',
        price: 5000,
        buyerName: userData.name || '구매자',
        buyerEmail: userData.email || '',
        buyerTel: userData.phone || '',

        // 주문 정보
        orderNumber: certNumber || 'ORDER-' + Date.now(),
        timestamp: new Date().getTime(),

        // 결과 URL
        returnUrl: window.location.origin + '/payment-complete.html',
        closeUrl: window.location.origin + '/payment-cancel.html'
    };

    // 이니시스 결제창 호출
    // INIStdPay.pay(paymentParams);

    console.log('PG 결제 호출:', paymentParams);
}

/* ========================================
   결제 취소 처리
======================================== */
function cancelPayment() {
    const overlay = document.getElementById('paymentOverlay');
    if (overlay) {
        overlay.remove();
    }

    console.log('결제가 취소되었습니다.');
}
