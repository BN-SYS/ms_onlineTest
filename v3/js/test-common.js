/* ========================================
   js/test-common.js
   전체 단계 공통 로직 + 검증 팩토리
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
    this.elapsedTime = 0; // 초 단위 경과 시간
  }

  /* ========== 초기화 ========== */
  init() {
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
  }

  /* ========== 이전 단계 검증 ========== */
  validatePreviousStages() {
    const stage = this.config.stage;
    // 1단계는 항상 허용
    if (stage === 1) return true;
    // 2단계: stage1Result.passed === true 필요
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
    // 3단계: stage1Result, stage2Result 모두 passed
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
      // 1단계: 카운트다운 타이머 (30분 → 0)
      this.timerInterval = setInterval(() => {
        this.elapsedTime++;
        const remaining = this.config.timeLimit - this.elapsedTime;
        if (remaining <= 0) {
          clearInterval(this.timerInterval);
          this.handleTimeOver();
          return;
        }
        // MM:SS 표시
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        document.getElementById('timeDisplay').textContent =
          `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        // 5분 남음 경고
        if (remaining === 300) {
          alert('⏰ 5분 남았습니다!');
          document.getElementById('timeDisplay').classList.add('warning');
        }
      }, 1000);
    } else {
      // 2·3단계: 카운트업 타이머 (0부터 증가)
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
    alert('⏰ 제한 시간이 초과되었습니다. 자동으로 제출합니다.');
    // 현재 문제부터 마지막까지 미답 처리
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

    // 문제 이미지
    const questionImg = document.getElementById('questionImg');
    if (questionImg) {
      questionImg.src = question.questionImage;
      questionImg.alt = `문제 ${idx + 1}`;
      questionImg.onerror = () => {
        questionImg.src = 'https://via.placeholder.com/750x400?text=이미지+로드+실패';
      };
    }

    // 문제 번호
    const currentQuestionElem = document.getElementById('currentQuestion');
    if (currentQuestionElem) {
      currentQuestionElem.textContent = idx + 1;
    }

    // 진행바
    this.updateProgressBar();

    // 보기 로드 (랜덤 섞기)
    const shuffledChoices = [...question.choices].sort(() => Math.random() - 0.5);
    this.displayChoices(shuffledChoices, question.id);

    // 이전에 선택한 보기가 있으면 표시
    const prevAnswer = this.userAnswers[idx];
    if (prevAnswer && typeof prevAnswer === 'object' && prevAnswer.choiceId) {
      const selectedElem = document.querySelector(
        `.choice-item[data-choice-id="${prevAnswer.choiceId}"]`
      );
      if (selectedElem) selectedElem.classList.add('selected');
    }

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
    const isLast = this.currentQuestionIndex === this.selectedQuestions.length - 1;

    // 이전 버튼: 첫 문제에서는 비활성
    if (prevBtn) {
      prevBtn.disabled = this.currentQuestionIndex === 0;
      prevBtn.style.opacity = prevBtn.disabled ? '0.4' : '1';
    }

    // 마지막 문제: 다음 버튼 숨기고 제출 버튼 표시
    if (nextBtn && submitBtn) {
      if (isLast) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
      } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
      }
    }
  }

  /* ========== 보기 선택 ========== */
  selectChoice(choiceId, questionId) {
    // 현재 문제 종료 시각 기록
    this.questionEndTimes[this.currentQuestionIndex] = Date.now();
    // 답안 저장
    this.userAnswers[this.currentQuestionIndex] = {
      questionId,
      choiceId,
      startTime: this.questionStartTimes[this.currentQuestionIndex],
      endTime: this.questionEndTimes[this.currentQuestionIndex]
    };

    // UI 선택 표시
    document.querySelectorAll('.choice-item').forEach((el) => el.classList.remove('selected'));
    const selectedElem = document.querySelector(`.choice-item[data-choice-id="${choiceId}"]`);
    if (selectedElem) selectedElem.classList.add('selected');

    // 마지막 문제면 제출 확인, 아니면 자동 다음
    if (this.currentQuestionIndex === this.selectedQuestions.length - 1) {
      if (confirm('마지막 문제입니다. 제출하시겠습니까?')) {
        this.submitStage();
      }
    } else {
      setTimeout(() => this.nextQuestion(), 800);
    }
  }

  /* ========== 다음 문제 ========== */
  nextQuestion() {
    // 답 안 골랐으면 null 처리 (오답)
    if (!this.userAnswers[this.currentQuestionIndex]) {
      console.log(`문제 ${this.currentQuestionIndex + 1}: 답을 선택하지 않음 → 오답 처리`);
      this.userAnswers[this.currentQuestionIndex] = null;
      this.questionEndTimes[this.currentQuestionIndex] = Date.now();
    }
    if (this.currentQuestionIndex < this.selectedQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.questionStartTimes[this.currentQuestionIndex] = Date.now();
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

    // 현재 문제 미응답 시 null 처리
    if (!this.userAnswers[this.currentQuestionIndex]) {
      this.userAnswers[this.currentQuestionIndex] = null;
      this.questionEndTimes[this.currentQuestionIndex] = Date.now();
    }

    // 채점
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
      } else {
        // null → 오답
      }
    });

    const correctRate = (correctCount / this.selectedQuestions.length) * 100;
    const avgTimePerQuestion = answeredCount > 0 ? totalTime / answeredCount : 0;
    const actualTotalTime = this.config.timeLimit ? this.elapsedTime : Math.floor((Date.now() - this.stageStartTime) / 1000);

    console.log(`=== ${this.config.stage}단계 채점 결과 ===`);
    console.log(`정답: ${correctCount} / ${this.selectedQuestions.length}`);
    console.log(`정답률: ${correctRate.toFixed(1)}%`);
    console.log(`답변한 문제: ${answeredCount}`);
    console.log(`총 소요 시간: ${actualTotalTime}초`);
    console.log(`평균 문제당 시간: ${avgTimePerQuestion.toFixed(1)}초`);

    // 검증 로직 (있을 경우)
    if (this.config.validation) {
      const validationResult = this.config.validation(correctRate, avgTimePerQuestion, actualTotalTime);
      if (!validationResult.passed) {
        alert(validationResult.message);
        // 실패 로그 저장
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

        // 1단계 실패: 회원정보 유지, 세션·재시도 정보만 갱신
        if (this.config.stage === 1) {
          const proceed = confirm(
            '1단계 검증 실패하였습니다.\n회원정보는 유지되지만, 새로운 세션으로 1단계를 다시 시작합니다.\n계속하시겠습니까?'
          );
          if (proceed) {
            // 기존 userData 불러오기
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            // 새 세션 ID 생성
            userData.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
            // 재시도 횟수 증가
            userData.retryCount = (userData.retryCount || 0) + 1;
            userData.lastRetryReason = validationResult.reason;
            userData.lastRetryTime = new Date().toISOString();
            // 저장
            localStorage.setItem('userData', JSON.stringify(userData));
            // stage1Result만 삭제
            localStorage.removeItem('stage1Result');
            // 재시작 로그
            this.saveLog({
              stage: this.config.stage,
              action: 'retry_started',
              sessionId: userData.sessionId,
              retryCount: userData.retryCount,
              reason: validationResult.reason
            });
            // 페이지 새로고침 (1단계 첫 문제부터 시작)
            location.reload();
          } else {
            location.href = 'index.html';
          }
          return;
        }

        // 2·3단계 실패: 해당 단계만 재시작
        const proceed = confirm(
          `${this.config.stage}단계 검증 실패\n이 단계를 다시 시작하시겠습니까?`
        );
        if (proceed) {
          // 단계별 재시도 카운터 증가
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const retryKey = `stage${this.config.stage}RetryCount`;
          userData[retryKey] = (userData[retryKey] || 0) + 1;
          localStorage.setItem('userData', JSON.stringify(userData));
          // 해당 단계 결과 삭제
          localStorage.removeItem(`stage${this.config.stage}Result`);
          // 재시작 로그
          this.saveLog({
            stage: this.config.stage,
            action: 'retry_started',
            retryCount: userData[retryKey],
            reason: validationResult.reason
          });
          // 페이지 새로고침
          location.reload();
        } else {
          location.href = 'index.html';
        }
        return;
      }
    }

    // 검증 통과: 결과 저장
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
    localStorage.setItem(`stage${this.config.stage}Result`, JSON.stringify(stageResult));
    this.saveLog(stageResult);

    // alert(`${this.config.stage}단계 완료!\n정답: ${correctCount} / ${this.selectedQuestions.length}`);
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
  return function(correctRate, avgTimePerQuestion, totalTime) {
    // 1) 정답률 검증
    if (correctRate < minCorrectRate) {
      return {
        passed: false,
        reason: 'low_correct_rate',
        message: `정답률이 너무 낮습니다.\n(기준: ${minCorrectRate}% 이상, 현재: ${correctRate.toFixed(1)}%)`
      };
    }
    // 2) 평균 시간 검증 (답변한 문제가 있을 때만)
    if (avgTimePerQuestion > 0 && avgTimePerQuestion < minAvgTime) {
      return {
        passed: false,
        reason: 'too_fast',
        message: `비정상적인 응시 패턴 감지\n(평균 ${avgTimePerQuestion.toFixed(1)}초/문제 → 최소 ${minAvgTime}초 필요)`
      };
    }
    // 3) 총 시간 검증
    if (totalTime < minTotalTime) {
      return {
        passed: false,
        reason: 'too_fast_total',
        message: `총 응시 시간이 너무 짧습니다.\n(최소 ${minTotalTime}초 필요, 현재 ${totalTime}초)`
      };
    }
    return { passed: true };
  };
}

/* ========================================
   전역 함수 (HTML onclick에서 사용)
======================================== */
let testManager;
function previousQuestion() { testManager.previousQuestion(); }
function nextQuestion() { testManager.nextQuestion(); }
function submitTest() { testManager.submitTest(); }
