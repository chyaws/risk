// 初始化所有图表
document.addEventListener('DOMContentLoaded', function() {
    // 1. 整体隐患整治进度饼图
    const progressChart = echarts.init(document.getElementById('progressChart'));
    progressChart.setOption({
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: {
                fontSize: 12
            }
        },
        series: [{
            name: '隐患整治进度',
            type: 'pie',
            radius: '60%',
            data: [
                {value: 45, name: '整治中', itemStyle: {color: '#FF6384'}},
                {value: 15, name: '暂停中', itemStyle: {color: '#36A2EB'}},
                {value: 40, name: '已完成', itemStyle: {color: '#4BC0C0'}}
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            label: {
                fontSize: 12
            }
        }]
    });

    // 更新大数字显示
    document.getElementById('inProgress').textContent = '45';
    document.getElementById('paused').textContent = '15';
    document.getElementById('completed').textContent = '40';

    // 2. 按一级隐患分类统计柱状图
    const primaryCategoryChart = echarts.init(document.getElementById('primaryCategoryChart'));
    primaryCategoryChart.setOption({
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
            data: ['组网类', '网元类', '动环设施类'],
            axisLabel: {
                fontSize: 10,
                interval: 0,
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            name: '数量',
            axisLabel: {
                fontSize: 10
            }
        },
        series: [{
            name: '数量',
            type: 'bar',
            data: [25, 30, 15, 20],
            itemStyle: {
                color: '#36A2EB'
            }
        }]
    });

    // 3. 按二级隐患分类统计柱状图
    const secondaryCategoryChart = echarts.init(document.getElementById('secondaryCategoryChart'));
    secondaryCategoryChart.setOption({
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
            data: ['老旧网元隐患', '网元硬件隐患', '网元软件隐患', '网元容量隐患', '网元配置隐患'],
            axisLabel: {
                fontSize: 10,
                interval: 0,
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            name: '数量',
            axisLabel: {
                fontSize: 10
            }
        },
        series: [{
            name: '数量',
            type: 'bar',
            data: [15, 20, 10, 8, 12],
            itemStyle: {
                color: '#FFCE56'
            }
        }]
    });

    // 4. 按专业室资产统计柱状图
    const departmentAssetChart = echarts.init(document.getElementById('departmentAssetChart'));
    departmentAssetChart.setOption({
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
            data: ['传输网络优化室', '空间与动力维护室', '基础网络维护室', '传输网络维护室'],
            axisLabel: {
                fontSize: 10,
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            name: '资产数量',
            axisLabel: {
                fontSize: 10
            }
        },
        series: [{
            name: '资产数量',
            type: 'bar',
            data: [150, 120, 90, 80],
            itemStyle: {
                color: '#4BC0C0'
            }
        }]
    });

    // 5. 按专业室隐患统计柱状图
    const departmentHazardChart = echarts.init(document.getElementById('departmentHazardChart'));
    departmentHazardChart.setOption({
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
            data: ['传输网络优化室', '空间与动力维护室', '基础网络维护室', '传输网络维护室'],
            axisLabel: {
                fontSize: 10,
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            name: '隐患数量',
            axisLabel: {
                fontSize: 10
            }
        },
        series: [{
            name: '隐患数量',
            type: 'bar',
            data: [25, 15, 20, 10],
            itemStyle: {
                color: '#FF6384'
            }
        }]
    });

    // 6. 传输网络优化室隐患等级统计柱状图
    const powerRoomChart = echarts.init(document.getElementById('powerRoomChart'));
    powerRoomChart.setOption({
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
            data: ['整治中', '暂停中', '已处理'],
            axisLabel: {
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            name: '数量',
            axisLabel: {
                fontSize: 10
            }
        },
        series: [{
            name: '数量',
            type: 'bar',
            data: [8, 12, 5],
            itemStyle: {
                color: function(params) {
                    const colors = ['#FF6384', '#FFCE56', '#4BC0C0'];
                    return colors[params.dataIndex];
                }
            }
        }]
    });

    // 7. 空间与动力维护室隐患等级统计柱状图
    const transmissionRoomChart = echarts.init(document.getElementById('transmissionRoomChart'));
    transmissionRoomChart.setOption({
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
            data: ['整治中', '暂停中', '已处理'],
            axisLabel: {
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            name: '数量',
            axisLabel: {
                fontSize: 10
            }
        },
        series: [{
            name: '数量',
            type: 'bar',
            data: [5, 8, 2],
            itemStyle: {
                color: function(params) {
                    const colors = ['#FF6384', '#FFCE56', '#4BC0C0'];
                    return colors[params.dataIndex];
                }
            }
        }]
    });

    // 8. 基础网络维护室隐患等级统计柱状图
    const maintenanceRoomChart = echarts.init(document.getElementById('maintenanceRoomChart'));
    maintenanceRoomChart.setOption({
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
            data: ['整治中', '暂停中', '已处理'],
            axisLabel: {
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            name: '数量',
            axisLabel: {
                fontSize: 10
            }
        },
        series: [{
            name: '数量',
            type: 'bar',
            data: [6, 10, 4],
            itemStyle: {
                color: function(params) {
                    const colors = ['#FF6384', '#FFCE56', '#4BC0C0'];
                    return colors[params.dataIndex];
                }
            }
        }]
    });

    // 9. 传输网络维护室隐患等级统计柱状图
    const baseRoomChart = echarts.init(document.getElementById('baseRoomChart'));
    baseRoomChart.setOption({
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
            data: ['整治中', '暂停中', '已处理'],
            axisLabel: {
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            name: '数量',
            axisLabel: {
                fontSize: 10
            }
        },
        series: [{
            name: '数量',
            type: 'bar',
            data: [3, 5, 2],
            itemStyle: {
                color: function(params) {
                    const colors = ['#FF6384', '#FFCE56', '#4BC0C0'];
                    return colors[params.dataIndex];
                }
            }
        }]
    });

    // 响应式调整
    window.addEventListener('resize', function() {
        progressChart.resize();
        primaryCategoryChart.resize();
        secondaryCategoryChart.resize();
        departmentAssetChart.resize();
        departmentHazardChart.resize();
        powerRoomChart.resize();
        transmissionRoomChart.resize();
        maintenanceRoomChart.resize();
        baseRoomChart.resize();
    });
});