import os
import sys

# Step 1 & 2: Setup and Gemini SDK Client Integration
# targeting the gemini-3.6-flash model
try:
    from google import genai
except ImportError:
    print("\n[Error] 'google-genai' SDK is not installed.")
    print("Please install it using: pip install google-genai\n")
    sys.exit(1)


def main():
    print("=" * 60)
    print("            🤖 Welcome to AI Talking Bot! 🤖")
    print("      Type 'exit' or 'quit' anytime to end the chat.")
    print("=" * 60)

    # Step 2: Retrieve API Key securely from environment variable
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("\n[Warning] GEMINI_API_KEY environment variable is not set.")
        print("Please set your API key:")
        print("  export GEMINI_API_KEY=\"your_api_key_here\"\n")
        # Allow user to input key interactively if not set
        api_key = input("Or enter your Gemini API Key now: ").strip()
        if not api_key:
            print("API Key required. Exiting...")
            sys.exit(1)

    try:
        # Initialize the client (Step 2)
        client = genai.Client(api_key=api_key)

        # Step 3: Create a multi-turn chat session targeting gemini-3.6-flash
        chat = client.chats.create(model="gemini-3.6-flash")
        print("\nConnected to Gemini (gemini-3.6-flash)! Let's start chatting.\n")

    except Exception as e:
        print(f"\n[Initialization Error]: {e}")
        print("Please check your API key and network connection.")
        sys.exit(1)

    # Step 3: Active loop to continuously read terminal input from the user
    while True:
        try:
            # Read input from user
            user_input = input("\nYou: ").strip()

            # Step 5: Handle blank inputs without crashing
            if not user_input:
                print("Bot: Please type something to chat!")
                continue

            # Step 4: Clean exit controls when user types 'exit' or 'quit'
            if user_input.lower() in ["exit", "quit"]:
                print("\nBot: Thanks for chatting with Talking Bot! See you again.\n")
                break

            # Step 3: Send message to the multi-turn session and print response
            response = chat.send_message(user_input)
            print(f"\nBot: {response.text}")

        # Step 5: Error handling (try-except) for network glitches or unexpected errors
        except KeyboardInterrupt:
            print("\n\nBot: Thanks for chatting with Talking Bot! See you again.\n")
            break
        except Exception as err:
            print(f"\nBot [Notice]: Network glitch or service issue ({err}).")
            print("Don't worry! Let's try again. What were you saying?")


if __name__ == "__main__":
    main()
