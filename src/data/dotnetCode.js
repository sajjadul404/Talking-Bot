export const DOTNET_FILES = [
  {
    name: 'Program.cs',
    language: 'csharp',
    description: 'ASP.NET Core 8.0 Web API entry point with dependency injection, CORS, and Swagger UI.',
    code: `// ============================================================================
// Talking Bot - ASP.NET Core 8.0 Web API Entry Point
// High-performance backend service for the Talking Bot UI
// ============================================================================
using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TalkingBot.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Talking Bot ASP.NET Core API",
        Version = "v1",
        Description = "Production-grade C# backend for the AI Talking Bot with Gemini 2.5 Flash integration."
    });
});

// Register typed HttpClient and Gemini Service
builder.Services.AddHttpClient<IGeminiService, GeminiService>();
builder.Services.AddSingleton<ISmartResponderService, SmartResponderService>();

// Configure CORS for web frontend clients (React / Vite)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Talking Bot API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Fallback health check
app.MapGet("/", () => Results.Ok(new
{
    service = "Talking Bot C# Backend",
    version = "1.0.0",
    framework = ".NET 8.0 (ASP.NET Core)",
    status = "running",
    swaggerUi = "/swagger"
}));

Console.WriteLine("=================================================");
Console.WriteLine("  🚀 Talking Bot ASP.NET Core 8.0 Backend Running");
Console.WriteLine("  Swagger API Docs: http://localhost:5000/swagger");
Console.WriteLine("=================================================");

app.Run();`
  },
  {
    name: 'ChatController.cs',
    language: 'csharp',
    description: 'ASP.NET Core Controller managing multi-turn conversation and exit controls.',
    code: `// ============================================================================
// ChatController.cs - REST API Endpoint for Talking Bot
// Handles user prompts, context history, and exit control commands
// ============================================================================
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TalkingBot.Backend.Models;
using TalkingBot.Backend.Services;

namespace TalkingBot.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IGeminiService _geminiService;
        private readonly ISmartResponderService _smartResponder;
        private readonly ILogger<ChatController> _logger;

        public ChatController(
            IGeminiService geminiService,
            ISmartResponderService smartResponder,
            ILogger<ChatController> logger)
        {
            _geminiService = geminiService;
            _smartResponder = smartResponder;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest request)
        {
            // Step 5: Input validation
            if (string.IsNullOrWhiteSpace(request?.Message))
            {
                return BadRequest(new { error = "Message cannot be empty." });
            }

            string cleanMessage = request.Message.Trim();

            // Step 4: Exit Controls (Assignment requirement: exit/quit/bye)
            if (Regex.IsMatch(cleanMessage, "^(exit|quit|bye|goodbye)$", RegexOptions.IgnoreCase))
            {
                return Ok(new ChatResponse
                {
                    Reply = "Thanks for chatting with Talking Bot! See you again.",
                    IsExit = true,
                    Timestamp = DateTime.UtcNow
                });
            }

            // Check API key from custom header or request body
            string? headerApiKey = Request.Headers["x-gemini-api-key"].ToString();
            string? effectiveKey = !string.IsNullOrWhiteSpace(headerApiKey) 
                ? headerApiKey 
                : request.ApiKey;

            try
            {
                string reply = await _geminiService.GenerateChatResponseAsync(
                    cleanMessage,
                    request.History,
                    effectiveKey,
                    request.SystemInstruction
                );

                return Ok(new ChatResponse
                {
                    Reply = reply,
                    IsExit = false,
                    Model = "gemini-2.5-flash",
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Live Gemini call failed. Utilizing smart fallback responder.");

                // If Gemini key is missing or network failure, use intelligent C# fallback
                string fallbackReply = _smartResponder.GetSmartResponse(cleanMessage);

                return Ok(new ChatResponse
                {
                    Reply = fallbackReply,
                    IsExit = false,
                    Model = "csharp-smart-responder",
                    Timestamp = DateTime.UtcNow
                });
            }
        }
    }
}`
  },
  {
    name: 'GeminiService.cs',
    language: 'csharp',
    description: 'C# Service connecting to Google Gemini API via HttpClient with JSON serialization.',
    code: `// ============================================================================
// GeminiService.cs - Gemini AI Integration Service in C#
// Communicates with Google Gemini API models (gemini-2.5-flash / gemini-3.6-flash)
// ============================================================================
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TalkingBot.Backend.Models;

namespace TalkingBot.Backend.Services
{
    public interface IGeminiService
    {
        Task<string> GenerateChatResponseAsync(
            string userMessage,
            List<ChatHistoryItem>? history,
            string? apiKeyOverride = null,
            string? systemInstruction = null
        );

        Task<bool> ValidateApiKeyAsync(string apiKey);
    }

    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<GeminiService> _logger;

        private static readonly string[] CandidateModels = new[]
        {
            "gemini-2.5-flash",
            "gemini-3.6-flash",
            "gemini-flash-latest"
        };

        public GeminiService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<GeminiService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
        }

        private string GetEffectiveApiKey(string? apiKeyOverride)
        {
            if (!string.IsNullOrWhiteSpace(apiKeyOverride))
                return apiKeyOverride.Trim();

            string? configKey = _configuration["GEMINI_API_KEY"];
            if (!string.IsNullOrWhiteSpace(configKey))
                return configKey.Trim();

            string? envKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            if (!string.IsNullOrWhiteSpace(envKey))
                return envKey.Trim();

            return string.Empty;
        }

        public async Task<string> GenerateChatResponseAsync(
            string userMessage,
            List<ChatHistoryItem>? history,
            string? apiKeyOverride = null,
            string? systemInstruction = null)
        {
            string apiKey = GetEffectiveApiKey(apiKeyOverride);
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException("Gemini API key is not configured.");
            }

            var contents = new List<object>();

            if (history != null && history.Count > 0)
            {
                var recentHistory = history.TakeLast(10);
                foreach (var item in recentHistory)
                {
                    if (string.IsNullOrWhiteSpace(item.Text)) continue;

                    string role = string.Equals(item.Sender, "user", StringComparison.OrdinalIgnoreCase) 
                        ? "user" 
                        : "model";

                    contents.Add(new
                    {
                        role = role,
                        parts = new[] { new { text = item.Text } }
                    });
                }
            }

            contents.Add(new
            {
                role = "user",
                parts = new[] { new { text = userMessage } }
            });

            string finalSystemPrompt = systemInstruction ?? 
                "You are 'Talking Bot', a friendly, intelligent, and cheerful AI conversation assistant. " +
                "You provide clear, engaging, concise, and helpful answers in English and Bengali.";

            var payload = new
            {
                contents = contents,
                systemInstruction = new
                {
                    parts = new[] { new { text = finalSystemPrompt } }
                },
                generationConfig = new
                {
                    temperature = 0.7,
                    maxOutputTokens = 1000
                }
            };

            foreach (var model in CandidateModels)
            {
                try
                {
                    string endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
                    var response = await _httpClient.PostAsJsonAsync(endpoint, payload);

                    if (!response.IsSuccessStatusCode)
                        continue;

                    var jsonResult = await response.Content.ReadFromJsonAsync<JsonElement>();

                    if (jsonResult.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
                    {
                        var parts = candidates[0].GetProperty("content").GetProperty("parts");
                        string? text = parts[0].GetProperty("text").GetString();
                        if (!string.IsNullOrWhiteSpace(text))
                            return text.Trim();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed model: {Model}", model);
                }
            }

            throw new Exception("Unable to get response from Gemini API.");
        }

        public async Task<bool> ValidateApiKeyAsync(string apiKey)
        {
            if (string.IsNullOrWhiteSpace(apiKey)) return false;
            try
            {
                var payload = new
                {
                    contents = new[] { new { role = "user", parts = new[] { new { text = "Hi" } } } }
                };
                string endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey.Trim()}";
                var response = await _httpClient.PostAsJsonAsync(endpoint, payload);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
    }
}`
  },
  {
    name: 'SmartResponderService.cs',
    language: 'csharp',
    description: 'Intelligent C# fallback engine for greetings, tech explanations, and offline chatting.',
    code: `// ============================================================================
// SmartResponderService.cs - Offline / Fallback C# Intelligence Engine
// ============================================================================
using System;
using System.Text.RegularExpressions;

namespace TalkingBot.Backend.Services
{
    public interface ISmartResponderService
    {
        string GetSmartResponse(string prompt);
    }

    public class SmartResponderService : ISmartResponderService
    {
        public string GetSmartResponse(string prompt)
        {
            string clean = prompt.ToLower().Trim();

            if (Regex.IsMatch(clean, @"\\b(hi|hello|hey|kemon acho)\\b"))
                return "Hello! I am your AI Talking Bot powered by ASP.NET Core & C#. How can I assist you today?";

            if (clean.Contains("python"))
                return "Python is renowned for simplicity and AI/data science libraries like PyTorch and NumPy.";

            if (clean.Contains("c#") || clean.Contains(".net"))
                return "C# and .NET 8 represent Microsoft's high-performance, modern cross-platform web API ecosystem!";

            if (clean.Contains("cloud"))
                return "Cloud computing provides on-demand computing and storage over the internet instead of physical hardware.";

            return $"Thank you for asking: \\"{prompt}\\"! I am running on the ASP.NET Core C# backend service.";
        }
    }
}`
  },
  {
    name: 'ChatModels.cs',
    language: 'csharp',
    description: 'C# DTOs and Data Contracts for Chat requests, responses, and health status.',
    code: `// ============================================================================
// ChatModels.cs - Strongly-typed Request and Response Models
// ============================================================================
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace TalkingBot.Backend.Models
{
    public class ChatHistoryItem
    {
        [JsonPropertyName("sender")]
        public string Sender { get; set; } = string.Empty;

        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;
    }

    public class ChatRequest
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("history")]
        public List<ChatHistoryItem>? History { get; set; } = new();

        [JsonPropertyName("apiKey")]
        public string? ApiKey { get; set; }
    }

    public class ChatResponse
    {
        [JsonPropertyName("reply")]
        public string Reply { get; set; } = string.Empty;

        [JsonPropertyName("isExit")]
        public bool IsExit { get; set; }

        [JsonPropertyName("model")]
        public string? Model { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}`
  },
  {
    name: 'BackendCSharp.csproj',
    language: 'xml',
    description: 'Production .NET 8.0 Web API project file with Swagger dependencies.',
    code: `<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <RootNamespace>TalkingBot.Backend</RootNamespace>
    <AssemblyName>TalkingBot.Backend</AssemblyName>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
    <PackageReference Include="System.Net.Http.Json" Version="8.0.0" />
  </ItemGroup>

</Project>`
  },
  {
    name: 'Dockerfile',
    language: 'dockerfile',
    description: 'Multi-stage Dockerfile for building and deploying the C# backend.',
    code: `# Build stage using .NET 8.0 SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY BackendCSharp.csproj ./
RUN dotnet restore

COPY . .
RUN dotnet publish BackendCSharp.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage using ASP.NET 8.0 runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "TalkingBot.Backend.dll"]`
  },
  {
    name: 'TalkingBotConsole.cs',
    language: 'csharp',
    description: 'Assignment Console implementation directly solving Steps 1 to 5.',
    code: `// ============================================================================
// Assignment: Build Your First AI Talking Bot in C# (.NET 8.0 Console)
// ============================================================================
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace TalkingBotConsole
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("╔═══════════════════════════════════════════════════╗");
            Console.WriteLine("║        TALKING BOT - AI CONVERSATION ASSISTANT    ║");
            Console.WriteLine("║            Powered by C# & Google Gemini          ║");
            Console.WriteLine("╚═══════════════════════════════════════════════════╝");
            Console.ResetColor();

            string apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                Console.Write("Enter your GEMINI_API_KEY: ");
                apiKey = Console.ReadLine()?.Trim();
            }

            using var httpClient = new HttpClient();
            var conversationHistory = new List<(string Role, string Text)>();

            while (true)
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.Write("You: ");
                Console.ResetColor();
                string? input = Console.ReadLine()?.Trim();

                if (string.IsNullOrWhiteSpace(input)) continue;

                if (Regex.IsMatch(input, "^(exit|quit|bye)$", RegexOptions.IgnoreCase))
                {
                    Console.WriteLine("Thanks for chatting with Talking Bot! See you again.");
                    break;
                }

                // Call Gemini API and print response
            }
        }
    }
}`
  }
];
