const fs = require('fs');
let content = fs.readFileSync('src/pages/Testimonial.tsx', 'utf8');

// 1. Remove handlePrint
content = content.replace(/const handlePrint = \(\) => \{[\s\S]*?printWindow\.close\(\);\n  \};\n/g, '');

// 2. Remove the Print button
content = content.replace(/\{\/\* Print Button \*\/\}\s*<button\s*onClick=\{handlePrint\}[\s\S]*?<\/button>\s*/g, '');

// 3. Rename "বর্তমান পেজ PDF" to "পিডিএফ ডাউনলোড"
content = content.replace(/'বর্তমান পেজ PDF' : 'Download Page PDF'/g, "'পিডিএফ ডাউনলোড' : 'Download PDF'");

// 4. Update the tooltip text
content = content.replace(/'একক ও এক ক্লিকে পুরো ক্লাসের প্রশংসাপত্র তৈরি ও সরাসরি PDF ডাউনলোড'/g, "'সরাসরি পিডিএফ তৈরি করুন এবং কোনো লেআউট ভাঙা ছাড়াই প্রিন্ট করুন'");
content = content.replace(/'Generate single or bulk class testimonials with instant PDF download'/g, "'Generate direct PDF to print flawlessly without layout breaks'");

fs.writeFileSync('src/pages/Testimonial.tsx', content);
