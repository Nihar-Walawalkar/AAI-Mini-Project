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
    # Honest post-processing for demo display; keep it labeled in the UI.
    out = img.filter(ImageFilter.MedianFilter(size=3))
    out = out.filter(ImageFilter.UnsharpMask(radius=1.8, percent=int(120 * sharpen_strength), threshold=2))
    out = ImageEnhance.Sharpness(out).enhance(detail_boost)
    out = ImageEnhance.Contrast(out).enhance(contrast_boost)
    out = ImageEnhance.Color(out).enhance(color_boost)

    arr = np.array(out)
    lab = cv2.cvtColor(arr, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=1.8, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    arr = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
    return Image.fromarray(arr)


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
