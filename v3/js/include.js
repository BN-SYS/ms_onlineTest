/* ========================================
   Include 공통 스크립트
   js/include.js
   ======================================== */

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
    }
});

/* ========================================
   일반 사용자 페이지 Include
   ======================================== */

// 일반 헤더 로드
function loadUserHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;
    
    fetch('includes/header.html')
        .then(response => {
            if (!response.ok) throw new Error('헤더 로드 실패');
            return response.text();
        })
        .then(data => {
            headerPlaceholder.innerHTML = data;
            initUserHeader();
        })
        .catch(error => {
            console.error('헤더 로드 에러:', error);
            headerPlaceholder.innerHTML = '<p style="color:red;">헤더 로드 실패</p>';
        });
}

// 일반 푸터 로드
function loadUserFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;
    
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
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
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
