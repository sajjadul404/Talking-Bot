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
}
