import 'package:flutter/rendering.dart';
import 'package:http/http.dart' as http;
import 'dart:convert'; // Add this import to parse JSON responses
import 'package:shared_preferences/shared_preferences.dart';

class Api {
  static const baseUrl = "http://192.168.29.165:8000/api/v1/";
  // static const baseUrl = "http://localhost:8000/api/v1/users/register";

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

  static Future<Map<String, dynamic>> fetchNews() async {
    var url = Uri.parse(baseUrl + "scrape/news");
    try {
      final res = await http.get(url);

      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      } else {
        throw Exception("Failed to fetch news: ${res.statusCode}");
      }
    } catch (e) {
      print("Error during fetchNews: ${e.toString()}");
      throw Exception("Network error");
    }
  }

  static Future<Map<String, dynamic>> getApplications() async {
    var url = Uri.parse(baseUrl + "application/user");
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? accessToken = prefs.getString('accessToken');

      if (accessToken == null) {
        throw Exception("Access token not found in SharedPreferences");
      }

      print("GET Request: $url");
      print("Access Token: $accessToken");

      final res = await http.get(
        url,
        headers: {
          "Authorization": "Bearer $accessToken",
          "Content-Type": "application/json",
        },
      );

      print("Response Status: ${res.statusCode}");
      print("Response Body: ${res.body}");

      if (res.statusCode == 200 || res.statusCode == 201) {
        return jsonDecode(res.body);
      } else {
        throw Exception("Failed to fetch applications: ${res.statusCode}");
      }
    } catch (e) {
      print("Error during getApplications: ${e.toString()}");
      throw Exception("Network error");
    }
  }

  static Future<Map<String, dynamic>> submitApplication(
    Map<String, dynamic> data,
  ) async {
    var url = Uri.parse(baseUrl + "application/submit");
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? accessToken = prefs.getString('accessToken');
      String? userId = prefs.getString('userId');

      if (accessToken == null || userId == null) {
        throw Exception(
          "Access token or user ID not found in SharedPreferences",
        );
      }

      // Add the user ID to the application data
      data['applicant'] = userId;

      print("POST Request: $url");
      print("Request Body: ${jsonEncode(data)}");
      print("Access Token: $accessToken");

      final res = await http.post(
        url,
        body: jsonEncode(data),
        headers: {
          "Authorization": "Bearer $accessToken",
          "Content-Type": "application/json",
        },
      );

      print("Response Status: ${res.statusCode}");
      print("Response Body: ${res.body}");

      if (res.statusCode == 200 || res.statusCode == 201) {
        return jsonDecode(res.body);
      } else {
        throw Exception("Failed to submit application: ${res.statusCode}");
      }
    } catch (e) {
      print("Error during submitApplication: ${e.toString()}");
      throw Exception("Network error");
    }
  }
}
