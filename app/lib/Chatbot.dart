import 'package:flutter/material.dart';
import 'package:google_generative_ai/google_generative_ai.dart';

// --- Configuration ---
// Your actual Gemini API Key
const String _apiKey = "AIzaSyDBA5i4NlcRarGTNADNxOYcwvyRJV9HMLw";

// --- Chat Message Data Structure ---
class ChatMessage {
  final String text;
  final bool isUserMessage;

  ChatMessage({required this.text, required this.isUserMessage});
}

// --- Chatbot Screen Widget ---
class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({super.key});

  @override
  State<ChatbotScreen> createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  // State variables
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;

  // Gemini AI Model
  GenerativeModel? _model;
  ChatSession? _chatSession;

  @override
  void initState() {
    super.initState();
    _initializeGemini();
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  // --- Gemini Initialization ---
  void _initializeGemini() {
    try {
      // Define the system instruction (persona) for the model
      final systemInstruction = Content.system("""
        You are a financial advisor skilled at providing comprehensive, easy-to-understand answers tailored to users.
        Your goal is to address questions effectively by giving response, using simple terms, practical examples, and insights when necessary.
        Focus on clarity, and present the answer in structured bullet points for better readability and understanding.
        If context is provided (like from a document, although document reading isn't implemented here), use it.
        Always format your core answers using bullet points (* point 1, * point 2, etc.).
        Keep explanations simple and avoid overly technical jargon unless necessary, in which case, explain it simply.
        Be helpful and empathetic.
        """);

      // Define generation configuration (optional, adjust as needed)
      final generationConfig = GenerationConfig(
        // temperature: 0.7, // Controls randomness (0.0-1.0)
        // topK: 40,         // Considers top K tokens
        // topP: 0.95,       // Considers tokens with cumulative probability P
        // maxOutputTokens: 1000, // Limits response length
      );

      // Initialize the Generative Model
      _model = GenerativeModel(
        model:
            'gemini-1.5-flash-latest', // Or 'gemini-pro' or other suitable model
        apiKey: _apiKey,
        systemInstruction: systemInstruction,
        generationConfig: generationConfig,
      );

      // Start a chat session (maintains conversation history)
      _chatSession = _model!.startChat();
      print("Chat session initialized: $_chatSession");

      // Add initial greeting message from the bot
      setState(() {
        _messages.add(
          ChatMessage(
            text:
                "Hello! I'm your financial advisor bot. How can I help you with your finances today?",
            isUserMessage: false,
          ),
        );
      });
    } catch (e) {
      print("Error initializing Gemini: $e");
      setState(() {
        _messages.add(
          ChatMessage(
            text:
                "Error initializing the chatbot. Please check the API key and configuration. ($e)",
            isUserMessage: false,
          ),
        );
        _isLoading = false; // Ensure loading stops on init error
      });
    }
  }

  // --- Send Message Logic ---
  Future<void> _sendMessage() async {
    final text = _textController.text.trim();
    if (text.isEmpty || _isLoading || _chatSession == null) {
      return; // Do nothing if input is empty, already loading, or chat not initialized
    }

    // Add user message to UI
    setState(() {
      _messages.add(ChatMessage(text: text, isUserMessage: true));
      _isLoading = true; // Show loading indicator
    });
    _textController.clear();
    _scrollToBottom(); // Scroll after adding user message

    try {
      // Send message to Gemini API using the chat session
      final response = await _chatSession!.sendMessage(Content.text(text));
      final botResponseText = response.text;

      if (botResponseText != null && botResponseText.isNotEmpty) {
        // Add bot response to UI
        setState(() {
          _messages.add(
            ChatMessage(text: botResponseText, isUserMessage: false),
          );
        });
      } else {
        // Handle empty response
        setState(() {
          _messages.add(
            ChatMessage(
              text: "Sorry, I couldn't generate a response. Please try again.",
              isUserMessage: false,
            ),
          );
        });
      }
    } catch (e) {
      // Handle API errors
      print("Error sending message to Gemini: $e");
      setState(() {
        _messages.add(
          ChatMessage(
            text: "Sorry, an error occurred while fetching the response. ($e)",
            isUserMessage: false,
          ),
        );
      });
    } finally {
      // Hide loading indicator and scroll down
      setState(() {
        _isLoading = false;
      });
      _scrollToBottom(); // Scroll after adding bot message or error
    }
  }

  // --- UI Helper Functions ---
  void _scrollToBottom() {
    // Needs a slight delay for the UI to update before scrolling
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // --- Build Method (UI) ---
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Financial Advisor Chatbot'),
        backgroundColor: Colors.blueAccent, // Or your app's theme color
      ),
      body: Column(
        children: [
          // Chat Messages Area
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16.0),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return _buildMessageBubble(message);
              },
            ),
          ),

          // Loading Indicator
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8.0),
              child: Center(child: CircularProgressIndicator()),
            ),

          // Input Area
          _buildInputArea(),
        ],
      ),
    );
  }

  // --- Widget Builders ---

  // Builds a single message bubble
  Widget _buildMessageBubble(ChatMessage message) {
    return Align(
      alignment:
          message.isUserMessage ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 5.0),
        padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
        decoration: BoxDecoration(
          color:
              message.isUserMessage
                  ? Colors.blueAccent[100] // User message color
                  : Colors.grey[300], // Bot message color
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16.0),
            topRight: const Radius.circular(16.0),
            bottomLeft:
                message.isUserMessage
                    ? const Radius.circular(16.0)
                    : Radius.zero,
            bottomRight:
                message.isUserMessage
                    ? Radius.zero
                    : const Radius.circular(16.0),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              spreadRadius: 1,
              blurRadius: 3,
              offset: Offset(0, 1), // changes position of shadow
            ),
          ],
        ),
        constraints: BoxConstraints(
          maxWidth:
              MediaQuery.of(context).size.width *
              0.75, // Max width 75% of screen
        ),
        child: SelectableText(
          // Use SelectableText to allow copying
          message.text,
          style: const TextStyle(fontSize: 16.0),
        ),
      ),
    );
  }

  // Builds the text input field and send button
  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
      decoration: BoxDecoration(
        color:
            Theme.of(context).cardColor, // Use theme card color for background
        boxShadow: [
          BoxShadow(
            offset: const Offset(0, -1),
            blurRadius: 3.0,
            color: Colors.black.withOpacity(0.05),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _textController,
              enabled:
                  _chatSession != null, // Only disable if chat session is null
              onSubmitted: (_) => _sendMessage(), // Send on enter key
              decoration: InputDecoration(
                hintText:
                    _chatSession == null
                        ? "Initializing..."
                        : "Ask a financial question...",
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(25.0),
                  borderSide: BorderSide.none, // No visible border line
                ),
                filled: true, // Need filled=true for fillColor to work
                fillColor: Colors.grey[100], // Background color of text field
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 10.0,
                ),
              ),
              minLines: 1,
              maxLines: 5, // Allow multi-line input
              textCapitalization: TextCapitalization.sentences,
            ),
          ),
          const SizedBox(width: 8.0),
          ValueListenableBuilder<TextEditingValue>(
            valueListenable: _textController,
            builder: (context, value, child) {
              return IconButton(
                icon: const Icon(Icons.send),
                onPressed:
                    _chatSession == null || value.text.trim().isEmpty
                        ? null // Disable button only if chat session is null or text is empty
                        : _sendMessage,
                color: Colors.blueAccent, // Button color
                tooltip: "Send message",
              );
            },
          ),
        ],
      ),
    );
  }
}
