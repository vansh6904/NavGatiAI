import 'package:app/Login.dart';
import 'package:app/services/Api.dart';
import 'package:flutter/material.dart';

class Signup extends StatefulWidget {
  SignupState createState() {
    return SignupState();
  }
}

class SignupState extends State<Signup> {
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
                "Create Account",
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
                      controller: nameController,
                      decoration: InputDecoration(
                        hintText: "Full Name",
                        hintStyle: TextStyle(color: Colors.blueAccent),
                      ),
                    ),
                  ),
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
                  Container(
                    margin: EdgeInsets.only(left: 80, right: 80),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "Account type",
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.blueAccent,
                          ),
                        ),
                        DropdownButton<String>(
                          value: "User",
                          items: [
                            DropdownMenuItem(
                              value: "User",
                              child: Text("User"),
                            ),
                          ],
                          onChanged: (String? newValue) {
                            accountTypeController.text = newValue ?? "User";
                          },
                        ),
                      ],
                    ),
                  ),

                  Padding(padding: EdgeInsets.only(top: 20)),
                  ElevatedButton(
                    onPressed: () {
                      // Handle sign up action
                      var data = {
                        "fullname": nameController.text,
                        "username": usernameController.text,
                        "password": passwordController.text,
                        "accountType": accountTypeController.text,
                      };
                      Api.addPerson(data);
                      print(data);
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder:
                              (_) => Login(), // Replace with your Login page
                        ),
                      );
                    },
                    child: Text("Register"),
                  ),
                  TextButton(
                    onPressed: () {
                      // Handle login navigation
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder:
                              (_) => Login(), // Replace with your Login page
                        ),
                      );
                    },
                    child: Text(
                      "Already have an account? Login",
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
