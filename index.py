from fastapi import APIRouter
import os
import sqlite3
from typing import List, Dict, Any

# 创建路由器实例
router = APIRouter()

# 获取当前文件所在目录
current_dir = os.path.dirname(os.path.abspath(__file__))


def _query_db(db_filename: str, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """
    统一的SQLite查询函数：
    - 自动定位数据库路径
    - 安全执行查询并返回字典列表
    - 出错时返回空列表
    """
    db_path = os.path.join(current_dir, "database", db_filename)
    if not os.path.exists(db_path):
        return []
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute(query, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [dict(r) for r in rows]
    except Exception:
        return []


@router.get("/index/department-hazards")
async def get_department_hazards():
    """
    专业室隐患统计（来源：standard_risks.db/标准隐患）
    返回示例：
    {
      "data": [
        {"name": "传输", "value": 120},
        {"name": "动环", "value": 80}
      ]
    }
    """
    # 聚合各专业的隐患数量
    query = (
        'SELECT "专业" as dept, SUM(CAST("隐患数量" AS INTEGER)) as cnt '\
        'FROM 标准隐患 GROUP BY "专业"'
    )
    rows = _query_db("standard_risks.db", query)
    data = [
        {"name": r.get("dept") or "", "value": int(r.get("cnt") or 0)}
        for r in rows
    ]
    # 根据值降序
    data.sort(key=lambda x: x["value"], reverse=True)
    return {"data": data}


@router.get("/index/categories")
async def get_categories_top():
    """
    分类TOP（来源：standard_risks.db/标准隐患）
    返回示例：
    {
      "primary": [{"name": "传输线路", "value": 50}, ...],  # TOP3
      "secondary": [{"name": "光纤连接", "value": 30}, ...]  # TOP5
    }
    """
    # 一级分类TOP3
    q_primary = (
        'SELECT "分类" as cat, SUM(CAST("隐患数量" AS INTEGER)) as cnt '\
        'FROM 标准隐患 GROUP BY "分类" ORDER BY cnt DESC LIMIT 3'
    )
    # 详细分类TOP5
    q_secondary = (
        'SELECT "详细分类" as cat, SUM(CAST("隐患数量" AS INTEGER)) as cnt '\
        'FROM 标准隐患 GROUP BY "详细分类" ORDER BY cnt DESC LIMIT 5'
    )
    rows_p = _query_db("standard_risks.db", q_primary)
    rows_s = _query_db("standard_risks.db", q_secondary)
    primary = [
        {"name": r.get("cat") or "", "value": int(r.get("cnt") or 0)}
        for r in rows_p
    ]
    secondary = [
        {"name": r.get("cat") or "", "value": int(r.get("cnt") or 0)}
        for r in rows_s
    ]
    return {"primary": primary, "secondary": secondary}


@router.get("/index/summary")
async def get_index_summary():
    """
    首页总览数据（暂以标准隐患总量作为进行中，其他状态占位）
    返回示例：
    {"inProgress": 100, "paused": 5, "completed": 37, "source": "db|fallback"}
    """
    # 总隐患数量作为一个参考指标
    q_total = 'SELECT SUM(CAST("隐患数量" AS INTEGER)) as total FROM 标准隐患'
    rows = _query_db("standard_risks.db", q_total)
    total = int((rows[0].get("total") if rows and rows[0].get("total") else 0))
    # 暂无“整治状态”字段，先给出占位逻辑：
    in_progress = total
    paused = 0
    completed = 0
    source = "db" if rows else "fallback"
    return {
        "inProgress": in_progress,
        "paused": paused,
        "completed": completed,
        "source": source
    }


@router.get("/index/department-assets")
async def get_department_assets():
    """
    专业室资产统计（来源：network_assets.db，若未知表结构则返回空）
    期望返回示例：
    {"data": [{"name": "传输网络", "value": 35}, ...]}
    """
    # 试探性查询：优先查找可能的表名和字段
    # 如果你的 assets 表结构不同，可根据实际情况调整此查询
    candidate_tables = ["network_assets", "assets", "资产信息"]
    for tbl in candidate_tables:
        # 检查表是否存在
        check = _query_db("network_assets.db", f"SELECT name FROM sqlite_master WHERE type='table' AND name='{tbl}'")
        if check:
            # 尝试按专业汇总资产数量（假设字段名为 profession 或 专业）
            rows = _query_db(
                "network_assets.db",
                f'SELECT COALESCE("profession", "专业") as dept, COUNT(1) as cnt FROM {tbl} GROUP BY COALESCE("profession", "专业")'
            )
            data = [
                {"name": r.get("dept") or "", "value": int(r.get("cnt") or 0)}
                for r in rows
            ]
            data.sort(key=lambda x: x["value"], reverse=True)
            return {"data": data, "table": tbl}
    # 无法识别有效表结构，返回空
    return {"data": []}