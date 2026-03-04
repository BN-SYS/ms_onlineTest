/* ========================================
   js/result-basic.js
   요구사항 명세 기반 점수 산출 로직 적용
======================================== */

document.addEventListener('DOMContentLoaded', () => {
    loadBasicResult();
});

function loadBasicResult() {
    console.log('=== 기본 결과 로드 시작 ===');

    // ========================================
    // 1. 데이터 수집
    // ========================================
    let stage1 = JSON.parse(localStorage.getItem('stage1Result') || 'null');
    let stage2 = JSON.parse(localStorage.getItem('stage2Result') || 'null');
    let stage3 = JSON.parse(localStorage.getItem('stage3Result') || 'null');
    let userData = JSON.parse(localStorage.getItem('userData') || 'null');
    let testSettings = JSON.parse(localStorage.getItem('testSettings') || 'null');
    let metacognitionData = JSON.parse(localStorage.getItem('metacognitionData') || 'null');

    // 실제 데이터 없으면 샘플 사용
    const hasRealData = stage1 && stage2 && stage3 && userData;

    if (!hasRealData) {
        console.warn('⚠️ 실제 테스트 데이터가 없습니다. 샘플 데이터를 사용합니다.');
        stage1 = createSampleStage1();
        stage2 = createSampleStage2();
        stage3 = createSampleStage3();
        userData = createSampleUser();
        metacognitionData = createSampleMetacognition();
    }

    if (!testSettings) {
        testSettings = createSampleTestSettings();
    }

    console.log('로드된 데이터:', { stage1, stage2, stage3, userData, testSettings, metacognitionData });

    // ========================================
    // 2. 날짜 및 인증정보 생성
    // ========================================
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

    let certNumber = localStorage.getItem('certNumber');
    let verifyCode = localStorage.getItem('verifyCode');

    if (!certNumber) {
        // 발급번호: MS-{년도}-{일련번호 6자리}
        certNumber = `MS-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;
        localStorage.setItem('certNumber', certNumber);
    }

    if (!verifyCode) {
        // 진위확인 코드: {4자리}-{4자리}
        verifyCode = generateVerifyCode(userData.sessionId || userData.email || certNumber);
        localStorage.setItem('verifyCode', verifyCode);
    }

    // ========================================
    // 3. 점수 계산 (요구사항 명세 기반)
    // ========================================
    const scoreResult = calculateComprehensiveScore(
        stage1,
        stage2,
        stage3,
        userData.birthYear,
        testSettings,
        metacognitionData
    );

    console.log('최종 점수 결과:', scoreResult);

    // ========================================
    // 4. UI 업데이트
    // ========================================
    
    // 날짜 표시
    const dateElem = document.getElementById('testDate');
    if (dateElem) {
        dateElem.textContent = dateStr;
    }

    // 개인정보 표시
    const userNameElem = document.getElementById('userName');
    const userBirthElem = document.getElementById('userBirth');
    const totalTimeElem = document.getElementById('totalTime');
    const verifyCodeElem = document.getElementById('verifyCode');

    if (userNameElem) {
        userNameElem.textContent = userData.name || '홍길동';
    }

    if (userBirthElem) {
        userBirthElem.textContent = (userData.birthYear || '1990') + '년생';
    }

    // 소요시간 표시
    if (totalTimeElem) {
        totalTimeElem.textContent = scoreResult.totalTimeFormatted;
        console.log('소요시간 표시:', scoreResult.totalTimeFormatted);
    }

    if (verifyCodeElem) {
        verifyCodeElem.textContent = verifyCode;
    }

    // 종합점수 표시
    const totalScoreElem = document.getElementById('totalScore');
    const percentileElem = document.getElementById('score-percentile');

    if (totalScoreElem) {
        totalScoreElem.innerHTML = `${scoreResult.finalScore}<span class="score-unit">점</span>`;
        console.log('종합점수 표시:', scoreResult.finalScore);
    }

    if (percentileElem) {
        percentileElem.textContent = scoreResult.rank;
        console.log('등급 표시:', scoreResult.rank);
    }

    // 해석 표시
    displayInterpretation(scoreResult);

    // ========================================
    // 5. 결과 저장 (상세 리포트용)
    // ========================================
    const fullResult = {
        ...scoreResult,
        certNumber,
        verifyCode,
        testDate: dateStr,
        userData: userData,
        stage1Data: stage1,
        stage2Data: stage2,
        stage3Data: stage3,
        metacognitionData: metacognitionData
    };

    localStorage.setItem('scoreResult', JSON.stringify(fullResult));
    console.log('✅ 결과 저장 완료');
}

/* ========================================
   종합 점수 계산 (요구사항 명세 기준)
======================================== */
function calculateComprehensiveScore(stage1, stage2, stage3, birthYear, testSettings, metacognitionData) {
    console.log('=== 종합 점수 계산 시작 ===');

    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(birthYear || 1990);

    // ========================================
    // 1. 연령 보정값 계산
    // ========================================
    let ageAdjustment = 0;
    if (age <= 13) {
        ageAdjustment = 8;
    } else if (age <= 18) {
        ageAdjustment = 4;
    } else if (age <= 29) {
        ageAdjustment = 0;
    } else if (age <= 39) {
        ageAdjustment = 4;
    } else if (age <= 49) {
        ageAdjustment = 8;
    } else if (age <= 59) {
        ageAdjustment = 12;
    } else {
        ageAdjustment = 16;
    }

    console.log('연령 정보:', { age, ageAdjustment });

    // ========================================
    // 2. 단계별 점수 계산 (연령 보정 적용)
    // ========================================
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

    console.log('단계별 점수 (연령 보정 후):', { stage1Score, stage2Score, stage3Score });

    // ========================================
    // 3. 작업속도 점수 계산 (연령 보정 적용)
    // ========================================
    const totalTimeSeconds = (stage1.totalTime || 0) + (stage2.totalTime || 0) + (stage3.totalTime || 0);
    const totalTimeFormatted = formatTime(totalTimeSeconds);

    // 제한시간 및 최소소요시간 (관리자 설정값, 초 단위)
    const timeLimit = (testSettings.stage1.timeLimit || 30) * 60 +
                      (testSettings.stage2.timeLimit || 10) * 60 +
                      (testSettings.stage3.timeLimit || 10) * 60;

    const minRequiredTime = (testSettings.stage1.minRequiredTime || 5) * 60 +
                            (testSettings.stage2.minRequiredTime || 2) * 60 +
                            (testSettings.stage3.minRequiredTime || 2) * 60;

    let speedScore = 0;

    if (totalTimeSeconds <= minRequiredTime) {
        speedScore = 100;
    } else if (totalTimeSeconds <= timeLimit) {
        // 선형 환산: 60~100점 구간
        speedScore = Math.max(60, 100 - ((totalTimeSeconds - minRequiredTime) / (timeLimit - minRequiredTime)) * 40);
    } else {
        // 제한시간 초과 (비정상이지만 만약 발생하면)
        speedScore = 60;
    }

    // 연령 보정 적용
    speedScore = Math.min(100, speedScore + ageAdjustment);

    console.log('작업속도 점수 (연령 보정 후):', speedScore);

    // ========================================
    // 4. 메타인지 점수 계산 (연령 보정 미적용)
    // ========================================
    let metacognitionScore = 0;

    if (metacognitionData && metacognitionData.expectedCorrect !== undefined) {
        const expectedCorrect = metacognitionData.expectedCorrect;
        const actualCorrect = stage1.correctCount + stage2.correctCount + stage3.correctCount;
        const error = Math.abs(expectedCorrect - actualCorrect);

        metacognitionScore = Math.max(0, 100 - (error * 4));
    } else {
        // 메타인지 데이터 없으면 0점
        metacognitionScore = 0;
    }

    console.log('메타인지 점수 (연령 보정 없음):', metacognitionScore);

    // ========================================
    // 5. 가중 종합점수 계산
    // ========================================
    // 1단계 × 3, 나머지 각 × 1, 합산 / 7
    const rawScore = (stage1Score * 3 + stage2Score * 1 + stage3Score * 1 + speedScore * 1 + metacognitionScore * 1) / 7;

    console.log('가중 종합점수 (상향 보정 전):', rawScore);

    // ========================================
    // 6. 전체 상향 보정 적용
    // ========================================
    const upwardAdjustment = testSettings.upwardAdjustment || 5;
    const finalScore = Math.min(100, Math.round(rawScore + upwardAdjustment));

    console.log('최종 종합점수 (상향 보정 후):', finalScore);

    // ========================================
    // 7. 등급 판정
    // ========================================
    const rank = getRank(finalScore);

    console.log('등급:', rank);

    return {
        stage1Score,
        stage2Score,
        stage3Score,
        speedScore,
        metacognitionScore,
        rawScore: Math.round(rawScore),
        finalScore,
        rank,
        ageAdjustment,
        upwardAdjustment,
        totalTimeSeconds,
        totalTimeFormatted
    };
}

/* ========================================
   단계별 점수 계산
======================================== */
function calculateStageScore(correctCount, baseScore, pointPerQuestion, ageAdjustment) {
    const rawScore = baseScore + (correctCount * pointPerQuestion);
    const scoreWithAge = Math.min(100, rawScore + ageAdjustment);

    console.log('단계 점수 계산:', {
        correctCount,
        baseScore,
        pointPerQuestion,
        rawScore,
        ageAdjustment,
        finalScore: scoreWithAge
    });

    return scoreWithAge;
}

/* ========================================
   등급 판정
======================================== */
function getRank(score) {
    if (score >= 90) return '최상위권';
    if (score >= 80) return '상위권';
    if (score >= 60) return '중위권';
    return '하위권';
}

/* ========================================
   시간 포맷 변환 (초 → 분:초)
======================================== */
function formatTime(seconds) {
    if (!seconds || seconds <= 0) return '0분 0초';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}분 ${remainingSeconds}초`;
}

/* ========================================
   진위확인 코드 생성
======================================== */
function generateVerifyCode(input) {
    if (!input || input.length === 0) {
        input = Date.now().toString() + Math.random().toString();
    }

    input = input + '_' + input.length + '_salt';

    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    if (hash === 0) {
        hash = Date.now();
    }

    const hexCode = Math.abs(hash).toString(16).toUpperCase();
    const paddedCode = hexCode.padStart(8, '0').slice(0, 8);
    const verifyCode = `${paddedCode.slice(0, 4)}-${paddedCode.slice(4, 8)}`;

    return verifyCode;
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
    const score = scoreResult.finalScore;
    const rank = scoreResult.rank;

    if (score >= 95) {
        level = '최상위 수준';
        description = `귀하의 종합 점수는 <strong>${score}점</strong>으로 <strong>${rank}</strong>에 해당합니다. 멘사 회원 수준의 뛰어난 지능을 보유하고 계십니다. 공식 멘사 입회 테스트 합격 가능성이 매우 높습니다.`;
    } else if (score >= 90) {
        level = '매우 우수';
        description = `귀하의 종합 점수는 <strong>${score}점</strong>으로 <strong>${rank}</strong>에 해당합니다. 우수한 인지 능력을 가지고 계십니다. 멘사 공식 테스트에 도전해보시길 권장드립니다.`;
    } else if (score >= 85) {
        level = '우수';
        description = `귀하의 종합 점수는 <strong>${score}점</strong>으로 <strong>${rank}</strong>에 해당합니다. 평균보다 훨씬 높은 인지 능력을 보유하고 있으며, 논리적 사고와 문제 해결 능력이 뛰어납니다.`;
    } else if (score >= 75) {
        level = '평균 상위';
        description = `귀하의 종합 점수는 <strong>${score}점</strong>으로 <strong>${rank}</strong>에 해당합니다. 평균 이상의 능력을 보유하고 계십니다. 추가 학습과 훈련을 통해 더욱 발전할 수 있습니다.`;
    } else if (score >= 65) {
        level = '평균 중상';
        description = `귀하의 종합 점수는 <strong>${score}점</strong>으로 <strong>${rank}</strong>에 해당합니다. 평균 수준의 인지 능력을 가지고 계십니다. 꾸준한 노력으로 향상 가능합니다.`;
    } else if (score >= 55) {
        level = '평균';
        description = `귀하의 종합 점수는 <strong>${score}점</strong>으로 <strong>${rank}</strong>에 해당합니다. 일반적인 인지 능력을 가지고 있으며, 충분한 휴식 후 재응시하시면 더 좋은 결과를 얻으실 수 있습니다.`;
    } else {
        level = '발전 가능';
        description = `귀하의 종합 점수는 <strong>${score}점</strong>으로 <strong>${rank}</strong>에 해당합니다. 아직 발전 가능성이 많습니다. 충분한 휴식 후 재도전을 권장합니다.`;
    }

    container.innerHTML = `
        <h4>${level}</h4>
        <p>${description}</p>
    `;

    console.log('해석 표시 완료:', { level, score, rank });
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
        totalTime: 450  // 7분 30초
    };
}

function createSampleStage2() {
    return {
        stage: 2,
        correctCount: 4,
        totalQuestions: 5,
        correctRate: 80,
        totalTime: 200  // 3분 20초
    };
}

function createSampleStage3() {
    return {
        stage: 3,
        correctCount: 3,
        totalQuestions: 5,
        correctRate: 60,
        totalTime: 225  // 3분 45초
    };
}

function createSampleMetacognition() {
    return {
        expectedCorrect: 20,
        timestamp: new Date().toISOString()
    };
}

function createSampleTestSettings() {
    return {
        stage1: {
            questionCount: 15,
            baseScore: 40,
            pointPerQuestion: 4,
            timeLimit: 30,  // 분
            minRequiredTime: 5  // 분
        },
        stage2: {
            questionCount: 5,
            baseScore: 60,
            pointPerQuestion: 8,
            timeLimit: 10,
            minRequiredTime: 2
        },
        stage3: {
            questionCount: 5,
            baseScore: 60,
            pointPerQuestion: 8,
            timeLimit: 10,
            minRequiredTime: 2
        },
        upwardAdjustment: 5  // 전체 상향 보정값
    };
}

/* ========================================
   공유 기능
======================================== */
function shareResult() {
    const totalScoreElem = document.getElementById('totalScore');
    const percentileElem = document.getElementById('score-percentile');

    if (!totalScoreElem || !percentileElem) {
        alert('점수 정보를 찾을 수 없습니다.');
        return;
    }

    const score = totalScoreElem.textContent.replace('점', '').trim();
    const rank = percentileElem.textContent;
    const text = `나의 멘사 브레인 챌린지 점수는 ${score}점 (${rank})! 멘사코리아 온라인 테스트로 확인하세요!`;

    if (navigator.share) {
        navigator.share({
            title: '멘사코리아 브레인 챌린지 결과',
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
    const confirmMsg = `상세 리포트 업그레이드\n\n결제 금액: 9,000원 (차액 결제)\n\n추가 제공 내용:\n- 표준편차 그래프 4개\n- 5개 항목 점수 상세 분석\n- 개선 방향 가이드\n- PDF 다운로드\n\n결제를 진행하시겠습니까?`;

    if (confirm(confirmMsg)) {
        showPaymentProcessing();
        setTimeout(() => {
            processUpgradePayment();
        }, 1500);
    }
}

function showPaymentProcessing() {
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
            <div style="font-size: 3rem; margin-bottom: 20px;">💳</div>
            <h3 style="margin-bottom: 10px; color: #333;">결제 진행 중...</h3>
            <p style="color: #666;">잠시만 기다려주세요.</p>
        </div>
    `;

    document.body.appendChild(overlay);
}

function processUpgradePayment() {
    const paymentInfo = {
        type: 'upgrade',
        originalAmount: 14900,
        upgradeAmount: 9000,
        totalPaid: 23900,
        upgraded: true,
        paymentTimestamp: new Date().toISOString(),
        transactionId: 'TXN-' + Date.now(),
        certificateNumber: localStorage.getItem('certNumber'),
        verificationCode: localStorage.getItem('verifyCode')
    };

    localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));

    const overlay = document.getElementById('paymentOverlay');
    if (overlay) {
        overlay.remove();
    }

    alert('결제가 완료되었습니다!\n상세 리포트 페이지로 이동합니다.');
    location.href = 'result-detail.html';
}
