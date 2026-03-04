/* ========================================
   Include 공통 스크립트
   js/include.js
======================================== */

// 결제 처리 중 플래그
let isProcessingPayment = false;

// 헤더/푸터 자동 로드
document.addEventListener('DOMContentLoaded', function() {
    // 현재 페이지가 관리자 페이지인지 확인
    const isAdminPage = window.location.pathname.includes('/admin/');
    
    if (isAdminPage) {
        // 관리자 페이지: 관리자 헤더/사이드바 로드
        loadAdminHeader();
        loadAdminSidebar();
    } else {
        // 일반 사용자 페이지: 일반 헤더/푸터 로드
        loadUserHeader();
        loadUserFooter();
        
        // 결제 페이지인 경우 결제 관련 기능 초기화
        if (window.location.pathname.includes('payment.html')) {
            initPaymentPage();
        }
    }
});

/* ========================================
   일반 사용자 페이지 Include
======================================== */

// 일반 헤더 로드
function loadUserHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) {
        console.warn('header-placeholder 요소를 찾을 수 없습니다.');
        return;
    }
    
    fetch('includes/header.html')
        .then(response => {
            if (!response.ok) throw new Error('헤더 로드 실패');
            return response.text();
        })
        .then(data => {
            headerPlaceholder.innerHTML = data;
            // DOM이 삽입된 후 초기화
            setTimeout(() => {
                initUserHeader();
            }, 0);
        })
        .catch(error => {
            console.error('헤더 로드 에러:', error);
            headerPlaceholder.innerHTML = '<p style="color:red;">헤더 로드 실패</p>';
        });
}

// 일반 푸터 로드
function loadUserFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) {
        console.warn('footer-placeholder 요소를 찾을 수 없습니다.');
        return;
    }
    
    fetch('includes/footer.html')
        .then(response => {
            if (!response.ok) throw new Error('푸터 로드 실패');
            return response.text();
        })
        .then(data => {
            footerPlaceholder.innerHTML = data;
        })
        .catch(error => {
            console.error('푸터 로드 에러:', error);
            footerPlaceholder.innerHTML = '<p style="color:red;">푸터 로드 실패</p>';
        });
}

// 일반 헤더 초기화 (모바일 메뉴 등)
function initUserHeader() {
    console.log('헤더 초기화 시작');
    
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    console.log('mobileMenuToggle:', mobileMenuToggle);
    console.log('navMenu:', navMenu);
    
    if (mobileMenuToggle && navMenu) {
        // 기존 이벤트 리스너 제거 (중복 방지)
        const newToggle = mobileMenuToggle.cloneNode(true);
        mobileMenuToggle.parentNode.replaceChild(newToggle, mobileMenuToggle);
        
        // 새로운 이벤트 리스너 등록
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('햄버거 버튼 클릭됨');
            navMenu.classList.toggle('active');
            console.log('navMenu.classList:', navMenu.classList);
        });
        
        console.log('햄버거 메뉴 이벤트 리스너 등록 완료');
    } else {
        console.error('햄버거 메뉴 요소를 찾을 수 없습니다:', {
            mobileMenuToggle,
            navMenu
        });
    }
    
    // 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
        if (navMenu && 
            navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !document.getElementById('mobileMenuToggle').contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
}

/* ========================================
   결제 페이지 전용 기능
======================================== */

// 결제 페이지 초기화
function initPaymentPage() {
    // 테스트 데이터 검증
    validateTestData();
    
    // 뒤로가기 방지 (이미 결제한 경우)
    preventDuplicatePayment();
}

// 테스트 데이터 검증
function validateTestData() {
    const userData = localStorage.getItem('userData');
    const stage1 = localStorage.getItem('stage1Result');
    const stage2 = localStorage.getItem('stage2Result');
    const stage3 = localStorage.getItem('stage3Result');

    // 테스트 데이터가 없으면 홈으로 리다이렉트
    if (!userData || !stage1 || !stage2 || !stage3) {
        alert('테스트를 먼저 완료해주세요.');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// 중복 결제 방지
function preventDuplicatePayment() {
    const paymentInfo = localStorage.getItem('paymentInfo');
    
    if (paymentInfo) {
        const payment = JSON.parse(paymentInfo);
        const paymentTime = new Date(payment.timestamp);
        const now = new Date();
        const timeDiff = (now - paymentTime) / 1000 / 60; // 분 단위
        
        // 5분 이내 결제 기록이 있으면 결과 페이지로 이동
        if (timeDiff < 5) {
            if (confirm('이미 결제하셨습니다. 결과 페이지로 이동하시겠습니까?')) {
                if (payment.type === 'basic') {
                    window.location.href = 'result-basic.html';
                } else {
                    window.location.href = 'result-detail.html';
                }
            }
        }
    }
}

// 선택 효과음 (선택사항)
function playSelectionSound() {
    // 간단한 클릭 피드백
    if (navigator.vibrate) {
        navigator.vibrate(50); // 모바일에서 진동 피드백
    }
}

// 결제 처리
function processPayment(type) {
    // 이미 처리 중이면 무시
    if (isProcessingPayment) {
        console.log('이미 결제 처리 중입니다.');
        return;
    }
    
    isProcessingPayment = true;
    console.log('결제 처리 시작:', type);
    
    // 테스트 데이터 재검증
    if (!validateTestData()) {
        isProcessingPayment = false;
        return;
    }

    const userData = JSON.parse(localStorage.getItem('userData'));
    const stage1 = JSON.parse(localStorage.getItem('stage1Result'));
    const stage2 = JSON.parse(localStorage.getItem('stage2Result'));
    const stage3 = JSON.parse(localStorage.getItem('stage3Result'));

    // 가격 정보
    const prices = {
        basic: { 
            original: 19900, 
            discounted: 14900,
            name: '기본 결과'
        },
        detail: { 
            original: 39900, 
            discounted: 23900,
            name: '상세 리포트'
        }
    };
    
    const selectedPrice = prices[type];
    
    // 결제 확인 다이얼로그
    const confirmMessage = `
결제 금액: ${selectedPrice.discounted.toLocaleString()}원 (정상가 ${selectedPrice.original.toLocaleString()}원)

${selectedPrice.name} 결제를 진행하시겠습니까?`;

    if (!confirm(confirmMessage)) {
        isProcessingPayment = false;
        console.log('결제 취소됨');
        return;
    }

    // 결제 진행 표시
    showPaymentProcessing();

    // 실제 환경에서는 PG사 연동 (이니시스, 토스페이먼츠 등)
    // 현재는 시뮬레이션
    setTimeout(() => {
        const paymentInfo = {
            type: type,
            typeName: selectedPrice.name,
            originalAmount: selectedPrice.original,
            discountedAmount: selectedPrice.discounted,
            savedAmount: selectedPrice.original - selectedPrice.discounted,
            timestamp: new Date().toISOString(),
            transactionId: generateTransactionId(),
            userEmail: userData.email,
            userName: userData.name
        };

        // 결제 정보 저장
        localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));
        
        console.log('결제 완료:', paymentInfo);
        
        // 결제 완료 처리
        hidePaymentProcessing();
        showPaymentSuccess(paymentInfo);

        // 결과 페이지로 이동 (2초 후)
        setTimeout(() => {
            if (type === 'basic') {
                window.location.href = 'result-basic.html';
            } else {
                window.location.href = 'result-detail.html';
            }
        }, 2000);
    }, 1500);
}

// 결제 진행 중 표시
function showPaymentProcessing() {
    // 오버레이 생성
    const overlay = document.createElement('div');
    overlay.id = 'payment-processing-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    overlay.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 16px; text-align: center; max-width: 400px;">
            <div style="font-size: 3rem; margin-bottom: 20px;">💳</div>
            <h3 style="margin-bottom: 10px; color: #333;">결제 진행 중...</h3>
            <p style="color: #666; font-size: 0.9rem;">잠시만 기다려주세요</p>
            <div style="margin-top: 20px;">
                <div class="spinner" style="
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #6C63FF;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                "></div>
            </div>
        </div>
    `;
    
    // 스피너 애니메이션
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(overlay);
}

// 결제 진행 중 표시 제거
function hidePaymentProcessing() {
    const overlay = document.getElementById('payment-processing-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// 결제 완료 표시
function showPaymentSuccess(paymentInfo) {
    const overlay = document.createElement('div');
    overlay.id = 'payment-success-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease-out;
    `;
    
    overlay.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 16px; text-align: center; max-width: 400px; animation: slideUp 0.5s ease-out;">
            <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
            <h2 style="color: #27ae60; margin-bottom: 15px;">결제 완료!</h2>
            <p style="color: #666; margin-bottom: 10px;">
                <strong>${paymentInfo.typeName}</strong>가<br>
                정상적으로 결제되었습니다.
            </p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 0.9rem;">
                <div style="margin-bottom: 8px;">
                    결제금액: <strong>${paymentInfo.discountedAmount.toLocaleString()}원</strong>
                </div>
                <div style="color: #27ae60;">
                    절약금액: ${paymentInfo.savedAmount.toLocaleString()}원
                </div>
            </div>
            <p style="color: #666; font-size: 0.9rem;">
                결과를 이메일로 발송했습니다<br>
                (5분 이내 도착 예정)
            </p>
            <p style="color: #999; font-size: 0.85rem; margin-top: 15px;">
                잠시 후 결과 페이지로 이동합니다...
            </p>
        </div>
    `;
    
    // 애니메이션
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(overlay);
}

// 거래 ID 생성
function generateTransactionId() {
    const date = new Date();
    const timestamp = date.getTime();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TXN${timestamp}${random}`;
}

/* ========================================
   관리자 페이지 Include
======================================== */

// 관리자 헤더 로드
function loadAdminHeader() {
    const headerPlaceholder = document.getElementById('headerPlaceholder');
    if (!headerPlaceholder) return;
    
    fetch('../includes/admin-header.html')
        .then(response => {
            if (!response.ok) throw new Error('관리자 헤더 로드 실패');
            return response.text();
        })
        .then(data => {
            headerPlaceholder.innerHTML = data;
            initAdminHeader();
        })
        .catch(error => {
            console.error('관리자 헤더 로드 에러:', error);
            headerPlaceholder.innerHTML = '<p style="color:red;">헤더 로드 실패</p>';
        });
}

// 관리자 사이드바 로드
function loadAdminSidebar() {
    const sidebarPlaceholder = document.getElementById('sidebarPlaceholder');
    if (!sidebarPlaceholder) return;
    
    fetch('../includes/admin-sidebar.html')
        .then(response => {
            if (!response.ok) throw new Error('관리자 사이드바 로드 실패');
            return response.text();
        })
        .then(data => {
            sidebarPlaceholder.innerHTML = data;
            initAdminSidebar();
        })
        .catch(error => {
            console.error('관리자 사이드바 로드 에러:', error);
            sidebarPlaceholder.innerHTML = '<p style="color:red;">사이드바 로드 실패</p>';
        });
}

// 관리자 헤더 초기화
function initAdminHeader() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

// 관리자 사이드바 초기화
function initAdminSidebar() {
    // 서브메뉴 토글
    const navItems = document.querySelectorAll('.nav-item.has-submenu > .nav-link');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;
            
            // 다른 메뉴 닫기
            document.querySelectorAll('.nav-item.has-submenu').forEach(otherItem => {
                if (otherItem !== parent) {
                    otherItem.classList.remove('active');
                }
            });
            
            // 현재 메뉴 토글
            parent.classList.toggle('active');
        });
    });
    
    // 현재 페이지 활성화 표시
    highlightCurrentPage();
}

// 현재 페이지 하이라이트
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop(); // 파일명만 추출
    const links = document.querySelectorAll('.nav-link, .submenu a');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href === currentPage) {
            // 링크 강조
            link.style.background = 'rgba(255, 255, 255, 0.15)';
            link.style.color = 'white';
            link.style.fontWeight = '700';
            
            // 부모 메뉴 열기
            const parentItem = link.closest('.nav-item.has-submenu');
            if (parentItem) {
                parentItem.classList.add('active');
            }
        }
    });
}

/* ========================================
   유틸리티 함수
======================================== */

// localStorage 안전하게 가져오기
function safeGetLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error(`localStorage 파싱 에러 (${key}):`, e);
        return defaultValue;
    }
}

// localStorage 안전하게 저장하기
function safeSetLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error(`localStorage 저장 에러 (${key}):`, e);
        return false;
    }
}

// 디버그 모드 (개발 시 사용)
const DEBUG_MODE = false; // 배포 시 false로 변경

if (DEBUG_MODE) {
    console.log('=== 결제 페이지 디버그 정보 ===');
    console.log('userData:', localStorage.getItem('userData'));
    console.log('stage1Result:', localStorage.getItem('stage1Result'));
    console.log('stage2Result:', localStorage.getItem('stage2Result'));
    console.log('stage3Result:', localStorage.getItem('stage3Result'));
    console.log('paymentInfo:', localStorage.getItem('paymentInfo'));
}
