/* ========================================
   js/consent.js - 동의 페이지 로직
======================================== */

/**
 * 약관 상세 내용 토글
 */
function toggleConsentDetail(event) {
    event.stopPropagation();
    event.preventDefault();

    const detailBox = document.getElementById('consentDetail');
    const toggleIcon = event.target;

    detailBox.classList.toggle('open');
    toggleIcon.classList.toggle('open');
}

/**
 * 출생연도 드롭다운 생성 (1930 ~ 현재-8)
 */
function populateBirthYearDropdown() {
    const birthYearSelect = document.getElementById('birthYear');
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear - 8;
    const minYear = 1930;

    for (let year = maxYear; year >= minYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '년';
        birthYearSelect.appendChild(option);
    }
}

/**
 * 샘플 문제 선택 처리
 */
function selectSample(element, isCorrect) {
    const allOptions = document.querySelectorAll('.sample-option-image');
    
    // 모든 선택지 비활성화
    allOptions.forEach(opt => {
        opt.style.pointerEvents = 'none';
    });

    if (isCorrect) {
        element.classList.add('correct');
        document.getElementById('sampleHint').style.display = 'block';
    } else {
        element.classList.add('wrong');
        setTimeout(() => {
            document.querySelector('.sample-option-image:nth-child(2)').classList.add('correct');
            document.getElementById('sampleHint').style.display = 'block';
        }, 800);
    }
}

/**
 * 폼 유효성 검증
 */
function checkFormValidity() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const userName = document.getElementById('userName');
    const birthYear = document.getElementById('birthYear');
    const userEmail = document.getElementById('userEmail');
    const startBtn = document.getElementById('startBtn');

    const allCheckboxesChecked = Array.from(checkboxes).every(cb => cb.checked);
    const nameValid = userName.value.trim().length > 0;
    const yearValid = birthYear.value !== '';
    const emailValid = userEmail.value.includes('@') && userEmail.value.includes('.');

    console.log('폼 검증:', {
        checkboxes: allCheckboxesChecked,
        name: nameValid,
        year: yearValid,
        email: emailValid
    });

    if (allCheckboxesChecked && nameValid && yearValid && emailValid) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

/**
 * 폼 제출 처리
 */
function handleFormSubmit(event) {
    event.preventDefault();

    const userName = document.getElementById('userName');
    const birthYear = document.getElementById('birthYear');
    const userEmail = document.getElementById('userEmail');

    const userData = {
        name: userName.value.trim(),
        birthYear: parseInt(birthYear.value),
        email: userEmail.value.trim(),
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('userData', JSON.stringify(userData));
    console.log('✅ 사용자 정보 저장:', userData);

    window.location.href = 'test-stage1.html';
}

/**
 * 샘플 문제 이벤트 리스너 등록
 */
function initSampleQuestion() {
    const sampleOptions = document.querySelectorAll('.sample-option-image');
    sampleOptions.forEach((option, index) => {
        const isCorrect = option.getAttribute('data-correct') === 'true';
        option.addEventListener('click', function() {
            selectSample(this, isCorrect);
        });
    });
}

/**
 * 페이지 초기화
 */
function initConsentPage() {
    // 출생연도 드롭다운 생성
    populateBirthYearDropdown();

    // 샘플 문제 초기화
    initSampleQuestion();

    // 폼 요소 가져오기
    const form = document.getElementById('consentForm');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const userName = document.getElementById('userName');
    const birthYear = document.getElementById('birthYear');
    const userEmail = document.getElementById('userEmail');
    const toggleIcon = document.getElementById('toggleIcon');

    // 토글 아이콘 이벤트
    if (toggleIcon) {
        toggleIcon.addEventListener('click', toggleConsentDetail);
    }

    // 폼 검증 이벤트 리스너 등록
    checkboxes.forEach(cb => cb.addEventListener('change', checkFormValidity));
    userName.addEventListener('input', checkFormValidity);
    birthYear.addEventListener('change', checkFormValidity);
    userEmail.addEventListener('input', checkFormValidity);

    // 폼 제출 이벤트
    form.addEventListener('submit', handleFormSubmit);
}

// ✅ DOMContentLoaded 이벤트에서 초기화
document.addEventListener('DOMContentLoaded', initConsentPage);
