from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import webbrowser
import os
import sys
import signal
import subprocess
import platform
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from seed_guard import SeedGuard

# Initialize SeedGuard
sg = SeedGuard()

# Determine environment mode
IS_DEV = os.environ.get("SEEDGUARD_ENV", "prod") == "dev"

app = FastAPI(
    docs_url="/docs" if IS_DEV else None,
    redoc_url="/redoc" if IS_DEV else None,
    openapi_url="/openapi.json" if IS_DEV else None
)

# Enable CORS for frontend (during dev)
if IS_DEV:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Request/response models
class EncodeRequest(BaseModel):
    seed_phrase: str
    shares_required: int = 3
    shares_total: int = 5
    password: str = ""

class DecodeRequest(BaseModel):
    primary: str
    shares: list[str]
    password: str = ""

@app.post("/encode")
def encode_seed(data: EncodeRequest):
    try:
        words = data.seed_phrase.strip().split()
        primary, shares = sg.encode_seed_phrase(
            seed_words=words,
            shares_required=data.shares_required,
            shares_total=data.shares_total,
            password=data.password or None
        )
        return {"primary": primary, "shares": shares}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/decode")
def decode_seed(data: DecodeRequest):
    try:
        seed_phrase = sg.decode_shares(
            encoded_primary=data.primary,
            shares=data.shares,
            password=data.password or None
        )
        return {"seed_phrase": seed_phrase}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/shutdown")
def shutdown():
    sig = signal.CTRL_BREAK_EVENT if platform.system() == "Windows" else signal.SIGINT
    os.kill(os.getpid(), sig)
    return {"message": "Shutting down"}

if not IS_DEV:
    # Determine static path for production (support PyInstaller _MEIPASS)
    static_dir = os.path.join(
        getattr(sys, "_MEIPASS", os.path.abspath(".")),
        "frontend/dist"
    )
    if not os.path.exists(static_dir):  # fallback if running without PyInstaller
        static_dir = os.path.abspath("backend/static")

    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

    @app.get("/")
    async def serve_root():
        return FileResponse(os.path.join(static_dir, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        return FileResponse(os.path.join(static_dir, "index.html"))

# Optional: auto-open browser in dev mode
if __name__ == "__main__":
    import threading

    def open_browser():
        try:
            url = "http://localhost:8000"
            system = platform.system()

            if system == "Darwin":  # macOS
                subprocess.Popen(["open", url])
            elif system == "Windows":
                os.startfile(url)
            else:
                webbrowser.open(url)
        except Exception as e:
            with open("browser_error.log", "w") as f:
                f.write(f"Failed to open browser: {e}")

    threading.Timer(1.0, open_browser).start()

    uvicorn.run(app, 
                host="0.0.0.0", 
                port=8000, 
                log_config=None)
