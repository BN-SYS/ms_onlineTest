// 가상 문제 데이터 - 실제 이미지 경로 사용
const questionsData = [
    {
        id: 1,
        questionImage: '/image/question1.jpg',
        choices: [
            { id: 1, image: '/image/question1-option1.jpg', isCorrect: true },
            { id: 2, image: '/image/question1-option2.jpg', isCorrect: false },
            { id: 3, image: '/image/question1-option3.jpg', isCorrect: false },
            { id: 4, image: '/image/question1-option4.jpg', isCorrect: false },
            { id: 5, image: '/image/question1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 2,
        questionImage: '/image/question2.jpg',
        choices: [
            { id: 1, image: '/image/question1-option1.jpg', isCorrect: true },
            { id: 2, image: '/image/question1-option2.jpg', isCorrect: false },
            { id: 3, image: '/image/question1-option3.jpg', isCorrect: false },
            { id: 4, image: '/image/question1-option4.jpg', isCorrect: false },
            { id: 5, image: '/image/question1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 3,
        questionImage: '/image/question3.jpg',
        choices: [
            { id: 1, image: '/image/question1-option1.jpg', isCorrect: true },
            { id: 2, image: '/image/question1-option2.jpg', isCorrect: false },
            { id: 3, image: '/image/question1-option3.jpg', isCorrect: false },
            { id: 4, image: '/image/question1-option4.jpg', isCorrect: false },
            { id: 5, image: '/image/question1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 4,
        questionImage: '/image/question4.jpg',
        choices: [
            { id: 1, image: '/image/question1-option1.jpg', isCorrect: true },
            { id: 2, image: '/image/question1-option2.jpg', isCorrect: false },
            { id: 3, image: '/image/question1-option3.jpg', isCorrect: false },
            { id: 4, image: '/image/question1-option4.jpg', isCorrect: false }
        ]
    },
    {
        id: 5,
        questionImage: '/image/question5.jpg',
        choices: [
            { id: 1, image: '/image/question1-option1.jpg', isCorrect: true },
            { id: 2, image: '/image/question1-option2.jpg', isCorrect: false },
            { id: 3, image: '/image/question1-option3.jpg', isCorrect: false },
            { id: 4, image: '/image/question1-option4.jpg', isCorrect: false },
            { id: 5, image: '/image/question1-option5.jpg', isCorrect: false },
            { id: 6, image: '/image/question1-option1.jpg', isCorrect: false },
            { id: 7, image: '/image/question1-option2.jpg', isCorrect: false },
            { id: 8, image: '/image/question1-option3.jpg', isCorrect: false }
        ]
    }
    // 추가 문제들도 같은 패턴으로 작성
];

// 전역 변수
let currentQuestionIndex = 0;
let userAnswers = [];
let startTime = Date.now();
let timerInterval;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('totalQuestions').textContent = questionsData.length;
    loadQuestion(0);
    startTimer();
});

// 문제 로드
function loadQuestion(index) {
    const question = questionsData[index];
    
    // 문제 이미지
    const questionImg = document.getElementById('questionImg');
    questionImg.src = question.questionImage;
    
    // 이미지 로드 에러 처리
    questionImg.onerror = function() {
        this.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
        console.error(`이미지를 불러올 수 없습니다: ${question.questionImage}`);
    };
    
    // 현재 문제 번호
    document.getElementById('currentQuestion').textContent = index + 1;
    
    // 진행바
    const progress = ((index + 1) / questionsData.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // 보기 랜덤 섞기
    const shuffledChoices = [...question.choices].sort(() => Math.random() - 0.5);
    
    // 보기 렌더링
    const choicesGrid = document.getElementById('choicesGrid');
    choicesGrid.innerHTML = shuffledChoices.map((choice, idx) => {
        // 사용자가 이미 선택한 답인지 확인 (원본 ID 기준)
        const isSelected = userAnswers[index] === choice.id;
        
        return `
            <div class="choice-item ${isSelected ? 'selected' : ''}" 
                 onclick="selectChoice(${choice.id})"
                 data-choice-id="${choice.id}">
                <img src="${choice.image}" 
                     alt="보기 ${idx + 1}"
                     onerror="this.src='https://via.placeholder.com/150?text=Option+${idx+1}'">
            </div>
        `;
    }).join('');
    
    // 버튼 상태
    document.getElementById('prevBtn').style.display = index === 0 ? 'none' : 'block';
    document.getElementById('nextBtn').style.display = index === questionsData.length - 1 ? 'none' : 'block';
    document.getElementById('submitBtn').style.display = index === questionsData.length - 1 ? 'block' : 'none';
}

// 보기 선택 - 자동 다음 문제 이동
function selectChoice(choiceId) {
    // 답안 저장
    userAnswers[currentQuestionIndex] = choiceId;
    
    // 선택 효과 표시
    const choiceItems = document.querySelectorAll('.choice-item');
    choiceItems.forEach(item => {
        if (parseInt(item.dataset.choiceId) === choiceId) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    // 마지막 문제인지 확인
    if (currentQuestionIndex === questionsData.length - 1) {
        // 마지막 문제면 자동 제출 안내
        setTimeout(() => {
            if (confirm('마지막 문제입니다. 테스트를 제출하시겠습니까?')) {
                submitTest();
            }
        }, 300);
    } else {
        // 다음 문제로 자동 이동 (0.5초 딜레이)
        setTimeout(() => {
            currentQuestionIndex++;
            loadQuestion(currentQuestionIndex);
        }, 100);
    }
}

// 다음 문제 (이전/다음 버튼용)
function goToNextQuestion() {
    if (!userAnswers[currentQuestionIndex]) {
        alert('답을 선택해주세요.');
        return;
    }
    
    if (currentQuestionIndex < questionsData.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    }
}

// 이전 문제
function goToPrevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
}

// 타이머
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        document.getElementById('timeDisplay').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// 제출
function submitTest() {
    if (userAnswers.length < questionsData.length) {
        if (!confirm('아직 풀지 않은 문제가 있습니다. 제출하시겠습니까?')) {
            return;
        }
    }
    
    clearInterval(timerInterval);
    
    // 채점
    let correctCount = 0;
    questionsData.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctChoice = question.choices.find(c => c.isCorrect);
        if (userAnswer === correctChoice.id) {
            correctCount++;
        }
    });
    
    // 결과 데이터 저장
    const testResult = {
        correctCount: correctCount,
        totalQuestions: questionsData.length,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
        answers: userAnswers
    };
    
    localStorage.setItem('testResult', JSON.stringify(testResult));
    
    // 결과 페이지로 이동
    location.href = 'result.html';
}