from fastapi import APIRouter
from pydantic import BaseModel
import os
import sqlite3
from typing import List, Dict, Any, Optional

# 创建路由器实例
router = APIRouter()

# 获取当前文件所在目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 定义请求体模型
class RiskFilterParams(BaseModel):
    序号: Optional[str] = None
    专业: Optional[str] = None
    分类: Optional[str] = None
    详细分类: Optional[str] = None
    隐患标题: Optional[str] = None
    隐患标题说明: Optional[str] = None
    隐患级别: Optional[str] = None
    网络层级: Optional[str] = None

# 数据API - 支持可选参数筛选
@router.post("/standard-risks", response_model=List[Dict[str, Any]])
async def get_standard_risks(params: RiskFilterParams):
    """
    获取标准隐患数据库中的记录，可选参数支持筛选
    如果有输入参数，则筛选数据库中该列包含该内容的条目
    没有输入参数则获取全部记录
    """
    # 数据库文件路径
    db_path = os.path.join(current_dir, "database", "standard_risks.db")
    
    # 检查数据库文件是否存在
    if not os.path.exists(db_path):
        return []
    
    try:
        # 连接到SQLite数据库
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # 这样可以通过列名访问值
        cursor = conn.cursor()
        
        # 基础查询语句
        query = '''
            SELECT 
                "序号", "专业", "分类", "详细分类", 
                "隐患标题", "隐患标题说明", "隐患级别", "网络层级", "隐患数量"
            FROM 标准隐患
        '''
        
        # 构建WHERE条件和参数列表
        where_conditions = []
        db_params = []
        
        # 检查每个参数是否有值，如果有则添加到WHERE条件中
        if params.序号 is not None:
            where_conditions.append('"序号" LIKE ?')
            db_params.append(f'%{params.序号}%')
        
        if params.专业 is not None:
            where_conditions.append('"专业" LIKE ?')
            db_params.append(f'%{params.专业}%')
        
        if params.分类 is not None:
            where_conditions.append('"分类" LIKE ?')
            db_params.append(f'%{params.分类}%')
        
        if params.详细分类 is not None:
            where_conditions.append('"详细分类" LIKE ?')
            db_params.append(f'%{params.详细分类}%')
        
        if params.隐患标题 is not None:
            where_conditions.append('"隐患标题" LIKE ?')
            db_params.append(f'%{params.隐患标题}%')
        
        if params.隐患标题说明 is not None:
            where_conditions.append('"隐患标题说明" LIKE ?')
            db_params.append(f'%{params.隐患标题说明}%')
        
        if params.隐患级别 is not None:
            where_conditions.append('"隐患级别" LIKE ?')
            db_params.append(f'%{params.隐患级别}%')
        
        if params.网络层级 is not None:
            where_conditions.append('"网络层级" LIKE ?')
            db_params.append(f'%{params.网络层级}%')
        
        # 如果有WHERE条件，则添加到查询语句中
        if where_conditions:
            query += ' WHERE ' + ' AND '.join(where_conditions)
        
        # 执行查询
        cursor.execute(query, db_params)
        
        # 获取所有结果
        rows = cursor.fetchall()
        
        # 将结果转换为字典列表
        result = []
        for row in rows:
            result.append(dict(row))
        
        # 按隐患数量从大到小排序
        result.sort(key=lambda x: int(x.get('隐患数量', 0)), reverse=True)
        
        # 关闭连接
        cursor.close()
        conn.close()
        
        return result
    except sqlite3.Error as e:
        print(f"数据库错误: {e}")
        return []
        
        
# 定义专业隐患查询请求模型
class SpecialtyRiskQuery(BaseModel):
    专业: str
    隐患标题: str


# 专业隐患查询接口
@router.post("/specialty-risk-query", response_model=List[Dict[str, Any]])
async def query_specialty_risk(query: SpecialtyRiskQuery):
    """
    根据专业和隐患标题查询隐患数据
    当专业为"传输"时，从risks_chuanyou2表中查询
    查询条件为表中"隐患名称"等于输入的"隐患标题"
    返回符合条件的所有列数据
    """
    # 数据库文件路径
    db_path = os.path.join(current_dir, "database", "standard_risks.db")
    
    # 检查数据库文件是否存在
    if not os.path.exists(db_path):
        return []
    
    try:
        # 连接到SQLite数据库
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # 这样可以通过列名访问值
        cursor = conn.cursor()
        
        # 当专业为"传输"时，从risks_chuanyou2表查询
        if query.专业 == "传输":
            # 先检查表是否存在
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='risks_chuanyou2'")
            if not cursor.fetchone():
                conn.close()
                return []
            
            # 查询表的所有列
            cursor.execute("PRAGMA table_info(risks_chuanyou2)")
            columns = [col[1] for col in cursor.fetchall()]
            
            # 构建查询语句
            columns_str = ", ".join([f'"{col}"' for col in columns])
            query_sql = f"SELECT {columns_str} FROM risks_chuanyou2 WHERE \"隐患名称\" = ?"
            
            # 执行查询
            cursor.execute(query_sql, (query.隐患标题,))
        elif query.专业 == "动环":
            # 当专业为"动环"时，从risks_space表查询
            # 先检查表是否存在
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='risks_space'")
            if not cursor.fetchone():
                conn.close()
                return []
            
            # 查询表的所有列
            cursor.execute("PRAGMA table_info(risks_space)")
            columns = [col[1] for col in cursor.fetchall()]
            
            # 构建查询语句
            columns_str = ", ".join([f'"{col}"' for col in columns])
            query_sql = f"SELECT {columns_str} FROM risks_space WHERE \"隐患名称\" = ?"
            
            # 执行查询
            cursor.execute(query_sql, (query.隐患标题,))
        else:
            # 其他专业暂时返回空列表
            conn.close()
            return []
        
        # 获取所有结果
        rows = cursor.fetchall()
        
        # 将结果转换为字典列表
        result = []
        for row in rows:
            result.append(dict(row))
        
        # 关闭连接
        cursor.close()
        conn.close()
        
        return result
    except sqlite3.Error as e:
        print(f"数据库错误: {e}")
        return []