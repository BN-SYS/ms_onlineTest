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
    
    // 인증번호 및 진위확인코드 생성
    const certNumber = `MS-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;
    const verifyCode = generateVerifyCode(userData.sessionId || userData.email || Date.now().toString());
    
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
    // input이 없거나 빈 문자열이면 랜덤 생성
    if (!input || input.length === 0) {
        input = Date.now().toString() + Math.random().toString();
    }
    
    console.log('진위확인코드 생성 입력값:', input);
    
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
    let emoji = '';
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
        <h4>${emoji} ${level}</h4>
        <p>${description}</p>
        <div class="stage-detail" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h5 style="margin-bottom: 10px;">📋 단계별 점수</h5>
            <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 8px;">
                    <strong>1단계:</strong> ${scoreResult.stage1Score}점 (${scoreResult.stage1Percentile})
                </li>
                <li style="margin-bottom: 8px;">
                    <strong>2단계:</strong> ${scoreResult.stage2Score}점 (${scoreResult.stage2Percentile})
                </li>
                <li style="margin-bottom: 8px;">
                    <strong>3단계:</strong> ${scoreResult.stage3Score}점 (${scoreResult.stage3Percentile})
                </li>
            </ul>
        </div>
    `;
    
    console.log('해석 표시 완료:', { level, totalScore: scoreResult.totalScore });
}

/* ========================================
   이메일 발송
======================================== */
function sendEmailNotification() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!userData || !userData.email) {
        console.log('ℹ이메일 정보가 없습니다.');
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
   업그레이드
======================================== */
function upgradeToDetail() {
    if (confirm('5,000원을 추가 결제하시면 상세 리포트를 확인하실 수 있습니다.\n결제하시겠습니까?')) {
        setTimeout(() => {
            alert('결제가 완료되었습니다!');
            
            const paymentInfo = {
                type: 'detail',
                amount: 5000,
                upgraded: true,
                upgradeTimestamp: new Date().toISOString(),
                certificateNumber: localStorage.getItem('certNumber'),
                verificationCode: localStorage.getItem('verifyCode')
            };
            localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));
            
            location.href = 'result-detail.html';
        }, 1000);
    }
}
