from __future__ import annotations

import time
import uuid
from pathlib import Path

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

from image_ops import (
    enhance_for_display,
    image_to_data_url,
    pil_to_tensor,
    prepare_image,
    save_outputs,
    simulate_lr_preview,
    tensor_to_pil,
)
from model import SRModel

BASE_DIR = Path(__file__).resolve().parent
WEIGHTS_PATH = BASE_DIR / "weights" / "best_generator_x2_bsds300.pth"
OUTPUT_DIR = BASE_DIR / "outputs"

app = FastAPI(title="Super Resolution Demo API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SRModel(str(WEIGHTS_PATH), scale=2, num_blocks=8)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/super-resolve")
async def super_resolve(
    file: UploadFile = File(...),
    enhance: bool = Form(True),
    sharpen_strength: float = Form(1.3),
) -> JSONResponse:
    try:
        image = Image.open(file.file).convert("RGB")
        prepared = prepare_image(image, scale=2)
        bicubic = simulate_lr_preview(prepared, scale=2)

        start = time.perf_counter()
        tensor = pil_to_tensor(prepared)
        sr_tensor = model(tensor)
        sr_image = tensor_to_pil(sr_tensor)
        inference_ms = round((time.perf_counter() - start) * 1000, 2)

        enhanced = enhance_for_display(sr_image, sharpen_strength=sharpen_strength) if enhance else sr_image

        job_id = uuid.uuid4().hex[:10]
        saved = save_outputs(
            OUTPUT_DIR / job_id,
            {
                "original": prepared,
                "bicubic": bicubic,
                "sr": sr_image,
                "enhanced": enhanced,
            },
        )

        return JSONResponse(
            {
                "jobId": job_id,
                "inferenceMs": inference_ms,
                "images": {
                    "original": image_to_data_url(prepared),
                    "bicubic": image_to_data_url(bicubic),
                    "sr": image_to_data_url(sr_image),
                    "enhanced": image_to_data_url(enhanced),
                },
                "savedPaths": saved,
                "notes": {
                    "model": "RRDBNet x2",
                    "displayEnhancement": "Unsharp mask + local contrast + mild color/contrast boost" if enhance else "Off",
                },
            }
        )
    except Exception as exc:
        return JSONResponse(status_code=500, content={"error": str(exc)})
