// AI分析功能实现

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取元素
    const aiAnalyzeButton = document.getElementById('aiAnalyzeButton');
    const inputText = document.getElementById('inputText');
    const newInputBox = document.getElementById('newInputBox');
    const primaryCategory = document.getElementById('primaryCategory');
    const secondaryCategory = document.getElementById('secondaryCategory');
    const analysisResult = document.getElementById('analysisResult');
    const suggestions = document.getElementById('suggestions');
    const uploadButton = document.getElementById('uploadButton');

    // 为AI分析按钮添加点击事件
    if (aiAnalyzeButton && inputText && newInputBox) {
        aiAnalyzeButton.addEventListener('click', function() {
            // 获取输入内容
            const prompt = inputText.value.trim();
            
            // 检查输入是否为空
            if (!prompt) {
                alert('请输入要分析的内容');
                return;
            }
            
            // 清空输出框
            newInputBox.value = '';
            
            // 禁用按钮，防止重复提交
            aiAnalyzeButton.disabled = true;
            aiAnalyzeButton.textContent = '分析中...';
            
            // 调用AI API进行流式响应
            callAiApi(prompt);
        });
    }

    uploadButton.addEventListener('click', async function() {
        const fileInput = document.getElementById('excelFile');
        const departmentSelect = document.getElementById('department');
        const department = departmentSelect.value; // 获取选中的值
        
        // 新增日志：打印专业室值
        console.log("选中的专业室：", department); 
        console.log("专业室是否为空：", !department);
        
        // 原有验证逻辑...
        if (!department) {
            alert('请选择所属专业室');
            return;
        }  
 
        // 验证部门选择
         if (!department) {
         alert('请选择所属专业室');
         return;
     } 
    });
    

    if (uploadButton) {
        uploadButton.addEventListener('click', async function() {
            const fileInput = document.getElementById('excelFile');
            const department = document.getElementById('department').value;
            
            // 1. 验证文件选择
            if (!fileInput.files || fileInput.files.length === 0) {
                alert('请选择要上传的Excel文件');
                return;
            }
            
            // 2. 声明并获取file变量（关键：在使用前定义）
            const file = fileInput.files[0];  // 这里声明file变量
            
            // 3. 验证文件类型（使用已声明的file变量）
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
                alert('请选择Excel文件（.xlsx或.xls格式）');
                return;
            }
            
            // 4. 验证部门选择
            if (!department) {
                alert('请选择所属专业室');
                return;
            }
            
            // 5. 构建FormData，此时file变量已正确定义
            const formData = new FormData();
            formData.append('file', file);  // 这里使用file变量
            formData.append('department', department);
            
            // 后续上传逻辑...
            try {
                this.disabled = true;
                this.textContent = '上传中...';
                
                const response = await fetch('/api/import-risks-excel', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                if (result.status === 'success') {
                    alert(`导入成功！共${result.total}条数据，成功导入${result.success}条，失败${result.failed}条`);
                    fileInput.value = '';
                } else {
                    alert(`导入失败: ${result.message}`);
                }
            } catch (error) {
                console.error('文件上传失败:', error);
                alert('文件上传失败，请重试');
            } finally {
                this.disabled = false;
                this.textContent = '上传隐患文件';
            }
        });
    }
 
    // 调用AI API的函数
    function callAiApi(prompt) {
        // 创建Fetch请求 - 使用查询参数的方式
        fetch(`/api/ai-chat-stream?prompt=${encodeURIComponent(prompt)}`, {
            method: 'POST',
            headers: {
                'Accept': 'text/event-stream'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应错误');
            }
            
            // 获取响应的可读流
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            // 处理流式响应
            function processText({ done, value }) {
                if (done) {
                    // 响应完成，恢复按钮状态
                    aiAnalyzeButton.disabled = false;
                    aiAnalyzeButton.textContent = '大模型AI分析';
                    
                    // 检查newInputBox是否包含3个半角逗号
                    const content = newInputBox.value.trim();
                    const commaCount = (content.match(/,/g) || []).length;
                    
                    if (commaCount >= 3) {
                        // 按照逗号分割内容
                        const parts = content.split(',');
                        
                        // 填充到相应字段
                        if (primaryCategory && parts[0]) {
                            primaryCategory.value = parts[0].trim();
                            // 手动触发change事件，以便更新secondaryCategory
                            primaryCategory.dispatchEvent(new Event('change'));
                        }
                        
                        // 延迟设置secondaryCategory，确保primaryCategory的change事件已处理完成
                        setTimeout(() => {
                            if (secondaryCategory && parts[1]) {
                                // 检查secondaryCategory中是否存在对应的选项
                                let optionFound = false;
                                for (let i = 0; i < secondaryCategory.options.length; i++) {
                                    if (secondaryCategory.options[i].value === parts[1].trim()) {
                                        secondaryCategory.value = parts[1].trim();
                                        optionFound = true;
                                        break;
                                    }
                                }
                            }
                        }, 10);
                        
                        if (analysisResult && parts[2]) {
                            analysisResult.value = parts[2].trim();
                        }
                        
                        if (suggestions && parts.length > 3) {
                            // 第三个逗号之后的所有内容作为隐患标题描述
                            suggestions.value = parts.slice(3).join(',').trim();
                        }
                    }
                    
                    return;
                }
                
                // 解码接收到的数据
                const text = decoder.decode(value, { stream: true });
                
                // 解析event-stream格式的数据
                const lines = text.split('\n');
                
                // 处理每一行数据
                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        // 提取实际数据内容
                        const data = line.substring(6);
                        
                        try {
                            // 解析JSON数据
                            const parsedData = JSON.parse(data);
                            
                            // 根据数据类型处理
                            if (parsedData.type === 'content' && parsedData.text) {
                                // 将新内容追加到输出框
                                newInputBox.value += parsedData.text;
                                // 自动滚动到底部
                                newInputBox.scrollTop = newInputBox.scrollHeight;
                            } else if (parsedData.type === 'error') {
                                console.error('AI分析错误:', parsedData.message);
                                alert('AI分析出错: ' + parsedData.message);
                                // 恢复按钮状态
                                aiAnalyzeButton.disabled = false;
                                aiAnalyzeButton.textContent = '大模型AI分析';
                            } else {
                                // 如果不是预期的JSON格式，可能是纯文本，直接追加
                                newInputBox.value += data;
                                newInputBox.scrollTop = newInputBox.scrollHeight;
                            }
                        } catch (e) {
                            // 如果解析失败，可能是原始文本，直接追加
                            newInputBox.value += data;
                            newInputBox.scrollTop = newInputBox.scrollHeight;
                        }
                    }
                });
                
                // 继续读取下一块数据
                reader.read().then(processText);
            }
            
            // 开始读取流
            reader.read().then(processText);
        })
        .catch(error => {
            console.error('API调用失败:', error);
            alert('AI分析失败，请稍后再试');
            // 恢复按钮状态
            aiAnalyzeButton.disabled = false;
            aiAnalyzeButton.textContent = '大模型AI分析';
        });
    }
});

   