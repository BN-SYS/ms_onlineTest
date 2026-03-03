/* ========================================
   js/result-detail.js - 점수 체계 + 배너 동기화 + 톤앤매너 통일
======================================== */

document.addEventListener('DOMContentLoaded', () => {
    loadDetailResult();
});

function loadDetailResult() {
    let stage1 = JSON.parse(localStorage.getItem('stage1Result') || 'null');
    let stage2 = JSON.parse(localStorage.getItem('stage2Result') || 'null');
    let stage3 = JSON.parse(localStorage.getItem('stage3Result') || 'null');
    let userData = JSON.parse(localStorage.getItem('userData') || '{}');
    let testSettings = JSON.parse(localStorage.getItem('testSettings') || 'null');
    let scoreResult = JSON.parse(localStorage.getItem('scoreResult') || 'null');
    let certNumber = localStorage.getItem('certNumber');
    let verifyCode = localStorage.getItem('verifyCode');

    // 예상 점수 (테스트 후 입력된 값)
    let expectedScore = JSON.parse(localStorage.getItem('expectedScore') || 'null');

    // '0000-0000'이면 무효 처리
    if (verifyCode === '0000-0000') {
        localStorage.removeItem('verifyCode');
        verifyCode = null;
    }

    if (!stage1) stage1 = createSampleStage1();
    if (!stage2) stage2 = createSampleStage2();
    if (!stage3) stage3 = createSampleStage3();
    if (!userData || Object.keys(userData).length === 0) {
        userData = createSampleUser();
    }
    if (!testSettings) {
        testSettings = createSampleTestSettings();
    }

    console.log('상세 결과 로드:', { stage1, stage2, stage3, userData, testSettings, expectedScore });

    // 날짜 표시 (화면 + 배너 동기화)
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

    const testDateElem = document.getElementById('testDate');
    if (testDateElem) {
        testDateElem.textContent = dateStr;
    }

    // 배너 날짜 동기화
    const bannerDateElem = document.getElementById('bannerDate');
    if (bannerDateElem) {
        bannerDateElem.textContent = dateStr;
    }

    // 개인정보 + 인증정보 (배너 포함)
    displayUserInfo(userData, certNumber, verifyCode);

    // 점수 계산 (scoreResult가 없으면 재계산)
    if (!scoreResult) {
        scoreResult = calculateScore(stage1, stage2, stage3, userData.birthYear, testSettings, expectedScore);
    }

    // 총 점수 표시 (백분위 대신 상위권/중위권/하위권 표시)
    document.getElementById('totalScore').textContent = scoreResult.totalScore + '점';
    document.getElementById('scoreRank').textContent = scoreResult.scoreRank;

    // 레벨 평가
    displayLevel(scoreResult);

    // 단계별 점수 (5개 항목: 시각추론, 논리사고, 지식응용, 작업속도, 메타인지)
    displayStages(stage1, stage2, stage3, scoreResult);

    // 그래프 생성 (백분위 표시)
    setTimeout(() => {
        createAllCharts(scoreResult);
    }, 100);

    // 개선 가이드
    displayRecommendation(scoreResult, stage1, stage2, stage3);
}

/* ========================================
   샘플 데이터
======================================== */
function createSampleUser() {
    return {
        name: '홍길동',
        email: 'hong@example.com',
        birthYear: '1990',
        sessionId: 'session_sample_' + Date.now()
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

function displayUserInfo(userData, certNumber, verifyCode) {
    const now = new Date();

    // 이미 저장된 인증번호/코드가 있으면 재사용, 없으면 새로 생성
    if (!certNumber) {
        certNumber = localStorage.getItem('certNumber');
    }
    if (!certNumber) {
        certNumber = `MS-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;
        localStorage.setItem('certNumber', certNumber);
    }

    // verifyCode가 없거나 '0000-0000'이면 새로 생성
    if (!verifyCode || verifyCode === '0000-0000') {
        verifyCode = localStorage.getItem('verifyCode');
    }
    if (!verifyCode || verifyCode === '0000-0000') {
        verifyCode = generateVerifyCode(userData.sessionId || userData.email || certNumber);
        localStorage.setItem('verifyCode', verifyCode);
    }

    // 화면 인증 카드 채우기
    document.getElementById('userName').textContent = userData.name || '홍길동';
    document.getElementById('userBirth').textContent = (userData.birthYear || '1990') + '년생';
    document.getElementById('certNumber').textContent = certNumber;

    const verifyCodeElem = document.getElementById('verifyCode');
    if (verifyCodeElem) {
        verifyCodeElem.textContent = verifyCode;
    }

    // 배너 인증번호 동기화
    const bannerCertNoElem = document.getElementById('bannerCertNo');
    if (bannerCertNoElem) {
        bannerCertNoElem.textContent = certNumber;
    }

    console.log('사용자 정보 표시:', { certNumber, verifyCode });
}

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
   점수 계산 (100점 만점 + 연령 보정 + 작업속도 + 메타인지)
======================================== */
function calculateScore(stage1, stage2, stage3, birthYear, testSettings, expectedScore) {
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

    // 작업속도 점수 계산 (총 소요시간 기반)
    const totalTime = stage1.totalTime + stage2.totalTime + stage3.totalTime;
    const speedScore = calculateSpeedScore(totalTime);

    // 메타인지 점수 계산 (예상 점수 vs 실제 점수 차이)
    const avgScore = Math.round((stage1Score + stage2Score + stage3Score) / 3);
    const metacognitionScore = calculateMetacognitionScore(expectedScore, avgScore);

    // 종합 점수 (3단계 평균)
    const totalScore = Math.round((stage1Score + stage2Score + stage3Score) / 3);

    // 점수 기반 등급 판정 (상위권/중위권/하위권)
    const scoreRank = getScoreRank(totalScore);

    console.log('단계별 점수:', {
        stage1Score,
        stage2Score,
        stage3Score,
        speedScore,
        metacognitionScore,
        totalScore,
        scoreRank
    });

    return {
        totalScore: totalScore,
        scoreRank: scoreRank,
        percentile: getPercentile(totalScore),
        stage1Score: stage1Score,
        stage1Percentile: getPercentile(stage1Score),
        stage2Score: stage2Score,
        stage2Percentile: getPercentile(stage2Score),
        stage3Score: stage3Score,
        stage3Percentile: getPercentile(stage3Score),
        speedScore: speedScore,
        speedPercentile: getPercentile(speedScore),
        metacognitionScore: metacognitionScore,
        metacognitionPercentile: getPercentile(metacognitionScore),
        totalTime: totalTime,
        ageAdjustment: ageAdjustment
    };
}

function calculateStageScore(correctCount, baseScore, pointPerQuestion, ageAdjustment) {
    const rawScore = baseScore + (correctCount * pointPerQuestion) + ageAdjustment;
    const finalScore = Math.min(100, rawScore);

    return finalScore;
}

/**
 * 작업속도 점수 계산
 * - 총 소요시간이 짧을수록 높은 점수 부여
 * - 기준: 875초(약 14분 35초) = 100점
 * - 1750초(약 29분) = 50점
 * - 그 이상은 비례 감소
 */
function calculateSpeedScore(totalTime) {
    const optimalTime = 875; // 최적 시간 (초)
    const maxTime = 1750; // 기준 최대 시간 (초)

    if (totalTime <= optimalTime) {
        return 100;
    } else if (totalTime >= maxTime) {
        return Math.max(30, 100 - Math.floor((totalTime - maxTime) / 30)); // 최소 30점
    } else {
        // 선형 감소
        const score = 100 - Math.floor(((totalTime - optimalTime) / (maxTime - optimalTime)) * 50);
        return Math.max(30, score);
    }
}

/**
 * 메타인지 점수 계산
 * - 예상 점수와 실제 점수 차이가 작을수록 높은 점수
 * - 오차 0 = 100점
 * - 오차 10점 이내 = 80~100점
 * - 오차 20점 이내 = 60~80점
 * - 오차 30점 이상 = 40~60점
 */
function calculateMetacognitionScore(expectedScore, actualScore) {
    if (!expectedScore || expectedScore <= 0) {
        // 예상 점수가 없으면 기본 50점 부여
        return 50;
    }

    const diff = Math.abs(expectedScore - actualScore);

    if (diff === 0) {
        return 100;
    } else if (diff <= 5) {
        return 95 - diff;
    } else if (diff <= 10) {
        return 90 - (diff - 5) * 2;
    } else if (diff <= 20) {
        return 80 - (diff - 10);
    } else if (diff <= 30) {
        return 70 - (diff - 20);
    } else {
        return Math.max(30, 50 - (diff - 30));
    }
}

/**
 * 점수 기반 등급 (상위권/중위권/하위권)
 */
function getScoreRank(score) {
    if (score >= 85) return '상위권';
    if (score >= 65) return '중위권';
    return '하위권';
}

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
   레벨 평가 표시
======================================== */
function displayLevel(scoreResult) {
    let level = '';
    let description = '';

    if (scoreResult.totalScore >= 95) {
        level = '최상위 수준';
        description = '멘사 회원 수준의 뛰어난 지능을 보유하고 계십니다. 공식 멘사 입회 테스트 합격 가능성이 매우 높습니다.';
    } else if (scoreResult.totalScore >= 90) {
        level = '매우 우수';
        description = '우수한 인지 능력을 가지고 계십니다. 멘사 공식 테스트에 도전해보시길 권장드립니다.';
    } else if (scoreResult.totalScore >= 85) {
        level = '우수';
        description = '평균보다 훨씬 높은 인지 능력을 보유하고 있으며, 논리적 사고와 문제 해결 능력이 뛰어납니다.';
    } else if (scoreResult.totalScore >= 75) {
        level = '평균 상위';
        description = '평균 이상의 능력을 보유하고 계십니다. 추가 학습과 훈련을 통해 더욱 발전할 수 있습니다.';
    } else if (scoreResult.totalScore >= 65) {
        level = '평균 중상';
        description = '평균 수준의 인지 능력을 가지고 계십니다. 꾸준한 노력으로 향상 가능합니다.';
    } else if (scoreResult.totalScore >= 55) {
        level = '평균';
        description = '일반적인 인지 능력을 가지고 있으며, 충분한 휴식 후 재응시하시면 더 좋은 결과를 얻으실 수 있습니다.';
    } else {
        level = '발전 가능';
        description = '아직 발전 가능성이 많습니다. 충분한 휴식 후 재도전을 권장합니다.';
    }

    document.getElementById('levelBox').innerHTML = `
        <h4>${level}</h4>
        <p>${description}</p>
    `;
}

/* ========================================
   단계별 점수 표시 (5개 항목: 시각추론, 논리사고, 종합인지, 작업속도, 메타인지)
======================================== */
function displayStages(s1, s2, s3, scoreResult) {
    const stages = [
        {
            title: '1단계: 시각 추론',
            score: scoreResult.stage1Score
        },
        {
            title: '2단계: 논리 사고',
            score: scoreResult.stage2Score
        },
        {
            title: '3단계: 종합 인지',
            score: scoreResult.stage3Score
        },
        {
            title: '작업 속도',
            score: scoreResult.speedScore,
            detail: `총 소요시간: ${formatTime(scoreResult.totalTime)}`
        },
        {
            title: '메타인지',
            score: scoreResult.metacognitionScore,
            detail: '자기 인식 정확도'
        }
    ];

    document.getElementById('stagesGrid').innerHTML = stages.map(s => `
        <div class="stage-item">
            <h5>${s.title}</h5>
            <div class="stage-score">${s.score}점</div>
            ${s.detail ? `<div class="stage-detail">${s.detail}</div>` : ''}
        </div>
    `).join('');
}

/**
 * 초 → 분:초 형식 변환
 */
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}분 ${sec}초`;
}

/* ========================================
   정규분포 데이터 생성 (100점 만점 기준)
======================================== */
function generateNormalDistribution(mean, stdDev, points = 80) {
    const data = [];
    const start = Math.max(0, mean - 4 * stdDev);
    const end = Math.min(100, mean + 4 * stdDev);
    const step = (end - start) / points;

    for (let x = start; x <= end; x += step) {
        const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
        const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
        data.push({ x: Math.round(x * 10) / 10, y: y });
    }

    return data;
}

/* ========================================
   Chart.js 그래프 생성 (통일된 톤앤매너)
======================================== */
function createCompactChart(canvasId, userScore, mean = 70, stdDev = 12) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const distributionData = generateNormalDistribution(mean, stdDev);
    const userY = (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * Math.pow((userScore - mean) / stdDev, 2));

    return new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    data: distributionData,
                    borderColor: 'rgba(26, 26, 46, 0.8)',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 2
                },
                {
                    data: [{ x: userScore, y: 0 }, { x: userScore, y: userY }],
                    borderColor: '#d4af37',
                    backgroundColor: '#d4af37',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: '#d4af37',
                    type: 'line',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: (context) => `점수: ${userScore}점`
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    display: true,
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        callback: v => v + '점',
                        font: { size: 9 },
                        color: '#666'
                    },
                    grid: { color: 'rgba(212, 175, 55, 0.1)' }
                },
                y: {
                    display: false,
                    grid: { display: false }
                }
            },
            animation: { duration: 1000 }
        }
    });
}

/* ========================================
   모든 그래프 생성
======================================== */
function createAllCharts(scoreResult) {
    // 각 그래프 생성
    createCompactChart('totalChart', scoreResult.totalScore);
    createCompactChart('stage1Chart', scoreResult.stage1Score);
    createCompactChart('stage2Chart', scoreResult.stage2Score);
    createCompactChart('stage3Chart', scoreResult.stage3Score);

    // 점수 텍스트 추가 (상위 % 제외)
    addPercentileLabels(scoreResult);
}

function addPercentileLabels(scoreResult) {
    const labels = [
        { id: 'totalChart', score: scoreResult.totalScore },
        { id: 'stage1Chart', score: scoreResult.stage1Score },
        { id: 'stage2Chart', score: scoreResult.stage2Score },
        { id: 'stage3Chart', score: scoreResult.stage3Score }
    ];

    labels.forEach(label => {
        const chartBox = document.getElementById(label.id)?.closest('.chart-box');
        if (chartBox) {
            const existingLabel = chartBox.querySelector('.chart-percentile');
            if (!existingLabel) {
                const percentileLabel = document.createElement('p');
                percentileLabel.className = 'chart-percentile';
                percentileLabel.textContent = `${label.score}점`;  // 점수만 표시
                chartBox.appendChild(percentileLabel);
            }
        }
    });
}

/* ========================================
   개선 가이드
======================================== */
function displayRecommendation(scoreResult, stage1, stage2, stage3) {
    const stages = [
        { name: '1단계 (시각 추론)', rate: stage1.correctRate, score: scoreResult.stage1Score },
        { name: '2단계 (논리 사고)', rate: stage2.correctRate, score: scoreResult.stage2Score },
        { name: '3단계 (지식 응용)', rate: stage3.correctRate, score: scoreResult.stage3Score }
    ];

    const weakest = stages.reduce((min, s) => s.score < min.score ? s : min);
    const strongest = stages.reduce((max, s) => s.score > max.score ? s : max);

    let content = '';

    if (scoreResult.totalScore >= 90) {
        content = `
            <h4>멘사 가입 준비 가이드</h4>
            <ul>
                <li>오프라인으로 진행되는 멘사 입회 테스트에 응시하여, 자신의 능력을 정식으로 확인해보시기 바랍니다.</li>
                <li>${strongest.name}이(가) 강점입니다 (${strongest.score}점). 전문 분야 개발을 추천합니다.</li>
                <li>고난도 논리 퍼즐과 수학 문제로 지속적인 두뇌 훈련을 하세요.</li>
                <li>모든 영역에서 균형잡힌 발전을 유지하세요.</li>
            </ul>
        `;
    } else if (scoreResult.totalScore >= 75) {
        content = `
            <h4>실력 향상 가이드</h4>
            <ul>
                <li>${strongest.name}이(가) 강점입니다 (${strongest.score}점). 이 영역을 더욱 발전시키세요.</li>
                <li>${weakest.name} 영역 (${weakest.score}점) 집중 훈련으로 균형잡힌 능력을 개발하세요.</li>
                <li>다양한 유형의 문제를 풀며 패턴 인식 능력을 향상시키세요.</li>
                <li>꾸준한 학습과 반복 훈련이 실력 향상의 핵심입니다.</li>
            </ul>
        `;
    } else {
        content = `
            <h4>학습 가이드</h4>
            <ul>
                <li>${weakest.name} 영역 (${weakest.score}점) 보강을 통해 전체 점수를 향상시킬 수 있습니다.</li>
                <li>기본적인 논리 훈련과 패턴 학습을 꾸준히 진행하세요.</li>
                <li>충분한 휴식 후 재도전하시면 더 좋은 결과를 얻을 수 있습니다.</li>
                <li>단계별로 체계적인 학습 계획을 세워 실행하세요.</li>
                <li>매일 10-15분씩 두뇌 훈련 문제를 풀어보세요.</li>
            </ul>
        `;
    }

    // 작업속도 / 메타인지 피드백 추가
    if (scoreResult.speedScore < 70) {
        content += `
            <div style="margin-top: 12px; padding: 10px; background: rgba(255,200,100,0.1); border-left: 3px solid #d4af37; border-radius: 4px;">
                <strong>⏱ 작업속도 개선 TIP:</strong> 
                문제를 빠르게 이해하고 답을 찾는 연습이 필요합니다. 시간 제한을 두고 반복 연습하세요.
            </div>
        `;
    }

    if (scoreResult.metacognitionScore < 70) {
        content += `
            <div style="margin-top: 12px; padding: 10px; background: rgba(100,150,255,0.1); border-left: 3px solid #5a7fc4; border-radius: 4px;">
                <strong>🧠 메타인지 개선 TIP:</strong> 
                자신의 실력을 객관적으로 파악하는 능력이 필요합니다. 문제 풀이 후 스스로 채점해보는 연습을 해보세요.
            </div>
        `;
    }

    content += `
        <div class="stage-summary" style="margin-top: 15px; padding: 12px; background: linear-gradient(135deg, rgba(26,26,46,0.03) 0%, rgba(212,175,55,0.05) 100%); border-radius: 8px; border: 1px solid rgba(212,175,55,0.15);">
            <div style="margin-bottom: 6px;"><strong style="color: #1a1a2e;">강점 영역:</strong> ${strongest.name} - ${strongest.score}점 (정답률 ${strongest.rate.toFixed(0)}%)</div>
            <div><strong style="color: #1a1a2e;">보완 영역:</strong> ${weakest.name} - ${weakest.score}점 (정답률 ${weakest.rate.toFixed(0)}%)</div>
        </div>
    `;

    document.getElementById('recommendationContent').innerHTML = content;
}


/* ========================================
   고화질 PDF 다운로드
======================================== */
async function downloadPDF() {
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        alert('PDF 라이브러리를 로드하는 중입니다.\n잠시 후 다시 시도해주세요.');
        return;
    }

    const button = event?.target?.closest('.action-btn');
    const originalHTML = button ? button.innerHTML : '';

    if (button) {
        button.innerHTML = 'PDF 생성 중...';
        button.disabled = true;
    }

    const resultPage = document.getElementById('resultPage');
    if (!resultPage) {
        alert('결과 페이지를 찾을 수 없습니다.');
        return;
    }

    // PDF 렌더링 모드 ON (테두리 추가)
    resultPage.classList.add('pdf-rendering');

    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;

    try {
        // CSS 적용 대기
        await new Promise(resolve => setTimeout(resolve, 150));

        // 고해상도 캡처 (scale 3 = 3배 해상도)
        const canvas = await html2canvas(resultPage, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: resultPage.scrollWidth,
            windowHeight: resultPage.scrollHeight,
            imageTimeout: 0,
            removeContainer: true,
            letterRendering: true,
        });

        // 고품질 이미지로 변환 (JPEG 품질 최대)
        const imgData = canvas.toDataURL('image/jpeg', 1.0); // 품질 1.0 (최고)

        // PDF 생성 (compress: false = 압축 안 함)
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: false,      // 압축 비활성화 (화질 우선)
            precision: 16         // 정밀도 증가
        });

        // 이미지를 A4에 맞춤 (압축 없음)
        pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');

        const fileName = `MensaStyle_Test_Report_${Date.now()}.pdf`;
        pdf.save(fileName);

        console.log('고화질 PDF 다운로드 완료:', fileName);

    } catch (err) {
        console.error('❌ PDF 생성 실패:', err);
        alert('PDF 생성 중 오류가 발생했습니다.\n다시 시도해주세요.');
    } finally {
        // PDF 렌더링 모드 OFF
        resultPage.classList.remove('pdf-rendering');

        if (button) {
            button.innerHTML = originalHTML;
            button.disabled = false;
        }
    }
}


/* ========================================
   공유/인쇄
======================================== */
function shareResult() {
    const score = document.getElementById('totalScore').textContent;
    const rank = document.getElementById('scoreRank').textContent;
    const text = `나의 멘사 테스트 점수는 ${score} (${rank})! 멘사 온라인 테스트로 확인하세요!`;

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

function printResult() {
    window.print();
}
