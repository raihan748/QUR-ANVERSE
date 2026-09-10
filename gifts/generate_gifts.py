import math
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

# Canvas dimensions (16:9 widescreen presentation ratio)
WIDTH, HEIGHT = 960, 540
TOTAL_FRAMES = 45  # 45 frames @ 25fps = 1.8s perfect seamless loop
FPS = 25

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
FRAMES_DIR = os.path.join(OUTPUT_DIR, "temp_frames")
os.makedirs(FRAMES_DIR, exist_ok=True)

# Colors
C_DARK_BG = (2, 22, 12)
C_MID_BG = (6, 52, 29)
C_LIGHT_BG = (11, 78, 43)
C_EMERALD = (16, 185, 129)
C_GOLD = (245, 158, 11)
C_PALE_GOLD = (253, 230, 138)
C_IVORY = (255, 253, 247)
C_BLACK = (0, 0, 0)
C_RED = (239, 68, 68)
C_DARK_GRAY = (17, 24, 39)
C_LIGHT_MINT = (167, 243, 208)

# Load fonts
try:
    font_logo = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 28)
    font_badge = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 12)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 9)
except Exception:
    font_logo = ImageFont.load_default()
    font_badge = ImageFont.load_default()
    font_sub = ImageFont.load_default()

def draw_star_polygon(draw, cx, cy, r_outer, r_inner, points, angle_offset, fill=None, outline=None, width=1):
    pts = []
    total_pts = points * 2
    for i in range(total_pts):
        angle = angle_offset + (math.pi * 2 / total_pts) * i
        r = r_outer if i % 2 == 0 else r_inner
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(pts, fill=fill, outline=outline, width=width)

def draw_rub_el_hizb(draw, cx, cy, size, angle, outline, width=2):
    # Two squares rotated 45 degrees
    def get_square(cx, cy, s, a):
        half = s / 2
        pts = []
        for da in [-math.pi*0.75, -math.pi*0.25, math.pi*0.25, math.pi*0.75]:
            pts.append((cx + half * math.sqrt(2) * math.cos(a + da), cy + half * math.sqrt(2) * math.sin(a + da)))
        return pts
    draw.polygon(get_square(cx, cy, size, angle), outline=outline, width=width)
    draw.polygon(get_square(cx, cy, size, angle + math.pi/4), outline=outline, width=width)

def render_frame(frame_idx, total_frames):
    t = (frame_idx / total_frames) * math.pi * 2  # 0 to 2pi
    
    # 1. Background radial gradient
    img = Image.new("RGBA", (WIDTH, HEIGHT), C_DARK_BG)
    draw = ImageDraw.Draw(img)

    cx, cy = WIDTH // 2, HEIGHT // 2 - 25

    # Radial gradient glow
    max_r = int(math.hypot(WIDTH / 2, HEIGHT / 2))
    for r in range(max_r, 0, -18):
        factor = r / max_r
        # Interpolate between C_LIGHT_BG in center to C_DARK_BG on edge
        rc = int(C_LIGHT_BG[0] * (1 - factor) + C_DARK_BG[0] * factor)
        gc = int(C_LIGHT_BG[1] * (1 - factor) + C_DARK_BG[1] * factor)
        bc = int(C_LIGHT_BG[2] * (1 - factor) + C_DARK_BG[2] * factor)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(rc, gc, bc, 255))

    # Background ambient particles
    for p in range(24):
        p_seed = p * 137.5
        px = (p_seed * 43) % WIDTH
        base_py = (p_seed * 29) % HEIGHT
        drift = (frame_idx / total_frames) * 120
        py = (base_py - drift) % HEIGHT
        p_alpha = int(120 + 80 * math.sin(t + p))
        p_size = 1.5 + (p % 3)
        p_color = C_PALE_GOLD if p % 2 == 0 else C_EMERALD
        draw.ellipse([px - p_size, py - p_size, px + p_size, py + p_size], fill=(*p_color, p_alpha))

    # 2. Rotating Islamic Sacred Mandalas
    angle1 = t * 0.5
    angle2 = -t * 0.75

    # Outer dashed-like circle
    draw.ellipse([cx - 240, cy - 240, cx + 240, cy + 240], outline=(*C_GOLD, 60), width=2)
    draw_rub_el_hizb(draw, cx, cy, 310, angle1, outline=(*C_GOLD, 75), width=2)
    
    # Inner circle & star
    draw.ellipse([cx - 180, cy - 180, cx + 180, cy + 180], outline=(*C_EMERALD, 80), width=2)
    draw_star_polygon(draw, cx, cy, 170, 130, 8, angle2, outline=(*C_EMERALD, 70), width=1)

    # 3. Corner Ornamental Filigrees
    corners = [
        (40, 40, 1, 1),
        (WIDTH - 40, 40, -1, 1),
        (40, HEIGHT - 40, 1, -1),
        (WIDTH - 40, HEIGHT - 40, -1, -1)
    ]
    for cor_x, cor_y, sx, sy in corners:
        # Corner arcs
        draw.line([cor_x, cor_y + sy * 50, cor_x, cor_y, cor_x + sx * 50, cor_y], fill=(*C_GOLD, 190), width=3)
        draw.line([cor_x + sx * 6, cor_y + sy * 40, cor_x + sx * 6, cor_y + sy * 6, cor_x + sx * 40, cor_y + sy * 6], fill=(*C_GOLD, 140), width=1)
        draw.ellipse([cor_x + sx * 14 - 3, cor_y + sy * 14 - 3, cor_x + sx * 14 + 3, cor_y + sy * 14 + 3], fill=C_GOLD)

    # 4. Floating Movement Calculation
    float_y = math.sin(t) * 16  # moves up and down by 16px
    logo_y = cy + float_y

    # Ground Shadow below Logo
    shadow_scale = 1.0 - (float_y / 16) * 0.18
    sw = int(140 * shadow_scale)
    sh = int(16 * shadow_scale)
    shadow_alpha = int(140 - (float_y / 16) * 40)
    shadow_y = cy + 155
    draw.ellipse([cx - sw, shadow_y - sh, cx + sw, shadow_y + sh], fill=(0, 0, 0, shadow_alpha))

    # 5. Neobrutalist Emblem Shield
    card_w, card_h = 240, 240
    c_left = cx - card_w // 2
    c_top = logo_y - card_h // 2
    c_right = c_left + card_w
    c_bottom = c_top + card_h
    corner_r = 45

    # Neobrutal Hard Shadow (Black +8px offset)
    draw.rounded_rectangle([c_left + 8, c_top + 8, c_right + 8, c_bottom + 8], radius=corner_r, fill=C_BLACK)

    # Main Card Base (Deep Emerald)
    draw.rounded_rectangle([c_left, c_top, c_right, c_bottom], radius=corner_r, fill=C_MID_BG, outline=C_BLACK, width=7)

    # Gold Dashed-Like Inner Border
    draw.rounded_rectangle([c_left + 10, c_top + 10, c_right - 10, c_bottom - 10], radius=corner_r - 8, outline=C_GOLD, width=4)

    # Rub el Hizb watermark inside card
    draw_rub_el_hizb(draw, cx, logo_y - 15, 110, math.pi / 8, outline=(*C_GOLD, 40), width=2)

    # 6. Open Mushaf / Holy Quran Drawing
    q_cy = logo_y - 20
    
    # Quran drop shadow
    draw.polygon([
        (cx - 75 + 4, q_cy - 15 + 4), (cx + 4, q_cy + 4), (cx + 75 + 4, q_cy - 15 + 4),
        (cx + 75 + 4, q_cy + 45 + 4), (cx + 4, q_cy + 60 + 4), (cx - 75 + 4, q_cy + 45 + 4)
    ], fill=C_BLACK)

    # Left Page (Ivory White)
    draw.polygon([
        (cx - 75, q_cy - 15), (cx, q_cy), (cx, q_cy + 60), (cx - 75, q_cy + 45)
    ], fill=C_IVORY, outline=C_BLACK, width=4)

    # Right Page (Amber Gold)
    draw.polygon([
        (cx, q_cy), (cx + 75, q_cy - 15), (cx + 75, q_cy + 45), (cx, q_cy + 60)
    ], fill=C_GOLD, outline=C_BLACK, width=4)

    # Red Center Ribbon
    draw.line([(cx + 1, q_cy), (cx + 1, q_cy + 75)], fill=C_RED, width=5)
    draw.polygon([(cx - 3, q_cy + 72), (cx + 5, q_cy + 72), (cx + 1, q_cy + 65)], fill=C_BLACK)

    # Verse lines on pages
    for ly in [q_cy + 10, q_cy + 22, q_cy + 34]:
        draw.line([(cx - 62, ly - 3), (cx - 12, ly + 2)], fill=C_DARK_GRAY, width=3)
        draw.line([(cx + 12, ly + 2), (cx + 62, ly - 3)], fill=C_DARK_GRAY, width=3)

    # AI Neural Orb Floating on Top of Quran
    orb_cy = q_cy - 35
    draw.ellipse([cx - 20, orb_cy - 20, cx + 20, orb_cy + 20], fill=C_EMERALD, outline=C_BLACK, width=4)
    # Audio wave in orb
    wave_pts = [
        (cx - 10, orb_cy), (cx - 6, orb_cy - 6), (cx - 2, orb_cy + 6),
        (cx + 2, orb_cy - 8), (cx + 6, orb_cy + 6), (cx + 10, orb_cy)
    ]
    draw.line(wave_pts, fill=C_IVORY, width=3)

    # 7. QURANVERSE Typography inside emblem
    text_logo = "QURANVERSE"
    bbox = draw.textbbox((0, 0), text_logo, font=font_logo)
    tw = bbox[2] - bbox[0]
    tx = cx - tw // 2
    ty = logo_y + 68

    # Text Black Stroke / Drop Shadow
    for dx, dy in [(-2, -2), (2, -2), (-2, 2), (2, 2), (3, 3), (0, 3)]:
        draw.text((tx + dx, ty + dy), text_logo, font=font_logo, fill=C_BLACK)
    # Text Gold Fill
    draw.text((tx, ty), text_logo, font=font_logo, fill=C_GOLD)

    # 8. Slogan Presentation Banner (Bottom Center)
    ban_y = HEIGHT - 54
    badge_text = "✦  AI GURU NGAJI & MUROJA'AH REAL-TIME  ✦"
    bb_b = draw.textbbox((0, 0), badge_text, font=font_badge)
    bw = bb_b[2] - bb_b[0] + 36
    bh = bb_b[3] - bb_b[1] + 16
    bx = cx - bw // 2
    by = ban_y - bh // 2

    # Neobrutal Badge Pill
    draw.rounded_rectangle([bx + 4, by + 4, bx + bw + 4, by + bh + 4], radius=14, fill=C_BLACK)
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=14, fill=C_DARK_BG, outline=C_GOLD, width=2)
    draw.text((cx - (bb_b[2] - bb_b[0]) // 2, by + 7), badge_text, font=font_badge, fill=C_PALE_GOLD)

    # Subtitle text
    sub_text = "STANDAR KEMENAG RI  •  30 JUZ RASM UTSMANI  •  ZERO API KEY"
    bb_s = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw_w = bb_s[2] - bb_s[0]
    draw.text((cx - sw_w // 2, ban_y + 18), sub_text, font=font_sub, fill=C_LIGHT_MINT)

    return img

def main():
    print(f"Generating {TOTAL_FRAMES} frames for QURANVERSE presentation gift...")
    frames = []
    
    for i in range(TOTAL_FRAMES):
        frame = render_frame(i, TOTAL_FRAMES)
        frame_path = os.path.join(FRAMES_DIR, f"frame_{i:03d}.png")
        frame.save(frame_path)
        # Convert to RGB with palette for Pillow animated GIF
        frame_p = frame.convert("RGB").convert("P", palette=Image.Palette.ADAPTIVE, colors=128)
        frames.append(frame_p)
        if (i + 1) % 10 == 0 or i == TOTAL_FRAMES - 1:
            print(f"Rendered {i + 1}/{TOTAL_FRAMES} frames")

    # 1. Save Looping Animated GIF
    gif_path = os.path.join(OUTPUT_DIR, "quranverse_floating_logo.gif")
    print(f"Compiling animated GIF to {gif_path}...")
    frame_duration = int(1000 / FPS)
    frames[0].save(
        gif_path,
        save_all=True,
        append_images=frames[1:],
        duration=frame_duration,
        loop=0,
        optimize=True
    )
    print(f"[OK] GIF successfully created: {os.path.getsize(gif_path) / 1024:.1f} KB")

    # 2. Compile High-Definition MP4 with FFmpeg
    mp4_path = os.path.join(OUTPUT_DIR, "quranverse_floating_presentation.mp4")
    print(f"Compiling MP4 video via FFmpeg to {mp4_path}...")
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-r", str(FPS),
        "-i", os.path.join(FRAMES_DIR, "frame_%03d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        "-movflags", "+faststart",
        mp4_path
    ]
    try:
        subprocess.run(ffmpeg_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"[OK] MP4 video successfully created: {os.path.getsize(mp4_path) / 1024:.1f} KB")
    except Exception as e:
        print(f"FFmpeg compile note: {e}")

    # 3. Clean up temp frames to keep folder clean
    for i in range(TOTAL_FRAMES):
        f_p = os.path.join(FRAMES_DIR, f"frame_{i:03d}.png")
        if os.path.exists(f_p):
            os.remove(f_p)
    if os.path.exists(FRAMES_DIR):
        os.rmdir(FRAMES_DIR)

    # 4. Save a High-Res Still Poster (4K) for Slide Backgrounds
    still_path = os.path.join(OUTPUT_DIR, "quranverse_presentation_wallpaper_hd.png")
    best_frame = render_frame(TOTAL_FRAMES // 4, TOTAL_FRAMES)
    best_frame.save(still_path)
    print(f"[OK] HD Presentation Wallpaper created: {still_path}")

    print("\nAlhamdulillah! All presentation gifts generated successfully in 'gifts/' folder!")

if __name__ == "__main__":
    main()
