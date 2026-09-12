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
            {
                return apiKeyOverride.Trim();
            }

            string? configKey = _configuration["GEMINI_API_KEY"];
            if (!string.IsNullOrWhiteSpace(configKey))
            {
                return configKey.Trim();
            }

            string? envKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            if (!string.IsNullOrWhiteSpace(envKey))
            {
                return envKey.Trim();
            }

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
                throw new InvalidOperationException("Gemini API key is not configured. Please provide an API key.");
            }

            var contents = new List<object>();

            // Convert chat history to Gemini payload format
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

            // Append current prompt
            contents.Add(new
            {
                role = "user",
                parts = new[] { new { text = userMessage } }
            });

            string finalSystemPrompt = systemInstruction ?? 
                "You are 'Talking Bot', a friendly, intelligent, and cheerful AI conversation assistant. " +
                "You provide clear, engaging, concise, and helpful answers in English and Bengali. " +
                "Teach programming, solve questions politely, and maintain an encouraging, positive attitude.";

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

            Exception? lastError = null;

            // Try candidate models in order
            foreach (var model in CandidateModels)
            {
                try
                {
                    string endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
                    var response = await _httpClient.PostAsJsonAsync(endpoint, payload);

                    if (!response.IsSuccessStatusCode)
                    {
                        string errBody = await response.Content.ReadAsStringAsync();
                        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                        {
                            // Model not found or deprecated, try next model candidate
                            continue;
                        }
                        throw new HttpRequestException($"Gemini API error ({response.StatusCode}): {errBody}");
                    }

                    var jsonResult = await response.Content.ReadFromJsonAsync<JsonElement>();

                    if (jsonResult.TryGetProperty("candidates", out var candidates) && 
                        candidates.GetArrayLength() > 0)
                    {
                        var firstCandidate = candidates[0];
                        if (firstCandidate.TryGetProperty("content", out var content) &&
                            content.TryGetProperty("parts", out var parts) &&
                            parts.GetArrayLength() > 0)
                        {
                            string? text = parts[0].GetProperty("text").GetString();
                            if (!string.IsNullOrWhiteSpace(text))
                            {
                                return text.Trim();
                            }
                        }
                    }

                    return "I received your message and am ready to continue chatting!";
                }
                catch (Exception ex)
                {
                    lastError = ex;
                    _logger.LogWarning(ex, "Failed to generate content using model {Model}", model);
                }
            }

            throw lastError ?? new Exception("Failed to receive response from Gemini API.");
        }

        public async Task<bool> ValidateApiKeyAsync(string apiKey)
        {
            if (string.IsNullOrWhiteSpace(apiKey)) return false;

            try
            {
                var payload = new
                {
                    contents = new[]
                    {
                        new { role = "user", parts = new[] { new { text = "Hello" } } }
                    },
                    generationConfig = new { maxOutputTokens = 5 }
                };

                string endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey.Trim()}";
                var response = await _httpClient.PostAsJsonAsync(endpoint, payload);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "API key validation error");
                return false;
            }
        }
    }
}
