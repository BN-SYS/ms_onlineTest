// ========================================
// 2단계 문제은행 (5개 샘플 문제)
// ========================================

const stage2QuestionBank = [
    {
        id: 's2_q1',
        questionImage: './image/stage2/question1.jpg',
        choices: [
            { id: 1, image: './image/stage2/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage2/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage2/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage2/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage2/q1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 's2_q2',
        questionImage: './image/stage2/question2.jpg',
        choices: [
            { id: 1, image: './image/stage2/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage2/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage2/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage2/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage2/q1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 's2_q3',
        questionImage: './image/stage2/question3.jpg',
        choices: [
            { id: 1, image: './image/stage2/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage2/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage2/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage2/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage2/q1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 's2_q4',
        questionText: '텍스트+이미지 혼합 문제 예시입니다.',
        questionImage: './image/stage2/question4.jpg',
        choices: [
            { id: 1, image: './image/stage2/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage2/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage2/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage2/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage2/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage2/q1-option6.jpg', isCorrect: false }
        ]
    },
    {
        id: 's2_q5',
        questionText: '텍스트+이미지 혼합 문제 예시입니다.',
        questionImage: './image/stage2/question5.jpg',
        choices: [
            { id: 1, image: './image/stage2/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage2/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage2/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage2/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage2/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage2/q1-option6.jpg', isCorrect: false }
        ]
    },
     // 텍스트만 있는 문제 (중앙 정렬 테스트)
    {
        id: 's2_q6',
        questionText: '서울특별시청에서 부산광역시청까지 차량 이동시 거리는 몇 km 일까요?',
        choices: [
            { id: 1, image: './image/stage2/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage2/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage2/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage2/q1-option4.jpg', isCorrect: false }
        ]
    },
    {
        id: 's2_q7',
        questionText: '2026년 기준, Republic of Korea의 인구는 약 몇 명일까요?',
        choices: [
            { id: 1, image: './image/stage2/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage2/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage2/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage2/q1-option4.jpg', isCorrect: false }
        ]
    },
    {
        id: 's2_q8',
        questionText: '3. 텍스트만 있는 문제 예시입니다.3. 텍스트만 있는 문제 예시입니다.3. 텍스트만 있는 문제 예시입니다.3. 텍스트만 있는 문제 예시입니다.3. 텍스트만 있는 문제 예시입니다.',
        choices: [
            { id: 1, image: './image/stage2/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage2/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage2/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage2/q1-option4.jpg', isCorrect: false }
        ]


    }
];

// ========================================
// 2단계 초기화
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    testManager = new TestManager({
        stage: 2,
        questionBank: stage2QuestionBank,
        questionCount: 5,
        timeLimit: 10 * 60, // 10분
        validation: createValidation(20, 1, 10), // 정답률 20%, 평균 1초, 총 10초
        nextPage: 'test-stage3.html'
    });

    testManager.init();
});