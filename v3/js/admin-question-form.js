/* ========================================
   문제 등록 폼 스크립트
   js/admin-question-form.js
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
  // 1. 문제 이미지 미리보기
  document.getElementById('questionImg').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const fileName = document.getElementById('questionFileName');
    const preview = document.getElementById('questionPreview');
    
    if (file) {
      fileName.textContent = file.name;
      const reader = new FileReader();
      reader.onload = function(event) {
        preview.src = event.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // 2. 선택지 개수 변경 시 카드 표시/숨김
  document.querySelectorAll('input[name="choiceCount"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const count = parseInt(this.value);
      for (let i = 1; i <= 8; i++) {
        const choiceItem = document.getElementById(`choice-${i}`);
        const choiceInput = document.getElementById(`choice-${i}-img`);
        
        if (i <= count) {
          choiceItem.style.display = 'flex';
          choiceInput.setAttribute('required', 'required');
        } else {
          choiceItem.style.display = 'none';
          choiceInput.removeAttribute('required');
        }
      }
    });
  });

  // 3. 선택지 이미지 미리보기 (1~8번)
  for (let i = 1; i <= 8; i++) {
    const input = document.getElementById(`choice-${i}-img`);
    input.addEventListener('change', function(e) {
      const file = e.target.files[0];
      const fileName = document.getElementById(`choice-${i}-name`);
      const preview = document.getElementById(`choice-${i}-preview`);
      
      if (file) {
        fileName.textContent = file.name;
        const reader = new FileReader();
        reader.onload = function(event) {
          preview.src = event.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 4. 폼 제출 전 유효성 검사
  document.getElementById('questionForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const stage = document.getElementById('stage').value;
    const questionImg = document.getElementById('questionImg').files[0];
    const choiceCount = parseInt(document.querySelector('input[name="choiceCount"]:checked').value);
    const correctAnswer = document.querySelector('input[name="correctAnswer"]:checked');
    
    // 단계 확인
    if (!stage) {
      alert('단계를 선택해주세요.');
      return;
    }
    
    // 문제 이미지 확인
    if (!questionImg) {
      alert('문제 이미지를 업로드해주세요.');
      return;
    }
    
    // 선택지 이미지 확인
    let uploadedChoices = 0;
    for (let i = 1; i <= choiceCount; i++) {
      if (document.getElementById(`choice-${i}-img`).files[0]) {
        uploadedChoices++;
      }
    }
    if (uploadedChoices < choiceCount) {
      alert(`선택지 이미지를 ${choiceCount}개 모두 업로드해주세요.`);
      return;
    }
    
    // 정답 확인
    if (!correctAnswer) {
      alert('정답을 선택해주세요.');
      return;
    }
    
    // 모든 검사 통과 → 서버 전송
    await submitQuestion(stage, questionImg, choiceCount, correctAnswer.value);
  });
});

// 5. 서버 전송 함수
async function submitQuestion(stage, questionImg, choiceCount, correctAnswer) {
  showLoading();
  
  try {
    // 문제 이미지 업로드
    const questionImageUrl = await uploadFile(questionImg, 'question');
    
    // 선택지 이미지 업로드
    const choices = [];
    for (let i = 1; i <= choiceCount; i++) {
      const choiceImg = document.getElementById(`choice-${i}-img`).files[0];
      const choiceImageUrl = await uploadFile(choiceImg, 'choice');
      
      choices.push({
        id: i,
        image: choiceImageUrl,
        isCorrect: (i == correctAnswer)
      });
    }
    
    // 문제 데이터 전송
    const questionData = {
      stage: parseInt(stage),
      questionImage: questionImageUrl,
      choices: choices
    };
    
    await apiCall('/questions', 'POST', questionData);
    
    alert('문제가 성공적으로 등록되었습니다.');
    location.href = 'questions.html'; // 목록 페이지로 이동
    
  } catch (error) {
    console.error('문제 등록 실패:', error);
    alert('문제 등록 중 오류가 발생했습니다.');
  } finally {
    hideLoading();
  }
}
