import 'package:flutter/rendering.dart';
import 'package:http/http.dart' as http;
import 'dart:convert'; // Add this import to parse JSON responses
import 'package:shared_preferences/shared_preferences.dart';
import 'package:navgati_ai_admin/models/UserModel.dart';

class Api {
  static const baseUrl = "http://192.168.29.165:8000/api/v1/";
  // static const baseUrl = "http://localhost:8000/api/v1/users/register";

  static getAllUsers() async {
    print("get all users loaded");
    var url = Uri.parse(baseUrl + "users/get-users/");
    try {
      final res = await http.get(url);

      if (res.statusCode == 200) {
        var responseBody = jsonDecode(res.body);
        return responseBody;
      } else {
        print("Failed to fetch users: ${res.statusCode}");
      }
    } catch (e) {
      print(e.toString());
      debugPrint(e.toString());
    }
  }

  static Future<List<UserModel>> getUsersByRole(String role) async {
    var url = Uri.parse(baseUrl + "users/get-users/");
    try {
      final res = await http.post(url, body: {"usertype": role});
      print("Response: ${res.body}"); // Debugging line to check the response
      if (res.statusCode == 200) {
        final List users = jsonDecode(res.body)['data'];
        return users.map((json) => UserModel.fromJson(json)).toList();
      } else {
        print("Failed to fetch $role: ${res.statusCode}");
      }
    } catch (e) {
      print("Error: $e");
    }
    return [];
  }

  static Future<bool> verifyUser(String userId) async {
    var url = Uri.parse(
      baseUrl + "users/verify",
    ); // Adjusted to match the backend route
    try {
      // Retrieve the access token from SharedPreferences
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? accessToken = prefs.getString('accessToken');

      if (accessToken == null) {
        print("Access token not found");
        return false;
      }

      print("User ID: $userId"); // Debugging line to check the userId
      final res = await http.post(
        url,
        headers: {
          "Authorization":
              "Bearer $accessToken", // Include the access token in the headers
          "Content-Type": "application/json", // Specify JSON content type
        },
        body: jsonEncode({"userId": userId}), // Send userId in the request body
      );

      print(
        "Response Status Code: ${res.statusCode}",
      ); // Debugging line to check the response
      print(
        "Response Body: ${res.body}",
      ); // Debugging line to check the response body

      if (res.statusCode == 200) {
        print("User verified successfully");
        return true;
      } else {
        print("Failed to verify user: ${res.statusCode}");
        return false;
      }
    } catch (e) {
      print("Verification Error: $e");
      return false;
    }
  }

  static Future<bool> deleteUser(String userId) async {
    var url = Uri.parse(
      baseUrl + "users/delete/",
    ); // Make sure this route exists!
    try {
      final res = await http.post(url, body: {"userId": userId});
      return res.statusCode == 200;
    } catch (e) {
      print("Delete Error: $e");
      return false;
    }
  }

  // static verifyUser(Map Pdata) async {
  //   var url = Uri.parse(baseUrl + "users/verify/");
  //   try {
  //     final res = await http.post(url, body: Pdata);

  //     if (res.statusCode == 200) {
  //       var responseBody = jsonDecode(res.body);
  //       return responseBody;
  //     } else {
  //       print("Failed to verify user: ${res.statusCode}");
  //     }
  //   } catch (e) {
  //     print(e.toString());
  //     debugPrint(e.toString());
  //   }
  // }

  static addPerson(Map Pdata) async {
    var url = Uri.parse(baseUrl + "users/register/");
    try {
      final res = await http.post(url, body: Pdata);

      if (res.statusCode == 200) {
        print("Person added successfully");
      } else {
        print("Failed to add person: ${res.statusCode}");
      }
    } catch (e) {
      print(e.toString());
      debugPrint(e.toString());
    }
  }

  static loginUser(Map Pdata) async {
    var url = Uri.parse(baseUrl + "users/login/");
    try {
      final res = await http.post(url, body: Pdata);

      if (res.statusCode == 200) {
        var responseBody = jsonDecode(res.body);

        // Extract the access token, username, and user ID
        String accessToken = responseBody['accessToken'];
        String username = responseBody['data']['username'];
        String userId =
            responseBody['data']['_id']; // Retrieve the user's MongoDB ObjectId
        print("User ID: $userId"); // Debugging line to check the userId
        print(
          "Access Token: $accessToken",
        ); // Debugging line to check the access token

        // Save the token, username, and user ID in shared preferences
        SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.setString('accessToken', accessToken);
        await prefs.setString('username', username);
        await prefs.setString('userId', userId); // Store the user ID

        print("User logged in successfully");
        return true;
      } else {
        print("Failed to login: ${res.statusCode}");
        return false;
      }
    } catch (e) {
      print("Error during login: ${e.toString()}");
      return false;
    }
  }
}
