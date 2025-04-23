import 'package:app/HomePage.dart';
import 'package:app/Signup.dart';
import 'package:app/services/Api.dart';
import 'package:flutter/material.dart';

class Login extends StatefulWidget {
  LoginState createState() {
    return LoginState();
  }
}

class LoginState extends State<Login> {
  var nameController = TextEditingController();
  var usernameController = TextEditingController();
  var passwordController = TextEditingController();
  var accountTypeController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        child: Stack(
          children: [
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.black87,
                    const Color.fromARGB(255, 70, 82, 97),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),

            Positioned(
              top: 50, // Adjust this value to move the text down
              left: 0,
              right: 0,
              child: Text(
                "Welcome Back",
                textAlign: TextAlign.center, // Centers the text horizontally
                style: TextStyle(
                  fontSize: 30,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),

            Container(
              margin: EdgeInsets.symmetric(vertical: 100, horizontal: 50),
              child: Material(
                elevation: 10,
                borderRadius: BorderRadius.circular(30),
                child: Container(
                  height: MediaQuery.of(context).size.height,
                  width: MediaQuery.of(context).size.width,
                  decoration: BoxDecoration(
                    color: Colors.white54,
                    borderRadius: BorderRadius.circular(30),
                  ),
                ),
              ),
            ),

            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    margin: EdgeInsets.only(left: 80, right: 80),
                    child: TextField(
                      controller: usernameController,
                      decoration: InputDecoration(
                        hintText: "Username",
                        hintStyle: TextStyle(color: Colors.blueAccent),
                      ),
                    ),
                  ),
                  Container(
                    margin: EdgeInsets.only(left: 80, right: 80),
                    child: TextField(
                      controller: passwordController,
                      decoration: InputDecoration(
                        hintText: "Password",
                        hintStyle: TextStyle(color: Colors.blueAccent),
                      ),
                    ),
                  ),

                  Padding(padding: EdgeInsets.only(top: 20)),
                  ElevatedButton(
                    onPressed: () async {
                      var data = {
                        "username": usernameController.text,
                        "password": passwordController.text,
                      };

                      // Call the API to validate credentials
                      bool isLoggedIn = await Api.loginUser(data);

                      if (isLoggedIn) {
                        // Navigate to HomePage immediately after login is successful
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(builder: (_) => HomePage()),
                        );
                      } else {
                        // Show an error message if login fails
                        showDialog(
                          context: context,
                          builder:
                              (context) => AlertDialog(
                                title: Text("Login Failed"),
                                content: Text("Invalid username or password."),
                                actions: [
                                  TextButton(
                                    onPressed: () {
                                      Navigator.of(context).pop();
                                    },
                                    child: Text("OK"),
                                  ),
                                ],
                              ),
                        );
                      }
                    },
                    child: Text("Login"),
                  ),
                  TextButton(
                    onPressed: () {
                      // Handle login navigation
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder:
                              (_) =>
                                  HomePage(), // Replace with your HomePage page
                        ),
                      );
                    },
                    child: Text(
                      "Don't have an account? Register here",
                      style: TextStyle(color: Colors.blueAccent),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
