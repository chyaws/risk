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

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取下拉框元素
    const primaryCategory = document.getElementById('primaryCategory');
    const secondaryCategory = document.getElementById('secondaryCategory');
    
    // 如果找不到元素，不执行后续代码
    if (!primaryCategory || !secondaryCategory) {
        console.error('未找到分类下拉框元素');
        return;
    }
    
    // 当主分类改变时，更新详细分类
    primaryCategory.addEventListener('change', function() {
        // 获取当前选择的主分类
        const selectedCategory = this.value;
        
        // 清空详细分类下拉框（保留第一个"全部"选项）
        secondaryCategory.innerHTML = '<option value="">全部</option>';
        
        // 如果选择了具体的主分类，则添加对应的详细分类选项
        if (selectedCategory && categoryMap[selectedCategory]) {
            categoryMap[selectedCategory].forEach(subCategory => {
                const option = document.createElement('option');
                option.value = subCategory;
                option.textContent = subCategory;
                secondaryCategory.appendChild(option);
            });
        }
    });
    
    // 初始化时触发一次change事件，确保详细分类下拉框与主分类下拉框的初始状态一致
    primaryCategory.dispatchEvent(new Event('change'));
});