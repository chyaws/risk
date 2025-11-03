// 现代化UI交互效果脚本

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 导航栏滚动效果
    const header = document.querySelector('.header-container');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 滚动超过100px时添加scrolled类
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // 为数据项添加进入视图时的动画
    const dataItems = document.querySelectorAll('.data-item, .chart-container');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    dataItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(item);
    });
    
    // 用户菜单交互功能
const userMenuBtn = document.querySelector('.user-menu-btn');
const userMenuContainer = document.querySelector('.user-menu-container');
const userDropdownMenu = document.querySelector('.user-dropdown-menu');
    
// 添加延迟关闭功能的变量
let closeMenuTimeout;
    
if (userMenuBtn && userDropdownMenu) {
    // 修复点击按钮切换菜单显示状态的逻辑
      userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // 保留原有的动画效果
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
        
        // 切换下拉菜单的显示状态
        const isVisible = window.getComputedStyle(userDropdownMenu).display === 'block';
        if (isVisible) {
            userDropdownMenu.style.display = 'none';
        } else {
            // 强制显示下拉菜单
            userDropdownMenu.style.display = 'block';
            userDropdownMenu.style.opacity = '1';
            userDropdownMenu.style.transform = 'translateY(0)';
        }
        
        // // 显示提示
        // showNotification('用户菜单已打开');
    });
    
    // 点击下拉菜单项时的处理
    const dropdownItems = userDropdownMenu.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            // 点击后关闭下拉菜单
            userDropdownMenu.style.display = 'none';
        });
    });
    
    // 菜单容器悬停时显示下拉菜单并取消关闭计时器
    if (userMenuContainer) {
        userMenuContainer.addEventListener('mouseenter', function() {
            if (closeMenuTimeout) {
                clearTimeout(closeMenuTimeout);
            }
            // 确保下拉菜单在悬停时显示
            userDropdownMenu.style.display = 'block';
            userDropdownMenu.style.opacity = '1';
            userDropdownMenu.style.transform = 'translateY(0)';
        });
    }
    
    // 菜单悬停时取消关闭计时器
    userDropdownMenu.addEventListener('mouseenter', function() {
        if (closeMenuTimeout) {
            clearTimeout(closeMenuTimeout);
        }
    });
    
    // 菜单容器离开时设置延迟关闭
    if (userMenuContainer) {
        userMenuContainer.addEventListener('mouseleave', function() {
            closeMenuTimeout = setTimeout(function() {
                userDropdownMenu.style.display = 'none';
            }, 300); // 300毫秒延迟，给用户足够时间移动鼠标
        });
    }
    
    // 菜单离开时设置延迟关闭
    userDropdownMenu.addEventListener('mouseleave', function() {
        closeMenuTimeout = setTimeout(function() {
            userDropdownMenu.style.display = 'none';
        }, 300); // 300毫秒延迟
    });
}

// 点击页面其他地方立即关闭菜单
document.addEventListener('click', function(e) {
    if (userMenuContainer && userDropdownMenu) {
        // 如果点击的不是用户菜单容器及其子元素
        if (!userMenuContainer.contains(e.target)) {
            if (closeMenuTimeout) {
                clearTimeout(closeMenuTimeout);
            }
            userDropdownMenu.style.display = 'none';
        }
    }
});
    
    // 简单的通知提示函数
    function showNotification(message) {
        // 检查是否已存在通知元素
        let notification = document.querySelector('.notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
        
        // 3秒后隐藏通知
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
        }, 3000);
    }
    
    // 为图表容器添加加载状态（如果需要）
    function setupChartLoadingStates() {
        const chartContainers = document.querySelectorAll('.chart-container');
        
        chartContainers.forEach(container => {
            // 为每个图表容器添加加载指示器
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'chart-loading';
            loadingIndicator.style.display = 'none';
            container.appendChild(loadingIndicator);
        });
    }
    
    // 初始化图表加载状态
    // setupChartLoadingStates(); // 根据实际需要启用
    
    // 添加CSS样式
    function addNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 80px;
                right: 20px;
                background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                opacity: 0;
                transform: translateY(-20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                font-size: 14px;
                font-weight: 500;
                max-width: 300px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            @media (max-width: 768px) {
                .notification {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                    white-space: normal;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 添加通知样式
    addNotificationStyles();
});