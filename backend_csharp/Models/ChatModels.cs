using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace TalkingBot.Backend.Models
{
    public class ChatHistoryItem
    {
        [JsonPropertyName("sender")]
        public string Sender { get; set; } = string.Empty; // "user" or "bot"

        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;

        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("timestamp")]
        public string? Timestamp { get; set; }
    }

    public class ChatRequest
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("history")]
        public List<ChatHistoryItem>? History { get; set; } = new();

        [JsonPropertyName("systemInstruction")]
        public string? SystemInstruction { get; set; }

        [JsonPropertyName("apiKey")]
        public string? ApiKey { get; set; }

        [JsonPropertyName("userEmail")]
        public string? UserEmail { get; set; }
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

    public class SetApiKeyRequest
    {
        [JsonPropertyName("apiKey")]
        public string ApiKey { get; set; } = string.Empty;
    }

    public class KeyStatusResponse
    {
        [JsonPropertyName("configured")]
        public bool Configured { get; set; }

        [JsonPropertyName("maskedKey")]
        public string MaskedKey { get; set; } = string.Empty;
    }

    public class HealthResponse
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = "ok";

        [JsonPropertyName("aiOnline")]
        public bool AiOnline { get; set; } = true;

        [JsonPropertyName("framework")]
        public string Framework { get; set; } = ".NET 8.0 (ASP.NET Core)";

        [JsonPropertyName("apiKeyConfigured")]
        public bool ApiKeyConfigured { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
