# encoding:utf-8

import json
import time
import jwt
import requests
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

# 创建路由器实例
router = APIRouter()


def generate_token(apikey: str, exp_seconds: int):
    try:
        id, secret = apikey.split(".")
    except Exception as e:
        raise Exception("invalid apikey", e)

    payload = {
        "api_key": id,
        "exp": int(round(time.time())) + exp_seconds,
        "timestamp": int(round(time.time())),
    }

    return jwt.encode(
        payload,
        secret,
        algorithm="HS256",
        headers={"alg": "HS256", "typ": "JWT", "sign_type": "SIGN"},
    )


# 添加流式生成器函数，用于FastAPI的StreamingResponse
def create_ai_stream_generator(prompt):
    """
    创建一个生成器，用于流式返回AI API的响应内容
    
    参数:
        prompt: 提示文本
        
    返回:
        生成器对象，产生JSON格式的字符串
    """
    # 保持不变的参数
    apiKey = "67b28fdf0e259900a02ca9af.WBhPKLB4PMZuzFSN240t+stlox26Ti4R"
    appId = "68d2741225659d60b3e1df74"
    stream = True
    token_exp_seconds = 3600
    history = []
    
    try:
        # 生成token
        jwt_token = generate_token(apiKey, token_exp_seconds)
        
        # 设置请求头
        headers = {'content-type': "application/json", "Authorization": "Bearer " + jwt_token}
        
        # 发送请求
        response = requests.post(
            "https://jiutian.10086.cn/largemodel/tmaas/api/v2/completions",
            json={
                "appId": appId,
                "prompt": prompt,
                "history": history,
                "stream": stream
            },
            headers=headers,
            stream=stream
        )
        
        # 处理响应
        if response.status_code == 200:
            for line in response.iter_lines():
                if line:
                    text = line.decode('utf-8')
                    # 解析JSON数据
                    data = json.loads(text[5:])
                    # 检查是否存在choices.delta.text路径
                    if 'choices' in data and len(data['choices']) > 0:
                        choice = data['choices'][0]
                        if 'delta' in choice and 'text' in choice['delta']:
                            # 获取当前片段的文本
                            current_text = choice['delta']['text']
                            # 生成JSON格式的事件流数据
                            yield json.dumps({"text": current_text, "type": "content"}, ensure_ascii=False) + '\n'
            # 发送结束标志
            yield json.dumps({"type": "end"}, ensure_ascii=False) + '\n'
        else:
            # 处理请求失败的情况
            yield json.dumps({"type": "error", "message": f"API请求失败: 状态码 {response.status_code}"}, ensure_ascii=False) + '\n'
    except Exception as e:
        # 处理异常情况
        yield json.dumps({"type": "error", "message": str(e)}, ensure_ascii=False) + '\n'


@router.post("/ai-chat-stream")
async def ai_chat_stream(prompt: str):
    """
    调用AI API进行对话的流式接口
    参数:
        prompt: 用户输入的提示文本
    返回:
        流式返回AI生成的响应文本
    """
    # 使用生成器创建流式响应
    def event_stream():
        for chunk in create_ai_stream_generator(prompt):
            # 按照text/event-stream格式包装数据
            yield f"data: {chunk}"
    
    # 返回流式响应
    return StreamingResponse(event_stream(), media_type="text/event-stream")

# 测试示例（可选）
if __name__ == "__main__":
    # 使用示例
    try:
        prompt = "OLT双上联同路由可能会导致双边同时中断"
        
        # 调用函数
        # result = call_ai_api_stream(prompt)
        # print("\n\n完整结果:", result)
    except Exception as e:
        print(f"发生错误: {e}")