import React from 'react';
import { 
  X, BookOpen, Scale, AlertCircle, CheckCircle2, Clock, 
  FileText, ShieldCheck, ChevronRight, ExternalLink 
} from 'lucide-react';

export interface PolicyGuideTopic {
  id: string;
  title: string;
  category: string;
  regulatoryRef: string;
  summary: string;
  keyPoints: string[];
  deadlines?: string;
  requiredDocs?: string[];
  penaltiesOrRisks?: string;
}

export const COMMITTEE_POLICY_TOPICS: Record<string, PolicyGuideTopic> = {
  overview: {
    id: 'overview',
    title: 'ম্যানেজিং কমিটি পরিচালনা ও আইনি কাঠামোর নীতিমালা',
    category: 'বোর্ড প্রবিধানমালা',
    regulatoryRef: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড (বিদ্যালয় ও কলেজ পরিচালনা পরিষদ) প্রবিধানমালা ২০০৯ (সংশোধিত ২০২৪)',
    summary: 'বেসরকারি মাধ্যমিক ও উচ্চ মাধ্যমিক বিদ্যালয় পরিচালনার জন্য সরকার ও সংশ্লিষ্ট শিক্ষা বোর্ড কর্তৃক অনুমোদিত বৈধ পরিচালনা পরিষদ অপরিহার্য। এটি প্রাতিষ্ঠানিক জবাবদিহিতা, আর্থিক স্বচ্ছতা ও শিক্ষক-কর্মচারী শৃঙ্খলা নিশ্চিত করে।',
    keyPoints: [
      'কমিটির সাধারণ মেয়াদকাল প্রজ্ঞাপন জারির পর অনুষ্ঠিত প্রথম সভা হতে সর্বোচ্চ ৩ (তিন) বছর।',
      'আইনি কোরাম: মোট সদস্যের অন্তত ৬০% (সাধারণত নূন্যতম ৭ জন) সদস্যের উপস্থিতিতে সভা আইনসম্মত বলে গণ্য হয়।',
      'সভাপতি পদাধিকারবলে সর্বোচ্চ নির্বাহী ক্ষমতাধর ব্যক্তি হলেও বিদ্যালয়ের সার্বিক অ্যাকাউন্টিং ও চেক যৌথ স্বাক্ষরে (সভাপতি ও সদস্য সচিব) পরিচালিত হয়।',
      'কোনো সদস্য পরপর তিনটি সাধারণ সভায় বিনা অনুমতিতে অনুপস্থিত থাকলে পদ স্বয়ংক্রিয়ভাবে শূন্য ঘোষিত হবে।'
    ],
    deadlines: 'প্রথম সভার তারিখ থেকেই মেয়াদের দিন গণনা শুরু হয়। মেয়াদ শেষের অন্তত ৯০ দিন পূর্বে নতুন কমিটি গঠনের কার্যক্রম শুরু করা আইনি বাধ্যবাধকতা।',
    requiredDocs: [
      'শিক্ষা বোর্ড কর্তৃক জারিকৃত মূল অনুমোদন প্রজ্ঞাপন',
      'প্রথম সভার উপস্থিতি ও স্বাক্ষরিত কার্যবিবরণী',
      'ব্যাংক হিসাব পরিচালনায় যৌথ স্বাক্ষরের রেজুলেশন কপি'
    ],
    penaltiesOrRisks: 'মেয়াদোত্তীর্ণ কমিটির মাধ্যমে গৃহীত কোনো আর্থিক লেনদেন বা প্রশাসনিক সিদ্ধান্ত সরকারি নিরীক্ষায় অবৈধ ঘোষিত হবে এবং শিক্ষক-কর্মচারীদের এমপিও স্থগিত হতে পারে।'
  },
  meetings: {
    id: 'meetings',
    title: 'সভা আহ্বান, নোটিশ জারি ও কার্যবিবরণী লিখন নীতিমালা',
    category: 'সভা ও সিদ্ধান্ত বিধিমালা',
    regulatoryRef: 'প্রবিধানমালার ধারা ১৮ ও ১৯ (সভা আহ্বান ও রেজুলেশন সংরক্ষণ)',
    summary: 'পরিচালনা পরিষদের প্রতিটি সভা স্বচ্ছভাবে আহ্বানের জন্য নির্ধারিত সময়ের পূর্বে লিখিত নোটিশ জারি এবং সভার সিদ্ধান্তসমূহ রেজুলেশন বহিতে ক্রমানুসারে লিপিবদ্ধ করে অনুমোদন বাধ্যতামূলক।',
    keyPoints: [
      'নিয়মিত সভার নোটিশ: সভার অন্তত ৭ (সাত) দিন পূর্বে এজেন্ডা/আলোচ্যসূচিসহ সকল সদস্যকে লিখিত নোটিশ বা রেজিস্টার্ড চিঠি পাঠাতে হবে।',
      'জরুরি সভার নোটিশ: বিশেষ পরিস্থিতিতে অন্তত ৪৮ ঘণ্টার নোটিশে জরুরি সভা আহ্বান করা যাবে।',
      'প্রত্যেক সভায় উপস্থিত সদস্যদের স্বহস্তে উপস্থিতি বহিতে পূর্ণাঙ্গ স্বাক্ষর থাকতে হবে।',
      'রেজুলেশন অনুমোদন: পূর্ববর্তী সভার কার্যবিবরণী পরবর্তী সভার ১নং আলোচ্যসূচি হিসেবে পঠিত ও অনুমোদিত হতে হবে।'
    ],
    deadlines: 'প্রতি ২ মাসে অন্তত একটি নিয়মিত সাধারণ সভা এবং বছরে নূন্যতম ৬টি সভা আহ্বান বাধ্যতামূলক।',
    requiredDocs: [
      'নোটিশ জারি রেজিস্টার ও সদস্যদের স্বাক্ষরিত প্রাপ্তিস্বীকার',
      'মূল রেজুলেশন খাতা ও অনুমোদিত রেজুলেশন সারসংক্ষেপ',
      'আর্থিক বরাদ্দের ক্ষেত্রে ব্যয় অনুমোদন ভাউচার ও কোটেশন বিবরণী'
    ]
  },
  formation_general: {
    id: 'formation_general',
    title: 'নতুন কমিটি গঠন ও নির্বাচন সংক্রান্ত সাধারণ নীতিমালা',
    category: 'নির্বাচন প্রবিধান',
    regulatoryRef: 'প্রবিধানমালার ধারা ৪–১৬ (নির্বাচন পরিচালনা ও প্রিজাইডিং অফিসার বিধি)',
    summary: 'কমিটির মেয়াদ সমাপ্তির প্রাক্কালে নতুন পরিচালনা পরিষদ গঠনের জন্য নির্ধারিত রোডম্যাপ অনুসরণ করা বাধ্যতামূলক। নির্বাচন সুষ্ঠুভাবে সম্পন্নের লক্ষ্যে জেলা/উপজেলা প্রশাসন সরাসরি সম্পৃক্ত থাকে।',
    keyPoints: [
      'মেয়াদ শেষের ৯০ দিন পূর্বে নির্বাচন প্রস্তুতি কমিটি বা অ্যাকাডেমিক সভায় ভোটার তালিকা প্রণয়নের সিদ্ধান্ত গ্রহণ।',
      'উপজেলা নির্বাহী অফিসার (ইউএনও) বা জেলা প্রশাসক (ডিসি) কর্তৃক সরকারি প্রিজাইডিং অফিসার নিয়োগ প্রদান।',
      'অভিভাবক ভোটার তালিকায় শুধুমাত্র বৈধ অধ্যয়নরত শিক্ষার্থীর অভিভাবক অন্তর্ভুক্ত হবেন (এক শিক্ষার্থীর বিপরীতে এক ভোট)।',
      'নির্বাচনী তহবিলের আয়-ব্যয়ের হিসাব স্বচ্ছভাবে সংরক্ষণ ও প্রিজাইডিং অফিসারকে অবগত রাখা।'
    ],
    deadlines: 'মেয়াদ শেষ হওয়ার অন্তত ৩০ দিন পূর্বে নির্বাচন অনুষ্ঠান ও সভাপতি নির্বাচন সম্পন্ন করতে হবে।'
  },
  voters: {
    id: 'voters',
    title: 'ভোটার তালিকা প্রণয়ন, আপত্তি নিষ্পত্তি ও চূড়ান্তকরণ নীতিমালা',
    category: 'ধাপ ১: ভোটার বিধিমালা',
    regulatoryRef: 'নির্বাচন প্রবিধানের ধারা ৫ (ভোটার তালিকা প্রণয়ন ও আপত্তি গ্রহণ)',
    summary: 'খসড়া ভোটার তালিকা প্রকাশের পর নির্দিষ্ট সময় নোটিশ বোর্ডে উন্মুক্ত রেখে আপত্তি ও সংশোধনের সুযোগ দিয়ে প্রিজাইডিং অফিসারের অনুমোদনক্রমে চূড়ান্ত তালিকা প্রস্তুত করতে হয়।',
    keyPoints: [
      'এক শিক্ষার্থীর পিতা-মাতার মধ্যে একজনই মাত্র ভোটার হতে পারবেন।',
      'বকেয়া বেতন বা ফির অজুহাতে কোনো বৈধ শিক্ষার্থীর অভিভাবককে ভোটার তালিকা থেকে বাদ দেওয়া বেআইনি।',
      'খসড়া তালিকা অন্তত ৭ দিন সর্বসাধারণের জন্য নোটিশ বোর্ডে টানিয়ে রাখতে হবে।',
      'দাবি-আপত্তি জানানোর জন্য ৩ কার্যদিবস সময় দিতে হবে এবং প্রধান শিক্ষক তা নিষ্পত্তি করবেন।'
    ],
    deadlines: 'তফসিল ঘোষণার অন্তত ১৫ দিন পূর্বে চূড়ান্ত ভোটার তালিকা প্রিজাইডিং অফিসার কর্তৃক সত্যায়িত ও সিলমোহরযুক্ত হতে হবে।',
    requiredDocs: [
      'শ্রেণিভিত্তিক শিক্ষার্থী ভর্তি রেজিস্টার',
      'অভিভাবকের জাতীয় পরিচয়পত্র ও যোগাযোগের ফোন নম্বর'
    ]
  },
  officer: {
    id: 'officer',
    title: 'প্রিজাইডিং অফিসার নিয়োগের আবেদন ও প্রশাসনিক অনুমতি',
    category: 'ধাপ ২: প্রিজাইডিং অফিসার বিধি',
    regulatoryRef: 'প্রবিধানমালার ধারা ৭ (প্রিজাইডিং অফিসার ও রিটার্নিং অফিসার মনোনয়ন)',
    summary: 'নির্বাচন নিরপেক্ষ করতে প্রতিষ্ঠান প্রধান সরাসরি স্থানীয় উপজেলা নির্বাহী অফিসার বরাবর সরকারি কর্মকর্তা (সাধারণত উপজেলা মাধ্যমিক শিক্ষা অফিসার বা সমমর্যাদার কর্মকর্তা)-কে প্রিজাইডিং অফিসার হিসেবে দায়িত্ব প্রদানের আবেদন করবেন।',
    keyPoints: [
      'প্রতিষ্ঠান প্রধান অফিসিয়াল প্যাডে নির্দিষ্ট স্মারক নম্বরে আবেদন পাঠাবেন।',
      'প্রিজাইডিং অফিসার নিয়োগপত্র জারির পরই নির্বাচন সংক্রান্ত পরবর্তী সকল আনুষ্ঠানিক এখতিয়ার তার ওপর ন্যস্ত হবে।',
      'প্রিজাইডিং অফিসারের উপস্থিতি ছাড়া কোনো মনোনয়নপত্র বিতরণ, গ্রহণ বা ভোটগ্রহণ আইনসিদ্ধ নয়।'
    ]
  },
  schedule: {
    id: 'schedule',
    title: 'নির্বাচন তফসিল ঘোষণা ও বিধিবদ্ধ সময়ের ব্যবধান',
    category: 'ধাপ ৩: তফসিল বিধিমালা',
    regulatoryRef: 'প্রবিধানমালার ধারা ৮ (নির্বাচনী তফসিল প্রকাশ)',
    summary: 'প্রিজাইডিং অফিসার কর্তৃক স্বাক্ষরিত তফসিল নোটিশ বোর্ডে প্রচার এবং স্থানীয় জনবহুল স্থানে বিজ্ঞপ্তি আকারে প্রকাশ করতে হয়।',
    keyPoints: [
      'মনোনয়নপত্র বিতরণ থেকে দাখিলের মধ্যে অন্তত ৩ কার্যদিবস থাকতে হবে।',
      'মনোনয়ন বাছাইয়ের পর প্রত্যাহারের জন্য অন্তত ২ কার্যদিবস সুযোগ দিতে হবে।',
      'চূড়ান্ত প্রার্থী তালিকা প্রকাশের পর ভোটগ্রহণের মধ্যে নূন্যতম ৭ দিনের প্রচারকালীন সময় থাকতে হবে।'
    ],
    deadlines: 'ভোটগ্রহণের অন্তত ১৫ দিন পূর্বে তফসিল সর্বসাধারণের অবগতির জন্য প্রচার করতে হবে।'
  },
  nomination: {
    id: 'nomination',
    title: 'মনোনয়নপত্র বিতরণ, গ্রহণ ও জামানত সংক্রান্ত বিধি',
    category: 'ধাপ ৪: মনোনয়ন বিধি',
    regulatoryRef: 'প্রবিধানমালার ধারা ৯ ও ১০ (মনোনয়ন দাখিল)',
    summary: 'বৈধ ভোটার তালিকায় নাম থাকা সাপেক্ষে অভিভাবক ও শিক্ষকগণ তাদের স্ব-স্ব ক্যাটাগরিতে মনোনয়নপত্র সংগ্রহ ও জমা দিতে পারেন।',
    keyPoints: [
      'প্রতিটি মনোনয়নপত্রে একজন প্রস্তাবকারী ও একজন সমর্থনকারী থাকতে হবে (উভয়কে একই ক্যাটাগরির ভোটার হতে হবে)।',
      'সরকারি প্রবিধান অনুযায়ী নির্ধারিত অফেরতযোগ্য জামানত ফি প্রতিষ্ঠানের ব্যাংক একাউন্টে জমা দিয়ে রসিদ সংযুক্ত করতে হবে।',
      'নির্দিষ্ট তারিখ ও সময়ের পরে কোনো মনোনয়নপত্র গ্রহণ করা আইনত দণ্ডনীয়।'
    ]
  },
  scrutiny: {
    id: 'scrutiny',
    title: 'মনোনয়নপত্র বাছাই ও প্রার্থী যোগ্যতার মাপকাঠি',
    category: 'ধাপ ৫: বাছাই ও স্ক্রুটিনি',
    regulatoryRef: 'প্রবিধানমালার ধারা ১১ (প্রার্থিতা যাচাই ও বাতিল)',
    summary: 'প্রিজাইডিং অফিসারের উপস্থিতিতে উন্মুক্তভাবে মনোনয়নপত্র বাছাই সম্পন্ন হয়। প্রার্থী বা তাদের প্রতিনিধিদের উপস্থিত থাকার অধিকার থাকে।',
    keyPoints: [
      'প্রার্থীর কোনো ঋণখেলাপি বা ফৌজদারি অপরাধে দণ্ডাদেশ না থাকার প্রত্যয়ন।',
      'দ্বৈত প্রার্থিতা নিষিদ্ধ: একই ব্যক্তি একাধিক ক্যাটাগরিতে প্রার্থী হতে পারবেন না।',
      'কোনো কারণবশত মনোনয়নপত্র বাতিল হলে প্রার্থীকে লিখিত কারণ জানানো এবং ২৪ ঘণ্টার মধ্যে আপিল করার সুযোগ দিতে হবে।'
    ]
  },
  ballot: {
    id: 'ballot',
    title: 'প্রতীক বরাদ্দ ও ব্যালট পেপার মুদ্রণ বিধিমালা',
    category: 'ধাপ ৬: ব্যালট ও প্রতীক',
    regulatoryRef: 'প্রবিধানমালার ধারা ১২ (ব্যালট প্রস্তুতি)',
    summary: 'প্রার্থীদের ক্যাটাগরিভিত্তিক ক্রমিক নম্বর বা প্রতীক বরাদ্দ করে গোপন ব্যালট পেপার মুদ্রণ করতে হয়।',
    keyPoints: [
      'সাধারণ নির্বাচনে প্রার্থীদের নামের বাংলা বর্ণানুক্রমিক বা নির্ধারিত প্রতীকে ব্যালট মুদ্রিত হবে।',
      'ব্যালটের মুড়ি (Counterfoil) এবং ব্যালট অংশে প্রিজাইডিং অফিসারের সরকারি সিল ও স্বাক্ষর থাকতে হবে।',
      'মহিলা সংরক্ষিত পদের জন্য আলাদা রঙের ব্যালট ব্যবহার উত্তম।'
    ]
  },
  result: {
    id: 'result',
    title: 'ভোটগ্রহণ, গণনা ও ফলাফল লক নীতিমালা',
    category: 'ধাপ ৭: ফলাফল আইন',
    regulatoryRef: 'প্রবিধানমালার ধারা ১৩ ও ১৪ (ফলাফল ঘোষণা ও সংরক্ষণ)',
    summary: 'ভোটগ্রহণ শেষে প্রিজাইডিং অফিসার প্রার্থীদের উপস্থিতিতে ভোট গণনা করে ফলাফল শিট প্রস্তুত ও স্বাক্ষরপূর্বক প্রাথমিক বিজয়ী ঘোষণা করবেন।',
    keyPoints: [
      'ভোট সমান হলে লটারির মাধ্যমে বিজয়ী নির্ধারণ করতে হবে।',
      'ফলাফল শিট প্রস্তুত হওয়ার সাথে সাথে প্রিজাইডিং অফিসার ও প্রতিষ্ঠান প্রধান তাতে যৌথ সিলমোহর দিবেন।',
      'ফলাফল কোনোভাবেই মৌখিক পরিবর্তনযোগ্য নয়; সিস্টেম রেজাল্ট লক করতে হবে।'
    ]
  },
  chairman: {
    id: 'chairman',
    title: 'সভাপতি নির্বাচন ও রেজুলেশন প্রস্তুতি',
    category: 'ধাপ ৮: সভাপতি নির্বাচন',
    regulatoryRef: 'প্রবিধানমালার ধারা ১৫ (সভাপতি নির্বাচন)',
    summary: 'নির্বাচিত অভিভাবক ও শিক্ষক প্রতিনিধিবৃন্দের প্রথম বিশেষ সভায় প্রিজাইডিং অফিসারের সভাপতিত্বে গোপন ভোটে বা সর্বসম্মতভাবে পরিচালনা পরিষদের সভাপতি নির্বাচিত হবেন।',
    keyPoints: [
      'সভাপতি প্রার্থীকে বোর্ড প্রবিধান অনুযায়ী নূন্যতম শিক্ষাগত যোগ্যতা (স্নাতক/সমমান) সম্পন্ন হতে হবে।',
      'কোনো শিক্ষক বা কর্মচারী সভাপতি পদে প্রতিদ্বন্দ্বিতা করতে পারবেন না।',
      'উপস্থিত সকল সদস্যের স্বাক্ষরে সভাপতি নির্বাচনের রেজুলেশন চূড়ান্ত করতে হবে।'
    ]
  },
  submission: {
    id: 'submission',
    title: 'শিক্ষা বোর্ডে পূর্ণাঙ্গ ফাইল সাবমিশন চেকলিস্ট',
    category: 'ধাপ ৯: বোর্ড সাবমিশন',
    regulatoryRef: 'প্রবিধানমালার ধারা ১৬ (অনুমোদনের আবেদন)',
    summary: 'নির্বাচন সম্পন্ন হওয়ার ৭ কার্যদিবসের মধ্যে যাবতীয় কাগজপত্র প্রস্তুত করে বোর্ড চেয়ারম্যান বরাবর অনুমোদনের আবেদন পাঠাতে হবে।',
    keyPoints: [
      'ফাইল ফরোয়ার্ডিং লেটার (প্রতিষ্ঠান প্রধানের স্বাক্ষর ও সিলযুক্ত)',
      'প্রিজাইডিং অফিসারের চূড়ান্ত প্রত্যয়নপত্র ও ফলাফল শিট',
      'সভাপতি নির্বাচনের রেজুলেশন কপি ও ভোটার তালিকা',
      'নির্বাচিত সকল সদস্যের জাতীয় পরিচয়পত্র ও শিক্ষাগত যোগ্যতার সনদ'
    ]
  },
  approval: {
    id: 'approval',
    title: 'বোর্ড অনুমোদন প্রজ্ঞাপন ও সংরক্ষণ',
    category: 'ধাপ ১০: বোর্ড প্রজ্ঞাপন',
    regulatoryRef: 'প্রবিধানমালার ধারা ১৭ (বোর্ড কর্তৃক অনুমোদন আদেশ)',
    summary: 'বোর্ড কর্তৃক যাচাই-বাছাই শেষে বিদ্যালয় শাখা থেকে অফিসিয়াল প্রজ্ঞাপন জারি করা হয় যা কমিটির একমাত্র বৈধ প্রমাণপত্র।',
    keyPoints: [
      'প্রজ্ঞাপনে উল্লেখিত স্মারক নম্বর ও অনুমোদনের তারিখ প্রাতিষ্ঠানিক ডাটাবেজে রেকর্ড রাখা বাধ্যতামূলক।',
      'বোর্ডের চিঠিতে কোনো শর্তাবলী থাকলে তা নির্দিষ্ট সময়ের মধ্যে বাস্তবায়ন করতে হবে।'
    ]
  },
  firstMeeting: {
    id: 'firstMeeting',
    title: 'প্রথম সভা আহ্বান, কো-অপ সদস্য নির্বাচন ও কমিটি সক্রিয়করণ',
    category: 'ধাপ ১১: সক্রিয়করণ ও দায়িত্ব হস্তান্তর',
    regulatoryRef: 'প্রবিধানমালার ধারা ১৮ ও ২০ (দায়িত্বভার গ্রহণ ও প্রথম সভা)',
    summary: 'বোর্ড অনুমোদনের সর্বোচ্চ ৩০ দিনের মধ্যে নবগঠিত কমিটির প্রথম সভা আহ্বান করতে হবে। এই সভা থেকেই কমিটির আনুষ্ঠানিক মেয়াদকাল শুরু হবে।',
    keyPoints: [
      'প্রথম সভায় কো-অপ সদস্য (বিদ্যোৎসাহী/শিক্ষানুরাগী প্রতিনিধি) মনোনয়ন বা অনুমোদন করা হয়।',
      'পূর্ববর্তী কমিটির কাছ থেকে প্রতিষ্ঠানের তহবিল, স্থাবর-অস্থাবর সম্পত্তির তালিকা ও নথিপত্র আনুষ্ঠানিকভাবে হস্তান্তর করা হয়।',
      'সিস্টেমে "কমিটি Activate" করার মাধ্যমে পুরাতন কমিটি স্বয়ংক্রিয়ভাবে আর্কাইভে স্থানান্তরিত হবে।'
    ]
  },
  archive: {
    id: 'archive',
    title: 'পুরাতন কমিটির রেকর্ড ও রেজুলেশন সংরক্ষণ নীতিমালা',
    category: 'স্থায়ী রেকর্ড সংরক্ষণ',
    regulatoryRef: 'জাতীয় আর্কাইভ ও শিক্ষা বোর্ড পরিদর্শন নির্দেশিকা',
    summary: 'বিগত সকল কমিটির প্রজ্ঞাপন, রেজুলেশন খাতা ও আর্থিক হিসাব বিবরণী প্রতিষ্ঠানের স্থায়ী নথিপত্র হিসেবে আজীবন সংরক্ষণযোগ্য।',
    keyPoints: [
      'কোনো অতীত কমিটির রেজুলেশন বা নথি বিনষ্ট করা সরকারি আইন অনুযায়ী শাস্তিযোগ্য অপরাধ।',
      'অডিট বা আইনি বিরোধ নিষ্পত্তিতে পুরাতন কমিটির সই-স্বাক্ষরযুক্ত কপি প্রামাণ্য দলিল হিসেবে গণ্য হয়।',
      'সফটওয়্যারে সকল মেয়াদের কমিটি সংরক্ষিত থাকবে যাতে যেকোনো সময় পরিদর্শনকারী দল তা যাচাই করতে পারে।'
    ]
  }
};

interface CommitteePolicyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicKey?: string;
}

export const CommitteePolicyGuideModal: React.FC<CommitteePolicyGuideModalProps> = ({
  isOpen,
  onClose,
  topicKey = 'overview'
}) => {
  const [selectedKey, setSelectedKey] = React.useState<string>(topicKey);

  React.useEffect(() => {
    if (topicKey && COMMITTEE_POLICY_TOPICS[topicKey]) {
      setSelectedKey(topicKey);
    }
  }, [topicKey, isOpen]);

  if (!isOpen) return null;

  const currentTopic = COMMITTEE_POLICY_TOPICS[selectedKey] || COMMITTEE_POLICY_TOPICS.overview;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-5 bg-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/60 border border-emerald-500/40 flex items-center justify-center text-emerald-200 shadow-inner">
              <Scale className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-emerald-300 uppercase">
                  সরকারি প্রবিধানমালা ও বোর্ডের নির্দেশিকা
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 font-mono">
                  BISE Reg. 2009/2024
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                কমিটি ব্যবস্থাপনা ও গঠন নীতিমালা গাইড
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (TWO COLUMN: TOPIC SELECTOR & DETAILS) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          
          {/* SIDEBAR NAVIGATION TOPICS */}
          <div className="md:col-span-4 bg-slate-50/70 p-3 space-y-1.5 overflow-y-auto max-h-60 md:max-h-full">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block py-1">
              নীতিমালা বিষয়সূচি
            </span>

            {Object.values(COMMITTEE_POLICY_TOPICS).map((topic) => {
              const isActive = selectedKey === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedKey(topic.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <div className="truncate">
                    <span className={`block text-[10px] uppercase font-mono ${isActive ? 'text-emerald-200' : 'text-slate-400'}`}>
                      {topic.category}
                    </span>
                    <span className="truncate block mt-0.5">{topic.title}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-300' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>

          {/* MAIN CONTENT DISPLAY */}
          <div className="md:col-span-8 p-6 sm:p-7 space-y-5 overflow-y-auto">
            
            {/* Title & Badge */}
            <div className="space-y-1.5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {currentTopic.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  আইনি রেফারেন্স:
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {currentTopic.title}
              </h3>
              <p className="text-xs font-semibold text-emerald-800 bg-emerald-50/70 p-2 rounded-xl border border-emerald-200/60">
                {currentTopic.regulatoryRef}
              </p>
            </div>

            {/* Regulatory Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>সারসংক্ষেপ ও আইনি বাধ্যবাধকতা</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                {currentTopic.summary}
              </p>
            </div>

            {/* Key Mandatory Points */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>পালনীয় প্রধান বিধিসমূহ</span>
              </h4>
              <div className="space-y-2">
                {currentTopic.keyPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deadlines if available */}
            {currentTopic.deadlines && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-amber-900 uppercase block">
                    সময়সীমা ও বিধিবদ্ধ সময় ব্যবধান (Statutory Timeline)
                  </span>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    {currentTopic.deadlines}
                  </p>
                </div>
              </div>
            )}

            {/* Required Documents if available */}
            {currentTopic.requiredDocs && currentTopic.requiredDocs.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>প্রয়োজনীয় কাগজপত্র ও প্রমাণক</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentTopic.requiredDocs.map((doc, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span className="truncate">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-compliance risk / penalty */}
            {currentTopic.penaltiesOrRisks && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">আইনি ঝুঁকি ও অস্বীকৃতি:</strong>
                  <span className="leading-relaxed">{currentTopic.penaltiesOrRisks}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">
            শিক্ষা মন্ত্রণালয় ও মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর (মাউশি) নীতিমালা সমর্থিত
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            বুঝেছি, বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
