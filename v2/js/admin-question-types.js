/* ========================================
   문제 유형 관리 스크립트
   js/admin-question-types.js
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
  loadQuestionTypes();
  
  // 폼 제출
  document.getElementById('typeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveQuestionType();
  });
});

// 유형 목록 로드
async function loadQuestionTypes() {
  try {
    // 실제로는 API 호출: const types = await apiCall('/question-types');
    
    // 샘플 데이터
    const types = [
      {
        id: 1,
        name: '1단계 - 기본 패턴',
        stageOrder: 1,
        difficulty: 'easy',
        questionCount: 15,
        timeLimit: 30,
        minCorrectRate: 20,
        minAvgTime: 30,
        allowRetry: true,
        showTimer: true,
        status: 'active',
        description: '기본적인 패턴 인식 문제'
      },
      {
        id: 2,
        name: '2단계 - 고급 패턴',
        stageOrder: 2,
        difficulty: 'medium',
        questionCount: 5,
        timeLimit: 0,
        minCorrectRate: 20,
        minAvgTime: 30,
        allowRetry: true,
        showTimer: false,
        status: 'active',
        description: '고급 패턴 인식 및 논리 추론'
      },
      {
        id: 3,
        name: '3단계 - 복합 패턴',
        stageOrder: 3,
        difficulty: 'hard',
        questionCount: 5,
        timeLimit: 0,
        minCorrectRate: 20,
        minAvgTime: 30,
        allowRetry: true,
        showTimer: false,
        status: 'active',
        description: '복합적인 논리 및 공간 추론'
      },
      {
        id: 4,
        name: '보너스 단계',
        stageOrder: 4,
        difficulty: 'expert',
        questionCount: 3,
        timeLimit: 15,
        minCorrectRate: 30,
        minAvgTime: 60,
        allowRetry: false,
        showTimer: true,
        status: 'preparing',
        description: '최고난이도 도전 문제 (준비중)'
      }
    ];
    
    renderQuestionTypes(types);
    
  } catch (error) {
    console.error('유형 목록 로드 실패:', error);
  }
}

// 유형 목록 렌더링
function renderQuestionTypes(types) {
  const tbody = document.getElementById('typeList');
  tbody.innerHTML = '';
  
  if (types.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center">등록된 유형이 없습니다.</td></tr>';
    document.getElementById('typeCount').textContent = '총 0개';
    return;
  }
  
  document.getElementById('typeCount').textContent = `총 ${types.length}개`;
  
  // 순서대로 정렬
  types.sort((a, b) => a.stageOrder - b.stageOrder);
  
  types.forEach(type => {
    const tr = document.createElement('tr');
    
    // 난이도 배지 색상
    const difficultyBadge = {
      'easy': 'badge-success',
      'medium': 'badge-warning',
      'hard': 'badge-danger',
      'expert': 'badge-primary'
    }[type.difficulty] || 'badge-secondary';
    
    // 난이도 텍스트
    const difficultyText = {
      'easy': '쉬움',
      'medium': '보통',
      'hard': '어려움',
      'expert': '최고'
    }[type.difficulty] || type.difficulty;
    
    // 상태 배지 색상
    const statusBadge = {
      'active': 'badge-success',
      'inactive': 'badge-secondary',
      'preparing': 'badge-warning'
    }[type.status] || 'badge-secondary';
    
    // 상태 텍스트
    const statusText = {
      'active': '활성',
      'inactive': '비활성',
      'preparing': '준비중'
    }[type.status] || type.status;
    
    tr.innerHTML = `
      <td style="text-align:center;"><strong>${type.stageOrder}</strong></td>
      <td>
        <strong>${type.name}</strong><br/>
        <small style="color:#6c757d;">${type.description || '-'}</small>
      </td>
      <td><span class="badge ${difficultyBadge}">${difficultyText}</span></td>
      <td>${type.questionCount}문제</td>
      <td>${type.timeLimit ? type.timeLimit + '분' : '무제한'}</td>
      <td>${type.minCorrectRate}%</td>
      <td>${type.minAvgTime}초</td>
      <td>${type.allowRetry ? '<span class="badge badge-success">O</span>' : '<span class="badge badge-secondary">X</span>'}</td>
      <td><span class="badge ${statusBadge}">${statusText}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editType(${type.id})">수정</button>
        <button class="btn btn-sm btn-danger" onclick="deleteType(${type.id})">삭제</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 유형 저장
async function saveQuestionType() {
  const formData = {
    name: document.getElementById('typeName').value,
    stageOrder: parseInt(document.getElementById('stageOrder').value),
    difficulty: document.getElementById('difficulty').value,
    questionCount: parseInt(document.getElementById('questionCount').value),
    timeLimit: parseInt(document.getElementById('timeLimit').value),
    minCorrectRate: parseInt(document.getElementById('minCorrectRate').value),
    minAvgTime: parseInt(document.getElementById('minAvgTime').value),
    allowRetry: document.getElementById('allowRetry').checked,
    showTimer: document.getElementById('showTimer').checked,
    status: document.getElementById('status').value,
    description: document.getElementById('description').value
  };
  
  // 유효성 검사
  if (!formData.name) {
    alert('유형 이름을 입력해주세요.');
    return;
  }
  
  if (formData.questionCount < 1) {
    alert('문제 수는 최소 1개 이상이어야 합니다.');
    return;
  }
  
  try {
    showLoading();
    
    // 실제로는 API 호출
    // await apiCall('/question-types', 'POST', formData);
    
    // 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500));
    
    alert('유형이 성공적으로 등록되었습니다.');
    resetForm();
    loadQuestionTypes();
    
  } catch (error) {
    console.error('유형 등록 실패:', error);
    alert('등록 중 오류가 발생했습니다.');
  } finally {
    hideLoading();
  }
}

// 폼 초기화
function resetForm() {
  document.getElementById('typeForm').reset();
  document.getElementById('stageOrder').value = 1;
  document.getElementById('questionCount').value = 15;
  document.getElementById('timeLimit').value = 30;
  document.getElementById('minCorrectRate').value = 20;
  document.getElementById('minAvgTime').value = 30;
  document.getElementById('allowRetry').checked = true;
  document.getElementById('showTimer').checked = true;
  document.getElementById('difficulty').value = 'easy';
  document.getElementById('status').value = 'active';
}

// 유형 수정
function editType(id) {
  alert(`유형 ID ${id} 수정 기능은 추후 구현 예정입니다.`);
  // 실제로는 해당 유형 데이터를 불러와 폼에 채우고
  // 저장 버튼을 "수정하기"로 변경
}

// 유형 삭제
async function deleteType(id) {
  if (!confirm('정말 삭제하시겠습니까?\n해당 유형에 속한 문제는 삭제되지 않습니다.')) {
    return;
  }
  
  try {
    showLoading();
    
    // 실제로는 API 호출
    // await apiCall(`/question-types/${id}`, 'DELETE');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    alert('삭제되었습니다.');
    loadQuestionTypes();
    
  } catch (error) {
    console.error('삭제 실패:', error);
    alert('삭제 중 오류가 발생했습니다.');
  } finally {
    hideLoading();
  }
}
