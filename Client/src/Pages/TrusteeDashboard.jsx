import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Stethoscope, Activity, ArrowUp, ArrowDown, 
  MessageSquare, BarChart2, PieChart, Download, RefreshCw,
  Image as ImageIcon, Upload, X
} from 'lucide-react';
import { Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { supabase } from '../helper/supabaseClient';
Chart.register(...registerables);

const TrusteeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    activeDoctors: 0,
    newDoctors: 0,
    consultations: 0,
    growthRate: 0
  });
  const [consultationData, setConsultationData] = useState([]);
  const [specialtyData, setSpecialtyData] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const fileInputRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch doctor statistics
      const { count: totalDoctors } = await supabase
        .from('doctors')
        .select('*', { count: 'exact' });

      const { count: activeDoctors } = await supabase
        .from('doctors')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      const { count: newDoctors } = await supabase
        .from('doctors')
        .select('*', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Fetch consultation data
      const { count: consultations } = await supabase
        .from('consultations')
        .select('*', { count: 'exact' });

      // Calculate growth rate
      const growthRate = ((newDoctors / Math.max(1, totalDoctors - newDoctors)) * 100).toFixed(1);

      // Fetch data for charts (simplified - implement actual queries)
      const consultationTrend = [
        { month: 'Jan', count: 120 },
        { month: 'Feb', count: 190 },
        { month: 'Mar', count: 170 },
        { month: 'Apr', count: 210 },
        { month: 'May', count: 240 },
        { month: 'Jun', count: 280 }
      ];

      const specialties = [
        { specialty: 'Cardiology', count: 24 },
        { specialty: 'Neurology', count: 18 },
        { specialty: 'Pediatrics', count: 32 },
        { specialty: 'Orthopedics', count: 15 }
      ];

      setStats({
        totalDoctors,
        activeDoctors,
        newDoctors,
        consultations,
        growthRate
      });
      setConsultationData(consultationTrend);
      setSpecialtyData(specialties);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    // Add user message with image
    const userMsg = {
      id: Date.now(),
      text: 'I uploaded a medical image for analysis',
      sender: 'user',
      time: new Date().toLocaleTimeString(),
      image: imagePreview
    };
    setAiMessages(prev => [...prev, userMsg]);
    setAiTyping(true);

    // In a real app, you would upload the image to your backend/AI service
    // For demo purposes, we'll simulate a response
    setTimeout(() => {
      // This is a mock analysis - replace with actual AI service call
      const mockDiagnoses = [
        "Possible fracture detected in the radius bone",
        "Mild swelling observed in surrounding tissue",
        "No obvious dislocation detected"
      ];
      
      const aiMsg = {
        id: Date.now() + 1,
        text: "Based on the X-ray image analysis:\n" + 
              mockDiagnoses.map(d => `• ${d}`).join('\n') +
              "\n\nPlease consult with a specialist for confirmation.",
        sender: 'ai',
        time: new Date().toLocaleTimeString()
      };
      setAiMessages(prev => [...prev, aiMsg]);
      setAiTyping(false);
    }, 3000);
  };

  const diagnoseSymptoms = async () => {
    if (!symptoms.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      text: `Symptoms: ${symptoms}`,
      sender: 'user',
      time: new Date().toLocaleTimeString()
    };
    setAiMessages(prev => [...prev, userMsg]);
    setSymptoms('');
    setAiTyping(true);

    // Simulate AI diagnosis (replace with actual API call)
    setTimeout(() => {
      const symptomLower = symptoms.toLowerCase();
      let diagnosis = "";
      let recommendation = "Consult with a doctor for proper evaluation.";

      if (symptomLower.includes('fever') && symptomLower.includes('cough') && symptomLower.includes('fatigue')) {
        diagnosis = "Possible viral infection (could be flu or common cold)";
        recommendation = "Get rest, stay hydrated, and monitor your temperature. If fever persists beyond 3 days, see a doctor.";
      } 
      else if (symptomLower.includes('chest pain') && symptomLower.includes('shortness of breath')) {
        diagnosis = "Potential cardiovascular issue";
        recommendation = "Seek immediate medical attention as this could be serious.";
      }
      else if (symptomLower.includes('headache') && symptomLower.includes('nausea') && symptomLower.includes('light sensitivity')) {
        diagnosis = "Possible migraine or tension headache";
        recommendation = "Rest in a dark room, stay hydrated. Consider OTC pain relief if appropriate.";
      }
      else {
        diagnosis = "Based on the symptoms provided, it's difficult to determine a specific condition";
        recommendation = "Please provide more details or consult with a healthcare professional.";
      }

      const aiMsg = {
        id: Date.now() + 1,
        text: `Preliminary assessment:\n${diagnosis}\n\nRecommendation:\n${recommendation}`,
        sender: 'ai',
        time: new Date().toLocaleTimeString()
      };
      setAiMessages(prev => [...prev, aiMsg]);
      setAiTyping(false);
    }, 2000);
  };

  const handleAIQuery = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      text: userInput,
      sender: 'user',
      time: new Date().toLocaleTimeString()
    };
    setAiMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setAiTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      let response = "";
      const query = userInput.toLowerCase();

      if (query.includes('growth') || query.includes('increase')) {
        response = `Our platform has grown by ${stats.growthRate}% this month with ${stats.newDoctors} new doctors joining.`;
      } 
      else if (query.includes('special') || query.includes('type')) {
        const topSpecialty = specialtyData[0]?.specialty || 'Cardiology';
        response = `The most common specialty is ${topSpecialty} with ${specialtyData[0]?.count || 0} practitioners.`;
      }
      else if (query.includes('consult') || query.includes('session')) {
        response = `There have been ${stats.consultations} consultations this month, showing a steady increase.`;
      }
      else if (query.includes('image') || query.includes('x-ray') || query.includes('scan')) {
        response = `You can upload medical images for analysis using the upload button below. I can help analyze X-rays, MRIs, and other scans.`;
      }
      else if (query.includes('symptom') || query.includes('pain') || query.includes('feel')) {
        response = `You can describe your symptoms in the symptoms section below for a preliminary assessment. Remember this is not a substitute for professional medical advice.`;
      }
      else {
        response = `As of today, we have ${stats.totalDoctors} doctors (${stats.activeDoctors} active) and ${stats.consultations} consultations.`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        time: new Date().toLocaleTimeString()
      };
      setAiMessages(prev => [...prev, aiMsg]);
      setAiTyping(false);
    }, 1500);
  };

  // Chart configurations
  const consultationChart = {
    labels: consultationData.map(d => d.month),
    datasets: [{
      label: 'Consultations',
      data: consultationData.map(d => d.count),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.3
    }]
  };

  const specialtyChart = {
    labels: specialtyData.map(d => d.specialty),
    datasets: [{
      data: specialtyData.map(d => d.count),
      backgroundColor: [
        '#6366f1', '#10b981', '#f59e0b', '#ef4444'
      ]
    }]
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Medical AI Assistant Dashboard</h1>
          <button 
            onClick={fetchData}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<Users className="text-indigo-600" />}
            title="Total Doctors"
            value={stats.totalDoctors}
            change={stats.growthRate}
            loading={loading}
          />
          <StatCard 
            icon={<Stethoscope className="text-green-600" />}
            title="Active Doctors"
            value={stats.activeDoctors}
            change={((stats.activeDoctors / stats.totalDoctors) * 100).toFixed(1)}
            suffix="%"
            loading={loading}
          />
          <StatCard 
            icon={<Activity className="text-blue-600" />}
            title="Consultations"
            value={stats.consultations}
            change={15.2}
            loading={loading}
          />
          <StatCard 
            icon={<Users className="text-amber-600" />}
            title="New Doctors"
            value={stats.newDoctors}
            change={stats.growthRate}
            loading={loading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">Consultation Trends</h2>
              <button className="text-gray-500 hover:text-gray-700">
                <Download className="w-5 h-5" />
              </button>
            </div>
            <div className="h-64">
              <Line 
                data={consultationChart}
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">Doctor Specialties</h2>
              <button className="text-gray-500 hover:text-gray-700">
                <Download className="w-5 h-5" />
              </button>
            </div>
            <div className="h-64">
              <Pie 
                data={specialtyChart}
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            </div>
          </div>
        </div>

        {/* Medical Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Image Analysis Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center">
              <ImageIcon className="text-indigo-600 mr-2" />
              <h2 className="font-semibold text-gray-800">Medical Image Analysis</h2>
            </div>
            
            <div className="p-4">
              {imagePreview ? (
                <div className="mb-4 relative">
                  <img 
                    src={imagePreview} 
                    alt="Uploaded medical scan" 
                    className="w-full h-48 object-contain border border-gray-200 rounded-lg"
                  />
                  <button 
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center mb-4 bg-gray-50">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Upload medical image (X-ray, MRI, etc.)</p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              <div className="flex space-x-2">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadedImage ? 'Change Image' : 'Select Image'}
                </button>
                <button
                  onClick={analyzeImage}
                  disabled={!uploadedImage}
                  className={`px-4 py-2 rounded-lg flex items-center justify-center ${uploadedImage ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Analyze
                </button>
              </div>
            </div>
          </div>

          {/* Symptom Analysis Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center">
              <MessageSquare className="text-indigo-600 mr-2" />
              <h2 className="font-semibold text-gray-800">Symptom Checker</h2>
            </div>
            
            <div className="p-4">
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms (e.g., fever, headache, pain location...)"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              
              <button
                onClick={diagnoseSymptoms}
                disabled={!symptoms.trim()}
                className={`w-full px-4 py-2 rounded-lg flex items-center justify-center ${symptoms.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Analyze Symptoms
              </button>
              
              <p className="text-xs text-gray-500 mt-2">
                Note: This is for informational purposes only and not a substitute for professional medical advice.
              </p>
            </div>
          </div>
        </div>

        {/* AI Report Assistant */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <MessageSquare className="text-indigo-600 mr-2" />
            <h2 className="font-semibold text-gray-800">AI Medical Assistant</h2>
          </div>
          
          {/* Chat Container */}
          <div className="h-64 overflow-y-auto p-4 bg-gray-50">
            {aiMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
                <p>Ask me about medical conditions, analyze images, or describe symptoms</p>
                <p className="text-sm mt-1">Try: "What could cause chest pain and shortness of breath?"</p>
              </div>
            ) : (
              aiMessages.map(msg => (
                <div key={msg.id} className={`mb-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.image && (
                    <div className="mb-2 inline-block max-w-xs">
                      <img 
                        src={msg.image} 
                        alt="Uploaded medical scan" 
                        className="border border-gray-200 rounded-lg"
                      />
                    </div>
                  )}
                  <div 
                    className={`inline-block px-4 py-2 rounded-lg ${msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                  >
                    {msg.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                    <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))
            )}
            {aiTyping && (
              <div className="flex items-center">
                <div className="bg-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleAIQuery} className="p-4 border-t border-gray-200">
            <div className="flex">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask medical questions or request analysis..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, change, suffix = '', loading }) => {
  const isPositive = parseFloat(change) >= 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
      <div className="flex justify-between">
        <div className="p-2 rounded-lg bg-gray-100">
          {icon}
        </div>
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <div className="text-2xl font-bold text-gray-900">
            {value}{suffix}
          </div>
        )}
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-500">{title}</h3>
      {loading ? (
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-2"></div>
      ) : (
        <div className="mt-3 flex items-center text-sm">
          {isPositive ? (
            <ArrowUp className="text-green-500 mr-1" />
          ) : (
            <ArrowDown className="text-red-500 mr-1" />
          )}
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {change}%
          </span>
          <span className="text-gray-500 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default TrusteeDashboard;