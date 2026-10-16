"""双色调 + 网点（duotone / halftone）：把任意照片变成海报印刷感。

用法（Agent 可原样执行）:
    python effect.py input.jpg out.png                         # 默认：深蓝 + 米白，网点 7px
    python effect.py input.jpg out.png --dark "#14213d" --light "#fca311" --cell 12 --angle 45
    python effect.py input.jpg out.png --mode duotone          # 只做双色调，不加网点

做了什么：
  1. 转灰度并做轻微的对比度拉伸（1% / 99% 分位裁掉），让中间调分开；
  2. 双色调：灰度 0→dark、1→light 线性插值（就是 Photoshop“双色调”模式里两色油墨的效果）；
  3. 网点：把图旋转 angle 度后按 cell 像素切格，每格画一个面积与暗度成正比的圆点，再转回去。
只依赖 Pillow + numpy。不是 Photoshop 的完整半调滤镜：不做 CMYK 分色、不模拟网点扩张。
"""
import argparse
import math

import numpy as np
from PIL import Image, ImageDraw, ImageOps


def hex_rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


def tone(img, lo=1, hi=99):
    g = np.asarray(ImageOps.grayscale(img), dtype=np.float32)
    a, b = np.percentile(g, [lo, hi])
    return np.clip((g - a) / max(1.0, b - a), 0, 1)


def duotone(g, dark, light):
    return Image.fromarray((dark + (light - dark) * g[..., None]).astype(np.uint8), "RGB")


def halftone(g, dark, light, cell=9, angle=45, scale=2):
    """在 scale 倍分辨率下画网点再缩回，边缘更干净。"""
    h, w = g.shape
    gray = Image.fromarray((g * 255).astype(np.uint8), "L").rotate(angle, expand=True, fillcolor=255)
    W, H = gray.size
    small = np.asarray(gray.resize((max(1, W // cell), max(1, H // cell)), Image.BILINEAR), dtype=np.float32) / 255
    canvas = Image.new("RGB", (W * scale, H * scale), tuple(int(c) for c in light))
    draw = ImageDraw.Draw(canvas)
    s = cell * scale
    for y in range(small.shape[0]):
        for x in range(small.shape[1]):
            r = s * math.sqrt((1 - small[y, x]) / math.pi)  # 圆面积 = 暗度 × 格子面积，最暗处网点刚好互相搭上
            if r < 0.4:
                continue
            cx, cy = (x + 0.5) * s, (y + 0.5) * s
            draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=tuple(int(c) for c in dark))
    canvas = canvas.resize((W, H), Image.LANCZOS).rotate(-angle, expand=False, fillcolor=tuple(int(c) for c in light))
    left, top = (W - w) // 2, (H - h) // 2
    return canvas.crop((left, top, left + w, top + h))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input"); ap.add_argument("output")
    ap.add_argument("--dark", default="#14213d"); ap.add_argument("--light", default="#f4e7c5")
    ap.add_argument("--cell", type=int, default=7); ap.add_argument("--angle", type=float, default=45)
    ap.add_argument("--mode", choices=["halftone", "duotone"], default="halftone")
    a = ap.parse_args()
    img = Image.open(a.input).convert("RGB")
    g = tone(img)
    dark, light = hex_rgb(a.dark), hex_rgb(a.light)
    out = duotone(g, dark, light) if a.mode == "duotone" else halftone(g, dark, light, a.cell, a.angle)
    out.save(a.output)
    print("wrote", a.output, out.size)


if __name__ == "__main__":
    main()
