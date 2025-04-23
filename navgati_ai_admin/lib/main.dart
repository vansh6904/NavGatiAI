import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'firebase_options.dart'; // Import your Firebase options file
import 'package:firebase_core/firebase_core.dart';
import 'package:navgati_ai_admin/services/Api.dart';
import 'package:navgati_ai_admin/models/UserModel.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(AdminConsoleApp());
}

class AdminConsoleApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NavgatiAI - Admin',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: LoginScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

// Login Screen
class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  String _error = '';

  void _login() {
    FirebaseFirestore.instance
        .collection('coadmins')
        .where('name', isEqualTo: _usernameController.text)
        .where('password', isEqualTo: _passwordController.text)
        .get()
        .then((querySnapshot) {
          if (querySnapshot.docs.isNotEmpty) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => DashboardScreen()),
            );
          } else {
            setState(() {
              _error = 'Invalid credentials!';
            });
          }
        })
        .catchError((error) {
          setState(() {
            _error = 'An error occurred. Please try again.';
          });
        });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Admin Login')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _usernameController,
                decoration: InputDecoration(labelText: 'Username'),
              ),
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: InputDecoration(labelText: 'Password'),
              ),
              if (_error.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text(_error, style: TextStyle(color: Colors.red)),
                ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: () async {
                  _login();
                  Api.loginUser({
                    "username": _usernameController.text,
                    "password": _passwordController.text,
                  });

                  // Save username in cookies
                  final prefs = await SharedPreferences.getInstance();
                  await prefs.setString('username', _usernameController.text);
                },
                child: Text('Login'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Dashboard with Top Navigation
class DashboardScreen extends StatelessWidget {
  final List<String> tabs = [
    'Users',
    'Entrepreneurs',
    'Investors',
    'Co-admins',
  ];

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: tabs.length,
      child: Scaffold(
        appBar: AppBar(
          title: Text('Admin Dashboard'),
          bottom: TabBar(
            isScrollable: true,
            tabs: tabs.map((tab) => Tab(text: tab)).toList(),
          ),
        ),
        body: TabBarView(
          children: [
            RoleBasedUserTab(role: 'user'),
            RoleBasedUserTab(role: 'entrepreneur'),
            InvestorTable(),
            CoAdminManager(),
          ],
        ),
      ),
    );
  }
}

// RoleBasedUserTab Widget
class RoleBasedUserTab extends StatefulWidget {
  final String role;

  RoleBasedUserTab({required this.role});

  @override
  _RoleBasedUserTabState createState() => _RoleBasedUserTabState();
}

class _RoleBasedUserTabState extends State<RoleBasedUserTab> {
  late Future<List<UserModel>> _futureUsers;

  @override
  void initState() {
    super.initState();
    _futureUsers = Api.getUsersByRole(widget.role);
  }

  void _refreshUsers() {
    setState(() {
      _futureUsers = Api.getUsersByRole(widget.role);
    });
  }

  Future<void> _verifyUser(String userId) async {
    bool success = await Api.verifyUser(userId);
    if (success) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("User verified")));
      _refreshUsers();
    } else {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Verification failed")));
    }
  }

  Future<void> _deleteUser(String userId) async {
    bool success = await Api.deleteUser(userId);
    if (success) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("User deleted")));
      _refreshUsers();
    } else {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Delete failed")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<UserModel>>(
      future: _futureUsers,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return const Center(
            child: Text("No users found. snapshot has error."),
          );
        } else if (!snapshot.hasData) {
          return const Center(
            child: Text("No users found. snapshot does not have data"),
          );
        } else if (snapshot.data!.isEmpty) {
          return const Center(
            child: Text("No users found. Snapshot data object is empty"),
          );
        }

        List<UserModel> users = snapshot.data!;

        return ListView.builder(
          itemCount: users.length,
          itemBuilder: (context, index) {
            UserModel user = users[index];

            return Card(
              margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
              child: ListTile(
                title: Text(user.fullname ?? "Unnamed"),
                subtitle: Text(
                  "Email: ${user.email}\nVerified: ${user.verified}",
                ),
                isThreeLine: true,
                trailing: Wrap(
                  spacing: 8,
                  children: [
                    if (user.verified == false)
                      IconButton(
                        icon: Icon(Icons.verified, color: Colors.green),
                        tooltip: "Verify",
                        onPressed: () => _verifyUser(user.id!),
                      ),
                    IconButton(
                      icon: Icon(Icons.delete, color: Colors.red),
                      tooltip: "Delete",
                      onPressed: () => _deleteUser(user.id!),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class InvestorTable extends StatelessWidget {
  final CollectionReference investors = FirebaseFirestore.instance.collection(
    'investors',
  );

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(height: 10),
        SizedBox(height: 10),
        StreamBuilder<QuerySnapshot>(
          stream: investors.snapshots(),
          builder: (context, snapshot) {
            if (!snapshot.hasData)
              return Center(child: CircularProgressIndicator());

            final docs = snapshot.data!.docs;

            return SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columns: [
                  DataColumn(label: Text('Name')),
                  DataColumn(label: Text('Email')),
                  DataColumn(label: Text('Verified')),
                  DataColumn(label: Text('Actions')),
                ],
                rows:
                    docs.map((doc) {
                      final data = doc.data() as Map<String, dynamic>;
                      final isVerified = data['verified'] == true;

                      return DataRow(
                        cells: [
                          DataCell(Text(data['userName'] ?? '')),
                          DataCell(Text(data['email'] ?? '')),
                          DataCell(Text(isVerified ? 'Yes' : 'No')),
                          DataCell(
                            Row(
                              children: [
                                if (!isVerified)
                                  ElevatedButton(
                                    onPressed: () {
                                      investors.doc(doc.id).update({
                                        'verified': true,
                                      });
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text(
                                            '${data['userName']} verified.',
                                          ),
                                        ),
                                      );
                                    },
                                    child: Text('Verify'),
                                  ),
                                SizedBox(width: 10),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.red,
                                  ),
                                  onPressed: () {
                                    if (data['banned'] == true) {
                                      investors.doc(doc.id).update({
                                        'banned': false,
                                      });
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text(
                                            '${data['userName']} unbanned.',
                                          ),
                                        ),
                                      );
                                    } else {
                                      investors.doc(doc.id).update({
                                        'banned': true,
                                      });
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text(
                                            '${data['userName']} banned.',
                                          ),
                                        ),
                                      );
                                    }
                                  },
                                  child: Text(
                                    data['banned'] == true ? 'Unban' : 'Ban',
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      );
                    }).toList(),
              ),
            );
          },
        ),
      ],
    );
  }
}

class CoAdminManager extends StatefulWidget {
  @override
  _CoAdminManagerState createState() => _CoAdminManagerState();
}

class _CoAdminManagerState extends State<CoAdminManager> {
  final CollectionReference coAdmins = FirebaseFirestore.instance.collection(
    'coadmins',
  );
  String savedUsername = '';

  @override
  void initState() {
    super.initState();
    _initializeSavedUsername();
  }

  Future<void> _initializeSavedUsername() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      savedUsername = prefs.getString('username') ?? '';
    });
  }

  void _showAdminDialog(BuildContext context, {DocumentSnapshot? doc}) {
    final nameController = TextEditingController(text: doc?.get('name') ?? '');
    final emailController = TextEditingController(
      text: doc?.get('email') ?? '',
    );
    final passwordController = TextEditingController();

    showDialog(
      context: context,
      builder:
          (_) => AlertDialog(
            title: Text(doc == null ? 'Create Co-admin' : 'Edit Co-admin'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  decoration: InputDecoration(labelText: 'Name'),
                  onChanged: (value) {
                    if (value.toLowerCase() == 'superadmin') {
                      nameController.clear();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'You are not allowed to create a superadmin',
                          ),
                        ),
                      );
                    }
                  },
                ),
                TextField(
                  controller: emailController,
                  decoration: InputDecoration(labelText: 'Email'),
                ),
                if (doc == null)
                  TextField(
                    controller: passwordController,
                    decoration: InputDecoration(labelText: 'Password'),
                  ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  final data = {
                    'name': nameController.text,
                    'email': emailController.text,
                    if (doc == null) 'password': passwordController.text,
                  };
                  if (doc == null) {
                    coAdmins.add(data);
                  } else {
                    coAdmins.doc(doc.id).update(data);
                  }
                  Navigator.pop(context);
                },
                child: Text(doc == null ? 'Create' : 'Update'),
              ),
            ],
          ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (savedUsername.isEmpty) {
      return Center(child: CircularProgressIndicator());
    }

    return Column(
      children: [
        SizedBox(height: 10),
        ElevatedButton.icon(
          icon: Icon(Icons.add),
          label: Text('Add Co-admin'),
          onPressed: () => _showAdminDialog(context),
        ),
        SizedBox(height: 10),
        Expanded(
          child: StreamBuilder<QuerySnapshot>(
            stream: coAdmins.snapshots(),
            builder: (context, snapshot) {
              if (!snapshot.hasData) {
                return Center(child: CircularProgressIndicator());
              }

              final docs = snapshot.data!.docs;

              return SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: DataTable(
                  columns: [
                    DataColumn(label: Text('Name')),
                    DataColumn(label: Text('Email')),
                    DataColumn(label: Text('Actions')),
                  ],
                  rows:
                      docs
                          .where((doc) {
                            final data = doc.data() as Map<String, dynamic>;
                            return data['name'] != 'superadmin' &&
                                data['name'] != savedUsername;
                          })
                          .map((doc) {
                            final data = doc.data() as Map<String, dynamic>;
                            return DataRow(
                              cells: [
                                DataCell(Text(data['name'] ?? '')),
                                DataCell(Text(data['email'] ?? '')),
                                DataCell(
                                  Row(
                                    children: [
                                      IconButton(
                                        icon: Icon(Icons.edit),
                                        onPressed:
                                            () => _showAdminDialog(
                                              context,
                                              doc: doc,
                                            ),
                                      ),
                                      IconButton(
                                        icon: Icon(
                                          Icons.delete,
                                          color: Colors.red,
                                        ),
                                        onPressed: () {
                                          coAdmins.doc(doc.id).delete();
                                          ScaffoldMessenger.of(
                                            context,
                                          ).showSnackBar(
                                            SnackBar(
                                              content: Text(
                                                '${data['name']} deleted',
                                              ),
                                            ),
                                          );
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            );
                          })
                          .toList(),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
