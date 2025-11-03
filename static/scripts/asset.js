// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取表单元素
    const departmentSelect = document.getElementById('department');
    const assetNameInput = document.getElementById('asset_name');
    const deviceTypeInput = document.getElementById('device_type');
    const roomNameInput = document.getElementById('belong_room');
    const searchButton = document.getElementById('searchButton');

    // 分页控件
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');

    // 分页状态
    let currentPage = 1;
    let pageSize = 20;
    let lastResultCount = 0;

    // 断言DOM元素存在，便于调试
    if (!departmentSelect || !assetNameInput || !deviceTypeInput || !roomNameInput || !searchButton) {
        console.error('资产筛选控件未找到：', {
            departmentSelect, assetNameInput, deviceTypeInput, roomNameInput, searchButton
        });
        return;
    }

    // 获取表格的tbody元素
    const tbody = document.querySelector('.hazard-table tbody');

    // 事件绑定：选择变化或回车即触发筛选（重置到第1页）
    departmentSelect.addEventListener('change', () => { currentPage = 1; filterAssets(); });
    assetNameInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            currentPage = 1;
            filterAssets();
        }
    });
    deviceTypeInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            currentPage = 1;
            filterAssets();
        }
    });
    roomNameInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            currentPage = 1;
            filterAssets();
        }
    });

    // 点击搜索按钮触发筛选（重置到第1页）
    searchButton.addEventListener('click', () => { currentPage = 1; filterAssets(); });

    // 分页事件
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', () => {
            const val = parseInt(pageSizeSelect.value, 10);
            pageSize = isNaN(val) ? 20 : val;
            currentPage = 1;
            filterAssets();
        });
    }
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage -= 1;
                filterAssets();
            }
        });
    }
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            // 如果上一页返回数量足够，允许翻到下一页
            if (lastResultCount === pageSize) {
                currentPage += 1;
                filterAssets();
            }
        });
    }

    function updatePaginationUI() {
        if (pageInfo) {
            pageInfo.textContent = `第 ${currentPage} 页`;
        }
        if (prevPageBtn) {
            prevPageBtn.disabled = currentPage <= 1;
        }
        if (nextPageBtn) {
            nextPageBtn.disabled = lastResultCount < pageSize; // 不满一页则禁用下一页
        }
        if (pageSizeSelect) {
            pageSizeSelect.value = String(pageSize);
        }
    }

    // 筛选资产数据的函数
    function filterAssets() {
        // 获取输入值
        const profession = departmentSelect.value || '';
        const asset_name = assetNameInput.value.trim() || '';
        const device_type = deviceTypeInput.value.trim() || '';
        const belong_room = roomNameInput.value.trim() || '';

        // 构建查询参数（与后端 /api/network-assets 的参数名对应）
        const params = [];

        if (profession) {
            params.push(`profession=${encodeURIComponent(profession)}`);
        }
        if (asset_name) {
            params.push(`asset_name=${encodeURIComponent(asset_name)}`);
        }
        if (device_type) {
            params.push(`device_type=${encodeURIComponent(device_type)}`);
        }
        if (belong_room) {
            params.push(`belong_room=${encodeURIComponent(belong_room)}`);
        }
        // 分页参数
        params.push(`page=${currentPage}`);
        params.push(`page_size=${pageSize}`);

        const queryParams = params.length > 0 ? ('?' + params.join('&')) : '';

        // 调用后端API
        fetch(`/api/network-assets${queryParams}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应错误');
                }
                return response.json();
            })
            .then(data => {
                // 清空tbody
                tbody.innerHTML = '';

                // 无数据时提示
                if (!Array.isArray(data) || data.length === 0) {
                    lastResultCount = 0;
                    const emptyRow = document.createElement('tr');
                    emptyRow.innerHTML = '<td colspan="6" style="text-align: center;">暂无符合条件的数据</td>';
                    tbody.appendChild(emptyRow);
                    updatePaginationUI();
                    return;
                }

                lastResultCount = data.length;

                // 渲染数据到表格
                data.forEach((item, index) => {
                    const row = document.createElement('tr');
                    const seq = index + 1 + (currentPage - 1) * pageSize;
                    row.innerHTML = `
                        <td>${seq}</td>
                        <td>${item['profession'] || ''}</td>
                        <td>${item['asset_name'] || ''}</td>
                        <td>${item['device_type'] || ''}</td>
                        <td>${item['belong_room'] || ''}</td>
                        <td>${item['related_risk'] || ''}</td>
                    `;
                    tbody.appendChild(row);
                });

                updatePaginationUI();
            })
            .catch(error => {
                console.error('获取数据时出错:', error);
                tbody.innerHTML = '';
                const errorRow = document.createElement('tr');
                errorRow.innerHTML = '<td colspan="6" style="text-align: center; color: red;">获取数据失败，请刷新页面重试</td>';
                tbody.appendChild(errorRow);
                lastResultCount = 0;
                updatePaginationUI();
            });
    }

    // 初始化时加载数据
    filterAssets();
});