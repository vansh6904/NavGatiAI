// Microfinance.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Input } from '../ui/input';
import { Label } from './Label';
import Button from './Button';
import { Select, SelectOption } from './Select';
import { cn } from '../ui/utils';
import { toast } from 'sonner';

const Microfinance = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    businessStage: '',
    numEmployees: '',
    monthlyIncome: '',
    fundingPurpose: '',
    requiredAmount: '',
    fundingType: ''
  });

  const [applications, setApplications] = useState([]);
  const user = useSelector(state => state.auth.userData);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/application/user`, {
          withCredentials: true
        });
        setApplications(response.data.data);
      } catch (error) {
        toast.error('Failed to load applications', {
          style: { background: '#dc2626', color: 'white' }
        });
      }
    };
    fetchApplications();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the user already has an application
    if (applications.length >= 1) {
      toast.error('You cannot post more than one application at a time!', {
        style: { background: '#dc2626', color: 'white' },
      });
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/application/submit`,
        formData,
        { withCredentials: true }
      );

      // Refetch applications to update the "Your Applications" section
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/application/user`, {
        withCredentials: true,
      });
      setApplications(response.data.data);

      toast.success('Application submitted!', {
        style: { background: '#059669', color: 'white' },
      });

      // Reset the form
      setFormData({
        businessName: '',
        businessType: '',
        businessStage: '',
        numEmployees: '',
        monthlyIncome: '',
        fundingPurpose: '',
        requiredAmount: '',
        fundingType: '',
      });
    } catch (error) {
      toast.error('Submission failed', {
        style: { background: '#dc2626', color: 'white' },
      });
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/application/${id}`, {
        withCredentials: true,
      });
  
      // Update the state to remove the deleted application
      setApplications((prev) => prev.filter((app) => app._id !== id));
  
      toast.success('Application deleted!', {
        style: { background: '#059669', color: 'white' },
      });
    } catch (error) {
      toast.error('Deletion failed', {
        style: { background: '#dc2626', color: 'white' },
      });
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-sm p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Application Form */}
            <Card className="bg-gray-800/30 border border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Funding Application
                </CardTitle>
                <p className="text-teal-300">Apply for business funding support</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-teal-300">Business Name</Label>
                      <Input
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="bg-gray-700/50 border-gray-600 text-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-teal-300">Business Type</Label>
                      <Input
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="bg-gray-700/50 border-gray-600 text-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-teal-300">Business Stage</Label>
                      <Select
                        name="businessStage"
                        value={formData.businessStage}
                        onChange={handleChange}
                        className="bg-gray-700/50 border-gray-600 text-gray-100"
                      >
                        <SelectOption value="">Select stage</SelectOption>
                        <SelectOption value="Idea Stage">Idea Stage</SelectOption>
                        <SelectOption value="Startup">Startup</SelectOption>
                        <SelectOption value="Established">Established</SelectOption>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-teal-300">Employees</Label>
                      <Input
                        type="number"
                        name="numEmployees"
                        value={formData.numEmployees}
                        onChange={handleChange}
                        className="bg-gray-700/50 border-gray-600 text-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-teal-300">Monthly Income (₹)</Label>
                      <Input
                        type="number"
                        name="monthlyIncome"
                        value={formData.monthlyIncome}
                        onChange={handleChange}
                        className="bg-gray-700/50 border-gray-600 text-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-teal-300">Funding Purpose</Label>
                      <Input
                        name="fundingPurpose"
                        value={formData.fundingPurpose}
                        onChange={handleChange}
                        className="bg-gray-700/50 border-gray-600 text-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-teal-300">Required Amount (₹)</Label>
                      <Input
                        type="number"
                        name="requiredAmount"
                        value={formData.requiredAmount}
                        onChange={handleChange}
                        className="bg-gray-700/50 border-gray-600 text-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-teal-300">Funding Type</Label>
                      <Select
                        name="fundingType"
                        value={formData.fundingType}
                        onChange={handleChange}
                        className="bg-gray-700/50 border-gray-600 text-gray-100"
                      >
                        <SelectOption value="">Select type</SelectOption>
                        <SelectOption value="Grant">Grant</SelectOption>
                        <SelectOption value="Microfinance Loan">Loan</SelectOption>
                        <SelectOption value="Investor Support">Investor</SelectOption>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500"
                  >
                    Submit Application
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Applications List */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Your Applications
              </h2>
              <div className="space-y-4">
                {applications.map(app => (
                  <Card key={app._id} className="bg-gray-800/30 border border-gray-700/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-100">{app.businessName}</h3>

                      </div>
                      {app.processedBy && (
                        <p className="text-sm text-teal-300 mt-2">
                          Processed by: {app.processedBy.username}
                        </p>
                      )}
                      <div className="mt-4 flex justify-end">
                        <Button
                          onClick={() => handleDelete(app._id)}
                          className="bg-red-600 hover:bg-red-500 text-white"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Microfinance;