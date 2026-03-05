/* ========================================
   js/test-stage3.js
   3단계 테스트 초기화 및 문제은행
======================================== */

// ========================================
// 3단계 문제은행 (5개 샘플 문제)
// ========================================

const stage3QuestionBank = [
    {
        id: 's3_q1',
        questionImage: './image/stage3/question1.jpg',
        choices: [
            { id: 1, image: './image/stage3/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage3/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage3/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage3/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage3/q1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 's3_q2',
        questionImage: './image/stage3/question2.jpg',
        choices: [
            { id: 1, image: './image/stage3/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage3/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage3/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage3/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage3/q1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 's3_q3',
        questionImage: './image/stage3/question3.jpg',
        choices: [
            { id: 1, image: './image/stage3/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage3/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage3/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage3/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage3/q1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 's3_q4',
        questionText: '텍스트+이미지 혼합 문제 예시입니다.',
        questionImage: './image/stage3/question4.jpg',
        choices: [
            { id: 1, image: './image/stage3/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage3/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage3/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage3/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage3/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage3/q1-option6.jpg', isCorrect: false }
        ]
    },
    {
        id: 's3_q5',
        questionText: '텍스트+이미지 혼합 문제 예시입니다.',
        questionImage: './image/stage3/question5.jpg',
        choices: [
            { id: 1, image: './image/stage3/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage3/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage3/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage3/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage3/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage3/q1-option6.jpg', isCorrect: false }
        ]
    },
     // 텍스트만 있는 문제 (중앙 정렬 테스트)
    {
        id: 's3_q6',
        questionText: '서울특별시청에서 부산광역시청까지 차량 이동시 거리는 몇 km 일까요?',
        choices: [
            { id: 1, image: './image/stage3/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage3/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage3/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage3/q1-option4.jpg', isCorrect: false }
        ]
    },
    {
        id: 's3_q7',
        questionText: '2026년 기준, Republic of Korea의 인구는 약 몇 명일까요?',
        choices: [
            { id: 1, image: './image/stage3/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage3/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage3/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage3/q1-option4.jpg', isCorrect: false }
        ]
    },
    {
        id: 's3_q8',
        questionText: '3. 텍스트만 있는 문제 예시입니다.3. 텍스트만 있는 문제 예시입니다.3. 텍스트만 있는 문제 예시입니다.3. 텍스트만 있는 문제 예시입니다.3. 텍스트만 있는 문제 예시입니다.',
        choices: [
            { id: 1, image: './image/stage3/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage3/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage3/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage3/q1-option4.jpg', isCorrect: false }
        ]


    }
];

// ========================================
// 3단계 초기화
// ========================================

// ✅ testManager를 전역 변수로 선언 (단일 선언)
window.testManager = new TestManager({
    stage: 3,
    questionBank: stage3QuestionBank, // ✅ 올바른 변수명
    questionCount: 5,
    timeLimit: 10 * 60, // ✅ 3단계는 시간 제한 없음 (필요시 10*60으로 변경)
    validation: createValidation(20, 1, 10), // ✅ 정답률 20%, 평균 1초, 총 10초
    nextPage: 'payment.html' // ✅ 3단계 완료 후 결제 페이지로 이동
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ 3단계 테스트 초기화 시작');
    window.testManager.init();
});
