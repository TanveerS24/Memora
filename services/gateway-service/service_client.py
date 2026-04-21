import httpx
from typing import Optional
from config import Config


class ServiceClient:
    def __init__(self):
        self.timeout = 30.0
    
    async def forward_request(
        self,
        service_url: str,
        path: str,
        method: str,
        headers: dict,
        params: Optional[dict] = None,
        json_data: Optional[dict] = None,
        files: Optional[dict] = None
    ):
        url = f"{service_url}{path}"
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            if method == "GET":
                response = await client.get(url, params=params)
            elif method == "POST":
                if files:
                    response = await client.post(url, data=json_data, files=files)
                else:
                    response = await client.post(url, json=json_data)
            elif method == "PUT":
                response = await client.put(url, json=json_data)
            elif method == "DELETE":
                response = await client.delete(url)
            else:
                return {"error": "Invalid method"}, 405
            
            try:
                return response.json(), response.status_code
            except:
                return response.text, response.status_code


service_client = ServiceClient()
