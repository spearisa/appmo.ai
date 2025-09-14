#!/usr/bin/env python3

import json
import os
import sys
from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO

class PlaceholderGenerator:
    def __init__(self):
        self.width = 400
        self.height = 300
        self.screenshots_dir = 'screenshots'
        
    def generate_placeholder(self, text, filename):
        """Generate a placeholder image with text"""
        try:
            # Create image with gradient-like background
            img = Image.new('RGB', (self.width, self.height), color='#1a202c')
            draw = ImageDraw.Draw(img)
            
            # Draw border
            draw.rectangle([(1, 1), (self.width-2, self.height-2)], outline='#4a5568', width=2)
            
            # Try to use a system font, fallback to default
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 16)
            except:
                font = ImageFont.load_default()
            
            # Wrap text
            words = text.split()
            lines = []
            current_line = []
            
            for word in words:
                test_line = ' '.join(current_line + [word])
                bbox = draw.textbbox((0, 0), test_line, font=font)
                if bbox[2] - bbox[0] > self.width - 40:
                    if current_line:
                        lines.append(' '.join(current_line))
                        current_line = [word]
                    else:
                        lines.append(word)
                else:
                    current_line.append(word)
            
            if current_line:
                lines.append(' '.join(current_line))
            
            # Draw text lines
            line_height = 20
            total_height = len(lines) * line_height
            start_y = (self.height - total_height) // 2
            
            for i, line in enumerate(lines):
                bbox = draw.textbbox((0, 0), line, font=font)
                text_width = bbox[2] - bbox[0]
                x = (self.width - text_width) // 2
                y = start_y + (i * line_height)
                draw.text((x, y), line, fill='#e2e8f0', font=font)
            
            # Draw DeepSite badge
            draw.rectangle([(self.width-80, 10), (self.width-10, 35)], fill='#3182ce')
            try:
                badge_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 12)
            except:
                badge_font = ImageFont.load_default()
            draw.text((self.width-70, 20), 'DeepSite', fill='#ffffff', font=badge_font)
            
            # Save image
            filepath = os.path.join(self.screenshots_dir, filename)
            img.save(filepath, 'PNG')
            return filepath
            
        except Exception as e:
            print(f"Error generating {filename}: {e}")
            return None
    
    def generate_from_json(self):
        """Generate placeholders from screenshots.json"""
        json_path = 'screenshots.json'
        
        if not os.path.exists(json_path):
            print('❌ screenshots.json not found')
            return
        
        try:
            with open(json_path, 'r') as f:
                data = json.load(f)
        except Exception as e:
            print(f'❌ Error reading screenshots.json: {e}')
            return
        
        if not isinstance(data, list):
            print('❌ Invalid screenshots.json format')
            return
        
        # Create screenshots directory
        if not os.path.exists(self.screenshots_dir):
            os.makedirs(self.screenshots_dir)
        
        print(f'🎨 Generating {len(data)} placeholder screenshots...')
        
        generated = 0
        
        for item in data:
            if item.get('filename') and item['filename'].endswith('.png'):
                # Extract project name from filename
                project_name = item['filename'].replace('space-', '').replace('.png', '')
                project_name = project_name.replace('-', ' ').title()
                
                try:
                    result = self.generate_placeholder(project_name, item['filename'])
                    if result:
                        generated += 1
                        
                        if generated % 100 == 0:
                            print(f'📸 Generated {generated}/{len(data)} screenshots...')
                except Exception as e:
                    print(f'❌ Error generating {item["filename"]}: {e}')
        
        print(f'✅ Successfully generated {generated} placeholder screenshots!')

def main():
    generator = PlaceholderGenerator()
    generator.generate_from_json()

if __name__ == '__main__':
    main()
