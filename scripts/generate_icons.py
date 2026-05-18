"""TubeFilm 아이콘 생성기.

무성영화(채플린 풍) 캐릭터 실루엣 — 보울러 모자 + 지팡이 + 살짝 차는 다리 포즈.
사용법: python3 scripts/generate_icons.py
출력: icons/icon{16,48,128}.png
"""

from __future__ import annotations

import math
import os

from PIL import Image, ImageDraw

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "icons")
SIZES = (16, 48, 128)

BG = (242, 238, 230)
BG_DARK = (215, 208, 195)
FIGURE = (16, 14, 18)
ACCENT = (200, 60, 70)


def make_bg(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size), BG)
    cx = cy = size / 2
    max_r = size * 0.75
    for y in range(size):
        for x in range(size):
            dx = (x - cx) / max_r
            dy = (y - cy) / max_r
            t = min(1.0, math.sqrt(dx * dx + dy * dy))
            r = int(BG[0] * (1 - t) + BG_DARK[0] * t)
            g = int(BG[1] * (1 - t) + BG_DARK[1] * t)
            b = int(BG[2] * (1 - t) + BG_DARK[2] * t)
            img.putpixel((x, y), (r, g, b))
    return img


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def fpoly(d: ImageDraw.ImageDraw, pts, color=FIGURE) -> None:
    d.polygon(pts, fill=color)


def fellipse(d: ImageDraw.ImageDraw, cx, cy, rx, ry, color=FIGURE) -> None:
    d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=color)


def fcircle(d: ImageDraw.ImageDraw, cx, cy, r, color=FIGURE) -> None:
    fellipse(d, cx, cy, r, r, color)


def thick_line(d: ImageDraw.ImageDraw, p1, p2, width, color=FIGURE) -> None:
    d.line([p1, p2], fill=color, width=width)
    fcircle(d, p1[0], p1[1], width / 2, color)
    fcircle(d, p2[0], p2[1], width / 2, color)


def draw_chaplin(d: ImageDraw.ImageDraw, S: int, detailed: bool) -> None:
    cx = S * 0.50
    base_y = S * 0.92

    head_r = S * 0.085
    head_cx = cx - S * 0.02
    head_cy = S * 0.30
    fcircle(d, head_cx, head_cy, head_r)

    if detailed:
        mustache_w = head_r * 0.9
        mustache_h = head_r * 0.18
        fellipse(d, head_cx, head_cy + head_r * 0.25, mustache_w, mustache_h)

    hat_brim_w = head_r * 2.2
    hat_brim_h = head_r * 0.25
    fellipse(d, head_cx, head_cy - head_r * 0.95, hat_brim_w, hat_brim_h)

    hat_w = head_r * 1.55
    hat_h = head_r * 1.1
    hat_top_y = head_cy - head_r * 1.85
    d.rounded_rectangle(
        (head_cx - hat_w, hat_top_y, head_cx + hat_w, head_cy - head_r * 0.85),
        radius=int(head_r * 0.5),
        fill=FIGURE,
    )

    neck_y = head_cy + head_r * 0.9
    shoulder_w = S * 0.22
    shoulder_y = neck_y + S * 0.02
    waist_w = S * 0.18
    waist_y = S * 0.62
    coat_pts = [
        (cx - shoulder_w * 0.4, shoulder_y),
        (cx - shoulder_w, shoulder_y + S * 0.04),
        (cx - waist_w, waist_y),
        (cx + waist_w, waist_y),
        (cx + shoulder_w, shoulder_y + S * 0.04),
        (cx + shoulder_w * 0.4, shoulder_y),
    ]
    fpoly(d, coat_pts)

    fellipse(d, cx, shoulder_y + S * 0.005, shoulder_w * 0.45, S * 0.015, BG)

    leg_top_y = waist_y - S * 0.005
    leg_w = max(1, int(S * 0.055))

    back_foot = (cx - S * 0.04, base_y)
    fpoly(
        d,
        [
            (cx - S * 0.06, leg_top_y),
            (cx + S * 0.02, leg_top_y),
            (back_foot[0] + S * 0.03, base_y),
            (back_foot[0] - S * 0.02, base_y),
        ],
    )

    front_foot = (cx + S * 0.30, base_y - S * 0.02)
    fpoly(
        d,
        [
            (cx - S * 0.01, leg_top_y),
            (cx + S * 0.07, leg_top_y),
            (front_foot[0] + S * 0.01, front_foot[1] + S * 0.01),
            (front_foot[0] - S * 0.08, front_foot[1] + S * 0.01),
        ],
    )

    shoe_h = S * 0.035
    fellipse(d, back_foot[0], base_y, S * 0.07, shoe_h)
    fellipse(d, front_foot[0] - S * 0.02, front_foot[1] + S * 0.005, S * 0.08, shoe_h)

    arm_w = max(1, int(S * 0.05))
    near_shoulder = (cx - shoulder_w * 0.75, shoulder_y + S * 0.03)
    near_hand = (cx - S * 0.30, S * 0.50)
    thick_line(d, near_shoulder, near_hand, arm_w)

    far_shoulder = (cx + shoulder_w * 0.75, shoulder_y + S * 0.03)
    far_hand = (cx + S * 0.32, S * 0.48)
    thick_line(d, far_shoulder, far_hand, arm_w)

    cane_top = (near_hand[0] - S * 0.05, near_hand[1] - S * 0.04)
    cane_bottom = (near_hand[0] + S * 0.12, base_y - S * 0.01)
    cane_w = max(1, int(S * 0.025))
    thick_line(d, cane_top, cane_bottom, cane_w)
    fcircle(d, cane_top[0], cane_top[1], cane_w * 1.4)


def make_icon(size: int) -> Image.Image:
    work_size = 256 if size < 64 else max(size, 256)
    detailed = work_size >= 96

    bg = make_bg(work_size).convert("RGBA")
    overlay = Image.new("RGBA", (work_size, work_size), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay, "RGBA")
    draw_chaplin(d, work_size, detailed)

    spot_overlay = Image.new("L", (work_size, work_size), 0)
    sd = ImageDraw.Draw(spot_overlay)
    sd.ellipse(
        (work_size * 0.12, work_size * 0.18, work_size * 0.88, work_size * 0.94),
        fill=22,
    )
    bg.paste(Image.new("RGB", bg.size, ACCENT), (0, 0), spot_overlay)

    composed = Image.alpha_composite(bg, overlay)

    radius = int(work_size * 0.18)
    mask = rounded_mask(work_size, radius)
    out = Image.new("RGBA", (work_size, work_size), (0, 0, 0, 0))
    out.paste(composed, (0, 0), mask)

    if work_size != size:
        out = out.resize((size, size), Image.LANCZOS)
    return out


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    for size in SIZES:
        icon = make_icon(size)
        path = os.path.join(OUT_DIR, f"icon{size}.png")
        icon.save(path, "PNG", optimize=True)
        print(f"  wrote {path} ({size}x{size})")


if __name__ == "__main__":
    main()
