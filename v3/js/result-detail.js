/* ========================================
   js/result-detail.js - 점수 체계로 변경
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
    
    if (!stage1) stage1 = createSampleStage1();
    if (!stage2) stage2 = createSampleStage2();
    if (!stage3) stage3 = createSampleStage3();
    if (!userData || Object.keys(userData).length === 0) {
        userData = createSampleUser();
    }
    if (!testSettings) {
        testSettings = createSampleTestSettings();
    }
    
    console.log('📊 상세 결과 로드:', { stage1, stage2, stage3, userData, testSettings });
    
    // 날짜 표시
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    document.getElementById('testDate').textContent = dateStr;
    
    // 개인정보 + 인증정보
    displayUserInfo(userData, certNumber, verifyCode);
    
    // 점수 계산 (scoreResult가 없으면 재계산)
    if (!scoreResult) {
        scoreResult = calculateScore(stage1, stage2, stage3, userData.birthYear, testSettings);
    }
    
    // 총 점수 표시
    document.getElementById('totalScore').textContent = scoreResult.totalScore + '점';
    document.getElementById('percentile').textContent = scoreResult.percentile;
    
    // 레벨 평가
    displayLevel(scoreResult);
    
    // 단계별 점수 (백분위 포함)
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

/* ========================================
   개인정보 표시 (진위확인코드 추가)
======================================== */
function displayUserInfo(userData, certNumber, verifyCode) {
    // certNumber와 verifyCode가 없으면 생성
    if (!certNumber) {
        const now = new Date();
        certNumber = `MS-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;
    }
    if (!verifyCode) {
        verifyCode = generateVerifyCode(userData.sessionId || Date.now().toString());
    }

    document.getElementById('userName').textContent = userData.name || '홍길동';
    document.getElementById('userBirth').textContent = (userData.birthYear || '1990') + '년생';
    document.getElementById('certNumber').textContent = certNumber;
    
    const verifyCodeElem = document.getElementById('verifyCode');
    if (verifyCodeElem) {
        verifyCodeElem.textContent = verifyCode;
    }
    
    console.log('사용자 정보 표시:', { certNumber, verifyCode });
}

function generateVerifyCode(input) {
    if (!input || input.length === 0) {
        input = Date.now().toString() + Math.random().toString();
    }
    
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    const hexCode = Math.abs(hash).toString(16).toUpperCase();
    const paddedCode = hexCode.padStart(8, '0').slice(0, 8);
    const verifyCode = `${paddedCode.slice(0, 4)}-${paddedCode.slice(4, 8)}`;
    
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

function calculateStageScore(correctCount, baseScore, pointPerQuestion, ageAdjustment) {
    const rawScore = baseScore + (correctCount * pointPerQuestion) + ageAdjustment;
    const finalScore = Math.min(100, rawScore);
    
    return finalScore;
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
   단계별 점수 표시 (백분위 추가)
======================================== */
function displayStages(s1, s2, s3, scoreResult) {
    const stages = [
        { 
            title: '1단계: 시각 추론', 
            correct: s1.correctCount, 
            total: s1.totalQuestions, 
            rate: s1.correctRate,
            score: scoreResult.stage1Score,
            percentile: scoreResult.stage1Percentile
        },
        { 
            title: '2단계: 논리 사고', 
            correct: s2.correctCount, 
            total: s2.totalQuestions, 
            rate: s2.correctRate,
            score: scoreResult.stage2Score,
            percentile: scoreResult.stage2Percentile
        },
        { 
            title: '3단계: 지식 응용', 
            correct: s3.correctCount, 
            total: s3.totalQuestions, 
            rate: s3.correctRate,
            score: scoreResult.stage3Score,
            percentile: scoreResult.stage3Percentile
        }
    ];

    document.getElementById('stagesGrid').innerHTML = stages.map(s => `
        <div class="stage-item">
            <h5>${s.title}</h5>
            <div class="stage-score">${s.score}점</div>
            <div class="stage-detail">${s.correct}/${s.total} 정답 (${s.rate.toFixed(0)}%)</div>
            <div class="stage-percentile">${s.percentile}</div>
        </div>
    `).join('');
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
   Chart.js 그래프 생성 (100점 만점 기준)
======================================== */
function createCompactChart(canvasId, userScore, percentile, mean = 70, stdDev = 12) {
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
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.15)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 2
                },
                {
                    data: [{ x: userScore, y: 0 }, { x: userScore, y: userY }],
                    borderColor: 'rgba(237, 100, 166, 1)',
                    backgroundColor: 'rgba(237, 100, 166, 1)',
                    borderWidth: 2.5,
                    pointRadius: 4,
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
                        font: { size: 9 }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
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
   모든 그래프 생성 (백분위 포함)
======================================== */
function createAllCharts(scoreResult) {
    // 각 그래프에 백분위 표시
    createCompactChart('totalChart', scoreResult.totalScore, scoreResult.percentile);
    createCompactChart('stage1Chart', scoreResult.stage1Score, scoreResult.stage1Percentile);
    createCompactChart('stage2Chart', scoreResult.stage2Score, scoreResult.stage2Percentile);
    createCompactChart('stage3Chart', scoreResult.stage3Score, scoreResult.stage3Percentile);
    
    // 백분위 텍스트 추가
    addPercentileLabels(scoreResult);
}

function addPercentileLabels(scoreResult) {
    const labels = [
        { id: 'totalChart', percentile: scoreResult.percentile, score: scoreResult.totalScore },
        { id: 'stage1Chart', percentile: scoreResult.stage1Percentile, score: scoreResult.stage1Score },
        { id: 'stage2Chart', percentile: scoreResult.stage2Percentile, score: scoreResult.stage2Score },
        { id: 'stage3Chart', percentile: scoreResult.stage3Percentile, score: scoreResult.stage3Score }
    ];
    
    labels.forEach(label => {
        const chartBox = document.getElementById(label.id)?.closest('.chart-box');
        if (chartBox) {
            const existingLabel = chartBox.querySelector('.chart-percentile');
            if (!existingLabel) {
                const percentileLabel = document.createElement('p');
                percentileLabel.className = 'chart-percentile';
                percentileLabel.style.cssText = 'text-align: center; margin-top: 10px; font-weight: 600; color: #667eea;';
                percentileLabel.textContent = `${label.score}점 (${label.percentile})`;
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
                <li>공식 멘사 테스트를 통해 정식 회원 자격을 취득하실 것을 권장합니다.</li>
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

    content += `
        <div class="stage-summary" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div style="margin-bottom: 8px;"><strong>강점 영역:</strong> ${strongest.name} - ${strongest.score}점 (정답률 ${strongest.rate.toFixed(0)}%)</div>
            <div><strong>보완 영역:</strong> ${weakest.name} - ${weakest.score}점 (정답률 ${weakest.rate.toFixed(0)}%)</div>
        </div>
    `;

    document.getElementById('recommendationContent').innerHTML = content;
}

/* ========================================
   PDF 다운로드
======================================== */
function downloadPDF() {
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        alert('PDF 라이브러리를 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    const button = event.target.closest('.action-btn');
    const originalHTML = button.innerHTML;
    button.innerHTML = '<span>⏳</span> 생성 중...';
    button.disabled = true;

    const resultPage = document.getElementById('resultPage');
    resultPage.classList.add('pdf-rendering');

    html2canvas(resultPage, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        
        const now = new Date();
        const fileName = `Mensa_Test_Result_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.pdf`;
        pdf.save(fileName);
        
        resultPage.classList.remove('pdf-rendering');
        button.innerHTML = originalHTML;
        button.disabled = false;
    }).catch(error => {
        console.error('PDF 생성 실패:', error);
        alert('PDF 생성 중 오류가 발생했습니다.');
        resultPage.classList.remove('pdf-rendering');
        button.innerHTML = originalHTML;
        button.disabled = false;
    });
}

/* ========================================
   공유/인쇄
======================================== */
function shareResult() {
    const score = document.getElementById('totalScore').textContent;
    const percentile = document.getElementById('percentile').textContent;
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

function printResult() {
    window.print();
}
