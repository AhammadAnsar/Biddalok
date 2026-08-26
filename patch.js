const fs = require('fs');

const path = 'src/pages/SystemAdmin.tsx';
let content = fs.readFileSync(path, 'utf8');

const rightSideOriginal = `{/* Developer Contact Pill */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/15 w-full lg:w-auto">
              <div className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-2 flex items-center gap-1.5">
                <User className="w-4 h-4" /> ডেভেলপার পরিচিতি (Developer Profile)
              </div>`;

const rightSideNew = `<div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Idea & Cooperation Pill */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/15 w-full sm:w-[260px]">
                <div className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> সার্বিক সহযোগিতা ও আইডিয়া
                </div>
                <h3 className="text-base font-bold text-white">মোঃ খায়রুল আলম</h3>
                <p className="text-indigo-200 text-xs font-medium">সিনিয়র শিক্ষক, আজিয়ারা উচ্চ বিদ্যালয়</p>
                
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>01822801957</span>
                  </div>
                </div>
              </div>

              {/* Developer Contact Pill */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/15 w-full sm:w-[260px]">
                <div className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold mb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> ডেভেলপার পরিচিতি (Developer Profile)
                </div>`;

content = content.replace(rightSideOriginal, rightSideNew);

const closeTagOriginal = `              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Management & Health */}`;

const closeTagNew = `              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Management & Health */}`;

content = content.replace(closeTagOriginal, closeTagNew);

fs.writeFileSync(path, content);
