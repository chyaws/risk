from fastapi import APIRouter, UploadFile, File, Form
import os
import pandas as pd
from datetime import datetime
import sqlite3
import io

# 创建路由器实例
router = APIRouter()

# 专业室-表名映射（根据实际需求配置）
DEPT_TABLE_MAPPING = {
    "传输网络优化室": "risks_transport",
    "空间与动力维护室": "risks_space",
    "综合管理室": "risks_management"
}

@router.post("/import-risks-excel")
async def import_risks_excel(
    file: UploadFile = File(...),
    department: str = Form(...)
):
    try:
        # 1. 验证专业室，确定目标表名
        if department not in DEPT_TABLE_MAPPING:
            return {"status": "error", "message": f"未配置[{department}]的目标表"}
        target_table = DEPT_TABLE_MAPPING[department]

        # 2. 连接数据库，获取目标表的字段列表（核心步骤1：获取表字段）
        db_path = os.path.join(os.path.dirname(__file__), "database", "risk.db")
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # 2.1 确保目标表存在（若不存在则创建基础结构）
        cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS {target_table} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            序号 TEXT,
            隐患标题 TEXT,
            隐患级别 TEXT,
            隐患说明 TEXT,
            录入时间 TIMESTAMP,
            录入部门 TEXT
        )
        ''')

        # 2.2 查询表结构，提取字段名（SQLite专用：PRAGMA table_info(表名)）
        cursor.execute(f"PRAGMA table_info({target_table})")
        # 结果格式：(字段序号, 字段名, 字段类型, ...)，只保留字段名
        db_fields = [row[1] for row in cursor.fetchall()]
        print(f"目标表[{target_table}]的字段：{db_fields}")  # 调试用

        # 3. 读取Excel文件（核心步骤2：读取Excel数据）
        file_content = await file.read()
        df = pd.read_excel(io.BytesIO(file_content))
        if df.empty:
            return {"status": "error", "message": "Excel文件为空"}

        # 4. 筛选并导入数据（核心步骤3：按表字段筛选Excel数据）
        success_count = 0
        for index, row in df.iterrows():
            try:
                # 4.1 将Excel行转为字典（键：Excel列名，值：单元格内容）
                excel_data = row.to_dict()

                # 4.2 筛选：只保留数据库中存在的字段（忽略大小写和空格差异）
                # 清洗Excel列名（去空格、转小写），方便匹配
                filtered_data = {}
                for excel_col, value in excel_data.items():
                    # 清洗Excel列名（如"隐患 标题"→"隐患标题"，"YinHuanJiBie"→"yinhuanjibie"）
                    clean_excel_col = str(excel_col).strip()
                    # 遍历数据库字段，找匹配项（数据库字段也转小写比对）
                    matched_db_field = next(
                        (db_field for db_field in db_fields 
                         if clean_excel_col == db_field.strip()), 
                        None  # 无匹配则返回None
                    )
                    if matched_db_field:
                        # 匹配成功，用数据库原始字段名作为键，值转为字符串（避免类型错误）
                        filtered_data[matched_db_field] = str(value) if pd.notna(value) else ""

                # 4.3 补充系统字段（如录入时间、录入部门，若表中存在这些字段）
                if "录入时间" in db_fields:
                    filtered_data["录入时间"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                if "录入部门" in db_fields:
                    filtered_data["录入部门"] = department

                # 4.5 动态生成INSERT语句（字段和值与筛选结果一致）
                # 字段列表：如["序号", "隐患标题", "录入时间"]
                fields = list(filtered_data.keys())
                # 对每个字段名添加双引号（处理包含/、空格、括号等特殊字符的字段）
                quoted_fields = [f'"{field}"' for field in fields]  # 例如："楼栋名称/机房名称"
                # 占位符：如":序号, :隐患标题, :录入时间"
                placeholders = ", ".join([f":{field}" for field in fields])
                # 执行插入
                cursor.execute(f'''
                     INSERT INTO {target_table} ({", ".join(quoted_fields)})
                     VALUES ({placeholders})
                 ''', filtered_data)
                
                # 生成SQL后，添加打印语句
                sql = f'''
                    INSERT INTO {target_table} ({", ".join(quoted_fields)})
                    VALUES ({placeholders})
                '''
                print("生成的SQL语句：", sql)  # 查看控制台输出
                cursor.execute(sql, filtered_data)

                
                success_count += 1
                print(f"第{index+1}行成功：导入字段{fields}")

            except Exception as e:
                print(f"第{index+1}行失败：{str(e)}")
                continue

        # 提交事务，关闭连接
        conn.commit()
        conn.close()

        return {
            "status": "success",
            "message": f"导入完成！共{len(df)}条，成功{success_count}条，失败{len(df)-success_count}条",
            "total": len(df),
            "success": success_count,
            "failed": len(df) - success_count,
            "db_fields": db_fields  # 返回表字段，方便调试
        }

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return {"status": "error", "message": f"导入失败：{str(e)}"}