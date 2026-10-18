# 🚀 বিদ্যালোক — GitHub ও Cloudflare Pages ডিপ্লয়মেন্ট গাইড

এই নির্দেশিকা অনুসরণ করে আপনি খুব সহজেই **Biddalok Web Edition** সম্পূর্ণ বিনামূল্যে GitHub এবং Cloudflare Pages-এ ডিপ্লয় করতে পারবেন।

---

## 📋 পূর্বপ্রস্তুতি (Prerequisites)
1. একটি **GitHub Account** (যেখানে কোড পুশ করা হবে)
2. একটি **Cloudflare Account** ([cloudflare.com](https://cloudflare.com))
3. ডোমেইন: **nicetrix.com** (যা ক্লাউডফ্লেয়ার বা আপনার ডিএনএস ম্যানেজমেন্টে যুক্ত আছে)

---

## ধাপ ১: গিটহাব রিপোজিটরি তৈরি ও কোড পুশ (GitHub Repo Setup)

১. [github.com/new](https://github.com/new)-এ যান এবং একটি নতুন রিপোজিটরি তৈরি করুন (যেমন: `biddalok-web` অথবা `biddalok-cloudflare`)।  
   *(Public অথবা Private যেকোনো একটি সিলেক্ট করতে পারেন)*

২. আপনার কম্পিউটারে টার্মিনাল/পাওয়ারশেল ওপেন করে `Biddalok-Cloudflare` ফোল্ডারে প্রবেশ করুন:
```bash
cd "g:\Vibe Projects\Biddalok-Cloudflare"
```

৩. গিট ইনিশিয়ালাইজ করে গিটহাবে পুশ করুন:
```bash
git init
git add .
git commit -m "feat: Initial commit for Biddalok Cloudflare Pages web edition"
git branch -M main
git remote add origin https://github.com/<your-username>/biddalok-web.git
git push -u origin main
```
*(<your-username> এর জায়গায় আপনার গিটহাব ইউজারনেম দিন)*

---

## ধাপ ২: Cloudflare Pages-এ ডিপ্লয়মেন্ট সংযোগ (Connect to Cloudflare Pages)

১. [Cloudflare Dashboard](https://dash.cloudflare.com)-এ লগইন করুন।
2. বাম পাশের মেন্যু থেকে **Compute (Workers & Pages)** > **Create application** > **Pages** ট্যাবে ক্লিক করুন।
3. **Connect to Git** নির্বাচন করুন।
4. আপনার গিটহাব অ্যাকাউন্ট অথরাইজ করে `biddalok-web` রিপোজিটরিটি সিলেক্ট করুন।
5. **Set up builds and deployments** পেইজে নিচের সেটিংসগুলো দিন:
   - **Project name**: `biddalok` (বা আপনার পছন্দের নাম)
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version** (Environment Variables-এ প্রয়োজন হলে):
     - Variable name: `NODE_VERSION`
     - Value: `20` (বা ২০+)
6. **Save and Deploy** বাটনে ক্লিক করুন।
7. ২ মিনিটের মধ্যে বিল্ড সফল হয়ে আপনার সাইটটি লাইভ হয়ে যাবে এবং একটি লিংক পাবেন (যেমন: `biddalok.pages.dev`)।

---

## ধাপ ৩: সাব-ডোমেইন যুক্ত করা (`biddalok.nicetrix.com`)

১. আপনার তৈরি হওয়া Cloudflare Pages প্রজেক্টের ভেতর যান।
2. **Custom domains** ট্যাবে ক্লিক করে **Set up a custom domain** বাটনে ক্লিক করুন।
3. ডোমেইন ঘরে লিখুন: `biddalok.nicetrix.com`
4. Cloudflare স্বয়ংক্রিয়ভাবে ডিএনএস রেকর্ড (CNAME) আপডেট করে নিবে এবং বিশ্বমানের **SSL/TLS সার্টিফিকেট** প্রদান করবে।
5. ৫-১০ মিনিটের মধ্যে `https://biddalok.nicetrix.com` ভিজিট করলেই সম্পূর্ণ সফটওয়্যারটি লাইভ দেখা যাবে।

---

## ধাপ ৪: AdSense ও গুগল কনসোল ভেরিফিকেশন

১. **AdSense ads.txt**:
   - সাইট লাইভ হওয়ার সাথে সাথেই `https://biddalok.nicetrix.com/ads.txt` ঠিকানায় গুগল অ্যাডসেন্স ফাইলটি সরাসরি পাওয়া যাবে:
     ```
     google.com, pub-6673594317291335, DIRECT, f08c47fec0942fa0
     ```
   - যেহেতু `nicetrix.com` ইতোমধ্যে মনিটাইজড, তাই অ্যাডসেন্স সিস্টেমে সাবডোমেইনটি স্বয়ংক্রিয় অনুমোদন পেয়ে যাবে।

২. **Google Search Console**:
   - `index.html`-এ সাইট ভেরিফিকেশন মেটা ট্যাগ যুক্ত আছে:
     ```html
     <meta name="google-site-verification" content="m4tV2GXt9Bdc_lqgP0awfckbmTrg9cWYZ5dGv5S47EQ" />
     ```
   - সার্চ কনসোলে `https://biddalok.nicetrix.com` প্রপার্টি যুক্ত করে "Verify" বাটনে চাপলেই তাৎক্ষণিক ভেরিফাই হয়ে যাবে।

৩. **Google Analytics 4 (GA4)**:
   - মেজারমেন্ট আইডি `G-7B4F7HKZX1` ইন্টিগ্রেট করা রয়েছে।
   - প্রাইভেসি সুরক্ষার জন্য `anonymize_ip: true` এবং `restricted_data_processing: true` সক্রিয় রাখা হয়েছে যাতে কোনো ব্যক্তিগত প্রাতিষ্ঠানিক ডাটা ট্র্যাকিং না হয়।

---

- **`wrangler.jsonc` & `public/200.html`**: `"not_found_handling": "single-page-application"` — যার কারণে ব্রাউজারে রিফ্রেশ বা ডিপ লিংক (যেমন `/about`, `/login`, `/students`) দিলে কোনো 404 পেজ বা রিডাইরেক্ট লুপ আসবে না, সরাসরি অ্যাপ লোড হবে।
- **`public/_headers`**: ব্রাউজার নিরাপত্তা ও ফন্ট/ইমেজ ফাইল ১ বছর ক্যাশ রাখার জন্য অপ্টিমাইজড রুলস।
- **`public/robots.txt`**: গুগল বা সার্চ ইঞ্জিন কেবল পাবলিক ল্যান্ডিং ও পলিসি পেজ ক্রল করবে; স্কুলের ছাত্রছাত্রীদের অভ্যন্তরীণ পেজগুলো ক্রল করা থেকে সম্পূর্ণ সুরক্ষিত।
