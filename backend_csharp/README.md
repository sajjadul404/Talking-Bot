# Talking Bot - ASP.NET Core 8.0 C# Backend

এটি সম্পূর্ণ **C# (.NET 8.0)** দিয়ে নির্মিত Talking Bot এর অফিশিয়াল ব্যাকএন্ড সার্ভিস।

## বৈশিষ্ট্যসমূহ (Features)
- **ASP.NET Core Web API**: হাই-পারফরম্যান্স RESTful আর্কিটেকচার।
- **Google Gemini AI Integration**: `gemini-2.5-flash` এবং `gemini-3.6-flash` মডেল সমর্থন।
- **Multi-turn Context Memory**: পূর্ববর্তী চ্যাট হিস্ট্রি প্রসেস করে প্রাসঙ্গিক উত্তর প্রদান।
- **Swagger / OpenAPI Documentation**: সরাসরি ব্রাউজারে `/swagger` দিয়ে এপিআই টেস্ট করার সুবিধা।
- **CORS Enabled**: যেকোনো React/Vue/Angular ফ্রন্টএন্ড থেকে সরাসরি কানেক্টেবল।
- **Smart Offline Fallback**: এপিআই কি না থাকলেও চ্যাট চালু রাখার জন্য ইন্টেলিজেন্ট সি-শার্প রেসপন্ডার।
- **Production-Ready Dockerfile**: ক্লাউড রান, রেন্ডার বা ডকার সার্ভারে সরাসরি ডিপ্লয় উপযোগী।

---

## প্রোজেক্ট স্ট্রাকচার (Project Structure)
```
backend_csharp/
├── BackendCSharp.csproj       # .NET 8.0 প্রোজেক্ট কনফিগারেশন
├── Program.cs                 # অ্যাপ্লিকেশনের মেইন এন্ট্রি পয়েন্ট ও মিডলওয়্যার
├── Dockerfile                 # ডকার ও ক্লাউড রান ডিপ্লয়মেন্ট ফাইল
├── appsettings.json           # কনফিগারেশন সেটিংস
├── Controllers/
│   ├── ChatController.cs      # POST /api/chat - চ্যাট হ্যান্ডলার ও এক্সিট লজিক
│   └── HealthController.cs    # GET /api/health, GET /api/key-status
├── Models/
│   └── ChatModels.cs          # DTOs: ChatRequest, ChatResponse, HealthResponse
└── Services/
    ├── IGeminiService.cs      # জেমিনি এআই ইন্টারফেস
    ├── GeminiService.cs       # HttpClient দিয়ে Gemini REST API কল
    └── SmartResponderService.cs # সি-শার্প ইন্টেলিজেন্ট ফলব্যাক রেসপন্ডার
```

---

## যেভাবে রান করবেন (How to Run)

### ১. প্রি-রেকুইজিট (Prerequisites)
আপনার কম্পিউটারে [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) ইনস্টল থাকতে হবে।

### ২. ডিপেন্ডেন্সি রিস্টোর ও রান
টার্মিনাল ওপেন করে এই ফোল্ডারে যান:
```bash
cd backend_csharp
```

Gemini API Key সেট করুন (ঐচ্ছিক, না দিলেও স্মার্ট ফলব্যাক চলবে):
```bash
# Windows (PowerShell)
$env:GEMINI_API_KEY="your_api_key_here"

# Linux / macOS (Bash)
export GEMINI_API_KEY="your_api_key_here"
```

অ্যাপ্লিকেশনটি চালু করুন:
```bash
dotnet run
```

### ৩. টেস্ট ও সোয়েগার ডকুমেন্টেশন
সার্ভার চালু হলে ব্রাউজারে যান:
- **Swagger UI**: `http://localhost:5000/swagger`
- **Health Check**: `http://localhost:5000/api/health`

---

## ফ্রন্টএন্ড কানেক্ট করার নিয়ম
আপনার ফ্রন্টএন্ডের বেস URL হিসেবে `http://localhost:5000` অথবা আপনার হোস্ট করা ব্যাকএন্ড ডোমেইন ব্যবহার করলেই রিয়েল-টাইম C# ব্যাকএন্ডের সাথে চ্যাট চলবে!
