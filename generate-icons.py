#!/usr/bin/env python3
"""
Generate PNG icons from SVG for PWA
Requires: cairosvg (pip install cairosvg)

Usage: python generate-icons.py
"""

try:
    import cairosvg
    
    sizes = [192, 512]
    
    for size in sizes:
        output_file = f'icon-{size}.png'
        cairosvg.svg2png(
            url='icon.svg',
            write_to=output_file,
            output_width=size,
            output_height=size
        )
        print(f'✓ Generated {output_file}')
    
    print('\n✅ All icons generated successfully!')
    
except ImportError:
    print('❌ Error: cairosvg not installed')
    print('\nInstall it with: pip install cairosvg')
    print('\nAlternatively, you can use an online converter:')
    print('1. Go to https://cloudconvert.com/svg-to-png')
    print('2. Upload icon.svg')
    print('3. Set width/height to 192px, convert and download as icon-192.png')
    print('4. Repeat with 512px for icon-512.png')
