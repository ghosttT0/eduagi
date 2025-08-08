#!/usr/bin/env python3
import os, asyncio, httpx, json

API_KEY = os.getenv('DEEPSEEK_API_KEY')

async def main():
    print('Key set:', 'yes' if API_KEY else 'no')
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    payload = {
        'model': 'deepseek-chat',
        'messages': [{'role': 'user', 'content': '用一句话介绍Python'}],
        'max_tokens': 50,
        'temperature': 0.7,
    }
    try:
        async with httpx.AsyncClient(timeout=60.0, http2=False) as client:
            r = await client.post('https://api.deepseek.com/v1/chat/completions', headers=headers, json=payload)
            print('status:', r.status_code)
            print('body head:', r.text[:200])
    except Exception as e:
        import traceback
        print('exception:', repr(e))
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(main())