# encoding:utf-8

import json
import time
import jwt
import requests


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

apiKey="67b28fdf0e259900a02ca9af.WBhPKLB4PMZuzFSN240t+stlox26Ti4R" # 在这里申请apiKey https://jiutian.10086.cn/largemodel/llmstudio/#/inference/order
jwt_token = generate_token(apiKey, 3600) # Token有效期为3600秒（1小时）


headers= {'content-type':"application/json","Authorization":"Bearer " + jwt_token} # API请求header
stream=True # 是否流式
response=requests.post("https://jiutian.10086.cn/largemodel/tmaas/api/v2/completions", # 注意url的域名和申请apiKey的网站域名保持一致
   json={
	 "appId": "68d2741225659d60b3e1df74", # appId在网页上访问app时，可以在url中找到
	 "prompt": "OLT双上联同路由可能会导致双边同时中断",
	 "history": [],
	 "stream": stream
	},
   headers=headers,stream=True)
   

# print(response.status_code)  # 保留状态码输出

for line in response.iter_lines():
    if line:
        text = line.decode('utf-8')
        if stream:
            # 解析JSON数据
            data = json.loads(text[5:])
            # 检查是否存在choices.delta.text路径
            print(data)
            if 'choices' in data and len(data['choices']) > 0:
                choice = data['choices'][0]
                if 'delta' in choice and 'text' in choice['delta']:
                    # 直接打印text内容，不添加任何其他信息
                    print(choice['delta']['text'])
        # 移除非流式响应的处理，因为您只需要处理流式响应中的choices.delta.text
