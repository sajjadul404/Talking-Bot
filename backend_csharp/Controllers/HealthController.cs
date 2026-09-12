using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using TalkingBot.Backend.Models;
using TalkingBot.Backend.Services;

namespace TalkingBot.Backend.Controllers
{
    [ApiController]
    [Route("api")]
    public class HealthController : ControllerBase
    {
        private readonly IGeminiService _geminiService;
        private readonly IConfiguration _configuration;

        public HealthController(IGeminiService geminiService, IConfiguration configuration)
        {
            _geminiService = geminiService;
            _configuration = configuration;
        }

        [HttpGet("health")]
        public IActionResult GetHealth()
        {
            string? key = _configuration["GEMINI_API_KEY"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            string? headerKey = Request.Headers["x-gemini-api-key"].ToString();
            bool hasKey = !string.IsNullOrWhiteSpace(headerKey) || !string.IsNullOrWhiteSpace(key);

            return Ok(new HealthResponse
            {
                Status = "ok",
                AiOnline = true,
                Framework = ".NET 8.0 (ASP.NET Core Web API)",
                ApiKeyConfigured = hasKey,
                Timestamp = DateTime.UtcNow
            });
        }

        [HttpGet("key-status")]
        public IActionResult GetKeyStatus()
        {
            string? key = _configuration["GEMINI_API_KEY"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            string? headerKey = Request.Headers["x-gemini-api-key"].ToString();
            string effective = !string.IsNullOrWhiteSpace(headerKey) ? headerKey : (key ?? string.Empty);
            bool hasKey = !string.IsNullOrWhiteSpace(effective);

            string masked = "";
            if (hasKey && effective.Length >= 8)
            {
                masked = $"{effective.Substring(0, 4)}...{effective.Substring(effective.Length - 4)}";
            }
            else if (hasKey)
            {
                masked = "configured";
            }

            return Ok(new KeyStatusResponse
            {
                Configured = hasKey,
                MaskedKey = masked
            });
        }

        [HttpPost("set-api-key")]
        public async Task<IActionResult> SetApiKey([FromBody] SetApiKeyRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.ApiKey))
            {
                return BadRequest(new { error = "API key cannot be empty." });
            }

            string cleanKey = request.ApiKey.Trim();

            // Validate key against Gemini API
            bool isValid = await _geminiService.ValidateApiKeyAsync(cleanKey);
            if (!isValid)
            {
                return BadRequest(new { error = "Invalid Gemini API key or unable to reach Google GenAI servers." });
            }

            // In runtime, save to environment variable
            Environment.SetEnvironmentVariable("GEMINI_API_KEY", cleanKey);

            return Ok(new
            {
                success = true,
                message = "Gemini API key verified and configured successfully in .NET backend!"
            });
        }
    }
}
