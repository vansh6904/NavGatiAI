import 'package:flutter/foundation.dart' show debugPrint;
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class Api {
  static const baseUrl = "http://10.168.0.107:8000/api/v1/";

  // Fetch all applications
  static Future<List<dynamic>> getAllApplications() async {
    try {
      // Retrieve the access token from SharedPreferences
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? accessToken = prefs.getString('accessToken');

      if (accessToken == null) {
        throw Exception("Access token not found");
      }

      // Make the GET request to the backend
      final response = await http.get(
        Uri.parse("${baseUrl}application/all/"),
        headers: {
          "Authorization": "Bearer $accessToken",
          "Content-Type": "application/json",
        },
      );
      print("Response: ${response.body}");

      if (response.statusCode == 201) {
        // Parse the response body
        final data = jsonDecode(response.body);
        return data['data']; // Return the list of applications
      } else {
        throw Exception("Failed to fetch applications: ${response.body}");
      }
    } catch (e) {
      print("Error fetching applications: $e");
      throw Exception("Error fetching applications");
    }
  }

  static addPerson(Map Pdata) async {
    print(
      "API.dart: addPerson called",
    ); // Debugging line to check if the function is called
    print(Pdata);
    var url = Uri.parse(baseUrl + "users/register/");
    try {
      final res = await http.post(url, body: Pdata);

      if ((res.statusCode == 200) || (res.statusCode == 201)) {
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
    print(
      "API.dart: loginUser called",
    ); // Debugging line to check if the function is called
    print(Pdata);
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
