// 가상 문제 데이터
let questionsDB = [
    {
        id: 1,
        questionNumber: 1,
        questionImage: '/image/question1.jpg',
        choices: [
            { id: 1, image: 'https://via.placeholder.com/150?text=A', isCorrect: true },
            { id: 2, image: 'https://via.placeholder.com/150?text=B', isCorrect: false },
            { id: 3, image: 'https://via.placeholder.com/150?text=C', isCorrect: false },
            { id: 4, image: 'https://via.placeholder.com/150?text=D', isCorrect: false },
            { id: 5, image: 'https://via.placeholder.com/150?text=E', isCorrect: false },
            { id: 6, image: 'https://via.placeholder.com/150?text=F', isCorrect: false }
        ]
    },
    {
        id: 2,
        questionNumber: 2,
        questionImage: '/image/question1.jpg',
        choices: [
            { id: 1, image: 'https://via.placeholder.com/150?text=A', isCorrect: false },
            { id: 2, image: 'https://via.placeholder.com/150?text=B', isCorrect: true },
            { id: 3, image: 'https://via.placeholder.com/150?text=C', isCorrect: false },
            { id: 4, image: 'https://via.placeholder.com/150?text=D', isCorrect: false }
        ]
    }
];

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    renderQuestions();
    setupEventListeners();
});

// 이벤트 설정
function setupEventListeners() {
    document.getElementById('questionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveQuestion();
    });
}

// 문제 렌더링
function renderQuestions() {
    const tbody = document.getElementById('questionsTableBody');
    tbody.innerHTML = questionsDB.map(q => {
        const correctChoice = q.choices.find(c => c.isCorrect);
        const correctIndex = q.choices.indexOf(correctChoice) + 1;
        
        return `
            <tr>
                <td>${q.questionNumber}</td>
                <td>
                    <img src="${q.questionImage}" alt="문제 ${q.questionNumber}" style="max-width: 150px; border-radius: 6px;">
                </td>
                <td>${q.choices.length}개</td>
                <td>보기 ${correctIndex}</td>
                <td>
                    <button class="btn-secondary" style="padding: 5px 15px; font-size: 0.9rem; margin-right: 5px;" onclick="editQuestion(${q.id})">수정</button>
                    <button class="btn-danger" style="padding: 5px 15px; font-size: 0.9rem;" onclick="deleteQuestion(${q.id})">삭제</button>
                </td>
            </tr>
        `;
    }).join('');
}

// 문제 모달 열기
function openQuestionModal() {
    document.getElementById('questionModal').classList.add('active');
}

function closeQuestionModal() {
    document.getElementById('questionModal').classList.remove('active');
    document.getElementById('questionForm').reset();
}

// 문제 저장
function saveQuestion() {
    const formData = new FormData(document.getElementById('questionForm'));
    
    // 파일 읽기는 실제로는 서버에서 처리
    // 프로토타입에서는 더미 데이터로 대체
    
    const questionNumber = parseInt(formData.get('questionNumber'));
    const correctAnswer = parseInt(formData.get('correctAnswer'));
    
    // 보기 생성
    const choices = [];
    for (let i = 1; i <= 8; i++) {
        const file = formData.get(`choice${i}`);
        if (file && file.size > 0) {
            choices.push({
                id: i,
                image: `https://via.placeholder.com/150?text=Choice+${i}`,
                isCorrect: i === correctAnswer
            });
        }
    }
    
    if (choices.length === 0) {
        alert('최소 1개 이상의 보기를 등록해주세요.');
        return;
    }
    
    const newQuestion = {
        id: Date.now(),
        questionNumber: questionNumber,
        questionImage: 'https://via.placeholder.com/600x400?text=New+Question',
        choices: choices
    };
    
    questionsDB.push(newQuestion);
    renderQuestions();
    closeQuestionModal();
    alert('문제가 등록되었습니다.');
}

// 문제 삭제
function deleteQuestion(id) {
    if (confirm('정말 삭제하시겠습니까?')) {
        questionsDB = questionsDB.filter(q => q.id !== id);
        renderQuestions();
    }
}

// 문제 수정
function editQuestion(id) {
    alert('수정 기능은 프로토타입에서 생략되었습니다.');
}
