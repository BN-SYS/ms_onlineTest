// ========================================
// 3단계 문제은행 (5개 샘플 문제)
// ========================================

const stage3QuestionBank = [
    {
        id: 's3_q1',
        questionImage: './image/stage3/question1.jpg',
        choices: [
            { id: 1, image: './image/stage2/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage2/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage2/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage2/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage2/q1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 's3_q2',
        questionImage: './image/stage3/question1.jpg',
        choices: [
            { id: 1, image: './image/stage2/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage2/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage2/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage2/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage2/q1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 's3_q3',
        questionImage: './image/stage3/question1.jpg',
        choices: [
            { id: 1, image: './image/stage2/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage2/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage2/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage2/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage2/q1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 's3_q4',
        questionImage: './image/stage3/question1.jpg',
        choices: [
            { id: 1, image: './image/stage2/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage2/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage2/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage2/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage2/q1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 's3_q5',
        questionImage: './image/stage3/question1.jpg',
        choices: [
            { id: 1, image: './image/stage2/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage2/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage2/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage2/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage2/q1-option5.jpg', isCorrect: false }
        ]
    }
];

// ========================================
// 3단계 초기화
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    testManager = new TestManager({
        stage: 3,
        questionBank: stage3QuestionBank,
        questionCount: 5,
        timeLimit: 10 * 60, // 10분
        validation: createValidation(20, 2, 10), // 정답률 20%, 평균 2초, 총 10초
        nextPage: 'payment.html'
    });

    testManager.init();
});