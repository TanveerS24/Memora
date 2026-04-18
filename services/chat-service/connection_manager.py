from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, couple_id: str, websocket: WebSocket):
        # WebSocket is already accepted by FastAPI
        if couple_id not in self.active_connections:
            self.active_connections[couple_id] = []
        self.active_connections[couple_id].append(websocket)
    
    def disconnect(self, couple_id: str, websocket: WebSocket):
        if couple_id in self.active_connections:
            self.active_connections[couple_id].remove(websocket)
            if not self.active_connections[couple_id]:
                del self.active_connections[couple_id]
    
    async def broadcast(self, couple_id: str, message: dict):
        if couple_id in self.active_connections:
            for connection in self.active_connections[couple_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass  # Connection might be closed


manager = ConnectionManager()
