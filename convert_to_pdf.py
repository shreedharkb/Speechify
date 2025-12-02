"""
Convert Markdown to PDF using markdown2 and weasyprint
"""

try:
    import markdown
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration
    
    # Read the markdown file
    with open('PROJECT_DOCUMENTATION.md', 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Convert markdown to HTML
    html_content = markdown.markdown(
        md_content,
        extensions=['tables', 'fenced_code', 'codehilite', 'toc']
    )
    
    # Add CSS styling
    css_style = """
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            margin-top: 30px;
        }
        h3 {
            color: #7f8c8d;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-left: 4px solid #3498db;
            overflow-x: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #3498db;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    """
    
    # Create full HTML document
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Speechify - Complete Technical Documentation</title>
        <style>{css_style}</style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    # Generate PDF
    font_config = FontConfiguration()
    html = HTML(string=full_html)
    html.write_pdf(
        'PROJECT_DOCUMENTATION.pdf',
        font_config=font_config
    )
    
    print("✅ PDF generated successfully: PROJECT_DOCUMENTATION.pdf")

except ImportError as e:
    print(f"❌ Missing required library: {e}")
    print("\nInstalling required packages...")
    import subprocess
    subprocess.run(['pip', 'install', 'markdown', 'weasyprint'])
    print("\n✅ Packages installed. Please run the script again.")

except Exception as e:
    print(f"❌ Error: {e}")
