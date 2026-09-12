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
        Description = "Production-grade C# backend for the AI Talking Bot with Gemini 2.5 Flash & 3.6 Flash integration."
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

app.Run();
