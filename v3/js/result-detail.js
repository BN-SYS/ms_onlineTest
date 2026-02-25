/* ========================================
   js/result-detail.js - 개선 버전
======================================== */

document.addEventListener('DOMContentLoaded', () => {
    loadDetailResult();
});

function loadDetailResult() {
    let stage1 = JSON.parse(localStorage.getItem('stage1Result') || 'null');
    let stage2 = JSON.parse(localStorage.getItem('stage2Result') || 'null');
    let stage3 = JSON.parse(localStorage.getItem('stage3Result') || 'null');
    let userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!stage1) stage1 = createSampleStage1();
    if (!stage2) stage2 = createSampleStage2();
    if (!stage3) stage3 = createSampleStage3();
    if (!userData || Object.keys(userData).length === 0) {
        userData = createSampleUser();
    }
    
    console.log('📊 상세 결과 로드:', { stage1, stage2, stage3, userData });
    
    // 날짜 표시
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    document.getElementById('testDate').textContent = dateStr;
    
    // 개인정보 + 인증정보
    displayUserInfo(userData);
    
    // IQ 점수 계산
    const iqResult = calculateIQ(stage1, stage2, stage3, userData.birthYear);
    
    // 총 점수 표시
    document.getElementById('totalScore').textContent = iqResult.totalIQ;
    document.getElementById('percentile').textContent = iqResult.percentile;
    
    // 레벨 평가
    displayLevel(iqResult);
    
    // 단계별 점수 (백분위 포함)
    displayStages(stage1, stage2, stage3, iqResult);
    
    // 그래프 생성 (백분위 표시)
    setTimeout(() => {
        createAllCharts(iqResult);
    }, 100);
    
    // 개선 가이드
    displayRecommendation(iqResult, stage1, stage2, stage3);
}

/* ========================================
   샘플 데이터
======================================== */
function createSampleUser() {
    return {
        name: '배은아',
        email: 'bae@example.com',
        birthYear: '1986',
        sessionId: 'session_sample_' + Date.now()
    };
}

function createSampleStage1() {
    return { stage: 1, correctCount: 7, totalQuestions: 15, correctRate: 47, totalTime: 450, avgTimePerQuestion: 30 };
}

function createSampleStage2() {
    return { stage: 2, correctCount: 5, totalQuestions: 5, correctRate: 100, totalTime: 200, avgTimePerQuestion: 40 };
}

function createSampleStage3() {
    return { stage: 3, correctCount: 4, totalQuestions: 5, correctRate: 80, totalTime: 225, avgTimePerQuestion: 45 };
}

/* ========================================
   개인정보 표시 (진위확인코드 추가)
======================================== */
function displayUserInfo(userData) {
    const certNumber = `MENSA-2026-${Date.now().toString().slice(-6)}`;
    const verifyCode = generateVerifyCode(userData.sessionId || Date.now().toString());

    document.getElementById('userName').textContent = userData.name || '홍길동';
    document.getElementById('userBirth').textContent = (userData.birthYear || '1995') + '년생';
    document.getElementById('certNumber').textContent = certNumber;
    document.getElementById('verifyCode').textContent = verifyCode; // ✅ 추가
}

function generateVerifyCode(sessionId) {
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
        const char = sessionId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const code = Math.abs(hash).toString(16).toUpperCase().slice(0, 8);
    return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
}

/* ========================================
   IQ 계산
======================================== */
function calculateIQ(stage1, stage2, stage3, birthYear) {
    const totalCorrect = stage1.correctCount + stage2.correctCount + stage3.correctCount;
    const totalQuestions = stage1.totalQuestions + stage2.totalQuestions + stage3.totalQuestions;
    const correctRate = (totalCorrect / totalQuestions) * 100;
    
    const baseIQ = 100;
    const deviation = (correctRate - 50) * 0.6;
    const totalIQ = Math.round(baseIQ + deviation);
    const percentile = calculatePercentile(totalIQ);
    
    return {
        totalIQ: totalIQ,
        percentile: percentile,
        correctRate: correctRate.toFixed(1),
        stage1IQ: Math.round(100 + (stage1.correctRate - 50) * 0.6),
        stage2IQ: Math.round(100 + (stage2.correctRate - 50) * 0.6),
        stage3IQ: Math.round(100 + (stage3.correctRate - 50) * 0.6),
        stage1Percentile: calculatePercentile(Math.round(100 + (stage1.correctRate - 50) * 0.6)),
        stage2Percentile: calculatePercentile(Math.round(100 + (stage2.correctRate - 50) * 0.6)),
        stage3Percentile: calculatePercentile(Math.round(100 + (stage3.correctRate - 50) * 0.6))
    };
}

function calculatePercentile(iqScore) {
    if (iqScore >= 145) return 0.1;
    if (iqScore >= 140) return 0.5;
    if (iqScore >= 135) return 1;
    if (iqScore >= 130) return 2;
    if (iqScore >= 125) return 5;
    if (iqScore >= 120) return 10;
    if (iqScore >= 115) return 15;
    if (iqScore >= 110) return 25;
    if (iqScore >= 100) return 50;
    if (iqScore >= 90) return 75;
    return 90;
}

/* ========================================
   레벨 평가 표시
======================================== */
function displayLevel(iqResult) {
    let level = '';
    let description = '';

    if (iqResult.totalIQ >= 140) {
        level = '🏆 천재 수준';
        description = '일반적인 인지 능력을 가지고 있으며, 꾸준한 노력을 통해 목표를 달성할 수 있습니다.';
    } else if (iqResult.totalIQ >= 130) {
        level = '🎯 매우 우수';
        description = '상위 2% 이내로 멘사 가입 자격을 충족합니다. 논리적 사고와 패턴 인식이 뛰어납니다.';
    } else if (iqResult.totalIQ >= 120) {
        level = '✨ 우수';
        description = '상위 10% 수준으로 평균보다 높은 인지 능력을 보유하고 있습니다.';
    } else if (iqResult.totalIQ >= 110) {
        level = '👍 평균 상';
        description = '평균보다 높은 인지 능력을 가지고 있습니다.';
    } else if (iqResult.totalIQ >= 90) {
        level = '💪 평균';
        description = '일반적인 인지 능력을 가지고 있으며, 꾸준한 노력을 통해 목표를 달성할 수 있습니다. ';
    } else {
        level = '🌱 평균 하';
        description = '충분한 휴식 후 재도전을 권장합니다.';
    }

    document.getElementById('levelBox').innerHTML = `
        <h4>${level}</h4>
        <p>${description}</p>
    `;
}

/* ========================================
   단계별 점수 표시 (백분위 추가)
======================================== */
function displayStages(s1, s2, s3, iqResult) {
    const stages = [
        { 
            title: '시각 추론', 
            correct: s1.correctCount, 
            total: s1.totalQuestions, 
            rate: s1.correctRate,
            percentile: iqResult.stage1Percentile
        },
        { 
            title: '논리 사고', 
            correct: s2.correctCount, 
            total: s2.totalQuestions, 
            rate: s2.correctRate,
            percentile: iqResult.stage2Percentile
        },
        { 
            title: '지식 응용', 
            correct: s3.correctCount, 
            total: s3.totalQuestions, 
            rate: s3.correctRate,
            percentile: iqResult.stage3Percentile
        }
    ];

    document.getElementById('stagesGrid').innerHTML = stages.map(s => `
        <div class="stage-item">
            <h5>${s.title}</h5>
            <div class="stage-score">${s.correct}/${s.total}</div>
            <div class="stage-rate">정답률 ${s.rate.toFixed(0)}%</div>
            <div class="stage-percentile">상위 ${s.percentile}%</div>
        </div>
    `).join('');
}

/* ========================================
   정규분포 데이터 생성
======================================== */
function generateNormalDistribution(mean, stdDev, points = 80) {
    const data = [];
    const start = mean - 4 * stdDev;
    const end = mean + 4 * stdDev;
    const step = (end - start) / points;
    
    for (let x = start; x <= end; x += step) {
        const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
        const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
        data.push({ x: Math.round(x * 10) / 10, y: y });
    }
    
    return data;
}

/* ========================================
   Chart.js 그래프 생성 (백분위 표시)
======================================== */
function createCompactChart(canvasId, userScore, percentile, mean = 100, stdDev = 15) {
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
                tooltip: { enabled: false }
            },
            scales: {
                x: {
                    type: 'linear',
                    display: true,
                    ticks: {
                        stepSize: stdDev,
                        callback: v => Math.round(v),
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
function createAllCharts(iqResult) {
    // 각 그래프에 백분위 표시
    createCompactChart('totalChart', iqResult.totalIQ, iqResult.percentile);
    createCompactChart('stage1Chart', iqResult.stage1IQ, iqResult.stage1Percentile);
    createCompactChart('stage2Chart', iqResult.stage2IQ, iqResult.stage2Percentile);
    createCompactChart('stage3Chart', iqResult.stage3IQ, iqResult.stage3Percentile);
    
    // 백분위 텍스트 추가
    addPercentileLabels(iqResult);
}

function addPercentileLabels(iqResult) {
    const labels = [
        { id: 'totalChart', percentile: iqResult.percentile },
        { id: 'stage1Chart', percentile: iqResult.stage1Percentile },
        { id: 'stage2Chart', percentile: iqResult.stage2Percentile },
        { id: 'stage3Chart', percentile: iqResult.stage3Percentile }
    ];
    
    labels.forEach(label => {
        const chartBox = document.getElementById(label.id)?.closest('.chart-box');
        if (chartBox) {
            const existingLabel = chartBox.querySelector('.chart-percentile');
            if (!existingLabel) {
                const percentileLabel = document.createElement('p');
                percentileLabel.className = 'chart-percentile';
                percentileLabel.textContent = `상위 ${label.percentile}%`;
                chartBox.appendChild(percentileLabel);
            }
        }
    });
}

/* ========================================
   개선 가이드
======================================== */
function displayRecommendation(iqResult, stage1, stage2, stage3) {
    const stages = [
        { name: '시각 추론', rate: stage1.correctRate },
        { name: '논리 사고', rate: stage2.correctRate },
        { name: '지식 응용', rate: stage3.correctRate }
    ];

    const weakest = stages.reduce((min, s) => s.rate < min.rate ? s : min);
    const strongest = stages.reduce((max, s) => s.rate > max.rate ? s : max);

    let content = '';

    if (iqResult.totalIQ >= 130) {
        content = `
            <h4>🎯 멘사 가입 준비 가이드</h4>
            <ul>
                <li>공식 멘사 테스트를 통해 정식 회원 자격을 취득하실 것을 권장합니다.</li>
                <li>${strongest.name} 영역이 강점입니다. 전문 분야 개발을 추천합니다.</li>
                <li>고난도 논리 퍼즐과 수학 문제로 지속적인 두뇌 훈련을 하세요.</li>
            </ul>
        `;
    } else if (iqResult.totalIQ >= 120) {
        content = `
            <h4>✨ 실력 향상 가이드</h4>
            <ul>
                <li>${strongest.name}이 강점입니다. 이 영역을 더욱 발전시키세요.</li>
                <li>${weakest.name} 영역 집중 훈련으로 균형잡힌 능력을 개발하세요.</li>
                <li>다양한 유형의 문제를 풀며 패턴 인식 능력을 향상시키세요.</li>
            </ul>
        `;
    } else {
        content = `
            <h4>💪 학습 가이드</h4>
            <ul>
                <li>${weakest.name} 영역 보강을 통해 전체 점수를 향상시킬 수 있습니다.</li>
                <li>기본적인 논리 훈련과 패턴 학습을 꾸준히 진행하세요.</li>
                <li>충분한 휴식 후 재도전하시면 더 좋은 결과를 얻을 수 있습니다.</li>
                <li>충분한 휴식 후 재도전하시면 더 좋은 결과를 얻을 수 있습니다.</li>
                <li>충분한 휴식 후 재도전하시면 더 좋은 결과를 얻을 수 있습니다.</li>
                <li>충분한 휴식 후 재도전하시면 더 좋은 결과를 얻을 수 있습니다.</li>
                <li>충분한 휴식 후 재도전하시면 더 좋은 결과를 얻을 수 있습니다.</li>
                <li>충분한 휴식 후 재도전하시면 더 좋은 결과를 얻을 수 있습니다.</li>
            </ul>
        `;
    }

    content += `
        <div class="stage-summary">
            <div><strong>강점 영역:</strong> ${strongest.name} (${strongest.rate.toFixed(0)}%)</div>
            <div><strong>보완 영역:</strong> ${weakest.name} (${weakest.rate.toFixed(0)}%)</div>
        </div>
    `;

    document.getElementById('recommendationContent').innerHTML = content;
}

/* ========================================
   PDF 다운로드
======================================== */
function downloadPDF() {
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        alert('📄 PDF 라이브러리를 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
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
        pdf.save(`Mensa-Style_Cognitive_Test_Result_${Date.now()}.pdf`);
        
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
    const iqScore = document.getElementById('totalScore').textContent;
    const percentile = document.getElementById('percentile').textContent;
    const text = `나의 IQ는 ${iqScore}점! (상위 ${percentile}%) 멘사 온라인 테스트로 확인하세요!`;
    
    if (navigator.share) {
        navigator.share({ title: '멘사 IQ 테스트 결과', text: text, url: window.location.origin })
            .catch(err => console.log('공유 취소'));
    } else {
        navigator.clipboard.writeText(text + '\n' + window.location.origin)
            .then(() => alert('📋 클립보드에 복사되었습니다!'))
            .catch(() => alert('❌ 복사 실패'));
    }
}

function printResult() {
    window.print();
}
