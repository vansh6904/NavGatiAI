import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:navgati_ai_enterpreneur/services/Api.dart';
import 'firebase_options.dart';
import 'package:url_launcher/url_launcher.dart';

// void main() async {
//   WidgetsFlutterBinding.ensureInitialized();
//   await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
//   runApp(const MyApp());

// }
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const RootApp()); // <-- Launch RootApp instead of MyApp
}

class RootApp extends StatelessWidget {
  const RootApp({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const MaterialApp(
            home: Scaffold(body: Center(child: CircularProgressIndicator())),
          );
        }

        // If user is logged in
        if (snapshot.hasData) {
          return MyApp(loggedIn: true, email: snapshot.data!.email ?? '');
        }

        // Not logged in
        return const MyApp(loggedIn: false);
      },
    );
  }
}

class MyApp extends StatelessWidget {
  final bool loggedIn;
  final String email;

  const MyApp({super.key, required this.loggedIn, this.email = ''});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NavGatiAI - Investor',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: loggedIn ? HomePage(email: email) : const LoginPage(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  // final String investorEmail = 'nice';
  // final String investorPassword = 'password123';

  String? _error;

  void _login() async {
    try {
      final credential = await FirebaseAuth.instance.signInWithEmailAndPassword(
        // username: _usernameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );

      // Check if the user is banned
      final userDoc =
          await FirebaseFirestore.instance
              .collection('investors')
              .doc(credential.user!.uid)
              .get();
      if (userDoc.exists && userDoc.data()?['banned'] == true) {
        print("user is banned");
        setState(() {
          _error = 'Your account has been banned. Please contact support.';
        });
        await FirebaseAuth.instance.signOut(); // Log out the user
        return;
      }
      if (userDoc.exists && userDoc.data()?['verified'] == false) {
        print("user is not verified");
        setState(() {
          _error =
              'Your account has not been verified. Please contact support.';
        });
        await FirebaseAuth.instance.signOut(); // Log out the user
        return;
      }
      // if (userDoc.exists &&
      //     userDoc.data()?['banned'] == true &&
      //     userDoc.data()?['verified'] == false) {
      //   print("user nor verified or is banned");
      //   setState(() {
      //     _error =
      //         'Your account has either been banned or not verified. Please contact support.'; //aaishvarya
      //   });
      //   await FirebaseAuth.instance.signOut(); // Log out the user
      //   return;
      // }
      var data = {
        'username': _usernameController.text.trim(),
        'password': _passwordController.text.trim(),
      };
      Api.loginUser(data); // Call your API to log in the user

      // Success! Navigate to home
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => HomePage(email: _emailController.text.trim()),
        ),
      );
    } on FirebaseAuthException catch (e) {
      setState(() {
        _error = e.message ?? 'Login failed';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Investor Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _usernameController,
              decoration: const InputDecoration(labelText: 'Username'),
            ),
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _login, child: const Text('Login')),
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const RegisterPage()),
                );
              },
              child: const Text("Don't have an account? Register here"),
            ),
            if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red)),
          ],
        ),
      ),
    );
  }
}

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  String? _error;

  void _register() async {
    try {
      final credential = await FirebaseAuth.instance
          .createUserWithEmailAndPassword(
            email: _emailController.text.trim(),
            password: _passwordController.text.trim(),
          );

      // Add additional investor info to Firestore
      await FirebaseFirestore.instance
          .collection('investors')
          .doc(credential.user!.uid)
          .set({
            'userName': _usernameController.text.trim(),
            'fullName': _nameController.text.trim(),
            'email': _emailController.text.trim(),
            'phone': _phoneController.text.trim(),
            'userId': credential.user!.uid,
            'verified': false,
            'banned': false,
          });
      var data = {
        'username': _usernameController.text.trim(),
        'fullname': _nameController.text.trim(),
        'password': _passwordController.text.trim(),
        'email': _emailController.text.trim(),
        'phoneNumber': _phoneController.text.trim(),
        'usertype': 'investor',
      };
      Api.addPerson(data); // Call your API to add the person

      // Navigate to login or directly to home
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => LoginPage()),
      );
    } on FirebaseAuthException catch (e) {
      setState(() {
        _error = e.message ?? 'Registration failed';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Investor Register')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Full Name'),
            ),
            TextField(
              controller: _usernameController,
              decoration: const InputDecoration(labelText: 'User Name'),
            ),
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(labelText: 'Phone Number'),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _register, child: const Text('Register')),
            if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red)),
          ],
        ),
      ),
    );
  }
}

class HomePage extends StatefulWidget {
  final String email;
  const HomePage({super.key, required this.email});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;

  final List<Widget> _tabs = [];

  @override
  void initState() {
    super.initState();
    _tabs.addAll([InvestTab(email: widget.email), const CommunitiesTab()]);
  }

  void _onTabTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Home"),
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () async {
              await FirebaseAuth.instance.signOut();
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const LoginPage()),
              );
            },
          ),
        ],
      ),
      body: _tabs[_selectedIndex],
    );
  }
}

class InvestTab extends StatelessWidget {
  final String email;
  const InvestTab({super.key, required this.email});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Invest in Businesses')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Card(
              child: ListTile(
                title: const Text('View Businesses'),
                subtitle: const Text('Explore uploaded business ideas'),
                trailing: const Icon(Icons.arrow_forward),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ViewBusinessesPage(),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 10),
            Card(
              child: ListTile(
                title: const Text('Your Investments'),
                subtitle: const Text('View your investment history'),
                trailing: const Icon(Icons.arrow_forward),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => YourInvestmentsPage(email: email),
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
}

class ViewBusinessesPage extends StatelessWidget {
  const ViewBusinessesPage({super.key});

  // Fetch applications from the backend
  Future<List<dynamic>> fetchApplications() async {
    return await Api.getAllApplications();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Businesses looking for your support')),
      body: FutureBuilder<List<dynamic>>(
        future: fetchApplications(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return const Center(child: Text('Error loading businesses'));
          }
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final applications = snapshot.data ?? [];

          if (applications.isEmpty) {
            return const Center(child: Text('No businesses found'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: applications.length,
            itemBuilder: (context, index) {
              final data = applications[index];
              final title = data['businessName'] ?? 'No name specified';
              final purpose = data['fundingPurpose'] ?? 'No purpose specified';
              final owner = data['applicant']?['username'] ?? 'Unknown Founder';

              return Card(
                elevation: 4,
                margin: const EdgeInsets.only(bottom: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => BusinessDetailsPage(data: data),
                      ),
                    );
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.business,
                              color: Color(0xFF00ACC1),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                title,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black87,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          purpose,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.black54,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Founder: $owner',
                              style: const TextStyle(
                                fontStyle: FontStyle.italic,
                                fontSize: 13,
                                color: Colors.grey,
                              ),
                            ),
                            const Icon(
                              Icons.arrow_forward_ios,
                              size: 16,
                              color: Colors.grey,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class YourInvestmentsPage extends StatelessWidget {
  final String email;
  const YourInvestmentsPage({super.key, required this.email});

  Future<List<Map<String, dynamic>>> fetchInvestedBusinesses() async {
    // Step 1: Get investor's investedCompanies from Firestore
    final querySnapshot =
        await FirebaseFirestore.instance
            .collection('investors')
            .where('email', isEqualTo: email)
            .get();

    if (querySnapshot.docs.isEmpty) return [];

    final investorData =
        querySnapshot.docs.first.data() as Map<String, dynamic>;
    final List<dynamic> investedCompanies =
        investorData['investedCompanies'] ?? [];

    // Step 2: Fetch all businesses from MongoDB
    final allBusinesses = await Api.getAllApplications();

    // Step 3: Filter businesses where businessName matches investedCompanies
    final investedBusinesses =
        allBusinesses.where((business) {
          return investedCompanies.contains(business['businessName']);
        }).toList();

    return List<Map<String, dynamic>>.from(investedBusinesses);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Your Investments')),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: fetchInvestedBusinesses(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return const Center(child: Text('Error loading investments'));
          }
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final businesses = snapshot.data ?? [];

          if (businesses.isEmpty) {
            return const Center(child: Text('No investments found'));
          }

          return ListView.builder(
            itemCount: businesses.length,
            padding: const EdgeInsets.all(16),
            itemBuilder: (context, index) {
              final data = businesses[index];
              final businessName = data['businessName'] ?? 'Unnamed Business';
              final founderEmail = data['email'] ?? 'N/A';
              final founderPhone = data['phoneNumber'] ?? 'N/A';

              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: InkWell(
                  onTap: () {
                    // Show contact dialog
                    showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          title: const Text('Contact Founder'),
                          content: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              ElevatedButton.icon(
                                onPressed: () {
                                  final Uri emailUri = Uri(
                                    scheme: 'mailto',
                                    path: founderEmail,
                                  );
                                  launchUrl(emailUri);
                                },
                                icon: const Icon(Icons.email),
                                label: const Text('Email'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.blue,
                                  foregroundColor: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 10),
                              ElevatedButton.icon(
                                onPressed: () {
                                  final Uri whatsappUri = Uri(
                                    scheme: 'https',
                                    host: 'wa.me',
                                    path: founderPhone,
                                    query: Uri.encodeFull('text='),
                                  );
                                  launchUrl(whatsappUri);
                                },
                                icon: const Icon(Icons.message),
                                label: const Text('WhatsApp'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                  foregroundColor: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 10),
                              ElevatedButton.icon(
                                onPressed: () {
                                  final Uri phoneUri = Uri(
                                    scheme: 'tel',
                                    path: founderPhone,
                                  );
                                  launchUrl(phoneUri);
                                },
                                icon: const Icon(Icons.phone),
                                label: const Text('Call'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.orange,
                                  foregroundColor: Colors.white,
                                ),
                              ),
                            ],
                          ),
                          actions: [
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).pop();
                              },
                              child: const Text('Close'),
                            ),
                          ],
                        );
                      },
                    );
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Card(
                    elevation: 3,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    color: Colors.grey[100],
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        vertical: 14.0,
                        horizontal: 16.0,
                      ),
                      child: Text(
                        businessName,
                        style: const TextStyle(fontSize: 16),
                      ),
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class CommunitiesTab extends StatelessWidget {
  const CommunitiesTab({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Communities (Coming Soon)')),
    );
  }
}

class BusinessDetailsPage extends StatelessWidget {
  final Map<String, dynamic> data;
  const BusinessDetailsPage({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final businessName = data['businessName'] ?? 'Business';
    final businessType = data['businessType'] ?? 'Type not stated';
    final fundingPurpose =
        data['fundingPurpose'] ?? 'Funding Purpose not stated';
    final businessStage = data['businessStage'] ?? 'Stage not stated';
    final fundingType = data['fundingType'] ?? 'Funding Type not stated';
    final monthlyIncome =
        data['monthlyIncome']?.toString() ??
        'Not specified'; // Convert to string
    final numEmployees =
        data['numEmployees']?.toString() ??
        'Not specified'; // Convert to string
    final requiredAmount =
        data['requiredAmount']?.toString() ??
        'Amount not stated'; // Convert to string
    final userId = data['userId'] ?? 'Unknown User ID';
    final userName = data['userName'] ?? 'Anonymous';
    final founderEmail =
        data['email'] ?? ''; // Ensure this field exists in MongoDB
    final founderPhone =
        data['phoneNumber'] ?? ''; // Ensure this field exists in MongoDB

    return Scaffold(
      appBar: AppBar(title: Text(businessName)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Card(
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  businessName,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Founded by: $userName',
                  style: const TextStyle(
                    fontSize: 14,
                    fontStyle: FontStyle.italic,
                    color: Colors.grey,
                  ),
                ),
                const Divider(height: 24, thickness: 1.2),

                _buildDetailRow("Business Type", businessType),
                _buildDetailRow("Business Stage", businessStage),
                _buildDetailRow("Funding Purpose", fundingPurpose),
                _buildDetailRow("Funding Type", fundingType),
                _buildDetailRow("Monthly Income", monthlyIncome),
                _buildDetailRow("Number of Employees", numEmployees),
                _buildDetailRow("Required Amount", requiredAmount),
                _buildDetailRow("User ID", userId),

                const SizedBox(height: 20),

                Center(
                  child: ElevatedButton.icon(
                    onPressed: () async {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            title: const Text('Contact Founder'),
                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                ElevatedButton.icon(
                                  onPressed: () {
                                    final Uri emailLaunchUri = Uri(
                                      scheme: 'mailto',
                                      path: founderEmail,
                                      query: Uri.encodeFull(
                                        'subject=Funding Opportunity for $businessName&body=Hi $userName, I am interested in funding your business idea.',
                                      ),
                                    );
                                    launchUrl(emailLaunchUri);
                                  },
                                  icon: const Icon(Icons.email),
                                  label: const Text('Email'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.blue,
                                    foregroundColor: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                ElevatedButton.icon(
                                  onPressed: () {
                                    final Uri whatsappUri = Uri(
                                      scheme: 'https',
                                      host: 'wa.me',
                                      path:
                                          founderPhone, // Replace with founder's phone number
                                      query: Uri.encodeFull(
                                        'text=Hi $userName, I am interested in funding your business idea.',
                                      ),
                                    );
                                    launchUrl(whatsappUri);
                                  },
                                  icon: const Icon(Icons.message),
                                  label: const Text('WhatsApp'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.green,
                                    foregroundColor: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                ElevatedButton.icon(
                                  onPressed: () {
                                    final Uri phoneUri = Uri(
                                      scheme: 'tel',
                                      path:
                                          founderPhone, // Replace with founder's phone number
                                    );
                                    launchUrl(phoneUri);
                                  },
                                  icon: const Icon(Icons.phone),
                                  label: const Text('Call'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.orange,
                                    foregroundColor: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                                child: const Text('Close'),
                              ),
                            ],
                          );
                        },
                      );
                      await FirebaseFirestore.instance
                          .collection('investors')
                          .doc(FirebaseAuth.instance.currentUser!.uid)
                          .set({
                            'investedCompanies': FieldValue.arrayUnion([
                              businessName,
                            ]),
                          }, SetOptions(merge: true));
                    },

                    icon: const Icon(Icons.attach_money),
                    label: const Text('Contact'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 12,
                      ),
                      textStyle: const TextStyle(fontSize: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("$label: ", style: const TextStyle(fontWeight: FontWeight.bold)),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
