// ========================================
// 1단계 문제은행 (24개 문제 + 테스트용 샘플 2개)
// ========================================

const stage1QuestionBank = [
    // ✅ 이미지만 있는 문제 (1~24번)
    {
        id: 's1_q1',
        questionImage: './image/stage1/question1.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false },
            { id: 7, image: './image/stage1/q1-option7.jpg', isCorrect: false },
            { id: 8, image: './image/stage1/q1-option8.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q2',
        questionImage: './image/stage1/question2.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q3',
        questionImage: './image/stage1/question3.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false },
            { id: 7, image: './image/stage1/q1-option7.jpg', isCorrect: false },
            { id: 8, image: './image/stage1/q1-option8.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q4',
        questionImage: './image/stage1/question4.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q5',
        questionImage: './image/stage1/question5.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q6',
        questionImage: './image/stage1/question6.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false },
            { id: 7, image: './image/stage1/q1-option7.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q7',
        questionImage: './image/stage1/question7.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q8',
        questionImage: './image/stage1/question8.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false },
            { id: 7, image: './image/stage1/q1-option7.jpg', isCorrect: false },
            { id: 8, image: './image/stage1/q1-option8.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q9',
        questionImage: './image/stage1/question9.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q10',
        questionImage: './image/stage1/question10.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q11',
        questionImage: './image/stage1/question11.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false },
            { id: 7, image: './image/stage1/q1-option7.jpg', isCorrect: false },
            { id: 8, image: './image/stage1/q1-option8.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q12',
        questionImage: './image/stage1/question12.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q13',
        questionImage: './image/stage1/question13.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false },
            { id: 7, image: './image/stage1/q1-option7.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q14',
        questionImage: './image/stage1/question14.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q15',
        questionImage: './image/stage1/question15.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q16',
        questionImage: './image/stage1/question16.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false },
            { id: 7, image: './image/stage1/q1-option7.jpg', isCorrect: false },
            { id: 8, image: './image/stage1/q1-option8.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q17',
        questionImage: './image/stage1/question17.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q18',
        questionImage: './image/stage1/question18.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q19',
        questionImage: './image/stage1/question19.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false },
            { id: 7, image: './image/stage1/q1-option7.jpg', isCorrect: false },
            { id: 8, image: './image/stage1/q1-option8.jpg', isCorrect: false }
        ]
    },


    // ========================================
    // ✅ 테스트용 샘플 문제 2개
    // ========================================
    // 텍스트 + 이미지 혼합 문제 (텍스트 좌측 정렬 + 이미지 아래 표시)
    {
        id: 's1_q20',
        questionText: '텍스트+이미지 혼합 문제 예시입니다.',
        questionImage: './image/stage1/question20.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q21',
        questionText: '텍스트+이미지 혼합 문제 예시입니다.',
        questionImage: './image/stage1/question21.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q22',
        questionText: '텍스트+이미지 혼합 문제 예시입니다.',
        questionImage: './image/stage1/question22.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q23',
        questionText: '텍스트+이미지 혼합 문제 예시입니다. 텍스트+이미지 혼합 문제 예시입니다.',
        questionImage: './image/stage1/question23.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q24',
        questionText: '텍스트+이미지 혼합 문제 예시입니다. 텍스트+이미지 혼합 문제 예시입니다. 텍스트+이미지 혼합 문제 예시입니다.',
        questionImage: './image/stage1/question24.jpg',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false },
            { id: 5, image: './image/stage1/q1-option5.jpg', isCorrect: false },
            { id: 6, image: './image/stage1/q1-option6.jpg', isCorrect: false }
        ]
    },

    // 텍스트만 있는 문제
    {
        id: 's1_q25',
        questionText: '서울특별시청에서 부산광역시청까지 차량 이동시 거리는 몇 km 일까요?',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q26',
        questionText: '2026년 기준, Republic of Korea의 인구는 약 몇 명일까요?',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false }
        ]
    },
    {
        id: 's1_q27',
        questionText: '3. 텍스트만 있는 문제 예시입니다.3. 텍스트만 있는 문제 예시입니다.3. 텍스트만 있는 문제 예시입니다.3. 텍스트만 있는 문제 예시입니다.3. 텍스트만 있는 문제 예시입니다.',
        choices: [
            { id: 1, image: './image/stage1/q1-option1.jpg', isCorrect: true },
            { id: 2, image: './image/stage1/q1-option2.jpg', isCorrect: false },
            { id: 3, image: './image/stage1/q1-option3.jpg', isCorrect: false },
            { id: 4, image: './image/stage1/q1-option4.jpg', isCorrect: false }
        ]


    }
];

// ========================================
// 1단계 초기화
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    testManager = new TestManager({
        stage: 1,
        questionBank: stage1QuestionBank,
        questionCount: 15, // ✅ 15개 출제
        timeLimit: 30 * 60, // 30분
        validation: createValidation(20, 1, 15), // 정답률 20%, 평균 1초, 총 30초
        nextPage: 'test-stage2.html'
    });

    testManager.init();
});
