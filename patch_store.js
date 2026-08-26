const fs = require('fs');
let content = fs.readFileSync('src/store/useAppStore.ts', 'utf8');

content = content.replace(
  'bulkAddStudents: (newStudents: Student[]) => void;',
  'bulkAddStudents: (newStudents: Student[]) => void;\n  bulkUpdateStudents: (updatedStudents: Student[]) => void;'
);

content = content.replace(
  'bulkAddStudents: (newStudents) =>\n        set((state) => ({\n          students: [...newStudents, ...(state.students || [])],\n        })),',
  'bulkAddStudents: (newStudents) =>\n        set((state) => ({\n          students: [...newStudents, ...(state.students || [])],\n        })),\n      bulkUpdateStudents: (updatedStudents) =>\n        set((state) => {\n          const updatedIds = new Set(updatedStudents.map(s => s.id));\n          const updatedMap = new Map(updatedStudents.map(s => [s.id, s]));\n          return {\n            students: (state.students || []).map(s => updatedIds.has(s.id) ? updatedMap.get(s.id)! : s)\n          };\n        }),'
);

fs.writeFileSync('src/store/useAppStore.ts', content);
console.log('Store updated');
