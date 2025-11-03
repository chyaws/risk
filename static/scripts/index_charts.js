// 数字动画效果
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // 格式化数字，添加千位分隔符
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// 初始化整体隐患整治进度图
function initProgressChart() {
    const chartDom = document.getElementById('progressChart');
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: ['整治中', '暂停中', '已完成']
        },
        series: [
            {
                name: '隐患整治进度',
                type: 'pie',
                radius: '70%',
                center: ['50%', '50%'],
                data: [
                    { value: 18, name: '整治中', itemStyle: { color: '#597dd1' } },
                    { value: 5, name: '暂停中', itemStyle: { color: '#f1a258' } },
                    { value: 37, name: '已完成', itemStyle: { color: '#ade292' } }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,   
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    formatter: '{b}\n{c} ({d}%)',
                    fontSize: 12
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    // 动态更新：从后端接口拉取 summary
    fetch('/api/index/summary')
        .then(r => r.json())
        .then(s => {
            const data = [
                { value: (s && s.inProgress) || 0, name: '整治中', itemStyle: { color: '#597dd1' } },
                { value: (s && s.paused) || 0, name: '暂停中', itemStyle: { color: '#f1a258' } },
                { value: (s && s.completed) || 0, name: '已完成', itemStyle: { color: '#ade292' } }
            ];
            myChart.setOption({ series: [{ data }] });
        })
        .catch(() => {});
    
    return myChart;
}

// 初始化分类图表（TOP 3）
function initPrimaryCategoryChart() {
    const chartDom = document.getElementById('primaryCategoryChart');
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, textStyle: { fontSize: 10 } },
        grid: { left: '0%', right: '6%', top: '6%', bottom: '6%', containLabel: true },
        xAxis: { type: 'value' },
        yAxis: {
            type: 'category',
            data: ['通信设备', '传输线路', '电力设备'],
            axisLabel: { fontSize: 10 },
            inverse: true
        },
        series: [{
            type: 'bar',
            data: [12, 8, 5],
            barWidth: 16,
            itemStyle: { color: '#597dd1' },
            emphasis: { itemStyle: { color: '#7aa4e8' } },
            label: { show: true, position: 'right', fontSize: 10 }
        }]
    };
    
    myChart.setOption(option);

    // 动态更新：拉取分类TOP3（横向条形图）
    fetch('/api/index/categories')
        .then(r => r.json())
        .then(d => {
            if (d && Array.isArray(d.primary)) {
                const sorted = d.primary.slice().sort((a, b) => Number(b.value || 0) - Number(a.value || 0));
                const names = sorted.map(i => i.name);
                const values = sorted.map(i => i.value);
                myChart.setOption({ yAxis: { data: names, inverse: true }, series: [{ data: values }] });
            }
        })
        .catch(() => {});

    return myChart;
}

// 初始化详细分类图表（TOP 5）
function initSecondaryCategoryChart() {
    const chartDom = document.getElementById('secondaryCategoryChart');
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, textStyle: { fontSize: 10 } },
        grid: { left: '0%', right: '6%', top: '6%', bottom: '6%', containLabel: true },
        xAxis: { type: 'value' },
        yAxis: {
            type: 'category',
            data: ['光纤连接', '电源故障', '设备散热', '接口松动', '信号衰减'],
            axisLabel: { fontSize: 10 },
            inverse: true
        },
        series: [{
            type: 'bar',
            data: [8, 6, 5, 4, 3],
            barWidth: 14,
            itemStyle: { color: '#36CFC9' },
            emphasis: { itemStyle: { color: '#69D1FF' } },
            label: { show: true, position: 'right', fontSize:  10 }
        }]
    };
    
    myChart.setOption(option);

    // 动态更新：拉取详细分类TOP5（横向条形图）
    fetch('/api/index/categories')
        .then(r => r.json())
        .then(d => {
            if (d && Array.isArray(d.secondary)) {
                const sorted = d.secondary.slice().sort((a, b) => Number(b.value || 0) - Number(a.value || 0));
                const names = sorted.map(i => i.name);
                const values = sorted.map(i => i.value);
-                myChart.setOption({ yAxis: { data: names }, series: [{ data: values }] });
+                myChart.setOption({ yAxis: { data: names, inverse: true }, series: [{ data: values }] });
            }
        })
        .catch(() => {});

    return myChart;
}

// 初始化专业室资产统计图表
function initDepartmentAssetChart() {
    const chartDom = document.getElementById('departmentAssetChart');
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            data: ['传输网络', '空间动力', '基础网络', '传输维护'],
            top: '3%',
            left: 'left',
            orient: 'vertical',
            textStyle: {
                fontSize: 12,
                color: '#666'
            },
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 10
        },
        series: [
            {
                name: '资产数量',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'outside',
                    formatter: '{c} 台',
                    fontSize: 12,
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '12',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: true,
                    length: 15,
                    length2: 30,
                },
                data: [
                    { value: 35, name: '传输网络', itemStyle: { color: '#597dd1' } },
                    { value: 25, name: '空间动力', itemStyle: { color: '#36CFC9' } },
                    { value: 30, name: '基础网络', itemStyle: { color: '#f1a258' } },
                    { value: 15, name: '传输维护', itemStyle: { color: '#ade292' } }
                ]
            }
        ]
    };
    
    myChart.setOption(option);

    // 动态更新：拉取资产统计
    fetch('/api/index/department-assets')
        .then(r => r.json())
        .then(d => {
            if (d && Array.isArray(d.data) && d.data.length > 0) {
                const data = d.data.map(i => ({ value: i.value, name: i.name }));
                const names = data.map(i => i.name);
                myChart.setOption({ legend: { data: names }, series: [{ data }] });
            }
        })
        .catch(() => {});

    return myChart;
}

// 初始化专业隐患统计图表 - 排行样式
function initDepartmentHazardChart() {
    const container = document.getElementById('departmentHazardChart');
    if (!container) return null;

    const renderTable = (items) => {
        const rows = items.map((item, idx) => {
            const v = Number(item.value) || 0;
            const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : '';
            const trClass = idx < 3 ? 'top-row' : '';
            return `
            <tr class="${trClass}">
                <td><span class="rank-badge ${rankClass}">${idx + 1}</span></td>
                <td><span class="dept-chip ${rankClass}">${item.name}</span></td>
                <td class="value-cell ${rankClass}">${v}</td>
            </tr>`;
        }).join('');
        container.innerHTML = `
            <table class="data-table hazard-table">
                <thead>
                    <tr>
                        <th>排名</th>
                        <th>专业室</th>
                        <th>隐患数</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>`;
    };

    const staticData = [
        { value: 20, name: '传输网络' },
        { value: 12, name: '空间动力' },
        { value: 8, name: '基础网络' },
        { value: 5, name: '传输维护' }
    ].sort((a, b) => b.value - a.value);
    renderTable(staticData);

    fetch('/api/index/department-hazards')
        .then(r => r.json())
        .then(d => {
            if (d && Array.isArray(d.data) && d.data.length > 0) {
                const sorted = d.data.slice().sort((a, b) => b.value - a.value);
                renderTable(sorted);
            }
        })
        .catch(() => {});

    return null;
}

// 初始化传输网络优化室图表
function initPowerRoomChart() {
    const chartDom = document.getElementById('powerRoomChart');
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['已完成', '整治中', '待处理'],
            axisLabel: {
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [15, 8, 2],
                type: 'bar',
                itemStyle: {
                    color: function(params) {
                        const colorList = ['#ade292', '#597dd1', '#f1a258'];
                        return colorList[params.dataIndex];
                    }
                }
            }
        ]
    };
    
    myChart.setOption(option);
    return myChart;
}

// 初始化空间与动力维护室图表
function initTransmissionRoomChart() {
    const chartDom = document.getElementById('transmissionRoomChart');
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['已完成', '整治中', '待处理'],
            axisLabel: {
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [10, 5, 3],
                type: 'bar',
                itemStyle: {
                    color: function(params) {
                        const colorList = ['#ade292', '#597dd1', '#f1a258'];
                        return colorList[params.dataIndex];
                    }
                }
            }
        ]
    };
    
    myChart.setOption(option);
    return myChart;
}

// 初始化基础网络维护室图表
function initMaintenanceRoomChart() {
    const chartDom = document.getElementById('maintenanceRoomChart');
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['已完成', '整治中', '待处理'],
            axisLabel: {
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [8, 3, 2],
                type: 'bar',
                itemStyle: {
                    color: function(params) {
                        const colorList = ['#ade292', '#597dd1', '#f1a258'];
                        return colorList[params.dataIndex];
                    }
                }
            }
        ]
    };
    
    myChart.setOption(option);
    return myChart;
}

// 初始化传输网络维护室图表
function initBaseRoomChart() {
    const chartDom = document.getElementById('baseRoomChart');
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['已完成', '整治中', '待处理'],
            axisLabel: {
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [4, 2, 1],
                type: 'bar',
                itemStyle: {
                    color: function(params) {
                        const colorList = ['#52C41A', '#165DFF', '#FF7D00'];
                        return colorList[params.dataIndex];
                    }
                }
            }
        ]
    };
    
    myChart.setOption(option);
    return myChart;
}

// 处理窗口大小变化，重绘图表
function handleResize(charts) {
    window.addEventListener('resize', function() {
        charts.forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    });
}

// 初始化所有图表
function initAllCharts() {
    const charts = [];
    
    // 初始化各个图表
    charts.push(initProgressChart());
    charts.push(initPrimaryCategoryChart());
    charts.push(initSecondaryCategoryChart());
    charts.push(initDepartmentAssetChart());
    charts.push(initDepartmentHazardChart());
    charts.push(initPowerRoomChart());
    charts.push(initTransmissionRoomChart());
    charts.push(initMaintenanceRoomChart());
    charts.push(initBaseRoomChart());
    
    // 添加窗口大小变化处理
    handleResize(charts);
    
    return charts;
}

// 页面加载完成后初始化数据动画和图表
window.addEventListener('load', function() {
    // 动态加载首页总览数值并执行动画，失败时使用默认值回退
    fetch('/api/index/summary')
        .then(r => r.json())
        .then(s => {
            animateValue("inProgress", 0, (s && s.inProgress) || 0, 1500);
            animateValue("paused", 0, (s && s.paused) || 0, 1500);
            animateValue("completed", 0, (s && s.completed) || 0, 1500);
        })
        .catch(() => {
            animateValue("inProgress", 0, 18, 1500);
            animateValue("paused", 0, 5, 1500);
            animateValue("completed", 0, 37, 1500);
        });
    
    // 初始化所有图表
    const charts = initAllCharts();
});