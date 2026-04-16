from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Dict

import cv2
import numpy as np
import torch
from PIL import Image, ImageEnhance, ImageFilter
from torchvision import transforms


def pil_to_tensor(img: Image.Image) -> torch.Tensor:
    tensor = transforms.ToTensor()(img)
    tensor = tensor * 2.0 - 1.0
    return tensor.unsqueeze(0)


def tensor_to_pil(tensor: torch.Tensor) -> Image.Image:
    tensor = tensor.squeeze(0).detach().cpu().clamp(-1, 1)
    tensor = (tensor + 1) / 2
    return transforms.ToPILImage()(tensor)


def prepare_image(img: Image.Image, scale: int = 2) -> Image.Image:
    img = img.convert("RGB")
    w, h = img.size
    w = max(scale, (w // scale) * scale)
    h = max(scale, (h // scale) * scale)
    return img.resize((w, h), Image.Resampling.BICUBIC)


def simulate_lr_preview(img: Image.Image, scale: int = 2) -> Image.Image:
    w, h = img.size
    low = img.resize((max(1, w // scale), max(1, h // scale)), Image.Resampling.BICUBIC)
    return low.resize((w, h), Image.Resampling.BICUBIC)


def enhance_for_display(
    img: Image.Image,
    sharpen_strength: float = 1.3,
    detail_boost: float = 1.1,
    contrast_boost: float = 1.06,
    color_boost: float = 1.03,
) -> Image.Image:
    # Remove the MedianFilter which was heavily blurring the image!
    # 1. Base PIL Enhancements
    out = ImageEnhance.Color(img).enhance(color_boost + 0.1)
    out = ImageEnhance.Contrast(out).enhance(contrast_boost + 0.05)
    
    # 2. Convert to OpenCV
    arr = np.array(out)
    arr_bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)

    # 3. Apply advanced Detail Enhancement (HD popping effect)
    arr_bgr = cv2.detailEnhance(arr_bgr, sigma_s=20, sigma_r=0.15)
    
    # 4. Convert to LAB for CLAHE (Lighting equalizer)
    lab = cv2.cvtColor(arr_bgr, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    arr_bgr = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    
    # 5. Smart Sharpening without massive ringing halos
    blur = cv2.GaussianBlur(arr_bgr, (0, 0), 1.0)
    weight = 1.2 + (sharpen_strength * 0.15) 
    arr_bgr = cv2.addWeighted(arr_bgr, weight, blur, -(weight - 1.0), 0)
    
    arr_rgb = cv2.cvtColor(arr_bgr, cv2.COLOR_BGR2RGB)
    return Image.fromarray(arr_rgb)


def image_to_data_url(img: Image.Image, fmt: str = "PNG") -> str:
    buffer = BytesIO()
    img.save(buffer, format=fmt)
    payload = buffer.getvalue()
    import base64

    return f"data:image/{fmt.lower()};base64," + base64.b64encode(payload).decode("utf-8")


def save_outputs(out_dir: Path, outputs: Dict[str, Image.Image]) -> Dict[str, str]:
    out_dir.mkdir(parents=True, exist_ok=True)
    paths: Dict[str, str] = {}
    for name, img in outputs.items():
        path = out_dir / f"{name}.png"
        img.save(path)
        paths[name] = str(path)
    return paths
