import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:app/Newsletter.dart';
import 'package:app/Microfinance.dart';
import 'package:app/Chatbot.dart';
import 'package:app/Dashboard.dart';

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String firstname = "Guest";
  String lastname = "User";
  String username = "Guest";
  String accessToken = "Guest";
  String userId = "Guest";

  @override
  void initState() {
    super.initState();
    _loadUsername(); // Load the username when the page initializes
  }

  Future<void> _loadUsername() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      username =
          prefs.getString('accessToken') != null
              ? prefs.getString('username') ?? "Guest"
              : "Guest";
      accessToken = prefs.getString('accessToken') ?? "Guest";
      userId = prefs.getString('userId') ?? "Guest";
    });
    print("Username from SharedPreferences: $username");
    print("AccessToken from SharedPreferences: $accessToken");
    print("UserId from SharedPreferences: $userId");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Home"),
        actions: [
          IconButton(
            icon: ImageIcon(
              NetworkImage(
                'https://th.bing.com/th/id/R.372a29ffbe7cecc6e5fc4fb14cc46e5e?rik=zxx%2fRMgk%2felUgA&riu=http%3a%2f%2fclipart-library.com%2fnewhp%2fkissclipart-home-icon-for-resume-clipart-computer-icons-house-0fb2868759bb5fb1.png&ehk=64pA3gEDjAn0zElYM4aUd4qN5LLTl8wMki7%2fVjIygkE%3d&risl=&pid=ImgRaw&r=0',
              ),
            ),
            onPressed: () {
              // Add functionality for the home icon if needed
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Hero Section
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundImage: NetworkImage(
                      'https://ui-avatars.com/api/?name=$username&color=007bff&background=e0e0e0',
                    ),
                  ),
                  SizedBox(height: 16),
                  Text(
                    "Welcome back, $username!",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.teal,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    '"A woman with a voice is, by definition, a strong woman."',
                    style: TextStyle(
                      fontStyle: FontStyle.italic,
                      color: Colors.grey[600],
                    ),
                    textAlign: TextAlign.center,
                  ),
                  Text(
                    "- Melinda Gates",
                    style: TextStyle(color: Colors.grey[500]),
                  ),
                ],
              ),
            ),
            // Cards Section
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Explore Features",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.teal,
                    ),
                  ),
                  SizedBox(height: 8),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                    children: [
                      _buildFeatureCard(
                        title: "Chatbot",
                        icon: Icons.chat,
                        color: Colors.blue,
                        onTap: () {
                          // Navigate to Chatbot
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ChatbotScreen(),
                            ),
                          );
                        },
                      ),
                      _buildFeatureCard(
                        title: "Dashboard",
                        icon: Icons.dashboard,
                        color: Colors.green,
                        onTap: () {
                          // Navigate to Dashboard
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => Dashboard(),
                            ),
                          );
                        },
                      ),
                      _buildFeatureCard(
                        title: "Microfinance",
                        icon: Icons.account_balance_wallet,
                        color: Colors.orange,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => Microfinance(),
                            ),
                          );
                        },
                      ),
                      _buildFeatureCard(
                        title: "Newsletter",
                        icon: Icons.email,
                        color: Colors.purple,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => Newsletter(),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureCard({
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        elevation: 4,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircleAvatar(
                backgroundColor: color.withOpacity(0.2),
                child: Icon(icon, color: color),
              ),
              SizedBox(height: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
