/* ========================================
   js/result-detail.js
   요구사항 명세 기반 상세 리포트 (5개 항목 + 정규분포 그래프)
======================================== */

document.addEventListener('DOMContentLoaded', () => {
    loadDetailResult();
});

function loadDetailResult() {
    console.log('=== 상세 리포트 로드 시작 ===');

    // ========================================
    // 1. 데이터 수집
    // ========================================
    let stage1 = JSON.parse(localStorage.getItem('stage1Result') || 'null');
    let stage2 = JSON.parse(localStorage.getItem('stage2Result') || 'null');
    let stage3 = JSON.parse(localStorage.getItem('stage3Result') || 'null');
    let userData = JSON.parse(localStorage.getItem('userData') || 'null');
    let testSettings = JSON.parse(localStorage.getItem('testSettings') || 'null');
    let metacognitionData = JSON.parse(localStorage.getItem('metacognitionData') || 'null');
    let scoreResult = JSON.parse(localStorage.getItem('scoreResult') || 'null');

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

    // scoreResult가 없으면 재계산
    if (!scoreResult) {
        scoreResult = calculateComprehensiveScore(
            stage1,
            stage2,
            stage3,
            userData.birthYear,
            testSettings,
            metacognitionData
        );
    }

    console.log('로드된 데이터:', { stage1, stage2, stage3, userData, scoreResult });

    // ========================================
    // 2. 날짜 및 인증정보
    // ========================================
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

    let certNumber = localStorage.getItem('certNumber');
    let verifyCode = localStorage.getItem('verifyCode');

    if (!certNumber) {
        certNumber = `MS-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;
        localStorage.setItem('certNumber', certNumber);
    }

    if (!verifyCode || verifyCode === '0000-0000') {
        verifyCode = generateVerifyCode(userData.sessionId || userData.email || certNumber);
        localStorage.setItem('verifyCode', verifyCode);
    }

    // ========================================
    // 3. UI 업데이트
    // ========================================

    // 날짜 표시
    const testDateElem = document.getElementById('testDate');
    if (testDateElem) {
        testDateElem.textContent = dateStr;
    }

    const bannerDateElem = document.getElementById('bannerDate');
    if (bannerDateElem) {
        bannerDateElem.textContent = dateStr;
    }

    // 개인정보 표시
    const userNameElem = document.getElementById('userName');
    const userBirthElem = document.getElementById('userBirth');
    const certNumberElem = document.getElementById('certNumber');
    const verifyCodeElem = document.getElementById('verifyCode');
    const bannerCertNoElem = document.getElementById('bannerCertNo');

    if (userNameElem) {
        userNameElem.textContent = userData.name || '홍길동';
    }

    if (userBirthElem) {
        userBirthElem.textContent = (userData.birthYear || '1990') + '년생';
    }

    if (certNumberElem) {
        certNumberElem.textContent = certNumber;
    }

    if (verifyCodeElem) {
        verifyCodeElem.textContent = verifyCode;
    }

    if (bannerCertNoElem) {
        bannerCertNoElem.textContent = certNumber;
    }

    // 종합점수 및 등급 표시
    const totalScoreElem = document.getElementById('totalScore');
    const scoreRankElem = document.getElementById('scoreRank');

    if (totalScoreElem) {
        totalScoreElem.textContent = scoreResult.finalScore || '0';
    }

    if (scoreRankElem) {
        scoreRankElem.textContent = scoreResult.rank;
    }

    // 레벨 평가
    displayLevel(scoreResult);

    // 5개 항목 점수 표시
    displayFiveScores(scoreResult);

    // 정규분포 그래프 생성 (6개)
    setTimeout(() => {
        createAllCharts(scoreResult);
    }, 100);

    // 개선 가이드
    displayRecommendation(scoreResult, stage1, stage2, stage3);

    console.log('상세 리포트 렌더링 완료');
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

    // ✅ 전체 문제 수
    const totalQuestions = 25; // (15 + 5 + 5)

    // ✅ 문제당 평균 시간 (반올림)
    const avgTimePerQuestion = totalTimeSeconds > 0
        ? Math.round(totalTimeSeconds / totalQuestions)
        : 0;

    const totalTimeFormatted = formatTime(totalTimeSeconds);

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
        speedScore = Math.max(60, 100 - ((totalTimeSeconds - minRequiredTime) / (timeLimit - minRequiredTime)) * 40);
    } else {
        speedScore = 60;
    }

    // ✅ 연령 보정 적용 및 반올림 (한 번만)
    speedScore = Math.min(100, Math.round(speedScore + ageAdjustment));

    console.log('작업속도 계산:', {
        totalTimeSeconds,
        totalQuestions,
        avgTimePerQuestion: `${avgTimePerQuestion}초`,
        speedScore: `${speedScore}점`
    });

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
        metacognitionScore = 0;
    }

    console.log('메타인지 점수 (연령 보정 없음):', metacognitionScore);

    // ========================================
    // 5. 가중 종합점수 계산
    // ========================================
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

    // ========================================
    // 8. 백분위 계산 (정규분포 그래프용)
    // ========================================
    return {
        stage1Score,
        stage1Percentile: getPercentile(stage1Score),
        stage2Score,
        stage2Percentile: getPercentile(stage2Score),
        stage3Score,
        stage3Percentile: getPercentile(stage3Score),
        speedScore, // ✅ 이미 반올림됨
        speedPercentile: getPercentile(speedScore),
        avgTimePerQuestion, // ✅ 추가: 반올림된 평균 시간 (초)
        metacognitionScore,
        metacognitionPercentile: getPercentile(metacognitionScore),
        rawScore: Math.round(rawScore),
        finalScore,
        percentile: getPercentile(finalScore),
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
   백분위 계산 (정규분포 표시용)
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
   레벨 평가 표시 (개괄적 평가)
======================================== */
function displayLevel(scoreResult) {
    let level = '';
    let description = '';
    const score = scoreResult.finalScore;

    if (score >= 95) {
        level = '최상위 수준';
        description = '매우 뛰어난 문제 해결 능력과 논리적 사고력을 보유하고 계십니다. 복잡한 패턴을 빠르게 파악하고, 추상적인 개념을 효과적으로 처리하는 능력이 탁월합니다.<br><br><strong>공식 멘사 입회 테스트 합격 가능성이 매우 높습니다.</strong> 온라인 테스트로 확인된 이러한 능력을 멘사코리아 입회테스트를 통해 객관적으로 검증받고, 전 세계 상위 2% 고지능자 모임에 합류해보시기 바랍니다.';
    } else if (score >= 90) {
        level = '매우 우수';
        description = '탁월한 논리적 사고력과 뛰어난 패턴 인식 능력을 가지고 계십니다. 어려운 문제 상황에서도 체계적으로 접근하여 해결책을 찾아내는 능력이 우수합니다.<br><br><strong>멘사 입회 기준에 충분히 도달할 수 있는 잠재력을 보유하고 있습니다.</strong> 온라인 테스트로 확인한 능력을 멘사코리아 입회테스트를 통해 검증받아보시는 것을 추천드립니다.';
    } else if (score >= 85) {
        level = '우수';
        description = '평균보다 훨씬 높은 수준의 논리적 사고와 문제 해결 능력을 보유하고 있습니다. 새로운 유형의 문제를 접했을 때 적응력이 빠르며, 체계적인 분석과 추론이 가능합니다.<br><br>지속적인 학습과 훈련을 통해 최상위권으로 도약할 수 있는 충분한 잠재력을 갖추고 있습니다. <strong>훈련 후 멘사코리아 입회테스트에 도전해보시기를 권장합니다.</strong>';
    } else if (score >= 75) {
        level = '평균 상위';
        description = '평균 이상의 안정적인 실력을 보유하고 계십니다. 기본적인 논리 구조를 잘 이해하고 있으며, 일반적인 난이도의 문제는 무난하게 해결할 수 있는 능력을 갖추고 있습니다.<br><br>추가적인 학습과 다양한 유형의 문제 풀이 훈련을 통해 더욱 발전할 수 있습니다. 실력 향상 후 <strong>멘사코리아 입회테스트에 도전하여 고지능자 인증을 받아보시는 것도 좋은 목표가 될 수 있습니다.</strong>';
    } else if (score >= 65) {
        level = '평균 중상';
        description = '안정적인 기본기를 갖추고 있으며, 표준적인 문제 해결 능력을 보유하고 있습니다. 평균 수준의 논리적 사고력을 가지고 있어, 기본 개념을 활용한 문제는 잘 풀어낼 수 있습니다.<br><br>꾸준한 훈련과 체계적인 학습으로 상위권 진입이 충분히 가능합니다. 목표를 설정하고 단계적으로 실력을 향상시켜 나가시기 바랍니다.';
    } else if (score >= 55) {
        level = '평균';
        description = '기본적인 문제 해결 능력을 갖추고 있습니다. 익숙한 유형의 문제는 해결할 수 있으나, 새로운 패턴이나 복잡한 구조의 문제에서는 어려움을 느낄 수 있습니다.<br><br>기본 논리 훈련과 패턴 학습을 단계별로 체계적으로 진행하시면 실력 향상에 큰 도움이 됩니다. 꾸준한 학습을 통해 한 단계씩 발전해 나가시기 바랍니다.';
    } else {
        level = '성장 단계';
        description = '현재는 기초를 다지는 단계로, 앞으로 발전 가능성이 충분합니다. 문제 유형에 대한 이해를 높이고, 기본적인 논리 구조를 익히는 것이 우선입니다.<br><br>쉬운 문제부터 차근차근 풀어나가며 자신감을 쌓는 것을 추천합니다. 작은 성공 경험을 반복하며 점진적으로 실력을 키워나가시기 바랍니다.';
    }

    const levelBox = document.getElementById('levelBox');
    if (levelBox) {
        levelBox.innerHTML = `
            <h4>${level}</h4>
            <p>${description}</p>
        `;
    }
}


/* ========================================
   5개 항목 점수 표시
======================================== */
function displayFiveScores(scoreResult) {
    const stages = [
        {
            title: '1단계 환산점수',
            detail: '시각 추론',
            score: scoreResult.stage1Score
        },
        {
            title: '2단계 환산점수',
            detail: '논리 사고',
            score: scoreResult.stage2Score
        },
        {
            title: '3단계 환산점수',
            detail: '종합 인지',
            score: scoreResult.stage3Score
        },
        {
            title: '작업 속도 환산점수',
            score: scoreResult.speedScore,
            detail: `총 소요시간: ${scoreResult.totalTimeFormatted || '0분 0초'}` // ✅ 수정
        },
        {
            title: '메타인지 원점수',
            score: scoreResult.metacognitionScore,
            detail: '자기 인식 정확도'
        }
    ];

    const stagesGrid = document.getElementById('stagesGrid');
    if (stagesGrid) {
        stagesGrid.innerHTML = stages.map(s => `
            <div class="stage-item">
                <h5>${s.title}</h5>
                ${s.detail ? `<div class="stage-detail">${s.detail}</div>` : ''}
                <div class="stage-score">${s.score || 0}점</div>
            </div>
        `).join('');
    }
}



/* ========================================
   정규분포 데이터 생성
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
   Chart.js 정규분포 그래프 생성
======================================== */
function createCompactChart(canvasId, userScore, mean = 75, stdDev = 24, isTotal = false) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.warn(`Canvas not found: ${canvasId}`);
        return null;
    }

    const distributionData = generateNormalDistribution(mean, stdDev);
    const userY = (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * Math.pow((userScore - mean) / stdDev, 2));

    // 종합 점수 그래프는 색상 차별화
    const lineColor = isTotal ? 'rgba(212, 175, 55, 0.8)' : 'rgba(26, 26, 46, 0.8)';
    const fillColor = isTotal ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.15)';
    const userLineColor = isTotal ? '#d4af37' : '#1a1a2e';

    return new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    data: distributionData,
                    borderColor: lineColor,
                    backgroundColor: fillColor,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: isTotal ? 3 : 2
                },
                {
                    // 사용자 위치 수직선 (0 ~ userY까지)
                    data: [
                        { x: userScore, y: 0 },
                        { x: userScore, y: userY }
                    ],
                    borderColor: userLineColor,
                    backgroundColor: userLineColor,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: userLineColor,
                    type: 'line',
                    fill: false,
                    // clip 비활성화로 캔버스 밖으로 그리기 허용
                    clip: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            // 전체 차트 clip 비활성화
            clip: false,
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
                        callback: function (value) {
                            return value + '점';
                        },
                        font: { size: 9 },
                        color: '#666',
                        padding: 5
                    },
                    grid: {
                        color: 'rgba(212, 175, 55, 0.1)',
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: true,
                        // 그리드도 clip 비활성화
                        drawBorder: true
                    },
                    border: {
                        display: true
                    }
                },
                y: {
                    display: false,
                    grid: { display: false }
                }
            },
            animation: { duration: 1000 },
            // 그래프 영역 패딩을 크게 확보
            layout: {
                padding: {
                    top: 15,
                    right: 30,
                    bottom: 10,
                    left: 10
                }
            }
        }
    });
}


/* ========================================
   모든 그래프 생성 (6개)
======================================== */
function createAllCharts(scoreResult) {
    console.log('정규분포 그래프 생성 시작');

    // 단계별 난이도 설정 (평균, 표준편차)
    const distributions = {
        total: { mean: 75, stdDev: 24 },      // 종합: 전체 평균
        stage1: { mean: 85, stdDev: 24 },     // 1단계: 시각 추론 (비교적 쉬움)
        stage2: { mean: 75, stdDev: 24 },     // 2단계: 논리 사고 (어려움)
        stage3: { mean: 70, stdDev: 24 },     // 3단계: 종합 인지 (가장 어려움)
    };

    // 종합 점수 그래프 (차별화)
    createCompactChart('totalChart', scoreResult.finalScore,
        distributions.total.mean, distributions.total.stdDev, true);

    // 1단계: 시각 추론 (가장 쉬움)
    createCompactChart('stage1Chart', scoreResult.stage1Score,
        distributions.stage1.mean, distributions.stage1.stdDev, false);

    // 2단계: 논리 사고 (중간 난이도)
    createCompactChart('stage2Chart', scoreResult.stage2Score,
        distributions.stage2.mean, distributions.stage2.stdDev, false);

    // 3단계: 종합 인지 (가장 어려움)
    createCompactChart('stage3Chart', scoreResult.stage3Score,
        distributions.stage3.mean, distributions.stage3.stdDev, false);

    // 점수 라벨 추가
    addPercentileLabels(scoreResult);

    console.log('그래프 생성 완료');
}


/* ========================================
   그래프 하단 점수 라벨 추가
======================================== */
function addPercentileLabels(scoreResult) {
    const labels = [
        { id: 'totalChart', score: scoreResult.finalScore, percentile: scoreResult },
        { id: 'stage1Chart', score: scoreResult.stage1Score, percentile: scoreResult },
        { id: 'stage2Chart', score: scoreResult.stage2Score, percentile: scoreResult },
        { id: 'stage3Chart', score: scoreResult.stage3Score, percentile: scoreResult },
        { id: 'speedChart', score: scoreResult.speedScore, percentile: scoreResult },
        { id: 'metacognitionChart', score: scoreResult.metacognitionScore, percentile: scoreResult }
    ];

    labels.forEach(label => {
        const chartBox = document.getElementById(label.id)?.closest('.chart-box');
        if (chartBox) {
            const existingLabel = chartBox.querySelector('.chart-percentile');
            if (!existingLabel) {
                const percentileLabel = document.createElement('p');
                percentileLabel.className = 'chart-percentile';
                percentileLabel.textContent = `${label.score}점`;
                chartBox.appendChild(percentileLabel);
            }
        }
    });
}


/* ========================================
   개선 가이드 (구체적이고 실행 가능한 조언)
======================================== */
function displayRecommendation(scoreResult, stage1, stage2, stage3) {
    const stages = [
        { name: '시각 추론', fullName: '1단계 (시각 추론)', rate: stage1.correctRate, score: scoreResult.stage1Score },
        { name: '논리 사고', fullName: '2단계 (논리 사고)', rate: stage2.correctRate, score: scoreResult.stage2Score },
        { name: '종합 인지', fullName: '3단계 (종합 인지)', rate: stage3.correctRate, score: scoreResult.stage3Score }
    ];

    // 점수순 정렬
    const sortedStages = [...stages].sort((a, b) => b.score - a.score);
    const maxScore = sortedStages[0].score;

    // 최고점 단계들 (동점 처리)
    const topStages = stages.filter(s => s.score === maxScore);
    const minScore = sortedStages[sortedStages.length - 1].score;
    const weakStages = stages.filter(s => s.score === minScore);

    let content = '';

    if (scoreResult.finalScore >= 90) {
        const topNames = topStages.map(s => s.name).join(', ');
        const isAllSame = topStages.length === 3;

        content = `
            ${isAllSame ? `
                <p style="margin-bottom: 15px; color: #333; line-height: 1.7; font-size: 11px; font-weight: 700;">
                    모든 영역에서 고르게 뛰어난 능력을 보이고 있습니다 (각 ${maxScore}점). 이제는 깊이 있는 전문성 개발 단계입니다.
                </p>
            ` : `
                <p style="margin-bottom: 15px; color: #333; line-height: 1.7; font-size: 11px; font-weight: 700;">
                    ${topNames} 영역에서 특히 뛰어난 능력(${maxScore}점)을 보이고 있습니다. 이를 활용한 심화 학습을 추천합니다.
                </p>
            `}
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 14px; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">고급 문제 해결 훈련:</strong> IMO(국제수학올림피아드), 페르미 추정, 논리 퍼즐 챔피언십 수준의 문제에 도전해보세요. 단순 반복보다는 새로운 유형의 난제를 접하는 것이 중요합니다.
                </li>
                <li style="margin-bottom: 14px; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">속도와 정확도의 균형:</strong> 현재 작업 속도 ${scoreResult.speedScore}점을 고려할 때, ${scoreResult.speedScore >= 90 ? '빠른 판단력을 유지하면서 실수를 최소화하는 연습' : '시간 압박 하에서도 정확도를 유지하는 훈련'}이 필요합니다.
                </li>
                <li style="margin-bottom: 14px; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">메타인지 정교화:</strong> 자기 평가 점수 ${scoreResult.metacognitionScore}점 ${scoreResult.metacognitionScore >= 90 ? '으로 자신의 능력을 정확히 파악하고 있습니다. 이를 활용해 학습 전략을 스스로 최적화하세요.' : '을 개선하기 위해, 문제별 난이도와 소요 시간을 예측하고 기록하는 습관을 들이세요.'}
                </li>
                <li style="margin-bottom: 0; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">실전 적용:</strong> 멘사 입회테스트, 논리력 경시대회, 또는 전문 분야(프로그래밍 알고리즘, 데이터 분석 등)에서 실력을 검증받고 활용해보세요.
                </li>
            </ul>
        `;
    } else if (scoreResult.finalScore >= 80) {
        const topNames = topStages.map(s => s.name).join(', ');
        const weakNames = weakStages.map(s => `${s.name}(${s.score}점)`).join(', ');

        content = `
            <p style="margin-bottom: 15px; color: #333; line-height: 1.7; font-size: 11px; font-weight: 700;">
                ${topNames} 영역(${maxScore}점)이 강점입니다. ${weakStages.length > 0 && maxScore !== minScore ? `${weakNames} 영역을 집중 보완하면 90점대 진입이 가능합니다.` : '모든 영역이 균형잡혀 있어 심화 학습으로 도약할 수 있습니다.'}
            </p>
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 14px; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">약점 영역 집중 공략:</strong> ${weakStages.length > 0 && maxScore !== minScore ?
                `${weakStages[0].name} 영역 특화 훈련이 필요합니다. ${weakStages[0].name === '시각 추론' ? '공간 지각력 훈련(3D 퍼즐, 회전 문제), 패턴 변환 연습' :
                    weakStages[0].name === '논리 사고' ? '기호 논리학 기초, 논리 게임(스도쿠, 켄켄), 삼단논법 훈련' :
                        '복합 문제 풀이, 다단계 추론 연습, 정보 통합 훈련'
                }을 추천합니다.` :
                '모든 영역의 난이도를 한 단계 높여 고급 문제에 도전하세요.'
            }
                </li>
                <li style="margin-bottom: 14px; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">문제 유형 다양화:</strong> Raven's Progressive Matrices, WAIS 스타일 문제, 추상적 추론 테스트 등 다양한 형식의 고난도 문제를 풀어보세요.
                </li>
                <li style="margin-bottom: 14px; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">시간 관리 최적화:</strong> ${scoreResult.speedScore < 80 ?
                `작업 속도 ${scoreResult.speedScore}점을 향상시키기 위해, 단계별 시간 제한을 설정하고(1단계 1분 30초, 2단계 1분, 3단계 1분 20초) 반복 연습하세요.` :
                `현재 속도(${scoreResult.speedScore}점)를 유지하면서 정확도를 높이는 데 집중하세요.`
            }
                </li>
                <li style="margin-bottom: 0; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">오답 분석 루틴:</strong> 틀린 문제는 단순히 정답 확인이 아니라, '왜 틀렸는지', '어떤 사고 과정이 부족했는지' 분석하고 기록하세요.
                </li>
            </ul>
        `;
    } else if (scoreResult.finalScore >= 70) {
        const topNames = topStages.map(s => s.name).join(', ');
        const weakNames = weakStages.map(s => `${s.name}(${s.score}점)`).join(', ');

        content = `
            <p style="margin-bottom: 15px; color: #333; line-height: 1.7; font-size: 11px; font-weight: 700;">
                ${topNames} 영역(${maxScore}점)을 중심으로 실력을 확장하고, ${weakStages.length > 0 && maxScore !== minScore ? `${weakNames} 영역을 체계적으로 보강하면` : '모든 영역을 균형있게 발전시키면'} 80점대 돌파가 가능합니다.
            </p>
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 14px; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">단계별 학습 플랜 (4주 기준):</strong>
                    <ul style="list-style: disc; margin: 8px 0 0 20px; padding: 0;">
                        <li style="margin-bottom: 6px; color: #555; font-size: 10px; line-height: 1.6;">1주차: 기본 패턴 복습 (하루 20분, 쉬운 문제 30개)</li>
                        <li style="margin-bottom: 6px; color: #555; font-size: 10px; line-height: 1.6;">2주차: 중급 문제 도전 (하루 30분, 중급 문제 20개)</li>
                        <li style="margin-bottom: 6px; color: #555; font-size: 10px; line-height: 1.6;">3주차: 약점 영역 집중 (${weakStages[0]?.name || '취약 영역'} 특화 훈련)</li>
                        <li style="margin-bottom: 0; color: #555; font-size: 10px; line-height: 1.6;">4주차: 모의 테스트 (실전과 동일한 조건으로 3회 이상)</li>
                    </ul>
                </li>
                <li style="margin-bottom: 14px; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">영역별 맞춤 훈련:</strong>
                    <ul style="list-style: disc; margin: 8px 0 0 20px; padding: 0;">
                        ${stages.map(s => `<li style="margin-bottom: 6px; color: #555; font-size: 10px; line-height: 1.6;">${s.name}: ${s.score}점 → ${s.name === '시각 추론' ? '도형 규칙 찾기, 거울상/회전 문제 집중' :
            s.name === '논리 사고' ? '조건 추론, 명제 논리, 벤다이어그램 연습' :
                '복합 정보 처리, 다중 규칙 적용 문제'
            }</li>`).join('')}
                    </ul>
                </li>
                <li style="margin-bottom: 14px; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">실전 감각 유지:</strong> 매주 1회, 시간 제한을 둔 모의 테스트로 실전 감각을 유지하세요. 점수보다는 '어떤 유형에서 시간이 오래 걸리는지' 파악이 중요합니다.
                </li>
                <li style="margin-bottom: 0; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">학습 기록 작성:</strong> 일일 학습 내용, 취약 유형, 개선 사항을 간단히 기록하면 학습 효율이 30% 이상 향상됩니다.
                </li>
            </ul>
        `;
    } else {
        const topNames = topStages.map(s => s.name).join(', ');
        const weakNames = weakStages.map(s => `${s.name}(${s.score}점)`).join(', ');

        content = `
            <p style="margin-bottom: 15px; color: #333; line-height: 1.7; font-size: 11px; font-weight: 700;">
                ${topStages.length > 0 ? `${topNames} 영역(${maxScore}점)에서 긍정적인 신호를 보이고 있습니다. 이를 발판으로 ` : ''}
                ${weakStages.length > 0 && maxScore !== minScore ? `${weakNames} 영역부터 차근차근 개선해 나가면` : '모든 영역을 균형있게 발전시키면'} 단기간에 큰 성장이 가능합니다.
            </p>
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 14px; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">기초 다지기 (2주 프로그램):</strong>
                    <ul style="list-style: disc; margin: 8px 0 0 20px; padding: 0;">
                        <li style="margin-bottom: 6px; color: #555; font-size: 10px; line-height: 1.6;">매일 10-15분, 가장 기본적인 패턴 문제부터 시작</li>
                        <li style="margin-bottom: 6px; color: #555; font-size: 10px; line-height: 1.6;">정답률 80% 이상 달성 시 다음 단계로 이동</li>
                        <li style="margin-bottom: 0; color: #555; font-size: 10px; line-height: 1.6;">틀린 문제는 다음날 다시 풀어보기 (반복학습)</li>
                    </ul>
                </li>
                <li style="margin-bottom: 14px; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">핵심 유형 마스터:</strong> ${weakStages[0]?.name || '취약 영역'}에서 자주 나오는 5가지 핵심 패턴(${weakStages[0]?.name === '시각 추론' ? '회전, 대칭, 중첩, 크기 변화, 개수 규칙' :
                weakStages[0]?.name === '논리 사고' ? '조건 추론, 대소 비교, 순서 배열, 참/거짓 판단, 논리 연산' :
                    '단계적 추론, 규칙 결합, 예외 찾기, 역추론, 정보 통합'
            })을 집중 학습하세요.
                </li>
                <li style="margin-bottom: 14px; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">컨디션 관리:</strong> 두뇌 활동은 컨디션의 영향을 크게 받습니다. 충분한 수면(7-8시간), 규칙적인 운동, 스트레스 관리 후 재응시하면 10-15점 향상을 기대할 수 있습니다.
                </li>
                <li style="margin-bottom: 14px; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">학습 리소스 활용:</strong> 무료 논리 퍼즐 앱(Lumosity, Peak, Elevate), 유튜브 IQ 테스트 해설 영상, 온라인 논리 게임 등을 활용하세요.
                </li>
                <li style="margin-bottom: 0; padding-left: 22px; position: relative; line-height: 1.7; color: #444; font-size: 11px;">
                    <span style="position: absolute; left: 0; top: 7px; width: 6px; height: 6px; background: #d4af37; border-radius: 50%;"></span>
                    <strong style="color: #1a1a2e;">작은 성공 경험 쌓기:</strong> 처음에는 쉬운 문제를 빠르게 맞혀 자신감을 쌓고, 점진적으로 난이도를 높이는 전략이 효과적입니다.
                </li>
            </ul>
        `;
    }

    // 작업속도 피드백
    if (scoreResult.speedScore < 70) {
        content += `
            <div style="margin-top: 16px; padding: 14px; background: linear-gradient(135deg, rgba(255,200,100,0.08) 0%, rgba(255,200,100,0.15) 100%); border-left: 4px solid #d4af37; border-radius: 8px;">
                <strong style="color: #1a1a2e; font-size: 11px; display: block; margin-bottom: 8px;">작업 속도 개선 실전 팁</strong>
                <p style="margin: 0 0 10px 0; color: #555; font-size: 11px; line-height: 1.6;">
                    현재 작업 속도 <strong>${scoreResult.speedScore}점</strong>입니다. 속도 향상을 위한 3단계 전략:
                </p>
                <ol style="margin: 0; padding-left: 20px; color: #555; font-size: 10px; line-height: 1.7;">
                    <li style="margin-bottom: 6px;"><strong>시간 감각 훈련:</strong> 스톱워치 없이 30초, 1분을 체감으로 측정하는 연습</li>
                    <li style="margin-bottom: 6px;"><strong>선별 전략:</strong> 처음 5초 안에 쉬운 문제와 어려운 문제 구분, 쉬운 것부터 해결</li>
                    <li style="margin-bottom: 0;"><strong>단계적 시간 단축:</strong> 같은 유형 문제를 반복하며 매번 10% 시간 단축 목표 설정</li>
                </ol>
            </div>
        `;
    }

    // 메타인지 피드백
    if (scoreResult.metacognitionScore < 70) {
        content += `
            <div style="margin-top: 16px; padding: 14px; background: linear-gradient(135deg, rgba(100,150,255,0.08) 0%, rgba(100,150,255,0.15) 100%); border-left: 4px solid #5a7fc4; border-radius: 8px;">
                <strong style="color: #1a1a2e; font-size: 11px; display: block; margin-bottom: 8px;">자기 평가 정확도 향상 실전 팁</strong>
                <p style="margin: 0 0 10px 0; color: #555; font-size: 11px; line-height: 1.6;">
                    현재 자기 평가 점수 <strong>${scoreResult.metacognitionScore}점</strong>입니다. 메타인지 능력 향상 방법:
                </p>
                <ol style="margin: 0; padding-left: 20px; color: #555; font-size: 10px; line-height: 1.7;">
                    <li style="margin-bottom: 6px;"><strong>자신감 캘리브레이션:</strong> 문제마다 확신도(0-100%)를 기록하고 실제 정답률과 비교</li>
                    <li style="margin-bottom: 6px;"><strong>오답 예측 훈련:</strong> "이 문제는 틀릴 것 같다"는 느낌이 들 때 따로 표시하고 검증</li>
                    <li style="margin-bottom: 0;"><strong>복기 루틴:</strong> 테스트 직후 "몇 개 맞췄을 것 같은지" 예측하고 실제 결과와 비교 분석</li>
                </ol>
            </div>
        `;
    }

    const recommendationContent = document.getElementById('recommendationContent');
    if (recommendationContent) {
        recommendationContent.innerHTML = content;
    }
}


/* ========================================
   샘플 데이터 생성
======================================== */
function createSampleUser() {
    return {
        name: '홍길동',
        email: 'hong@example.com',
        birthYear: '1990',
        sessionId: 'session_sample_' + Date.now(),
        testNumber: 'ONT-999999' // ✅ 수험번호 추가
    };
}

function createSampleStage1() {
    return {
        stage: 1,
        correctCount: 12,
        totalQuestions: 15,
        correctRate: 80,
        totalTime: 450, // 7.5분
        avgTimePerQuestion: 30, // ✅ 문제당 평균 30초
        passed: true
    };
}

function createSampleStage2() {
    return {
        stage: 2,
        correctCount: 4,
        totalQuestions: 5,
        correctRate: 80,
        totalTime: 200, // 3.33분
        avgTimePerQuestion: 40, // ✅ 문제당 평균 40초
        passed: true
    };
}

function createSampleStage3() {
    return {
        stage: 3,
        correctCount: 3,
        totalQuestions: 5,
        correctRate: 60,
        totalTime: 225, // 3.75분
        avgTimePerQuestion: 45, // ✅ 문제당 평균 45초
        passed: true
    };
}

function createSampleMetacognition() {
    return {
        expectedCorrect: 20, // 예상 정답 수
        actualCorrect: 19,   // 실제 정답 수 (12 + 4 + 3)
        timestamp: new Date().toISOString()
    };
}

function createSampleTestSettings() {
    return {
        stage1: {
            questionCount: 15,
            baseScore: 40,
            pointPerQuestion: 4,
            timeLimit: 30 * 60, // ✅ 초 단위 (30분 = 1800초)
            minRequiredTime: 5 * 60 // ✅ 초 단위 (5분 = 300초)
        },
        stage2: {
            questionCount: 5,
            baseScore: 60,
            pointPerQuestion: 8,
            timeLimit: 10 * 60, // ✅ 초 단위 (10분 = 600초)
            minRequiredTime: 2 * 60 // ✅ 초 단위 (2분 = 120초)
        },
        stage3: {
            questionCount: 5,
            baseScore: 60,
            pointPerQuestion: 8,
            timeLimit: 10 * 60, // ✅ 초 단위 (10분 = 600초)
            minRequiredTime: 2 * 60 // ✅ 초 단위 (2분 = 120초)
        },
        upwardAdjustment: 5,
        // ✅ 작업속도 점수 계산 기준
        workSpeedThresholds: {
            excellent: 30,  // 문제당 30초 이하: 100점
            good: 45,       // 문제당 45초 이하: 90점
            normal: 60,     // 문제당 60초 이하: 80점
            slow: Infinity  // 그 외: 70점
        }
    };
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

    resultPage.classList.add('pdf-rendering');

    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;

    try {
        await new Promise(resolve => setTimeout(resolve, 150));

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

        const imgData = canvas.toDataURL('image/jpeg', 1.0);

        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: false,
            precision: 16
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');

        const certNumber = localStorage.getItem('certNumber') || Date.now();
        const fileName = `MensaKorea_BrainChallenge_Report_${certNumber}.pdf`;
        pdf.save(fileName);

        console.log('고화질 PDF 다운로드 완료:', fileName);

    } catch (err) {
        console.error('❌ PDF 생성 실패:', err);
        alert('PDF 생성 중 오류가 발생했습니다.\n다시 시도해주세요.');
    } finally {
        resultPage.classList.remove('pdf-rendering');

        if (button) {
            button.innerHTML = originalHTML;
            button.disabled = false;
        }
    }
}

/* ========================================
   공유 기능
======================================== */
function shareResult() {
    const totalScoreElem = document.getElementById('totalScore');
    const scoreRankElem = document.getElementById('scoreRank');

    if (!totalScoreElem || !scoreRankElem) {
        alert('점수 정보를 찾을 수 없습니다.');
        return;
    }

    const score = totalScoreElem.textContent.replace('점', '').trim();
    const rank = scoreRankElem.textContent;
    const text = `나의 멘사코리아 브레인 챌린지 점수는 ${score}점 (${rank})! 멘사코리아 온라인 테스트로 확인하세요!`;

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
   인쇄 기능
======================================== */
function printResult() {
    window.print();
}
