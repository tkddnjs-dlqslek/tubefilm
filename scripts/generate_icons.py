"""TubeFilm 아이콘 생성기.

버스터 키튼 풍 실루엣 — 평평한 포크파이 모자 + 보타이 + 앞으로 기울인 스트라이드 포즈.
사용법: python3 scripts/generate_icons.py
출력: icons/icon{16,48,128}.png
"""

from __future__ import annotations

import math
import os

from PIL import Image, ImageDraw

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "icons")
SIZES = (16, 48, 128)

BG = (248, 246, 238)
BG_DARK = (210, 206, 196)
FIGURE = (14, 12, 16)
ACCENT = (190, 50, 55)


def make_bg(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size), BG)
    cx = cy = size / 2
    max_r = size * 0.78
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


def rotate_pt(p, center, angle_rad):
    dx = p[0] - center[0]
    dy = p[1] - center[1]
    c = math.cos(angle_rad)
    s = math.sin(angle_rad)
    return (center[0] + dx * c - dy * s, center[1] + dx * s + dy * c)


def draw_keaton(d: ImageDraw.ImageDraw, S: int, detailed: bool) -> None:
    tilt = math.radians(-8)
    pivot = (S * 0.50, S * 0.88)

    base_y = S * 0.92
    cx = S * 0.50
    head_r = S * 0.085
    head_cx = cx
    head_cy = S * 0.31

    head = (head_cx, head_cy)
    head_rot = rotate_pt(head, pivot, tilt)
    fcircle(d, head_rot[0], head_rot[1], head_r)

    porkpie_brim_w = head_r * 2.55
    porkpie_brim_h = head_r * 0.22
    brim_center = rotate_pt(
        (head_cx, head_cy - head_r * 0.92), pivot, tilt
    )

    crown_w = head_r * 1.6
    crown_h = head_r * 0.65
    crown_center = rotate_pt(
        (head_cx, head_cy - head_r * 1.32), pivot, tilt
    )

    overlay_layer = Image.new("RGBA", (int(S), int(S)), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay_layer, "RGBA")

    od.ellipse(
        (head_cx - porkpie_brim_w, head_cy - head_r * 0.92 - porkpie_brim_h,
         head_cx + porkpie_brim_w, head_cy - head_r * 0.92 + porkpie_brim_h),
        fill=FIGURE + (255,),
    )
    od.rounded_rectangle(
        (head_cx - crown_w, head_cy - head_r * 1.32 - crown_h / 2,
         head_cx + crown_w, head_cy - head_r * 1.32 + crown_h / 2),
        radius=int(head_r * 0.15),
        fill=FIGURE + (255,),
    )

    rot_layer = overlay_layer.rotate(
        math.degrees(-tilt), center=pivot, resample=Image.BICUBIC
    )
    base = Image.new("RGBA", rot_layer.size, (0, 0, 0, 0))
    base.alpha_composite(rot_layer)
    d._image.alpha_composite(base)

    neck_y = head_rot[1] + head_r * 0.9
    shoulder_w = S * 0.20
    shoulder_y = neck_y + S * 0.018
    waist_w = S * 0.16
    waist_y = S * 0.62

    body_pts = [
        rotate_pt((cx - shoulder_w * 0.5, shoulder_y), pivot, tilt),
        rotate_pt((cx - shoulder_w, shoulder_y + S * 0.03), pivot, tilt),
        rotate_pt((cx - waist_w, waist_y), pivot, tilt),
        rotate_pt((cx + waist_w, waist_y), pivot, tilt),
        rotate_pt((cx + shoulder_w, shoulder_y + S * 0.03), pivot, tilt),
        rotate_pt((cx + shoulder_w * 0.5, shoulder_y), pivot, tilt),
    ]
    fpoly(d, body_pts)

    if detailed:
        bow_cx = head_rot[0]
        bow_cy = neck_y + S * 0.008
        bow_w = S * 0.035
        bow_h = S * 0.018
        bow_l = [
            (bow_cx - bow_w, bow_cy - bow_h),
            (bow_cx, bow_cy),
            (bow_cx - bow_w, bow_cy + bow_h),
        ]
        bow_r = [
            (bow_cx + bow_w, bow_cy - bow_h),
            (bow_cx, bow_cy),
            (bow_cx + bow_w, bow_cy + bow_h),
        ]
        fpoly(d, bow_l, ACCENT)
        fpoly(d, bow_r, ACCENT)
        fcircle(d, bow_cx, bow_cy, S * 0.008, ACCENT)

    leg_top_y = waist_y - S * 0.005
    back_foot_x = cx - S * 0.15
    front_foot_x = cx + S * 0.20

    fpoly(
        d,
        [
            rotate_pt((cx - S * 0.08, leg_top_y), pivot, tilt),
            rotate_pt((cx - S * 0.005, leg_top_y), pivot, tilt),
            rotate_pt((back_foot_x + S * 0.035, base_y), pivot, tilt),
            rotate_pt((back_foot_x - S * 0.035, base_y), pivot, tilt),
        ],
    )
    fpoly(
        d,
        [
            rotate_pt((cx + S * 0.005, leg_top_y), pivot, tilt),
            rotate_pt((cx + S * 0.08, leg_top_y), pivot, tilt),
            rotate_pt((front_foot_x + S * 0.04, base_y - S * 0.01), pivot, tilt),
            rotate_pt((front_foot_x - S * 0.04, base_y - S * 0.01), pivot, tilt),
        ],
    )

    shoe_h = S * 0.03
    back_shoe = rotate_pt((back_foot_x, base_y), pivot, tilt)
    front_shoe = rotate_pt((front_foot_x, base_y - S * 0.005), pivot, tilt)
    fellipse(d, back_shoe[0] - S * 0.01, back_shoe[1], S * 0.075, shoe_h)
    fellipse(d, front_shoe[0] + S * 0.005, front_shoe[1], S * 0.085, shoe_h)

    arm_w = max(1, int(S * 0.052))
    back_shoulder = rotate_pt(
        (cx - shoulder_w * 0.78, shoulder_y + S * 0.02), pivot, tilt
    )
    back_hand = rotate_pt((cx - S * 0.27, S * 0.66), pivot, tilt)
    thick_line(d, back_shoulder, back_hand, arm_w)

    front_shoulder = rotate_pt(
        (cx + shoulder_w * 0.78, shoulder_y + S * 0.02), pivot, tilt
    )
    front_hand = rotate_pt((cx + S * 0.30, S * 0.42), pivot, tilt)
    thick_line(d, front_shoulder, front_hand, arm_w)


class CompositingDraw:
    def __init__(self, image: Image.Image):
        self._image = image
        self._draw = ImageDraw.Draw(image, "RGBA")

    def __getattr__(self, name):
        return getattr(self._draw, name)


def make_icon(size: int) -> Image.Image:
    work_size = 256 if size < 64 else max(size, 256)
    detailed = work_size >= 96

    bg = make_bg(work_size).convert("RGBA")
    figure_layer = Image.new("RGBA", (work_size, work_size), (0, 0, 0, 0))
    cd = CompositingDraw(figure_layer)
    draw_keaton(cd, work_size, detailed)

    spot_overlay = Image.new("L", (work_size, work_size), 0)
    sd = ImageDraw.Draw(spot_overlay)
    sd.ellipse(
        (work_size * 0.08, work_size * 0.10, work_size * 0.92, work_size * 0.90),
        fill=14,
    )
    bg.paste(Image.new("RGB", bg.size, ACCENT), (0, 0), spot_overlay)

    composed = Image.alpha_composite(bg, figure_layer)

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
