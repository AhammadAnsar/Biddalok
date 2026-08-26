# 🏫 Biddalok by SoftDows (বিদ্যালোক)
### School & Institution Management Desktop Software (PC EXE)

**Biddalok (বিদ্যালোক)** একটি আধুনিক, সুপার ফাস্ট ও অফলাইন-ফার্স্ট স্কুল এবং শিক্ষাপ্রতিষ্ঠান ম্যানেজমেন্ট সফটওয়্যার। এটি ইন্টারনেট সংযোগ ছাড়াই পিসিতে স্বয়ংক্রিয়ভাবে সুপার ফাস্ট ডাটাবেজ সহ কাজ করে।

---

## 👨‍💻 ডেভেলপার পরিচিতি (Developer Information)
- **প্রতিষ্ঠাতা ও ডেভেলপার:** আনসার আহাম্মদ (Ansar Ahammad)
- **প্রতিষ্ঠান:** SoftDows (সফটডাউস)
- **মোবাইল:** 01737011052
- **ইমেইল:** ahammadansar75@gmail.com
- **ওয়েবসাইট:** [softdows.com/biddalok](https://softdows.com/biddalok)

---

## 💻 VS Code দিয়ে সফটওয়্যার তৈরি ও রান করার পদ্ধতি (Step-by-Step Guide)

### ১. প্রয়োজনীয় টুলস (Prerequisites):
1. **Node.js** ইন্সটল করা থাকতে হবে (ভার্সন 18 বা 20+ রেকমেন্ডেড): [https://nodejs.org](https://nodejs.org)
2. **VS Code (Visual Studio Code)**: [https://code.visualstudio.com](https://code.visualstudio.com)

---

### ২. প্রজেক্ট ওপেন ও প্যাকেজ ইন্সটলেশন:
1. প্রজেক্ট ফোল্ডারটি আনজিপ করে VS Code দিয়ে ওপেন করুন (`File -> Open Folder...`)।
2. VS Code এর টার্মিনাল ওপেন করুন (`Ctrl + ~` অথবা `Terminal -> New Terminal`)।
3. সব ডিপেনডেন্সি ইন্সটল করতে লিখুন:
   ```bash
   npm install
   ```

---

### ৩. ডেভেলপমেন্ট মোডে রান করা (Live Testing):
```bash
npm run electron:dev
```
*এটি স্বয়ংক্রিয়ভাবে লোকাল সার্ভার এবং ডেস্কটপ উইন্ডো একসাথে ওপেন করে লাইভ প্রিভিউ দেখাবে।*

---

### ৪. ইনস্টলার (.exe) বিল্ড করা (Creating Desktop EXE Installer):

#### পদ্ধতি ক (১-ক্লিকে অটো বিল্ড):
প্রজেক্ট ফোল্ডারে থাকা **`build-windows-exe.bat`** ফাইলে ডাবল ক্লিক করুন।

#### পদ্ধতি খ (টার্মিনাল কমান্ডের মাধ্যমে):
```bash
npm run electron:build:win
```

বিল্ড সম্পন্ন হলে প্রজেক্টের **`release/`** ফোল্ডারে ২টি ফাইল তৈরি হবে:
1. **`Biddalok by SoftDows Setup 1.0.0.exe`** -> উইন্ডোজ প্রফেশনাল ইন্সটলার (ডেস্কটপ ও স্টার্ট মেন্যু শর্টকাট সহ ইন্সটল হবে)।
2. **`Biddalok by SoftDows 1.0.0.exe`** -> পোর্টেবল ভার্সন (ইন্সটল ছাড়াই সরাসরি পেনড্রাইভ বা যেকোনো ফোল্ডার থেকে রান হবে)।

---

## ⚡ অফলাইন সুপার ফাস্ট ডাটাবেজ ও ব্যাকআপ সুবিধা:
- **IndexedDB + LocalStorage Hybrid Architecture:** পিসিতে হাজার হাজার শিক্ষার্থীর তথ্য মুহূর্তের মধ্যে লোড হবে।
- **ওয়ান-ক্লিক ব্যাকআপ ও রিস্টোর:** সফটওয়্যারের *সিস্টেম অ্যাডমিন (System Admin)* মেন্যু থেকে যেকোনো সময় ১-ক্লিকে পুরো প্রতিষ্ঠানের সব ডেটা `.json` ফাইলে ব্যাকআপ নেওয়া ও রিস্টোর করা যায়।
- **জিরো কনফিগারেশন:** কোনো আলাদা SQL সার্ভার বা জটিল ডাটাবেজ সেটআপের ঝামেলা নেই।

---

## 📜 কপিরাইট ও লাইসেন্স
&copy; 2026 **SoftDows**. Developed by **Ansar Ahammad**. All rights reserved.
