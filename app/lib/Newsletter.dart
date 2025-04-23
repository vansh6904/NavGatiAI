import 'package:flutter/material.dart';
import 'package:app/services/Api.dart';

class Newsletter extends StatefulWidget {
  @override
  _NewsletterState createState() => _NewsletterState();
}

class _NewsletterState extends State<Newsletter> {
  List<dynamic> news = [];
  bool isLoading = false;
  String? errorMessage;

  Future<void> fetchNews() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      // Call the API using the Api class
      final response = await Api.fetchNews();
      if (response['success'] == true) {
        setState(() {
          news = response['data'];
        });
      } else {
        setState(() {
          errorMessage = "Failed to fetch news data.";
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = "Network error - failed to fetch news.";
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Newsletter"),
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.pop(context); // Navigate back
          },
        ),
        actions: [
          IconButton(
            icon: ImageIcon(
              NetworkImage(
                'https://th.bing.com/th/id/R.372a29ffbe7cecc6e5fc4fb14cc46e5e?rik=zxx%2fRMgk%2felUgA&riu=http%3a%2f%2fclipart-library.com%2fnewhp%2fkissclipart-home-icon-for-resume-clipart-computer-icons-house-0fb2868759bb5fb1.png&ehk=64pA3gEDjAn0zElYM4aUd4qN5LLTl8wMki7%2fVjIygkE%3d&risl=&pid=ImgRaw&r=0',
              ),
            ),
            onPressed: () {
              Navigator.pushNamed(context, '/home'); // Navigate to Home
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            if (news.isEmpty && !isLoading)
              Center(
                child: ElevatedButton(
                  onPressed: fetchNews,
                  child: Text("Fetch Latest News"),
                ),
              ),
            if (isLoading)
              Center(
                child: Column(
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text("Loading financial updates..."),
                  ],
                ),
              ),
            if (errorMessage != null)
              Center(
                child: Text(errorMessage!, style: TextStyle(color: Colors.red)),
              ),
            if (news.isNotEmpty)
              Expanded(
                child: GridView.builder(
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                  ),
                  itemCount: news.length,
                  itemBuilder: (context, index) {
                    final item = news[index];
                    print("Image URL: ${item['image']}");
                    return Card(
                      elevation: 4,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Image.network(
                              "${item['image']}?cache_buster=${DateTime.now().millisecondsSinceEpoch}",
                              fit: BoxFit.cover,
                              width: double.infinity,
                              loadingBuilder: (
                                context,
                                child,
                                loadingProgress,
                              ) {
                                if (loadingProgress == null) {
                                  return child; // Image loaded successfully
                                }
                                return Center(
                                  child: CircularProgressIndicator(
                                    value:
                                        loadingProgress.expectedTotalBytes !=
                                                null
                                            ? loadingProgress
                                                    .cumulativeBytesLoaded /
                                                (loadingProgress
                                                        .expectedTotalBytes ??
                                                    1)
                                            : null,
                                  ),
                                );
                              },
                              errorBuilder: (context, error, stackTrace) {
                                return Icon(
                                  Icons.broken_image,
                                  size: 50,
                                  color: Colors.grey,
                                );
                              },
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text(
                              item['title'],
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8.0,
                            ),
                            child: Text(
                              item['summary'],
                              style: TextStyle(color: Colors.grey),
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  item['time'],
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey,
                                  ),
                                ),
                                InkWell(
                                  onTap: () {
                                    // Open the news link
                                    launchUrl(item['link']);
                                  },
                                  child: Text(
                                    "Read More",
                                    style: TextStyle(
                                      color: Colors.blue,
                                      decoration: TextDecoration.underline,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }

  void launchUrl(String url) {
    // Add functionality to open the URL in a browser
    // You can use the url_launcher package for this
  }
}
