import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

const COLORS = [
  "#0d9488",
  "#0891b2",
  "#06b6d4",
  "#22d3ee",
  "#67e8f9",
  "#5eead4",
];

const CATEGORIES = [
  "Housing",
  "Transportation",
  "Food",
  "Utilities",
  "Entertainment",
  "Other",
];

const Dashboard = () => {
  // State management remains unchanged
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [advice, setAdvice] = useState("");
  const [notification, setNotification] = useState(null);

  // All useEffect and functions remain exactly the same
  useEffect(() => {
    if (transactions.length > 0) {
      const total = transactions.reduce((sum, t) => sum + t.amount, 0);
      if (income && total > income * 0.9) {
        setNotification(
          "Warning: You're approaching your monthly budget limit!"
        );
      }
    }
  }, [transactions, income]);

  const addTransaction = (e) => {
    e.preventDefault();
    if (!amount || !date || !category) {
      setNotification("Please fill in all fields");
      return;
    }

    const newTransaction = {
      date,
      amount: parseFloat(amount),
      category,
      id: Date.now(),
    };

    setTransactions([...transactions, newTransaction]);
    setAmount("");
    setDate("");
    setCategory("");
    setNotification("Transaction added successfully!");
    setTimeout(() => setNotification(null), 3000);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    setNotification("Transaction deleted");
    setTimeout(() => setNotification(null), 3000);
  };

  const formatAdviceText = (text) => {
    if (!text) return [];
    const paragraphs = text.split("\n").filter((p) => p.trim());
    return paragraphs.map((para) => {
      return para
        .replace(/[*\\]/g, "")
        .trim()
        .replace(/^[-•]/, "")
        .trim();
    });
  };

  const getAdvice = async () => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    try {
      setAdvice("Loading...");
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `As a financial advisor, analyze my budget and provide specific advice. Monthly income: ₹${income}. Expenses: ${JSON.stringify(
                    transactions.map((t) => ({
                      category: t.category,
                      amount: t.amount,
                    }))
                  )}. Please provide clear, actionable advice for better budget management. Format your response as bullet points.give the answer is short format maximum in 100 words`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let rawText =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No advice received.";
      setAdvice(rawText);
    } catch (error) {
      console.error("Error fetching AI advice:", error);
      setAdvice("Error fetching advice. Please try again later.");
    }
  };

  const categoryData = transactions.reduce((acc, transaction) => {
    const found = acc.find((item) => item.name === transaction.category);
    if (found) {
      found.value += transaction.amount;
    } else {
      acc.push({ name: transaction.category, value: transaction.amount });
    }
    return acc;
  }, []);

  const getTrendData = () => {
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    return sortedTransactions.reduce((acc, curr) => {
      const date = new Date(curr.date).toLocaleDateString();
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.amount += curr.amount;
      } else {
        acc.push({ date, amount: curr.amount });
      }
      return acc;
    }, []);
  };

  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remainingBudget = income ? income - totalExpenses : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {notification && (
          <div className="fixed top-4 left-4 right-4 mx-4 bg-gray-800 p-3 rounded-lg shadow-xl flex items-center space-x-2 animate-fade-in z-50 border border-teal-400/20">
            <AlertCircle className="text-teal-400" size={18} />
            <p className="text-gray-100 text-sm">{notification}</p>
          </div>
        )}

        <Card className="bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Smart Budget Tracker
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Budget Overview Card */}
              <Card className="bg-gray-800/30 border border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="text-teal-400" size={20} />
                    <CardTitle className="text-base sm:text-lg font-semibold text-gray-100">
                      Budget Overview
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    type="number"
                    placeholder="Monthly Income"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 text-gray-100 text-sm sm:text-base"
                  />
                  <div className="space-y-2">
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/30">
                      <p className="text-xs sm:text-sm text-teal-300">Total Expenses</p>
                      <p className="text-lg sm:text-xl font-bold text-red-400">
                        ₹{totalExpenses.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/30">
                      <p className="text-xs sm:text-sm text-teal-300">Remaining Budget</p>
                      <p className="text-lg sm:text-xl font-bold text-teal-400">
                        ₹{remainingBudget.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Transaction Card */}
              <Card className="bg-gray-800/30 border border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-teal-400" size={20} />
                    <CardTitle className="text-base sm:text-lg font-semibold text-gray-100">
                      Add Transaction
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={addTransaction} className="space-y-3">
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-gray-100 text-sm sm:text-base"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-gray-100 text-sm sm:text-base"
                    />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 text-sm sm:text-base focus:ring-2 focus:ring-teal-400/30"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-sm sm:text-base"
                    >
                      Add Expense
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Recent Transactions Card */}
              <Card className="bg-gray-800/30 border border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="text-teal-400" size={20} />
                    <CardTitle className="text-base sm:text-lg font-semibold text-gray-100">
                      Recent Transactions
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 h-[200px] sm:h-[300px] overflow-y-auto custom-scrollbar">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex justify-between items-center p-2 sm:p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition"
                      >
                        <div>
                          <p className="font-medium text-gray-100 text-sm sm:text-base">
                            {transaction.category}
                          </p>
                          <p className="text-xs sm:text-sm text-teal-300">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-red-400 font-medium text-sm sm:text-base">
                            ₹{transaction.amount.toFixed(2)}
                          </span>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="text-gray-400 hover:text-red-400 transition text-lg"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800/30 border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-100">
                    Expense Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {categoryData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            borderColor: "#0d9488",
                            borderRadius: "8px",
                          }}
                          formatter={(value) => `₹${value.toFixed(2)}`}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: "12px" }}
                          layout="horizontal"
                          verticalAlign="bottom"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/30 border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-100">
                    Spending Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            borderColor: "#0d9488",
                            borderRadius: "8px",
                          }}
                          formatter={(value) => `₹${value.toFixed(2)}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#0d9488"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Advice Section */}
            <Card className="bg-gray-800/30 border border-gray-700/50">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-100">
                    AI Budgeting Advice
                  </CardTitle>
                  <Button
                    onClick={getAdvice}
                    disabled={!income || transactions.length === 0}
                    className={cn(
                      "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-sm sm:text-base",
                      "disabled:bg-gray-700 disabled:cursor-not-allowed"
                    )}
                  >
                    {advice === "Loading..." ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      "Get AI Advice"
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {advice && (
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                    {advice === "Loading..." ? (
                      <div className="flex items-center justify-center py-2">
                        <span className="text-teal-300 text-sm">
                          Analyzing your budget...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formatAdviceText(advice).map((paragraph, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-teal-100 text-sm sm:text-base"
                          >
                            <span className="text-teal-400 font-bold mt-1">
                              •
                            </span>
                            <p className="leading-relaxed">{paragraph}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;