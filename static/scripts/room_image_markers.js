document.addEventListener('DOMContentLoaded', function() {
    // 分类与详细分类的映射关系
    const categoryMap = {
        "网元类": [
            "老旧网元隐患",
            "网元硬件隐患",
            "网元软件隐患",
            "网元容量隐患",
            "网元配置隐患"
        ],
        "组网类": [
            "备用设备/链路/路由不可用隐患",
            "线路隐患",
            "同路由隐患",
            "超大环或长单链隐患",
            "网元无保护隐患",
            "网元同局址隐患",
            "网元备份隐患",
            "业务单侧接入隐患",
            "负载均衡隐患",
            "组网结构不规范"
        ],
        "业务系统类": [
            "业务系统非网元类容灾隐患",
            "业务系统非网元类软件隐患",
            "业务系统非网元类配置隐患",
            "业务系统非网元类容量隐患"
        ],
        "动环设施类": [
            "动环设施低于规范要求隐患",
            "动环设施老旧隐患",
            "动环设施异常隐患",
            "单核心机楼隐患",
            "机房环境安全隐患"
        ],
        "安全类": [
            "数据安全隐患",
            "安全漏洞隐患",
            "防火墙策略隐患",
            "账号口令隐患",
            "设备违规入网隐患"
        ],
        "IT系统类": [
            "网管支撑系统备用隐患",
            "网管支撑系统软件隐患",
            "入网设备托管隐患",
            "网管支撑系统老旧设备隐患",
            "网管支撑系统容量隐患",
            "访问隐患"
        ],
        "其它类": [
            "工具/系统软件隐患",
            "性能隐患",
            "兼容性隐患",
            "其它隐患"
        ]
    };

    // 创建标记点配置
    const markers = [
        { id: 1, x: 70, y: 20, category: "网元类" },
        { id: 2, x: 42, y: 45, category: "组网类" },
        { id: 3, x: 45, y: 25, category: "业务系统类" },
        { id: 4, x: 30, y: 70, category: "动环设施类" },
        { id: 5, x: 60, y: 60, category: "安全类" },
        { id: 6, x: 55, y: 10, category: "IT系统类" },
        { id: 7, x: 50, y: 80, category: "其它类" }
    ];

    // 获取图片容器和图片元素
    const container = document.querySelector('.room-image-container');
    const image = document.querySelector('.room-image');

    if (!container || !image) {
        console.error('未找到图片容器或图片元素');
        return;
    }

    // 设置容器样式为相对定位
    container.style.position = 'relative';

    // 创建悬浮菜单元素
    const popupMenu = document.createElement('div');
    popupMenu.className = 'popup-menu';
    popupMenu.style.position = 'absolute';
    popupMenu.style.display = 'none';
    popupMenu.style.backgroundColor = '#fff';
    popupMenu.style.border = '1px solid #ccc';
    popupMenu.style.borderRadius = '4px';
    popupMenu.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    popupMenu.style.padding = '8px 0';
    popupMenu.style.zIndex = '1000';
    popupMenu.style.maxWidth = '250px';
    document.body.appendChild(popupMenu);
    
    // 初始化一个全局的计时器变量
    let hidePopupTimer = null;
    
    // 为悬浮菜单添加鼠标进入事件
    popupMenu.addEventListener('mouseenter', function() {
        // 清除计时器，保持菜单显示
        if (hidePopupTimer) {
            clearTimeout(hidePopupTimer);
            hidePopupTimer = null;
        }
    });
    
    // 为悬浮菜单添加鼠标离开事件
    popupMenu.addEventListener('mouseleave', function() {
        // 当鼠标离开菜单时隐藏
        popupMenu.style.display = 'none';
    });
    
    // 为每个标记点创建DOM元素
    markers.forEach(marker => {
        const markerContainer = document.createElement('div');
        markerContainer.style.position = 'absolute';
        markerContainer.style.left = `${marker.x}%`;
        markerContainer.style.top = `${marker.y}%`;
        markerContainer.style.transform = 'translate(-50%, -50%)';
        markerContainer.style.display = 'flex';
        markerContainer.style.alignItems = 'center';
        markerContainer.style.zIndex = '100';
        
        // 创建标记点元素
        const markerElement = document.createElement('div');
        markerElement.className = 'image-marker';
        markerElement.dataset.category = marker.category;
        
        // 设置标记点样式
        markerElement.style.width = '12px';
        markerElement.style.height = '12px';
        markerElement.style.backgroundColor = '#ff4d4f';
        markerElement.style.border = '2px solid #fff';
        markerElement.style.borderRadius = '50%';
        markerElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
        markerElement.style.cursor = 'pointer';
        
        // 创建分类名称文本元素
        const categoryLabel = document.createElement('div');
        categoryLabel.className = 'marker-label';
        categoryLabel.textContent = marker.category;
        categoryLabel.style.marginLeft = '8px';
        categoryLabel.style.fontSize = '12px';
        categoryLabel.style.color = '#333';
        categoryLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        categoryLabel.style.padding = '2px 6px';
        categoryLabel.style.borderRadius = '3px';
        categoryLabel.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        
        // 组合元素
        markerContainer.appendChild(markerElement);
        markerContainer.appendChild(categoryLabel);
        
        // 添加到容器
        container.appendChild(markerContainer);
        
        // 添加鼠标悬浮事件
        markerContainer.addEventListener('mouseenter', function(event) {
            // 清除之前的计时器
            if (hidePopupTimer) {
                clearTimeout(hidePopupTimer);
                hidePopupTimer = null;
            }
            showPopupMenu(event.clientX, event.clientY, marker.category);
        });
        
        markerContainer.addEventListener('mouseleave', function() {
            // 设置延时隐藏，让用户有时间将鼠标移动到菜单上
            hidePopupTimer = setTimeout(function() {
                popupMenu.style.display = 'none';
            }, 300);
        });
    });
    
    // 显示悬浮菜单
    function showPopupMenu(x, y, category) {
        // 清空菜单内容
        popupMenu.innerHTML = '';
        
        // 添加分类标题
        const title = document.createElement('div');
        title.className = 'popup-menu-title';
        title.style.fontWeight = 'bold';
        title.style.padding = '4px 16px';
        title.style.borderBottom = '1px solid #f0f0f0';
        title.textContent = category;
        popupMenu.appendChild(title);
        
        // 添加详细分类选项
        if (categoryMap[category]) {
            categoryMap[category].forEach(item => {
                const option = document.createElement('div');
                option.className = 'popup-menu-option';
                option.style.padding = '4px 16px';
                option.style.cursor = 'pointer';
                option.style.fontSize = '14px';
                option.textContent = item;
                
                // 添加选项点击事件
                option.addEventListener('click', function() {
                    // 这里可以添加点击后的处理逻辑
                    console.log('选择了:', category, '->', item);
                    // 可以触发搜索或其他操作
                    triggerSearchByCategory(category, item);
                    popupMenu.style.display = 'none';
                });
                
                // 添加选项悬停效果
                option.addEventListener('mouseenter', function() {
                    option.style.backgroundColor = '#f5f5f5';
                });
                
                option.addEventListener('mouseleave', function() {
                    option.style.backgroundColor = 'transparent';
                });
                
                popupMenu.appendChild(option);
            });
        }
        
        // 显示菜单并设置位置
        popupMenu.style.display = 'block';
        popupMenu.style.left = `${x + 10}px`;
        popupMenu.style.top = `${y + 10}px`;
        
        // 确保菜单位于视口内
        adjustPopupPosition();
    }

    // 调整悬浮菜单位置，确保在视口内
    function adjustPopupPosition() {
        const rect = popupMenu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 检查是否超出右侧边界
        if (rect.right > viewportWidth) {
            popupMenu.style.left = `${parseInt(popupMenu.style.left) - (rect.right - viewportWidth) - 20}px`;
        }
        
        // 检查是否超出底部边界
        if (rect.bottom > viewportHeight) {
            popupMenu.style.top = `${parseInt(popupMenu.style.top) - (rect.bottom - viewportHeight) - 20}px`;
        }
    }

    // 根据分类和详细分类触发搜索
    function triggerSearchByCategory(category, subCategory) {
        // 获取页面上的搜索元素
        const primaryCategorySelect = document.getElementById('primaryCategory');
        const secondaryCategorySelect = document.getElementById('secondaryCategory');
        const searchButton = document.getElementById('searchButton');
        
        if (primaryCategorySelect && secondaryCategorySelect && searchButton) {
            // 设置分类和详细分类
            primaryCategorySelect.value = category;
            
            // 触发分类变更事件，更新详细分类下拉框
            const event = new Event('change');
            primaryCategorySelect.dispatchEvent(event);
            
            // 延迟设置详细分类并触发搜索，确保下拉框已更新
            setTimeout(() => {
                secondaryCategorySelect.value = subCategory;
                secondaryCategorySelect.dispatchEvent(event);
                searchButton.click();
            }, 100);
        }
    }

    // 处理窗口大小变化，确保标记点位置正确
    window.addEventListener('resize', function() {
        // 标记点使用百分比定位，所以不需要额外调整位置
    });

    // 点击页面其他地方关闭悬浮菜单
    document.addEventListener('click', function(event) {
        if (!popupMenu.contains(event.target) && !event.target.classList.contains('image-marker')) {
            popupMenu.style.display = 'none';
        }
    });
});