import 'package:flutter/material.dart';
import 'package:app/services/Api.dart';

class Microfinance extends StatefulWidget {
  @override
  _MicrofinanceState createState() => _MicrofinanceState();
}

class _MicrofinanceState extends State<Microfinance> {
  final _formKey = GlobalKey<FormState>();
  Map<String, dynamic> formData = {
    "businessName": "",
    "businessType": "",
    "businessStage": null, // Set to null for dropdown fields
    "numEmployees": "",
    "monthlyIncome": "",
    "fundingPurpose": "",
    "requiredAmount": "",
    "fundingType": null, // Set to null for dropdown fields
  };

  List<dynamic> applications = [];
  bool isLoading = false;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    fetchApplications(); // Fetch applications when the page loads
  }

  Future<void> fetchApplications() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final response = await Api.getApplications();
      setState(() {
        applications = response['data'];
      });
      print("Applications fetched successfully: $applications");
    } catch (e) {
      setState(() {
        errorMessage = "Failed to load applications.";
      });
      print("Error during fetchApplications: $e");
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> submitApplication() async {
    if (!_formKey.currentState!.validate()) return;

    _formKey.currentState!.save();

    print("Submitting Application: $formData");

    try {
      final response = await Api.submitApplication(formData);
      setState(() {
        applications.add(response['data']);
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Application submitted successfully!")),
      );

      // Reset the form
      setState(() {
        formData = {
          "businessName": "",
          "businessType": "",
          "businessStage": null,
          "numEmployees": "",
          "monthlyIncome": "",
          "fundingPurpose": "",
          "requiredAmount": "",
          "fundingType": null,
        };
      });
    } catch (e) {
      print("Error during application submission: $e");
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Failed to submit application.")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Microfinance")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Application Form
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Funding Application",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.teal,
                        ),
                      ),
                      SizedBox(height: 16),
                      _buildTextField(
                        label: "Business Name",
                        onSaved: (value) => formData["businessName"] = value,
                      ),
                      _buildTextField(
                        label: "Business Type",
                        onSaved: (value) => formData["businessType"] = value,
                      ),
                      _buildDropdownField(
                        label: "Business Stage",
                        value: formData["businessStage"],
                        items: ["Idea Stage", "Startup", "Established"],
                        onChanged:
                            (value) => setState(
                              () => formData["businessStage"] = value,
                            ),
                      ),
                      _buildTextField(
                        label: "Employees",
                        keyboardType: TextInputType.number,
                        onSaved: (value) => formData["numEmployees"] = value,
                      ),
                      _buildTextField(
                        label: "Monthly Income (₹)",
                        keyboardType: TextInputType.number,
                        onSaved: (value) => formData["monthlyIncome"] = value,
                      ),
                      _buildTextField(
                        label: "Funding Purpose",
                        onSaved: (value) => formData["fundingPurpose"] = value,
                      ),
                      _buildTextField(
                        label: "Required Amount (₹)",
                        keyboardType: TextInputType.number,
                        onSaved: (value) => formData["requiredAmount"] = value,
                      ),
                      _buildDropdownField(
                        label: "Funding Type",
                        value: formData["fundingType"],
                        items: [
                          "Grant",
                          "Microfinance Loan",
                          "Investor Support",
                        ],
                        onChanged:
                            (value) =>
                                setState(() => formData["fundingType"] = value),
                      ),
                      SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: submitApplication,
                        child: Text("Submit Application"),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            SizedBox(height: 16),
            // Applications List
            Text(
              "Your Applications",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.teal,
              ),
            ),
            SizedBox(height: 8),
            if (isLoading)
              Center(child: CircularProgressIndicator())
            else if (errorMessage != null)
              Center(
                child: Text(errorMessage!, style: TextStyle(color: Colors.red)),
              )
            else if (applications.isEmpty)
              Center(child: Text("No applications found."))
            else
              ListView.builder(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                itemCount: applications.length,
                itemBuilder: (context, index) {
                  final app = applications[index];
                  return Card(
                    elevation: 4,
                    child: ListTile(
                      title: Text(app['businessName']),
                      subtitle: Text("Status: ${app['status']}"),
                      trailing:
                          app['processedBy'] != null
                              ? Text(
                                "Processed by: ${app['processedBy']['username']}",
                              )
                              : null,
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    TextInputType keyboardType = TextInputType.text,
    required void Function(String?) onSaved,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextFormField(
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(),
        ),
        keyboardType: keyboardType,
        validator: (value) {
          if (value == null || value.isEmpty) {
            return "This field is required.";
          }
          return null;
        },
        onSaved: onSaved,
      ),
    );
  }

  Widget _buildDropdownField({
    required String label,
    required String? value,
    required List<String> items,
    required void Function(String?) onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: DropdownButtonFormField<String>(
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(),
        ),
        value:
            items.contains(value) ? value : null, // Ensure value matches items
        items:
            items
                .map((item) => DropdownMenuItem(value: item, child: Text(item)))
                .toList(),
        onChanged: onChanged,
        validator: (value) {
          if (value == null || value.isEmpty) {
            return "This field is required.";
          }
          return null;
        },
      ),
    );
  }
}
