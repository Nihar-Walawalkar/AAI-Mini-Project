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


def apply_deblocking(img: Image.Image) -> Image.Image:
    # Use Bilateral Filter to denoise but keep edges sharp
    arr = np.array(img)
    arr_bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
    # d=9: Neighborhood, 75, 75: color/space sigma
    filtered = cv2.bilateralFilter(arr_bgr, 9, 75, 75)
    return Image.fromarray(cv2.cvtColor(filtered, cv2.COLOR_BGR2RGB))


def calculate_metrics(original: Image.Image, processed: Image.Image) -> Dict[str, float]:
    from skimage.metrics import peak_signal_noise_ratio as psnr
    from skimage.metrics import structural_similarity as ssim
    
    # Resize processed to match original if needed for comparison
    o_arr = np.array(original.convert("L"))
    p_arr = np.array(processed.resize(original.size, Image.Resampling.LANCZOS).convert("L"))
    
    psnr_val = psnr(o_arr, p_arr)
    ssim_val = ssim(o_arr, p_arr)
    
    return {
        "psnr": round(float(psnr_val), 2),
        "ssim": round(float(ssim_val), 4)
    }


def extract_detail_patches(
    img: Image.Image, 
    patch_size: int = 120, 
    num_patches: int = 3
) -> list[Image.Image]:
    # Extract center and two random high-entropy candidates (logic simplified for speed)
    w, h = img.size
    patches = []
    
    # 1. Center Patch
    left = (w - patch_size) // 2
    top = (h - patch_size) // 2
    patches.append(img.crop((left, top, left + patch_size, top + patch_size)))
    
    # 2. Top-Left focus
    patches.append(img.crop((w // 4, h // 4, w // 4 + patch_size, h // 4 + patch_size)))
    
    # 3. Bottom-Right focus
    patches.append(img.crop((w * 3 // 4 - patch_size, h * 3 // 4 - patch_size, w * 3 // 4, h * 3 // 4)))
    
    return patches


def generate_edge_map(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("L"))
    # Canny edge detection
    edges = cv2.Canny(arr, 100, 200)
    # Invert for cleaner UI look (dark lines on white or transparent)
    # Let's keep it neon on dark for the current UI theme
    return Image.fromarray(edges)


def enhance_for_display(
    img: Image.Image,
    sharpen_strength: float = 1.3,
    detail_boost: float = 1.1,
    contrast_boost: float = 1.06,
    color_boost: float = 1.03,
    deblock: bool = False,
) -> Image.Image:
    # 0. Optional Deep Deblocking
    if deblock:
        img = apply_deblocking(img)

    # 1. Base PIL Enhancements
    out = ImageEnhance.Color(img).enhance(color_boost + 0.1)
    out = ImageEnhance.Contrast(out).enhance(contrast_boost + 0.05)
    
    # 2. Convert to OpenCV
    arr = np.array(out)
    arr_bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)

    # 3. Apply advanced Detail Enhancement (HD popping effect)
    arr_bgr = cv2.detailEnhance(arr_bgr, sigma_s=20, sigma_r=0.15)
    
    # 4. Convert to LAB for CLAHE
    lab = cv2.cvtColor(arr_bgr, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    arr_bgr = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    
    # 5. Smart Sharpening
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
