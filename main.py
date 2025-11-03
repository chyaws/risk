from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse
import os
import pandas as pd
from datetime import datetime
import sqlite3
from typing import List, Dict, Any, Optional, Generator
from fastapi.staticfiles import StaticFiles
from AI_api import router as ai_router  # 导入AI功能路由器
from risk_api import router as risk_router  # 导入路由器
from import_api import router as import_router  # 导入导入功能路由器
from index import router as index_router  # 导入首页动态数据路由器
import io  # 导入io模块，用于创建BytesIO


app = FastAPI()

# 在创建app实例后添加路由器挂载
app.include_router(risk_router, prefix="/api")
app.include_router(import_router, prefix="/api")  # 挂载导入功能路由器
app.include_router(ai_router, prefix="/api")  # 挂载AI功能路由器
app.include_router(index_router, prefix="/api")  # 挂载首页数据路由器

# 获取当前文件所在目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 挂载主静态目录
app.mount("/static", StaticFiles(directory=os.path.join(current_dir, "static")), name="static")
# 挂载ECharts库（如果echarts-master不在static目录下）
if os.path.exists(os.path.join(current_dir, "static", "libs", "echarts-master")):
    app.mount("/static/libs", StaticFiles(directory=os.path.join(current_dir, "static", "libs", "echarts-master", "dist")), name="libs")


# 添加根路径端点
@app.get("/")
async def root():
    # 直接加载index页面，而不是返回JSON消息
    page_name = "index"
    
    # 定义有效的页面名称映射
    valid_pages = {
        "index": "index.html",
        "risks_table": "risks_table.html",
        "assets_system": "assets_system.html",
        "import_risks": "import_risks.html",
        "ai_report": "ai_report.html",
        "risk_popup": "risk_popup.html"
    }
    
    # 构建文件路径
    file_path = os.path.join(current_dir, "templates", valid_pages[page_name])
    
    # 检查文件是否存在
    if not os.path.exists(file_path):
        return {"detail": f"文件 '{valid_pages[page_name]}' 不存在"}
    
    # 读取并返回文件内容
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    return Response(content=content, media_type="text/html")

# HTML页面服务接口
@app.get("/{page_name}")
async def get_page(page_name: str):
    """
    提供HTML页面服务的统一接口
    支持的页面: index, risks_table, assets_system
    """
    # 定义有效的页面名称映射
    valid_pages = {
        "index": "index.html",
        "risks_table": "risks_table.html",
        "assets_system": "assets_system.html",
        "import_risks": "import_risks.html",
        "ai_report": "ai_report.html",
        "risk_popup": "risk_popup.html"
    }
    
    # 检查请求的页面是否有效
    if page_name not in valid_pages:
        return {"detail": f"页面 '{page_name}' 不存在"}
    
    # 构建文件路径
    file_path = os.path.join(current_dir, "templates", valid_pages[page_name])
    
    # 检查文件是否存在
    if not os.path.exists(file_path):
        return {"detail": f"文件 '{valid_pages[page_name]}' 不存在"}
    
    # 读取并返回文件内容
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    return Response(content=content, media_type="text/html")


# AI API流式调用接口已移至AI_api.py文件中

# 导入功能已移至import_api.py文件中

# 运行应用
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)



# 兼容IDE或浏览器注入的Vite客户端请求，返回空脚本避免404日志
@app.get("/@vite/client")
async def vite_client_stub():
    return Response(content="// Vite client stub", media_type="application/javascript")


