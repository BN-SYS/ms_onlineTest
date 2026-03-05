/* ========================================
   js/test-common.js
   전체 단계 공통 로직 + 검증 팩토리 + 우클릭 방지 + 템플릿 생성
======================================== */

/* ========================================
   템플릿 생성 함수들
======================================== */

/**
 * 단계 표시기 HTML 생성
 */
function createStageIndicator(currentStage) {
  const stages = [
    { number: 1, label: '시각 추론' },
    { number: 2, label: '논리 사고' },
    { number: 3, label: '종합 인지' }
  ];

  let html = '<div class="stage-indicator"><div class="stage-steps">';

  stages.forEach((stage, index) => {
    let stateClass = '';
    if (stage.number < currentStage) {
      stateClass = 'completed';
    } else if (stage.number === currentStage) {
      stateClass = 'active';
    }

    html += `
      <div class="stage-step ${stateClass}">
        <div class="stage-number">${stage.number}</div>
        <div class="stage-label">${stage.label}</div>
      </div>
    `;

    if (index < stages.length - 1) {
      const connectorClass = stage.number < currentStage ? 'completed' : '';
      html += `<div class="stage-connector ${connectorClass}"></div>`;
    }
  });

  html += '</div></div>';
  return html;
}


/**
 * 메타인지 모달 생성 (3단계 전용)
 */
function createMetacognitionModal() {
  return `
    <div class="metacognition-modal" id="metacognitionModal" style="display:none;">
      <div class="modal-overlay"></div>
      <div class="modal-content">
        
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <h2>테스트를 마치셨습니다!</h2>
          <p class="modal-subtitle">결과 확인 전, 본인의 예상 성적을 입력해주세요.</p>
          <div class="modal-info">
            <span class="info-icon">※</span>
            <span class="info-text">메타인지(자기 인식 능력)는 높은 지능의 중요한 요소입니다.</span>
          </div>
        </div>

        <!-- 모달 바디 -->
        <div class="modal-body">
          <div class="question-item">
            <div class="question-header">
              <span class="question-badge">Q</span>
              <h3>전체 25문제 중 몇 문제를 맞췄다고 생각하시나요?</h3>
            </div>
            
            <div class="input-group">
              <div class="input-wrapper">
                <input 
                  type="number" 
                  class="modal-input" 
                  id="expectedCorrectInput" 
                  min="0" 
                  max="25" 
                  placeholder="예: 18"
                  autocomplete="off"
                />
                <span class="input-unit">문제</span>
              </div>
              <p class="input-hint">0 ~ 25 사이의 숫자를 입력해주세요</p>
              <p class="input-error" id="errorCorrect" style="display:none;">
                0에서 25 사이의 정수를 입력해주세요
              </p>
            </div>
          </div>
        </div>

        <!-- 모달 푸터 -->
        <div class="modal-footer">
          <button class="modal-submit-btn" id="metaSubmitBtn">
            <span class="btn-icon">✓</span>
            <span class="btn-text">완료하기</span>
          </button>
          <p class="modal-notice">※ 제출 후에는 수정할 수 없습니다.</p>
        </div>

      </div>
    </div>
  `;
}


/**
 * 전체 테스트 컨테이너 생성
 */
function createTestContainer(config) {
  const { stage, questionCount, timeLimit } = config;
  // localStorage에서 수험번호 읽기
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const testNumber = userData.testNumber || 'ONT-0000';

  // 초기 타이머 표시값
  let initialTimer = '00:00';
  if (stage === 1 && timeLimit) {
    const min = Math.floor(timeLimit / 60);
    const sec = timeLimit % 60;
    initialTimer = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  const html = `
    <div class="test-container">
      ${createStageIndicator(stage)}
      
      <!-- 상단 진행바 -->
      <div class="progress-bar">
        <div class="progress-fill" id="progressBar"></div>
      </div>

      <!-- 문제 번호 및 타이머 -->
      <div class="test-header">
        <div class="question-number">
          <span id="currentQuestion">1</span> / <span id="totalQuestions">${questionCount}</span>
        </div>
        <div class="site-url">
          <span id="siteUrl">test.mensakorea.kr</span>
        </div>
        <div class="timer" id="timer">
          ⏱<span id="timeDisplay">${initialTimer}</span>
        </div>
      </div>

      <!-- 문제 영역 -->
      <div class="question-section">
        <div class="question-text" id="questionText" style="display: none;">
          <!-- 텍스트 영역 (동적 생성) -->
        </div>
        <div class="question-image">
          <img id="questionImg" src="" alt="문제 이미지" style="display: none;">
        </div>
        <div class="question-watermark">
          <span class="test-number" id="testNumber">${testNumber}</span>
          <span class="test-url">test.mensakorea.kr</span>
        </div>
      </div>

      <!-- 보기 영역 -->
      <div class="choices-grid" id="choicesGrid">
        <!-- JS로 동적 생성 -->
      </div>

      <!-- 네비게이션 버튼 -->
      <div class="navigation-buttons">
        <button class="nav-btn prev-btn" id="prevBtn" disabled>
          ← 이전 문제
        </button>
        <button class="nav-btn next-btn" id="nextBtn" disabled>
          다음 문제 →
        </button>
        <button class="nav-btn submit-btn" id="submitBtn" style="display:none;" disabled>
          제출하기
        </button>
      </div>
    </div>
  `;

  return html;
}

/**
 * 페이지 초기 렌더링
 */
function renderTestPage(config) {
  // 테스트 컨테이너 생성
  const container = document.getElementById('test-container-wrapper');
  if (container) {
    container.innerHTML = createTestContainer(config);
  }

  // 3단계인 경우 메타인지 모달 추가
  if (config.stage === 3) {
    document.body.insertAdjacentHTML('beforeend', createMetacognitionModal());
  }
}

/* ========================================
   TestManager 클래스
======================================== */

class TestManager {
  constructor(config) {
    this.config = config; // stage, questionBank, questionCount, timeLimit, validation, nextPage
    this.selectedQuestions = [];
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.questionStartTimes = [];
    this.questionEndTimes = [];
    this.stageStartTime = Date.now();
    this.timerInterval = null;
    this.elapsedTime = 0;
  }

  /* ========== 초기화 ========== */
  init() {
    // 페이지 렌더링
    renderTestPage(this.config);

    // 우클릭 방지 초기화
    this.initSecurityMeasures();

    if (!this.validatePreviousStages()) {
      alert('잘못된 접근입니다. 이전 단계가 완료되지 않았습니다.');
      location.href = 'index.html';
      return;
    }

    // 문제 랜덤 선택
    this.selectedQuestions = this.selectRandomQuestions(
      this.config.questionBank,
      this.config.questionCount
    );

    // 답안·시간 배열 초기화
    this.userAnswers = new Array(this.selectedQuestions.length).fill(null);
    this.questionStartTimes = new Array(this.selectedQuestions.length).fill(null);
    this.questionEndTimes = new Array(this.selectedQuestions.length).fill(null);

    // UI 업데이트
    document.getElementById('totalQuestions').textContent = this.selectedQuestions.length;
    this.loadQuestion(0);
    this.startTimer();
    this.questionStartTimes[0] = Date.now();
    this.updateNavigationButtons();

    // 네비게이션 버튼 이벤트 등록
    this.attachNavigationEvents();

    // 3단계: 메타인지 모달 이벤트 등록
    if (this.config.stage === 3) {
      this.attachMetacognitionEvents();
    }
  }

  /* ========== 네비게이션 이벤트 등록 ========== */
  attachNavigationEvents() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousQuestion());
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextQuestion());
    }
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitTest());
    }
  }

  /* ========== 메타인지 모달 이벤트 등록 ========== */
  attachMetacognitionEvents() {
    const modalSubmitBtn = document.getElementById('metaSubmitBtn');
    const expectedCorrectInput = document.getElementById('expectedCorrectInput');
    const errorElem = document.getElementById('errorCorrect');

    if (modalSubmitBtn) {
      modalSubmitBtn.addEventListener('click', () => {
        console.log('메타인지 제출 버튼 클릭됨');
        this.submitMetacognition();
      });
    } else {
      console.error('❌ metaSubmitBtn 버튼을 찾을 수 없음');
    }

    if (expectedCorrectInput) {
      // Enter 키 제출
      expectedCorrectInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          console.log('Enter 키로 메타인지 제출');
          this.submitMetacognition();
        }
      });

      // 실시간 검증
      expectedCorrectInput.addEventListener('input', () => {
        const value = parseInt(expectedCorrectInput.value);
        if (expectedCorrectInput.value && (value < 0 || value > 25 || isNaN(value))) {
          errorElem.style.display = 'flex';
        } else {
          errorElem.style.display = 'none';
        }
      });
    } else {
      console.error('❌ expectedCorrectInput 입력 필드를 찾을 수 없음');
    }

    // ESC 키 방지
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('metacognitionModal');
        if (modal && modal.style.display === 'flex') {
          e.preventDefault();
          alert('메타인지 측정은 필수입니다. 입력을 완료해주세요.');
        }
      }
    });
  }

  /* ========== 메타인지 데이터 제출 ========== */
  submitMetacognition() {
    const expectedCorrectInput = document.getElementById('expectedCorrectInput');
    const errorElem = document.getElementById('errorCorrect');

    console.log('📝 submitMetacognition 호출됨');
    console.log('입력값:', expectedCorrectInput?.value);

    if (!expectedCorrectInput) {
      console.error('❌ expectedCorrectInput 요소를 찾을 수 없음');
      return;
    }

    const value = expectedCorrectInput.value.trim();
    const expectedCorrect = parseInt(value);

    // 검증 강화
    if (value === '' || isNaN(expectedCorrect) || !Number.isInteger(expectedCorrect) || expectedCorrect < 0 || expectedCorrect > 25) {
      console.warn('⚠️ 유효하지 않은 입력:', value);
      if (errorElem) errorElem.style.display = 'flex';
      alert('0에서 25 사이의 정수를 입력해주세요.');
      expectedCorrectInput.focus();
      return;
    }

    // 메타인지 데이터 저장
    const metacognitionData = {
      expectedCorrect: expectedCorrect,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('metacognitionData', JSON.stringify(metacognitionData));
    console.log('메타인지 데이터 저장:', metacognitionData);

    // 모달 닫기
    const modal = document.getElementById('metacognitionModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }

    // 제출 처리 계속 진행
    this.processSubmission();
  }

  /* ========== 메타인지 모달 표시 ========== */
  showMetacognitionModal() {
    const modal = document.getElementById('metacognitionModal');
    if (!modal) {
      console.error('❌ metacognitionModal을 찾을 수 없음');
      return;
    }

    console.log('메타인지 모달 표시');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // 입력 필드 초기화
    const input = document.getElementById('expectedCorrectInput');
    if (input) {
      input.value = '';
      input.focus();
    }

    const errorElem = document.getElementById('errorCorrect');
    if (errorElem) errorElem.style.display = 'none';
  }

  /* ========== 보안 조치 초기화 (우클릭 방지 등) ========== */
  initSecurityMeasures() {
    // 1. 우클릭(컨텍스트 메뉴) 방지
    document.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      return false;
    }, false);

    // 2. 개발자 도구 단축키 방지
    document.addEventListener('keydown', function (e) {
      if (e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C')) {
        e.preventDefault();
        return false;
      }
    }, false);

    // 3. 드래그 방지
    document.addEventListener('dragstart', function (e) {
      e.preventDefault();
      return false;
    }, false);

    // 4. 이미지 보안 속성
    document.addEventListener('DOMContentLoaded', function () {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        img.ondragstart = function () { return false; };
        img.oncontextmenu = function () { return false; };
      });
    });

    // 5. 선택 방지 CSS
    if (!document.getElementById('security-style')) {
      const style = document.createElement('style');
      style.id = 'security-style';
      style.textContent = `
        body {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        img {
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
        }
      `;
      document.head.appendChild(style);
    }

    // 6. 콘솔 경고
    console.clear();
    console.log('%c경고', 'color: red; font-size: 40px; font-weight: bold;');
    console.log('%c이 페이지의 콘솔을 사용하여 테스트를 조작하는 것은 부정행위입니다.\n모든 활동이 기록되고 있습니다.',
      'color: orange; font-size: 16px;');
  }

  /* ========== 이전 단계 검증 ========== */
  validatePreviousStages() {
    const stage = this.config.stage;
    if (stage === 1) return true;
    if (stage === 2) {
      const s1 = localStorage.getItem('stage1Result');
      if (!s1) return false;
      try {
        const data = JSON.parse(s1);
        return data.passed === true;
      } catch (e) {
        return false;
      }
    }
    if (stage === 3) {
      const s1 = localStorage.getItem('stage1Result');
      const s2 = localStorage.getItem('stage2Result');
      if (!s1 || !s2) return false;
      try {
        const data1 = JSON.parse(s1);
        const data2 = JSON.parse(s2);
        return data1.passed === true && data2.passed === true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  /* ========== 문제 랜덤 선택 ========== */
  selectRandomQuestions(bank, count) {
    const shuffled = [...bank].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /* ========== 타이머 시작 ========== */
  startTimer() {
    if (this.config.timeLimit) {
      // 1단계: 카운트다운
      this.timerInterval = setInterval(() => {
        this.elapsedTime++;
        const remaining = this.config.timeLimit - this.elapsedTime;
        if (remaining <= 0) {
          clearInterval(this.timerInterval);
          this.handleTimeOver();
          return;
        }
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        document.getElementById('timeDisplay').textContent =
          `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        if (remaining === 300) {
          alert('⏱ 5분 남았습니다!');
          document.getElementById('timeDisplay').classList.add('warning');
        }
      }, 1000);
    } else {
      // 2·3단계: 카운트업
      const start = Date.now();
      this.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - start) / 1000);
        const min = Math.floor(elapsed / 60);
        const sec = elapsed % 60;
        document.getElementById('timeDisplay').textContent =
          `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
      }, 1000);
    }
  }

  /* ========== 시간 초과 처리 ========== */
  handleTimeOver() {
    alert('⏱ 제한 시간이 초과되었습니다. 자동으로 제출합니다.');
    for (let i = this.currentQuestionIndex; i < this.selectedQuestions.length; i++) {
      if (!this.userAnswers[i]) {
        this.userAnswers[i] = null;
        this.questionEndTimes[i] = Date.now();
      }
    }
    this.submitStage();
  }

  /* ========== 문제 로드 ========== */
  loadQuestion(idx) {
    this.currentQuestionIndex = idx;
    const question = this.selectedQuestions[idx];

    const questionTextElem = document.getElementById('questionText');
    const questionImg = document.getElementById('questionImg');

    // 텍스트/이미지 존재 여부 확인
    const hasText = question.questionText && question.questionText.trim() !== '';
    const hasImage = question.questionImage && question.questionImage.trim() !== '';

    // 케이스별 처리
    if (hasText && !hasImage) {
      questionTextElem.textContent = question.questionText;
      questionTextElem.style.display = 'flex';
      questionTextElem.classList.add('text-only-centered');
      questionTextElem.style.textAlign = 'left';
      questionImg.style.display = 'none';
    } else if (hasText && hasImage) {
      questionTextElem.textContent = question.questionText;
      questionTextElem.style.display = 'block';
      questionTextElem.classList.remove('text-only-centered');
      questionTextElem.style.textAlign = 'left';
      questionTextElem.style.marginBottom = '15px';

      questionImg.src = question.questionImage;
      questionImg.alt = `문제 ${idx + 1}`;
      questionImg.style.display = 'block';
      questionImg.onerror = () => {
        questionImg.src = 'https://via.placeholder.com/750x400?text=이미지+로드+실패';
      };
      questionImg.ondragstart = function () { return false; };
      questionImg.oncontextmenu = function () { return false; };
    } else if (!hasText && hasImage) {
      questionTextElem.style.display = 'none';
      questionTextElem.classList.remove('text-only-centered');
      questionImg.src = question.questionImage;
      questionImg.alt = `문제 ${idx + 1}`;
      questionImg.style.display = 'block';
      questionImg.onerror = () => {
        questionImg.src = 'https://via.placeholder.com/750x400?text=이미지+로드+실패';
      };
      questionImg.ondragstart = function () { return false; };
      questionImg.oncontextmenu = function () { return false; };
    } else {
      questionTextElem.textContent = '물음표(?)로 표시된 곳에 들어갈 가장 적절한 정답을 보기 중에서 선택하세요.';
      questionTextElem.style.display = 'flex';
      questionTextElem.classList.add('text-only-centered');
      questionTextElem.style.textAlign = 'left';
      questionImg.style.display = 'none';
    }

    // 문제 번호 업데이트
    const currentQuestionElem = document.getElementById('currentQuestion');
    if (currentQuestionElem) {
      currentQuestionElem.textContent = idx + 1;
    }

    // 진행바 업데이트
    this.updateProgressBar();

    // 보기 랜덤 셔플 및 표시
    const shuffledChoices = [...question.choices].sort(() => Math.random() - 0.5);
    this.displayChoices(shuffledChoices, question.id);

    // 이전 답안 복원
    const prevAnswer = this.userAnswers[idx];
    if (prevAnswer && typeof prevAnswer === 'object' && prevAnswer.choiceId) {
      const selectedElem = document.querySelector(
        `.choice-item[data-choice-id="${prevAnswer.choiceId}"]`
      );
      if (selectedElem) selectedElem.classList.add('selected');
    }

    // 네비게이션 버튼 상태 업데이트
    this.updateNavigationButtons();
  }

  /* ========== 보기 렌더링 ========== */
  displayChoices(choices, questionId) {
    const grid = document.getElementById('choicesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    choices.forEach((choice) => {
      const item = document.createElement('div');
      item.className = 'choice-item';
      item.dataset.choiceId = choice.id;
      item.innerHTML = `
        <img src="${choice.image}" 
             alt="보기 ${choice.id}" 
             class="choice-image"
             onerror="this.src='https://via.placeholder.com/140?text=보기+${choice.id}'" />
      `;
      item.onclick = () => this.selectChoice(choice.id, questionId);

      const img = item.querySelector('img');
      if (img) {
        img.ondragstart = function () { return false; };
        img.oncontextmenu = function () { return false; };
      }

      grid.appendChild(item);
    });
  }

  /* ========== 진행바 업데이트 ========== */
  updateProgressBar() {
    const bar = document.getElementById('progressBar');
    if (!bar) return;
    const percentage = ((this.currentQuestionIndex + 1) / this.selectedQuestions.length) * 100;
    bar.style.width = percentage + '%';
  }

  /* ========== 네비게이션 버튼 활성화 제어 ========== */
  updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    const isFirst = this.currentQuestionIndex === 0;
    const isLast = this.currentQuestionIndex === this.selectedQuestions.length - 1;
    const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== null;

    // 이전 버튼: 첫 문제가 아니면 활성화
    if (prevBtn) {
      prevBtn.disabled = isFirst;
      prevBtn.style.opacity = isFirst ? '0.4' : '1';
      prevBtn.style.cursor = isFirst ? 'not-allowed' : 'pointer';
    }

    // 다음/제출 버튼
    if (nextBtn && submitBtn) {
      if (isLast) {
        // 마지막 문제: 제출 버튼 표시
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
        submitBtn.disabled = !hasAnswer;
        submitBtn.style.opacity = hasAnswer ? '1' : '0.4';
        submitBtn.style.cursor = hasAnswer ? 'pointer' : 'not-allowed';
      } else {
        // 중간 문제: 다음 버튼 표시
        nextBtn.style.display = 'inline-block';
        nextBtn.disabled = !hasAnswer;
        nextBtn.style.opacity = hasAnswer ? '1' : '0.4';
        nextBtn.style.cursor = hasAnswer ? 'pointer' : 'not-allowed';
        submitBtn.style.display = 'none';
      }
    }
  }

  /* ========== 보기 선택 (자동 넘김 제거) ========== */
  selectChoice(choiceId, questionId) {
    // 답안 저장 (기존 답안 수정 가능)
    this.questionEndTimes[this.currentQuestionIndex] = Date.now();
    this.userAnswers[this.currentQuestionIndex] = {
      questionId,
      choiceId,
      startTime: this.questionStartTimes[this.currentQuestionIndex],
      endTime: this.questionEndTimes[this.currentQuestionIndex]
    };

    // UI 업데이트
    document.querySelectorAll('.choice-item').forEach((el) => el.classList.remove('selected'));
    const selectedElem = document.querySelector(`.choice-item[data-choice-id="${choiceId}"]`);
    if (selectedElem) selectedElem.classList.add('selected');

    console.log(`문제 ${this.currentQuestionIndex + 1}: 보기 ${choiceId} 선택`);

    // 버튼 상태 업데이트 (다음/제출 버튼 활성화)
    this.updateNavigationButtons();
  }

  /* ========== 다음 문제 ========== */
  nextQuestion() {
    // 답안 선택 확인
    if (!this.userAnswers[this.currentQuestionIndex]) {
      alert('답을 선택해주세요.');
      return;
    }

    // 다음 문제로 이동
    if (this.currentQuestionIndex < this.selectedQuestions.length - 1) {
      this.currentQuestionIndex++;

      // 시작 시간 기록 (처음 진입 시에만)
      if (!this.questionStartTimes[this.currentQuestionIndex]) {
        this.questionStartTimes[this.currentQuestionIndex] = Date.now();
      }

      this.loadQuestion(this.currentQuestionIndex);
    }
  }

  /* ========== 이전 문제 ========== */
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.loadQuestion(this.currentQuestionIndex);
    }
  }

  /* ========== 제출(alias) ========== */
  submitTest() {
    this.submitStage();
  }

  /* ========== 단계 제출 + 채점 + 검증 ========== */
  submitStage() {
    clearInterval(this.timerInterval);

    // 미답변 문제 확인
    const unansweredCount = this.userAnswers.filter(a => a === null).length;
    if (unansweredCount > 0) {
      if (!confirm(`${unansweredCount}개 문제를 풀지 않았습니다. 제출하시겠습니까?`)) {
        return;
      }
    }

    // 3단계 마지막 문제 제출 시 메타인지 모달 표시
    if (this.config.stage === 3) {
      console.log('3단계 완료 - 메타인지 모달 표시');
      this.showMetacognitionModal();
      return;
    }

    this.processSubmission();
  }

  /* ========== 실제 제출 처리 로직 ========== */
  processSubmission() {
    let correctCount = 0;
    let totalTime = 0;
    let answeredCount = 0;

    this.selectedQuestions.forEach((question, i) => {
      const answer = this.userAnswers[i];
      if (answer && typeof answer === 'object' && answer.choiceId) {
        const correctChoice = question.choices.find((c) => c.isCorrect);
        if (correctChoice && answer.choiceId === correctChoice.id) {
          correctCount++;
        }
        const qTime = (answer.endTime - answer.startTime) / 1000;
        totalTime += qTime;
        answeredCount++;
      }
    });

    const correctRate = (correctCount / this.selectedQuestions.length) * 100;
    const avgTimePerQuestion = answeredCount > 0 ? totalTime / answeredCount : 0;
    const actualTotalTime = this.config.timeLimit ? this.elapsedTime : Math.floor((Date.now() - this.stageStartTime) / 1000);

    // 검증 로직
    if (this.config.validation) {
      const validationResult = this.config.validation(correctRate, avgTimePerQuestion, actualTotalTime);
      if (!validationResult.passed) {
        alert(validationResult.message);
        this.saveLog({
          stage: this.config.stage,
          passed: false,
          reason: validationResult.reason,
          correctCount,
          correctRate: parseFloat(correctRate.toFixed(1)),
          totalTime: actualTotalTime,
          avgTimePerQuestion: parseFloat(avgTimePerQuestion.toFixed(1)),
          answeredCount,
          totalQuestions: this.selectedQuestions.length
        });

        if (this.config.stage === 1) {
          const proceed = confirm(
            '1단계 검증 실패하였습니다.\n회원정보는 유지되지만, 새로운 세션으로 1단계를 다시 시작합니다.\n계속하시겠습니까?\n취소 시 메인 페이지로 이동합니다.'
          );
          if (proceed) {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            userData.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
            userData.retryCount = (userData.retryCount || 0) + 1;
            userData.lastRetryReason = validationResult.reason;
            userData.lastRetryTime = new Date().toISOString();
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.removeItem('stage1Result');
            this.saveLog({
              stage: this.config.stage,
              action: 'retry_started',
              sessionId: userData.sessionId,
              retryCount: userData.retryCount,
              reason: validationResult.reason
            });
            location.reload();
          } else {
            location.href = 'index.html';
          }
          return;
        }

        const proceed = confirm(
          `${this.config.stage}단계 검증 실패\n이 단계를 다시 시작하시겠습니까?\n취소 시 메인 페이지로 이동합니다.`
        );
        if (proceed) {
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const retryKey = `stage${this.config.stage}RetryCount`;
          userData[retryKey] = (userData[retryKey] || 0) + 1;
          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.removeItem(`stage${this.config.stage}Result`);
          this.saveLog({
            stage: this.config.stage,
            action: 'retry_started',
            retryCount: userData[retryKey],
            reason: validationResult.reason
          });
          location.reload();
        } else {
          location.href = 'index.html';
        }
        return;
      }
    }

    // 합격 처리
    const stageResult = {
      stage: this.config.stage,
      questions: this.selectedQuestions.map((q) => q.id),
      answers: this.userAnswers,
      correctCount,
      correctRate: parseFloat(correctRate.toFixed(1)),
      totalTime: actualTotalTime,
      avgTimePerQuestion: parseFloat(avgTimePerQuestion.toFixed(1)),
      answeredCount,
      totalQuestions: this.selectedQuestions.length,
      passed: true
    };

    const questionSnapshots = this.selectedQuestions.map(q => {
      const correct = q.choices?.find(c => c.isCorrect);
      return {
        questionId: q.id,
        questionText: q.questionText || null,
        questionImage: q.questionImage || null,
        correctChoiceId: correct ? correct.id : null,
        choices: (q.choices || []).map(c => ({
          id: c.id,
          text: c.text || null,
          image: c.image || null,
          isCorrect: !!c.isCorrect
        }))
      };
    });

    stageResult.questionSnapshots = questionSnapshots;
    localStorage.setItem(`stage${this.config.stage}Result`, JSON.stringify(stageResult));
    this.saveLog(stageResult);

    alert(`${this.config.stage}단계 완료!`);
    location.href = this.config.nextPage;
  }

  /* ========== 로그 저장 ========== */
  saveLog(data) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const logEntry = {
      sessionId: userData.sessionId,
      userId: userData.email,
      name: userData.name,
      birthYear: userData.birthYear,
      ip: userData.ip,
      timestamp: new Date().toISOString(),
      ...data
    };
    let logs = JSON.parse(localStorage.getItem('testLogs') || '[]');
    logs.push(logEntry);
    localStorage.setItem('testLogs', JSON.stringify(logs));
    console.log('📝 로그 저장:', logEntry);
  }
}

/* ========================================
   검증 함수 팩토리
======================================== */
function createValidation(minCorrectRate, minAvgTime, minTotalTime) {
  return function (correctRate, avgTimePerQuestion, totalTime) {
    if (correctRate < minCorrectRate) {
      return {
        passed: false,
        reason: 'low_correct_rate',
        message: `정답률이 너무 낮습니다.\n해당 단계 재응시가 필요합니다.\n취소 시 메인 페이지로 이동합니다.`
      };
    }
    if (avgTimePerQuestion > 0 && avgTimePerQuestion < minAvgTime) {
      return {
        passed: false,
        reason: 'too_fast',
        message: `비정상적인 응시 패턴이 감지되었습니다.\n해당 단계 재응시가 필요합니다.\n취소 시 메인 페이지로 이동합니다.`
      };
    }
    if (totalTime < minTotalTime) {
      return {
        passed: false,
        reason: 'too_fast_total',
        message: `총 응시 시간이 너무 짧습니다.\n해당 단계 재응시가 필요합니다.\n취소 시 메인 페이지로 이동합니다.`
      };
    }
    return { passed: true };
  };
}

/* ========================================
   전역 변수 (HTML에서 직접 접근 가능하도록 유지)
======================================== */
let testManager;
