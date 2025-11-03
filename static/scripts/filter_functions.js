// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    //获取下拉框元素
    const departmentSelect = document.getElementById('department');
    const primaryCategorySelect = document.getElementById('primaryCategory');
    const secondaryCategorySelect = document.getElementById('secondaryCategory');
    const hazardRatingSelect = document.getElementById('hazardRating');
    const hazardNameInput = document.getElementById('hazardName');
    const searchButton = document.getElementById('searchButton');
    
    // 获取表格的tbody元素
    const tbody = document.querySelector('.hazard-table tbody');
    
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
    
    //根据分类更新详细分类下拉框选项
    function updateSecondaryCategory() {
        const selectedCategory = primaryCategorySelect.value;
        
        // 清空详细分类下拉框
        secondaryCategorySelect.innerHTML = '<option value="">全部</option>';
        
        // 如果有选中的分类且存在对应的详细分类
        if (selectedCategory && categoryMap[selectedCategory]) {
            // 添加对应的详细分类选项
            categoryMap[selectedCategory].forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                secondaryCategorySelect.appendChild(option);
            });
        }
    }
    
    // 为下拉框添加change事件监听器
    departmentSelect.addEventListener('change', filterRisks);
    primaryCategorySelect.addEventListener('change', function() {
        updateSecondaryCategory();
        filterRisks();
    });
    secondaryCategorySelect.addEventListener('change', filterRisks);
    hazardRatingSelect.addEventListener('change', filterRisks);
    
    // 为搜索按钮添加点击事件监听器
    searchButton.addEventListener('click', filterRisks);
    
    // 为隐患标题输入框添加回车键事件
    hazardNameInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterRisks();
        }
    });
    
    // 筛选隐患数据的函数
    function filterRisks() {
        // 获取下拉框的值
        const department = departmentSelect.value || '';
        const primaryCategory = primaryCategorySelect.value || '';
        const secondaryCategory = secondaryCategorySelect.value || '';
        const hazardRating = hazardRatingSelect.value || '';
        const hazardName = hazardNameInput.value.trim() || '';
        
        // 构建请求参数对象
        const requestBody = {};
        if (department) requestBody.专业 = department;
        if (primaryCategory) requestBody.分类 = primaryCategory;
        if (secondaryCategory) requestBody.详细分类 = secondaryCategory;
        if (hazardRating) requestBody.隐患级别 = hazardRating;
        if (hazardName) requestBody.隐患标题 = hazardName;
        
        // 发送POST请求到API，通过请求体传输数据
        fetch('/api/standard-risks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应错误');
                }
                return response.json();
            })
            .then(data => {
                // 清空tbody
                tbody.innerHTML = '';
                
                // 检查是否有数据
                if (data.length === 0) {
                    const emptyRow = document.createElement('tr');
                    emptyRow.innerHTML = '<td colspan="9" style="text-align: center;">暂无符合条件的数据</td>';
                    tbody.appendChild(emptyRow);
                    return;
                }
                
                // 填充数据到表格
                data.forEach((item, index) => {
                    const row = document.createElement('tr');
                    
                    // 构建表格行内容
                    row.innerHTML = `
                        <td>${item['序号'] || index + 1}</td>
                        <td>${item['专业'] || ''}</td>
                        <td>${item['分类'] || ''}</td>
                        <td>${item['详细分类'] || ''}</td>
                        <td>${item['隐患标题'] || ''}</td>
                        <td>${item['隐患标题说明'] || ''}</td>
                        <td>${item['隐患级别'] || ''}</td>
                        <td>${item['网络层级'] || ''}</td>
                        <td>${item['隐患数量'] || ''}</td>
                    `;
                    
                    // 打开弹窗显示隐患详情
                    function openRiskDetailModal(data) {
                        // 创建弹窗容器
                        const modalContainer = document.createElement('div');
                        modalContainer.id = 'riskDetailModal';
                        modalContainer.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background-color: rgba(0, 0, 0, 0.5);
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            z-index: 1000;
                        `;

                        // 创建弹窗内容和iframe
                        const modalContent = document.createElement('div');
                        modalContent.style.cssText = `
                            background-color: white;
                            border-radius: 8px;
                            width: 95%;
                            max-width: 95vw;
                            height: 95%;
                            max-height: 95vh;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                            overflow: hidden;
                        `;

                        const iframe = document.createElement('iframe');
            iframe.src = '/risk_popup';
                        iframe.style.cssText = `
                            width: 100%;
                            height: 100%;
                            border: none;
                        `;
                        iframe.id = 'riskDetailFrame';

                        // 组装弹窗结构
                        modalContent.appendChild(iframe);
                        modalContainer.appendChild(modalContent);
                        
                        // 添加到页面
                        document.body.appendChild(modalContainer);

                        // 关闭弹窗的函数
                        function closeModal() {
                            modalContainer.remove();
                        }

                        // 保存到window对象，让iframe可以调用
                        window.closeRiskDetailModal = closeModal;

                        // 等待iframe加载完成后传递数据
                        iframe.onload = function() {
                            if (iframe.contentWindow) {
                                iframe.contentWindow.postMessage({
                                    type: 'riskData',
                                    payload: data
                                }, '*');
                            }
                        };

                        // 点击弹窗外部关闭
                        modalContainer.addEventListener('click', function(event) {
                            if (event.target === modalContainer) {
                                closeModal();
                            }
                        });

                        // ESC键关闭
                        document.addEventListener('keydown', function(event) {
                            if (event.key === 'Escape') {
                                closeModal();
                            }
                        });
                    }
                    
                    // 添加点击事件监听器
                    row.addEventListener('click', function() {
                        // 获取当前行的数据
                        const rowData = item;
                        const specialty = rowData['专业'] || '';
                        const riskTitle = rowData['隐患标题'] || '';
                        
                        // 调用specialty-risk-query API
                        fetch('/api/specialty-risk-query', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ '专业': specialty, '隐患标题': riskTitle })
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log('API返回结果:', data);
                            // 调用弹窗函数显示详情
                            openRiskDetailModal(data);
                        })
                        .catch(error => {
                            console.error('API调用失败:', error);
                        });
                    });
                    
                    // 添加鼠标悬停效果，提升用户体验
                    row.style.cursor = 'pointer';
                    row.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = '#f5f5f5';
                    });
                    row.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = '';
                    });
                    
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('获取数据时出错:', error);
                tbody.innerHTML = '';
                const errorRow = document.createElement('tr');
                errorRow.innerHTML = '<td colspan="9" style="text-align: center; color: red;">获取数据失败，请刷新页面重试</td>';
                tbody.appendChild(errorRow);
            });
    }
    
    // 初始化时加载数据
    filterRisks();
});