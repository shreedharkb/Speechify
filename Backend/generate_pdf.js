const fs = require('fs');
const { marked } = require('marked');

// Read the markdown file
const markdown = fs.readFileSync('PROJECT_DOCUMENTATION.md', 'utf-8');

// Convert to HTML
const htmlContent = marked.parse(markdown);

// Create styled HTML
const styledHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Speechify - Complete Technical Documentation</title>
    <style>
        @page { size: A4; margin: 2cm; }
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; margin-top: 40px; }
        h2 { color: #34495e; margin-top: 30px; border-bottom: 2px solid #95a5a6; padding-bottom: 8px; }
        h3 { color: #7f8c8d; margin-top: 25px; }
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            color: #e74c3c;
        }
        pre {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-left: 4px solid #3498db;
            overflow-x: auto;
            border-radius: 4px;
        }
        pre code {
            background: transparent;
            color: #ecf0f1;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th {
            background-color: #3498db;
            color: white;
            padding: 12px;
            text-align: left;
        }
        td {
            border: 1px solid #ddd;
            padding: 10px;
        }
        tr:nth-child(even) { background-color: #f9f9f9; }
        ul, ol { margin-left: 25px; }
        li { margin: 8px 0; }
        blockquote {
            border-left: 4px solid #3498db;
            padding-left: 15px;
            color: #555;
            font-style: italic;
        }
    </style>
</head>
<body>
${htmlContent}
</body>
</html>
`;

// Write to HTML file
fs.writeFileSync('PROJECT_DOCUMENTATION_FORMATTED.html', styledHTML);

console.log('✅ HTML file created: PROJECT_DOCUMENTATION_FORMATTED.html');
console.log('📄 Open this file in your browser and use Ctrl+P to save as PDF');
console.log('   Recommended settings:');
console.log('   - Layout: Portrait');
console.log('   - Margins: Default');
console.log('   - Background graphics: Enabled');
