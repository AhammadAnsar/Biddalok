const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

code = code.replace(/\\\$\\{appName\\.substring\\(0, 18\\)\\}\\.\\.\\./g, "\`${appName.substring(0, 18)}...\`");

code = code.replace(/className=\{\\\`flex items-center/g, "className={\`flex items-center");
code = code.replace(/hover:translate-x-1'\\n                    \}\\`\}/g, "hover:translate-x-1'\n                    }\`}");
code = code.replace(/className=\{\\\`w-5 h-5 flex-shrink-0 \\\$\{isActive \? 'text-indigo-100' : 'text-indigo-300'\}\\`\}/g, "className={\`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-100' : 'text-indigo-300'}\`}");

code = code.replace(/className=\{\\\`px-3/g, "className={\`px-3");
code = code.replace(/hover:bg-slate-200\/50'\\n                \}\\`\}/g, "hover:bg-slate-200/50'\n                }\`}");

fs.writeFileSync('src/components/Layout.tsx', code);
