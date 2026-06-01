import os
from PIL import Image

def crop_logo_only():
    image_path = "logo2.png"
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found.")
        return

    # Load image and convert to RGBA
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    print(f"Original image size: {width}x{height}")

    # Calculate column alpha sum to find the gap between logo and text
    column_alpha_sums = []
    for x in range(width):
        col_alpha = 0
        for y in range(height):
            r, g, b, a = img.getpixel((x, y))
            # Consider pixel active if it's not fully transparent and not white background
            if a > 10 and not (r > 240 and g > 240 and b > 240 and a > 240):
                col_col_dist = abs(r - 2) + abs(g - 2) + abs(b - 5) # Dist from dark background if any
                col_alpha += a
        column_alpha_sums.append(col_alpha)

    # Find the gap: a column with very low or zero active pixels between the left section (logo) and right section (text)
    # The logo is on the left, so we search for a gap starting around x = width // 3 to x = 2 * width // 3
    logo_end_x = width // 2 # fallback
    min_density = float('inf')
    
    # We look for a minimum density column in the middle third of the image
    start_search = int(width * 0.25)
    end_search = int(width * 0.65)
    
    for x in range(start_search, end_search):
        # Check a window of columns to ensure it's a real gap
        window = column_alpha_sums[x-2:x+3]
        avg_density = sum(window) / len(window) if window else column_alpha_sums[x]
        if avg_density < min_density:
            min_density = avg_density
            logo_end_x = x

    print(f"Detected gap column at x = {logo_end_x} with average local density = {min_density}")

    # Crop the left part (the logo)
    cropped_img = img.crop((0, 0, logo_end_x, height))

    # Now, auto-trim any fully transparent/empty borders from the cropped logo
    bbox = cropped_img.getbbox()
    if bbox:
        trimmed_img = cropped_img.crop(bbox)
        print(f"Trimmed logo size: {trimmed_img.size[0]}x{trimmed_img.size[1]} (from bbox {bbox})")
    else:
        trimmed_img = cropped_img
        print("Warning: Could not auto-trim transparent borders.")

    # Save as a square image by adding padding if necessary, or just keep the trimmed version
    # Let's keep it as trimmed with a slight transparent padding to make it look premium
    w, h = trimmed_img.size
    max_dim = max(w, h)
    
    # Create a transparent square canvas
    square_img = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
    # Paste the trimmed logo in the center
    offset_x = (max_dim - w) // 2
    offset_y = (max_dim - h) // 2
    square_img.paste(trimmed_img, (offset_x, offset_y))

    # Save to the root and copy to public assets
    square_img.save("logo2_cropped.png", "PNG")
    print("Cropped logo successfully saved to logo2_cropped.png!")

if __name__ == "__main__":
    crop_logo_only()
