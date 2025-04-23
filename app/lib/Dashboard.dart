import 'package:flutter/material.dart';
import 'package:app/services/Api.dart';
import 'package:fl_chart/fl_chart.dart'; // For charts
import 'dart:convert';

class Dashboard extends StatefulWidget {
  @override
  _DashboardState createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> {
  List<Map<String, dynamic>> transactions = [];
  String income = "";
  String? notification;

  // Controllers for input fields
  final TextEditingController amountController = TextEditingController();
  final TextEditingController dateController = TextEditingController();
  final TextEditingController categoryController = TextEditingController();

  @override
  void initState() {
    super.initState();
    fetchTransactions();
  }

  Future<void> fetchTransactions() async {
    try {
      final response = await Api.getApplications();
      setState(() {
        transactions =
            List<Map<String, dynamic>>.from(response['data']).map((
              transaction,
            ) {
              return {
                "category": transaction['category'] ?? "Unknown",
                "amount": transaction['amount'] ?? 0.0,
                "date": transaction['date'] ?? "Unknown",
                "businessType": transaction['businessType'] ?? "Unknown",
                "businessStage": transaction['businessStage'] ?? "Unknown",
                "monthlyIncome": transaction['monthlyIncome'] ?? 0.0,
                "fundingPurpose": transaction['fundingPurpose'] ?? "Unknown",
                "fundingType": transaction['fundingType'] ?? "Unknown",
              };
            }).toList();
      });
    } catch (e) {
      setState(() {
        notification = "Failed to fetch transactions.";
      });
    }
  }

  Future<void> addTransaction() async {
    if (amountController.text.isEmpty ||
        dateController.text.isEmpty ||
        categoryController.text.isEmpty ||
        income.isEmpty) {
      setState(() {
        notification = "Please fill in all fields.";
      });
      return;
    }

    final newTransaction = {
      "date": dateController.text,
      "amount": double.parse(amountController.text),
      "category": categoryController.text,
      "fundingType": "Microfinance Loan",
      "requiredAmount": double.parse(amountController.text),
      "fundingPurpose": "General Purpose",
      "monthlyIncome": double.parse(income),
      "businessStage": "Startup",
      "businessType": "Retail",
    };

    try {
      final response = await Api.submitApplication(newTransaction);
      setState(() {
        transactions.add({
          ...response['data'],
          "category": categoryController.text,
          "amount": double.parse(amountController.text),
          "date": dateController.text,
        });
        // Clear the input fields
        amountController.clear();
        dateController.clear();
        categoryController.clear();
        notification = "Transaction added successfully!";
      });
    } catch (e) {
      setState(() {
        notification = "Failed to add transaction.";
      });
    }
  }

  void deleteTransaction(String id) {
    setState(() {
      transactions.removeWhere((t) => t['_id'] == id);
      notification = "Transaction deleted.";
    });
  }

  double get totalExpenses =>
      transactions.fold(0, (sum, t) => sum + (t['amount'] ?? 0));

  double get remainingBudget =>
      income.isNotEmpty ? double.parse(income) - totalExpenses : 0;

  List<PieChartSectionData> getPieChartData() {
    final categoryData = <String, double>{};

    for (var transaction in transactions) {
      final category = transaction['category'] ?? "Unknown";
      final amount = transaction['amount'] ?? 0.0;

      categoryData[category] = (categoryData[category] ?? 0) + amount;
    }

    final filteredData =
        categoryData.entries.where((entry) => entry.value > 0).toList();

    if (filteredData.isEmpty) {
      return [];
    }

    return filteredData
        .map(
          (entry) => PieChartSectionData(
            value: entry.value,
            title: "${entry.key} (${entry.value.toStringAsFixed(0)})",
            color:
                Colors.primaries[categoryData.keys.toList().indexOf(entry.key) %
                    Colors.primaries.length],
            radius: 50,
          ),
        )
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Dashboard"), backgroundColor: Colors.teal),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (notification != null)
                Card(
                  color: Colors.redAccent,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      notification!,
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextField(
                        decoration: InputDecoration(
                          labelText: "Monthly Income",
                        ),
                        keyboardType: TextInputType.number,
                        onChanged:
                            (value) => setState(() {
                              income = value;
                            }),
                      ),
                      SizedBox(height: 8),
                      Text(
                        "Total Expenses: ₹${totalExpenses.toStringAsFixed(2)}",
                      ),
                      Text(
                        "Remaining Budget: ₹${remainingBudget.toStringAsFixed(2)}",
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextField(
                        controller: dateController,
                        decoration: InputDecoration(labelText: "Date"),
                        keyboardType: TextInputType.datetime,
                      ),
                      TextField(
                        controller: amountController,
                        decoration: InputDecoration(labelText: "Amount"),
                        keyboardType: TextInputType.number,
                      ),
                      TextField(
                        controller: categoryController,
                        decoration: InputDecoration(labelText: "Category"),
                      ),
                      SizedBox(height: 8),
                      ElevatedButton(
                        onPressed: addTransaction,
                        child: Text("Add Transaction"),
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Recent Transactions"),
                      ...transactions
                          .where(
                            (transaction) =>
                                transaction['category'] != "Unknown" &&
                                transaction['date'] != "Unknown" &&
                                transaction['amount'] != 0.0,
                          )
                          .map((transaction) {
                            return ListTile(
                              title: Text(transaction['category']),
                              subtitle: Text(transaction['date']),
                              trailing: Text("₹${transaction['amount']}"),
                              onLongPress:
                                  () => deleteTransaction(transaction['_id']),
                            );
                          })
                          .toList(),
                      if (transactions
                          .where(
                            (transaction) =>
                                transaction['category'] != "Unknown" &&
                                transaction['date'] != "Unknown" &&
                                transaction['amount'] != 0.0,
                          )
                          .isEmpty)
                        Center(child: Text("No valid transactions available")),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Expense Distribution"),
                      SizedBox(height: 16),
                      Container(
                        height: 200,
                        child:
                            transactions.isEmpty
                                ? Center(child: Text("No data available"))
                                : PieChart(
                                  PieChartData(
                                    sections: getPieChartData(),
                                    centerSpaceRadius: 40,
                                    sectionsSpace: 2,
                                  ),
                                ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
