from fastapi import FastAPI, Request, Response, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

from config import Config
from service_client import service_client

app = FastAPI(title="Gateway Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://172.31.144.1:3000", "http://172.31.144.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.api_route("/api/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def auth_proxy(path: str, request: Request):
    headers = dict(request.headers)
    headers.pop("host", None)
    
    body = await request.body()
    json_data = None
    if body and request.headers.get("content-type", "").startswith("application/json"):
        import json
        json_data = json.loads(body)
    
    result, status_code = await service_client.forward_request(
        service_url=Config.AUTH_SERVICE_URL,
        path=f"/{path}",
        method=request.method,
        headers=headers,
        params=dict(request.query_params),
        json_data=json_data
    )
    
    return JSONResponse(content=result, status_code=status_code)


@app.api_route("/api/partner/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def partner_proxy(path: str, request: Request):
    headers = dict(request.headers)
    headers.pop("host", None)
    
    body = await request.body()
    json_data = None
    if body and request.headers.get("content-type", "").startswith("application/json"):
        import json
        json_data = json.loads(body)
    
    result, status_code = await service_client.forward_request(
        service_url=Config.PARTNER_SERVICE_URL,
        path=f"/{path}",
        method=request.method,
        headers=headers,
        params=dict(request.query_params),
        json_data=json_data
    )
    
    return JSONResponse(content=result, status_code=status_code)


@app.api_route("/api/chat/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def chat_proxy(path: str, request: Request):
    headers = dict(request.headers)
    headers.pop("host", None)
    
    body = await request.body()
    json_data = None
    if body and request.headers.get("content-type", "").startswith("application/json"):
        import json
        json_data = json.loads(body)
    
    result, status_code = await service_client.forward_request(
        service_url=Config.CHAT_SERVICE_URL,
        path=f"/{path}",
        method=request.method,
        headers=headers,
        params=dict(request.query_params),
        json_data=json_data
    )
    
    return JSONResponse(content=result, status_code=status_code)


@app.api_route("/api/memory/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def memory_proxy(path: str, request: Request):
    headers = dict(request.headers)
    headers.pop("host", None)
    
    body = await request.body()
    json_data = None
    if body and request.headers.get("content-type", "").startswith("application/json"):
        import json
        json_data = json.loads(body)
    
    result, status_code = await service_client.forward_request(
        service_url=Config.MEMORY_SERVICE_URL,
        path=f"/{path}",
        method=request.method,
        headers=headers,
        params=dict(request.query_params),
        json_data=json_data
    )
    
    return JSONResponse(content=result, status_code=status_code)


@app.api_route("/api/rag/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def rag_proxy(path: str, request: Request):
    headers = dict(request.headers)
    headers.pop("host", None)
    
    body = await request.body()
    json_data = None
    if body and request.headers.get("content-type", "").startswith("application/json"):
        import json
        json_data = json.loads(body)
    
    result, status_code = await service_client.forward_request(
        service_url=Config.RAG_SERVICE_URL,
        path=f"/{path}",
        method=request.method,
        headers=headers,
        params=dict(request.query_params),
        json_data=json_data
    )
    
    return JSONResponse(content=result, status_code=status_code)


@app.api_route("/api/media/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def media_proxy(path: str, request: Request):
    headers = dict(request.headers)
    headers.pop("host", None)
    
    body = await request.body()
    json_data = None
    files = None
    
    if request.headers.get("content-type", "").startswith("multipart/form-data"):
        form = await request.form()
        json_data = {k: v for k, v in form.items() if k != "file"}
        if "file" in form:
            files = {"file": (form["file"].filename, await form["file"].read(), form["file"].content_type)}
    elif body and request.headers.get("content-type", "").startswith("application/json"):
        import json
        json_data = json.loads(body)
    
    result, status_code = await service_client.forward_request(
        service_url=Config.MEDIA_SERVICE_URL,
        path=f"/{path}",
        method=request.method,
        headers=headers,
        params=dict(request.query_params),
        json_data=json_data,
        files=files
    )
    
    return JSONResponse(content=result, status_code=status_code)


@app.api_route("/api/insights/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def insights_proxy(path: str, request: Request):
    headers = dict(request.headers)
    headers.pop("host", None)
    
    body = await request.body()
    json_data = None
    if body and request.headers.get("content-type", "").startswith("application/json"):
        import json
        json_data = json.loads(body)
    
    result, status_code = await service_client.forward_request(
        service_url=Config.INSIGHT_SERVICE_URL,
        path=f"/{path}",
        method=request.method,
        headers=headers,
        params=dict(request.query_params),
        json_data=json_data
    )
    
    return JSONResponse(content=result, status_code=status_code)


@app.api_route("/api/scheduler/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def scheduler_proxy(path: str, request: Request):
    headers = dict(request.headers)
    headers.pop("host", None)
    
    body = await request.body()
    json_data = None
    if body and request.headers.get("content-type", "").startswith("application/json"):
        import json
        json_data = json.loads(body)
    
    result, status_code = await service_client.forward_request(
        service_url=Config.SCHEDULER_SERVICE_URL,
        path=f"/{path}",
        method=request.method,
        headers=headers,
        params=dict(request.query_params),
        json_data=json_data
    )
    
    return JSONResponse(content=result, status_code=status_code)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "gateway-service"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("GATEWAY_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
