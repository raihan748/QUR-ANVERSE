import math
import os
from PIL import Image, ImageDraw, ImageFont

# Canvas dimensions (16:9 widescreen presentation ratio)
WIDTH, HEIGHT = 960, 540
TOTAL_FRAMES = 40  # 40 frames @ 25fps = 1.6s seamless loop
FPS = 25

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
FRAMES_DIR = os.path.join(OUTPUT_DIR, "temp_frames")
os.makedirs(FRAMES_DIR, exist_ok=True)

# Elegant Celestial & Islamic Color Palette
C_DARK_BG = (2, 28, 18)        # Deep Imperial Pine
C_MID_BG = (4, 46, 29)         # Royal Emerald
C_LIGHT_BG = (8, 68, 42)       # Luminous Jade
C_EMERALD = (16, 185, 129)     # Celestial Emerald
C_EMERALD_BRIGHT = (52, 211, 153)
C_GOLD = (245, 158, 11)        # Imperial Gold
C_PALE_GOLD = (253, 230, 138)  # Starlight Gold
C_LIGHT_GOLD = (254, 243, 199)
C_AMBER_DEEP = (180, 83, 9)
C_IVORY = (255, 253, 247)      # Pure Mushaf Page
C_BLACK = (1, 15, 9)
C_CRIMSON = (225, 29, 72)      # Silk Ribbon Red
C_CRIMSON_DEEP = (159, 18, 57)
C_TEXT_DARK = (15, 118, 110)
C_MINT = (167, 243, 208)

# Load fonts
try:
    font_logo = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 34)
    font_badge = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 11)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 9)
    font_ornament = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 13)
except Exception:
    font_logo = ImageFont.load_default()
    font_badge = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_ornament = ImageFont.load_default()

def draw_star_polygon(draw, cx, cy, r_outer, r_inner, points, angle_offset, fill=None, outline=None, width=1):
    pts = []
    total_pts = points * 2
    for i in range(total_pts):
        angle = angle_offset + (math.pi * 2 / total_pts) * i
        r = r_outer if i % 2 == 0 else r_inner
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(pts, fill=fill, outline=outline, width=width)

def draw_rub_el_hizb(draw, cx, cy, size, angle, outline, width=2):
    def get_square(cx, cy, s, a):
        half = s / 2
        pts = []
        for da in [-math.pi * 0.75, -math.pi * 0.25, math.pi * 0.25, math.pi * 0.75]:
            pts.append((cx + half * math.sqrt(2) * math.cos(a + da), cy + half * math.sqrt(2) * math.sin(a + da)))
        return pts
    draw.polygon(get_square(cx, cy, size, angle), outline=outline, width=width)
    draw.polygon(get_square(cx, cy, size, angle + math.pi / 4), outline=outline, width=width)

def render_frame(frame_idx, total_frames):
    t = (frame_idx / total_frames) * math.pi * 2  # 0 to 2pi
    
    # 1. Background radial gradient (Celestial Aura)
    img = Image.new("RGBA", (WIDTH, HEIGHT), C_DARK_BG)
    draw = ImageDraw.Draw(img)

    cx, cy = WIDTH // 2, HEIGHT // 2 - 25

    # Multi-step radial gradient
    max_r = int(math.hypot(WIDTH / 2, HEIGHT / 2))
    for r in range(max_r, 0, -16):
        factor = r / max_r
        rc = int(C_LIGHT_BG[0] * (1 - factor) + C_DARK_BG[0] * factor)
        gc = int(C_LIGHT_BG[1] * (1 - factor) + C_DARK_BG[1] * factor)
        bc = int(C_LIGHT_BG[2] * (1 - factor) + C_DARK_BG[2] * factor)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(rc, gc, bc, 255))

    # Ambient stardust particles
    for p in range(32):
        p_seed = p * 137.5
        px = (p_seed * 43) % WIDTH
        base_py = (p_seed * 31) % HEIGHT
        drift = (frame_idx / total_frames) * 90
        py = (base_py - drift) % HEIGHT
        p_alpha = int(100 + 90 * math.sin(t + p * 0.8))
        p_size = 1.2 + (p % 3) * 0.7
        p_color = C_PALE_GOLD if p % 2 == 0 else C_EMERALD_BRIGHT
        draw.ellipse([px - p_size, py - p_size, px + p_size, py + p_size], fill=(*p_color, p_alpha))

    # 2. Celestial Geometric Rings (Rotating Rub el Hizb & Orbit)
    angle1 = t * 0.4
    angle2 = -t * 0.6

    # Subtle celestial orbit ellipse
    draw.ellipse([cx - 280, cy - 140, cx + 280, cy + 140], outline=(*C_GOLD, 40), width=1)
    draw.ellipse([cx - 240, cy - 240, cx + 240, cy + 240], outline=(*C_PALE_GOLD, 50), width=1)
    
    # Outer Rub el Hizb Mandala
    draw_rub_el_hizb(draw, cx, cy, 320, angle1, outline=(*C_GOLD, 70), width=2)
    draw_rub_el_hizb(draw, cx, cy, 260, angle2, outline=(*C_EMERALD, 60), width=1)
    draw_star_polygon(draw, cx, cy, 180, 140, 8, -angle1, outline=(*C_GOLD, 75), width=1)

    # 3. Corner Islamic Filigrees
    corners = [
        (36, 36, 1, 1),
        (WIDTH - 36, 36, -1, 1),
        (36, HEIGHT - 36, 1, -1),
        (WIDTH - 36, HEIGHT - 36, -1, -1)
    ]
    for cor_x, cor_y, sx, sy in corners:
        draw.line([cor_x, cor_y + sy * 48, cor_x, cor_y, cor_x + sx * 48, cor_y], fill=(*C_GOLD, 180), width=2)
        draw.line([cor_x + sx * 6, cor_y + sy * 38, cor_x + sx * 6, cor_y + sy * 6, cor_x + sx * 38, cor_y + sy * 6], fill=(*C_GOLD, 110), width=1)
        draw.ellipse([cor_x + sx * 12 - 3, cor_y + sy * 12 - 3, cor_x + sx * 12 + 3, cor_y + sy * 12 + 3], fill=C_GOLD)

    # 4. Floating Vertical Motion
    float_y = math.sin(t) * 14
    logo_y = cy + float_y

    # Soft ambient drop shadow beneath the floating emblem
    sw = int(140 - float_y * 1.5)
    sh = int(18 - float_y * 0.4)
    shadow_alpha = int(130 - float_y * 3)
    shadow_y = cy + 162
    draw.ellipse([cx - sw, shadow_y - sh, cx + sw, shadow_y + sh], fill=(0, 0, 0, max(20, min(180, shadow_alpha))))

    # 5. Celestial Shield / Emblem Pod
    card_w, card_h = 240, 240
    c_left = cx - card_w // 2
    c_top = logo_y - card_h // 2
    c_right = c_left + card_w
    c_bottom = c_top + card_h
    corner_r = 50

    # Soft dark drop shadow of emblem
    draw.rounded_rectangle([c_left + 4, c_top + 8, c_right + 4, c_bottom + 8], radius=corner_r, fill=(0, 0, 0, 140))

    # Main Emblem Body (Midnight Jade)
    draw.rounded_rectangle([c_left, c_top, c_right, c_bottom], radius=corner_r, fill=C_MID_BG, outline=C_GOLD, width=3)
    # Inner gold border
    draw.rounded_rectangle([c_left + 8, c_top + 8, c_right - 8, c_bottom - 8], radius=corner_r - 6, outline=(*C_PALE_GOLD, 130), width=1)
    
    # Subtle inner 8-pointed star watermark
    draw_rub_el_hizb(draw, cx, logo_y - 12, 120, math.pi / 8, outline=(*C_GOLD, 40), width=1)

    # 6. Open Holy Mushaf
    q_cy = logo_y - 18

    # Mushaf leather backing
    backing_pts = [
        (cx - 78, q_cy - 12), (cx, q_cy + 2), (cx + 78, q_cy - 12),
        (cx + 78, q_cy + 52), (cx, q_cy + 68), (cx - 78, q_cy + 52)
    ]
    draw.polygon(backing_pts, fill=C_BLACK, outline=C_GOLD, width=2)

    # Left Page (Ivory Pearl)
    left_page = [
        (cx - 74, q_cy - 8), (cx - 1, q_cy + 5), (cx - 1, q_cy + 65), (cx - 74, q_cy + 50)
    ]
    draw.polygon(left_page, fill=C_IVORY, outline=(*C_AMBER_DEEP, 200), width=1)

    # Right Page (Luminous Gold Parchment)
    right_page = [
        (cx + 1, q_cy + 5), (cx + 74, q_cy - 8), (cx + 74, q_cy + 50), (cx + 1, q_cy + 65)
    ]
    draw.polygon(right_page, fill=C_LIGHT_GOLD, outline=(*C_AMBER_DEEP, 200), width=1)

    # Decorative verse lines on pages
    for dy in [16, 28, 40]:
        draw.line([(cx - 62, q_cy + dy - 6), (cx - 14, q_cy + dy + 2)], fill=C_TEXT_DARK, width=2)
        draw.line([(cx + 14, q_cy + dy + 2), (cx + 62, q_cy + dy - 6)], fill=C_AMBER_DEEP, width=2)

    # Silk Crimson Bookmark Ribbon
    draw.line([(cx, q_cy + 4), (cx + 8, q_cy + 76)], fill=C_CRIMSON, width=3)
    draw.ellipse([cx + 6, q_cy + 74, cx + 12, q_cy + 80], fill=C_GOLD)

    # 7. Radiant AI Orb / Nur Ilahi floating above Mushaf
    orb_cy = q_cy - 38
    # Outer glowing halo
    draw.ellipse([cx - 24, orb_cy - 24, cx + 24, orb_cy + 24], fill=(*C_EMERALD, 80))
    draw.ellipse([cx - 17, orb_cy - 17, cx + 17, orb_cy + 17], fill=C_MID_BG, outline=C_GOLD, width=2)
    draw.ellipse([cx - 8, orb_cy - 8, cx + 8, orb_cy + 8], fill=C_IVORY)
    
    # Sound wave crest
    wave_pts = [
        (cx - 10, orb_cy), (cx - 6, orb_cy - 4), (cx - 2, orb_cy + 4),
        (cx + 2, orb_cy - 6), (cx + 6, orb_cy + 4), (cx + 10, orb_cy)
    ]
    draw.line(wave_pts, fill=C_AMBER_DEEP, width=2)

    # 8. AL-HUDA Typography inside emblem
    text_logo = "AL-HUDA"
    bbox = draw.textbbox((0, 0), text_logo, font=font_logo)
    tw = bbox[2] - bbox[0]
    tx = cx - tw // 2
    ty = logo_y + 68

    # Elegant drop shadow
    draw.text((tx + 2, ty + 2), text_logo, font=font_logo, fill=C_BLACK)
    draw.text((tx, ty), text_logo, font=font_logo, fill=C_GOLD)

    # 9. Presentation Slogan Banner at bottom
    ban_y = HEIGHT - 52
    badge_text = "✦  TANYA AZMAN  •  AL-HUDA AI MUROJA'AH  ✦"
    bb_b = draw.textbbox((0, 0), badge_text, font=font_badge)
    bw = bb_b[2] - bb_b[0] + 36
    bh = bb_b[3] - bb_b[1] + 14
    bx = cx - bw // 2
    by = ban_y - bh // 2

    # Capsule Pill
    draw.rounded_rectangle([bx + 2, by + 3, bx + bw + 2, by + bh + 3], radius=13, fill=C_BLACK)
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=13, fill=C_MID_BG, outline=C_GOLD, width=1)
    draw.text((cx - (bb_b[2] - bb_b[0]) // 2, by + 5), badge_text, font=font_badge, fill=C_LIGHT_GOLD)

    # Subtitle line
    sub_text = "STANDAR KEMENAG RI  •  30 JUZ RASM UTSMANI  •  ZERO API KEY"
    bb_s = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw_w = bb_s[2] - bb_s[0]
    draw.text((cx - sw_w // 2, ban_y + 18), sub_text, font=font_sub, fill=C_MINT)

    return img

def main():
    print(f"Generating {TOTAL_FRAMES} frames for Al-Huda presentation gift...")
    frames = []
    
    for i in range(TOTAL_FRAMES):
        frame = render_frame(i, TOTAL_FRAMES)
        frame_path = os.path.join(FRAMES_DIR, f"frame_{i:03d}.png")
        frame.save(frame_path)
        # Convert to palette mode for sharp, efficient GIF
        frame_p = frame.convert("RGB").convert("P", palette=Image.Palette.ADAPTIVE, colors=128)
        frames.append(frame_p)
        if (i + 1) % 10 == 0 or i == TOTAL_FRAMES - 1:
            print(f"Rendered {i + 1}/{TOTAL_FRAMES} frames")

    # 1. Save Looping Animated GIF
    gif_path = os.path.join(OUTPUT_DIR, "alhuda_floating_logo.gif")
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

    # 2. Clean up temp frames to keep folder pristine
    for i in range(TOTAL_FRAMES):
        f_p = os.path.join(FRAMES_DIR, f"frame_{i:03d}.png")
        if os.path.exists(f_p):
            os.remove(f_p)
    if os.path.exists(FRAMES_DIR):
        os.rmdir(FRAMES_DIR)

    # 3. Save High-Res Presentation Wallpaper (HD Still)
    still_path = os.path.join(OUTPUT_DIR, "alhuda_presentation_wallpaper_hd.png")
    best_frame = render_frame(TOTAL_FRAMES // 4, TOTAL_FRAMES)
    best_frame.save(still_path)
    print(f"[OK] HD Presentation Wallpaper created: {still_path}")

    print("\nAlhamdulillah! All presentation gifts updated successfully with beautiful AL-HUDA & Tanya Azman branding!")

if __name__ == "__main__":
    main()
