import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaSave, FaUndo, FaInfoCircle } from 'react-icons/fa';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'security', 'notifications', 'appearance'
  
  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'EduConnect',
    siteDescription: 'A comprehensive education management system',
    contactEmail: 'admin@educonnect.com',
    supportPhone: '+1 (555) 123-4567',
    academicYear: '2023-2024',
    currentSemester: 'Spring',
    maintenanceMode: false,
    allowRegistration: true,
  });
  
  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    allowedIPs: '',
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notifyOnLogin: true,
    notifyOnPasswordChange: true,
    notifyOnProfileUpdate: false,
    notifyAdminOnNewUser: true,
    notifyTeacherOnAssignment: true,
  });
  
  // Appearance settings state
  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#8B5CF6',
    darkMode: false,
    sidebarCollapsed: false,
    showUserAvatars: true,
    enableAnimations: true,
    defaultFontSize: 'medium',
  });
  
  // Handle general settings change
  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // Handle security settings change
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
    });
  };
  
  // Handle notification settings change
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    });
  };
  
  // Handle appearance settings change
  const handleAppearanceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppearanceSettings({
      ...appearanceSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would save the settings to a backend
    toast.success('Settings saved successfully!');
  };
  
  // Reset settings to default
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      // In a real application, this would reset to default values from the backend
      toast.success('Settings reset to default values.');
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Page header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">System Settings</h1>
      </div>
      
      {/* Tab navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'general' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 hover:text-primary'}`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'security' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 hover:text-primary'}`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'notifications' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 hover:text-primary'}`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'appearance' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 hover:text-primary'}`}
          >
            Appearance
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow p-4 overflow-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">General Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                    <input
                      type="text"
                      name="siteName"
                      value={generalSettings.siteName}
                      onChange={handleGeneralChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                    <input
                      type="text"
                      name="siteDescription"
                      value={generalSettings.siteDescription}
                      onChange={handleGeneralChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={generalSettings.contactEmail}
                      onChange={handleGeneralChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
                    <input
                      type="text"
                      name="supportPhone"
                      value={generalSettings.supportPhone}
                      onChange={handleGeneralChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                    <input
                      type="text"
                      name="academicYear"
                      value={generalSettings.academicYear}
                      onChange={handleGeneralChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                    <select
                      name="currentSemester"
                      value={generalSettings.currentSemester}
                      onChange={handleGeneralChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Fall">Fall</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Winter">Winter</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      name="maintenanceMode"
                      checked={generalSettings.maintenanceMode}
                      onChange={handleGeneralChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                      Enable Maintenance Mode
                    </label>
                    <div className="ml-2 text-gray-500 cursor-pointer">
                      <FaInfoCircle title="When enabled, only administrators can access the site." />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowRegistration"
                      name="allowRegistration"
                      checked={generalSettings.allowRegistration}
                      onChange={handleGeneralChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-700">
                      Allow New User Registration
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Security Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Password Length</label>
                    <input
                      type="number"
                      name="passwordMinLength"
                      value={securitySettings.passwordMinLength}
                      onChange={handleSecurityChange}
                      min="6"
                      max="20"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      name="sessionTimeout"
                      value={securitySettings.sessionTimeout}
                      onChange={handleSecurityChange}
                      min="5"
                      max="120"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
                    <input
                      type="number"
                      name="maxLoginAttempts"
                      value={securitySettings.maxLoginAttempts}
                      onChange={handleSecurityChange}
                      min="3"
                      max="10"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allowed IP Addresses (comma separated)</label>
                    <input
                      type="text"
                      name="allowedIPs"
                      value={securitySettings.allowedIPs}
                      onChange={handleSecurityChange}
                      placeholder="Leave empty to allow all IPs"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="passwordRequireUppercase"
                      name="passwordRequireUppercase"
                      checked={securitySettings.passwordRequireUppercase}
                      onChange={handleSecurityChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="passwordRequireUppercase" className="ml-2 block text-sm text-gray-700">
                      Require Uppercase Letters in Passwords
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="passwordRequireNumbers"
                      name="passwordRequireNumbers"
                      checked={securitySettings.passwordRequireNumbers}
                      onChange={handleSecurityChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="passwordRequireNumbers" className="ml-2 block text-sm text-gray-700">
                      Require Numbers in Passwords
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="passwordRequireSymbols"
                      name="passwordRequireSymbols"
                      checked={securitySettings.passwordRequireSymbols}
                      onChange={handleSecurityChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="passwordRequireSymbols" className="ml-2 block text-sm text-gray-700">
                      Require Symbols in Passwords
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="twoFactorAuth"
                      name="twoFactorAuth"
                      checked={securitySettings.twoFactorAuth}
                      onChange={handleSecurityChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="twoFactorAuth" className="ml-2 block text-sm text-gray-700">
                      Enable Two-Factor Authentication
                    </label>
                    <div className="ml-2 text-gray-500 cursor-pointer">
                      <FaInfoCircle title="When enabled, users will be required to verify their identity using a second method." />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      name="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                      Enable Email Notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      name="smsNotifications"
                      checked={notificationSettings.smsNotifications}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-700">
                      Enable SMS Notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pushNotifications"
                      name="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-700">
                      Enable Push Notifications
                    </label>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">Notification Events</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyOnLogin"
                      name="notifyOnLogin"
                      checked={notificationSettings.notifyOnLogin}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="notifyOnLogin" className="ml-2 block text-sm text-gray-700">
                      Notify on New Login
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyOnPasswordChange"
                      name="notifyOnPasswordChange"
                      checked={notificationSettings.notifyOnPasswordChange}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="notifyOnPasswordChange" className="ml-2 block text-sm text-gray-700">
                      Notify on Password Change
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyOnProfileUpdate"
                      name="notifyOnProfileUpdate"
                      checked={notificationSettings.notifyOnProfileUpdate}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="notifyOnProfileUpdate" className="ml-2 block text-sm text-gray-700">
                      Notify on Profile Update
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyAdminOnNewUser"
                      name="notifyAdminOnNewUser"
                      checked={notificationSettings.notifyAdminOnNewUser}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="notifyAdminOnNewUser" className="ml-2 block text-sm text-gray-700">
                      Notify Admin on New User Registration
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyTeacherOnAssignment"
                      name="notifyTeacherOnAssignment"
                      checked={notificationSettings.notifyTeacherOnAssignment}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="notifyTeacherOnAssignment" className="ml-2 block text-sm text-gray-700">
                      Notify Teacher on New Assignment Submission
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Appearance Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        name="primaryColor"
                        value={appearanceSettings.primaryColor}
                        onChange={handleAppearanceChange}
                        className="h-10 w-10 border-0 rounded p-0"
                      />
                      <input
                        type="text"
                        name="primaryColor"
                        value={appearanceSettings.primaryColor}
                        onChange={handleAppearanceChange}
                        className="ml-2 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        name="secondaryColor"
                        value={appearanceSettings.secondaryColor}
                        onChange={handleAppearanceChange}
                        className="h-10 w-10 border-0 rounded p-0"
                      />
                      <input
                        type="text"
                        name="secondaryColor"
                        value={appearanceSettings.secondaryColor}
                        onChange={handleAppearanceChange}
                        className="ml-2 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        name="accentColor"
                        value={appearanceSettings.accentColor}
                        onChange={handleAppearanceChange}
                        className="h-10 w-10 border-0 rounded p-0"
                      />
                      <input
                        type="text"
                        name="accentColor"
                        value={appearanceSettings.accentColor}
                        onChange={handleAppearanceChange}
                        className="ml-2 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Font Size</label>
                    <select
                      name="defaultFontSize"
                      value={appearanceSettings.defaultFontSize}
                      onChange={handleAppearanceChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="darkMode"
                      name="darkMode"
                      checked={appearanceSettings.darkMode}
                      onChange={handleAppearanceChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700">
                      Enable Dark Mode
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sidebarCollapsed"
                      name="sidebarCollapsed"
                      checked={appearanceSettings.sidebarCollapsed}
                      onChange={handleAppearanceChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="sidebarCollapsed" className="ml-2 block text-sm text-gray-700">
                      Collapse Sidebar by Default
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showUserAvatars"
                      name="showUserAvatars"
                      checked={appearanceSettings.showUserAvatars}
                      onChange={handleAppearanceChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="showUserAvatars" className="ml-2 block text-sm text-gray-700">
                      Show User Avatars
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableAnimations"
                      name="enableAnimations"
                      checked={appearanceSettings.enableAnimations}
                      onChange={handleAppearanceChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="enableAnimations" className="ml-2 block text-sm text-gray-700">
                      Enable UI Animations
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Form actions */}
            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <FaUndo />
                Reset to Default
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                <FaSave />
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;