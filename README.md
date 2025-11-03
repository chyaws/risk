# 综合调度及维护中心资源及隐患系统

## 项目简介

本项目是一个用于综合调度及维护中心的资源及隐患管理系统，提供全景监控、标准隐患管理和资产信息管理功能。

## 项目结构

项目采用清晰的结构组织，将前端资源、后端代码、静态资源、数据库和文档分离，便于维护和扩展。

```
myAssetsAndRisks/
├── README.md            # 项目文档
├── main.py              # 后端主程序，包含API接口和静态文件服务
├── index.html           # 全景监控页面
├── risks_table.html     # 标准隐患页面
├── assets_system.html   # 资产信息页面
├── backup/              # 备份文件目录
│   ├── csv_import250914.js
│   ├── csv_import250916.js
│   ├── hazard_table250914.html
│   ├── table_functions250914.js
│   └── 隐患标准2.csv
├── database/            # 数据库目录
│   ├── standard_risks.db
│   └── 标准隐患.csv
├── docs/                # 文档目录
│   └── 3-中国移动广东公司网络运行安全保障体系实施细则（2025版）第三分册：风险隐患管理.docx
├── static/              # 静态资源主目录
│   ├── assets/          # 图片等资源文件
│   │   └── copr01.jpg
│   ├── css/             # 样式表目录
│   │   └── styles.css
│   ├── libs/            # 第三方库目录
│   │   └── echarts-master/
│   └── scripts/         # JavaScript脚本目录
│       ├── category_filter.js   # 分类筛选脚本
│       ├── charts.js            # 图表渲染脚本
│       ├── risks_data_loader.js # 隐患数据加载脚本
│       ├── search_function.js   # 搜索功能脚本
│       └── table_filter.js      # 表格筛选脚本
```

## 静态资源引用规范

所有静态资源引用都统一使用`/static`前缀，具体如下：

- CSS文件：`/static/css/styles.css`
- JavaScript脚本：`/static/scripts/文件名.js`
- ECharts库：`/static/libs/echarts.js`
- 图片资源：`/static/assets/图片名.jpg`

## 后端API接口

系统提供以下API接口：

- `/api/standard-risks` - 获取标准隐患数据
- `/api/chart-data` - 获取图表展示数据

## 如何运行

1. 确保安装了必要的依赖：
   ```
   pip install fastapi uvicorn sqlite3
   ```

2. 运行后端服务器：
   ```
   uvicorn main:app --reload
   ```

3. 在浏览器中访问：
   ```
   http://127.0.0.1:8000
   ```

## 页面功能

1. **全景监控** (`/index`)：展示整体隐患整治进度、分类统计和各专业室数据
2. **标准隐患** (`/risks_table`)：管理和查看标准隐患数据，支持搜索和筛选
3. **资产信息** (`/assets_system`)：管理和查看网元资产信息

## 响应式设计

系统支持响应式设计，适配不同屏幕尺寸，在手机、平板和桌面设备上都能良好显示。