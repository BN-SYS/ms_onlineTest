/* ========================================
   문제 목록 스크립트
   js/admin-questions.js
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
  loadQuestions();
});

// 문제 목록 로드
async function loadQuestions() {
  try {
    // const questions = await apiCall('/questions');
    
    // 샘플 데이터
    const questions = [
      {
        id: 1,
        stage: 1,
        questionImage: '../image/q1.jpg',
        choiceCount: 4,
        correctAnswer: 2,
        attemptCount: 245,
        correctRate: 68.5,
        createdAt: '2026-02-20'
      },
      {
        id: 2,
        stage: 1,
        questionImage: '../image/q2.jpg',
        choiceCount: 5,
        correctAnswer: 3,
        attemptCount: 189,
        correctRate: 54.2,
        createdAt: '2026-02-19'
      },
      {
        id: 3,
        stage: 2,
        questionImage: '../image/q3.jpg',
        choiceCount: 6,
        correctAnswer: 4,
        attemptCount: 102,
        correctRate: 42.1,
        createdAt: '2026-02-18'
      }
    ];
    
    renderQuestions(questions);
    
  } catch (error) {
    console.error('문제 목록 로드 실패:', error);
  }
}

// 문제 목록 렌더링
function renderQuestions(questions) {
  const tbody = document.getElementById('questionList');
  tbody.innerHTML = '';
  
  if (questions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">등록된 문제가 없습니다.</td></tr>';
    return;
  }
  
  questions.forEach(q => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${q.id}</strong></td>
      <td><span class="badge badge-primary">${q.stage}단계</span></td>
      <td><img src="${q.questionImage}" alt="문제" style="width:80px; height:auto; border-radius:6px;" /></td>
      <td>${q.choiceCount}개</td>
      <td>${q.correctAnswer}번</td>
      <td>${formatNumber(q.attemptCount)}</td>
      <td><strong>${q.correctRate}%</strong></td>
      <td>${q.createdAt}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editQuestion(${q.id})">수정</button>
        <button class="btn btn-sm btn-danger" onclick="deleteQuestion(${q.id})">삭제</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 문제 수정
function editQuestion(id) {
  location.href = `question-form.html?id=${id}`;
}

// 문제 삭제
async function deleteQuestion(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  
  try {
    await apiCall(`/questions/${id}`, 'DELETE');
    alert('삭제되었습니다.');
    loadQuestions();
  } catch (error) {
    console.error('삭제 실패:', error);
  }
}

// 필터링
function filterQuestions() {
  const stage = document.getElementById('stageFilter').value;
  const search = document.getElementById('searchInput').value;
  
  console.log('필터:', stage, search);
  // 실제로는 API 호출 시 파라미터로 전달
  loadQuestions();
}
