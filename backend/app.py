from __future__ import annotations

import time
import uuid
from pathlib import Path

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

from io import BytesIO
from image_ops import (
    calculate_metrics,
    enhance_for_display,
    extract_detail_patches,
    generate_edge_map,
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
    deblock: bool = Form(False),
) -> JSONResponse:
    try:
        # Load and prepare images
        original_bytes = await file.read()
        image = Image.open(BytesIO(original_bytes)).convert("RGB")
        
        # 'prepared' is the low-res input for the model
        prepared = prepare_image(image, scale=2)
        bicubic = simulate_lr_preview(prepared, scale=2)

        # Inference
        start = time.perf_counter()
        tensor = pil_to_tensor(prepared)
        sr_tensor = model(tensor)
        sr_image = tensor_to_pil(sr_tensor)
        inference_ms = round((time.perf_counter() - start) * 1000, 2)

        # Scientific Metrics compared to the High-Res Original
        metrics = calculate_metrics(image, sr_image)

        # Enhanced result with optional deblocking
        enhanced = enhance_for_display(sr_image, sharpen_strength=sharpen_strength, deblock=deblock)
        
        # Edge analysis & Detail Zoom Patches
        edge_map = generate_edge_map(enhanced)
        patches = extract_detail_patches(enhanced)

        job_id = uuid.uuid4().hex[:10]
        saved = save_outputs(
            OUTPUT_DIR / job_id,
            {
                "original": image, # Ground truth
                "input": prepared, # Low Res
                "bicubic": bicubic,
                "sr": sr_image,
                "enhanced": enhanced,
                "edges": edge_map
            },
        )

        return JSONResponse(
            {
                "jobId": job_id,
                "inferenceMs": inference_ms,
                "metrics": metrics,
                "images": {
                    "original": image_to_data_url(image),
                    "bicubic": image_to_data_url(bicubic),
                    "sr": image_to_data_url(sr_image),
                    "enhanced": image_to_data_url(enhanced),
                    "edges": image_to_data_url(edge_map),
                },
                "patches": [image_to_data_url(p) for p in patches],
                "savedPaths": saved,
                "metadata": {
                    "inputSize": f"{prepared.width}x{prepared.height}",
                    "outputSize": f"{sr_image.width}x{sr_image.height}",
                    "scale": 2,
                    "deblockApplied": deblock
                },
                "notes": {
                    "model": "RRDBNet (Optimized)",
                    "displayEnhancement": "HD Contrast + Sharpen" if enhance else "Off",
                    "metrics": "PSNR/SSIM compared to Ground Truth (Uploaded Original)"
                },
            }
        )
    except Exception as exc:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(exc)})
