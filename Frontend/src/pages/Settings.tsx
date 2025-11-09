import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { LogOut, Save, User, Camera, AlertTriangle, X, Loader2 } from 'lucide-react';
import api from '../context/axios';
import { useUser } from '../hooks/useUser';

const Settings: React.FC = () => {
  const { user, getMyUser } = useUser();

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showRemoveAvatarModal, setShowRemoveAvatarModal] = useState(false);

  useEffect(() => {
    getMyUser()
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
      setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("username", formData.username);
      form.append("email", formData.email);
      form.append("bio", formData.bio);
      if(avatarFile) form.append("avatar", avatarFile);

      setLoading(true);
      const res = await api.put("/users/update-profile", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.msg);
      setTimeout(() => {setMessage('');}, 4000);

      getMyUser();
      setLoading(false);
      setAvatarFile(null);
    } catch (error: any) {
      setMessage(error.response.data.msg);
      setTimeout(() => {setMessage('');}, 4000);
      setLoading(false);
      setAvatarFile(null);
    }
  };

  const deleteAccount = async () => {
    try {
      setDeleteLoading(true);
      await api.delete("/users/delete-account");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error: any) {
      setMessage(error.response.data.msg);
      setTimeout(() => {setMessage('');}, 5000);
      setDeleteLoading(false);
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  }

  const handleAvatarChange = () => {
    const fileInput = document.getElementById('avatar-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          avatar_url: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value so the same file can be selected again if needed
    e.target.value = '';
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate('/login');
  };

  const handleRemoveAvatar = async () => {
    try {
      setLoading(true);
      const res = await api.delete("/users/delete-avatar");
      setMessage(res.data.msg);
      setTimeout(() => {setMessage('');}, 5000);
      getMyUser();
      HandleRemoveAvatarModal();
      setLoading(false);
    } catch (error: any) {
      setMessage(error.response.data.msg);
      setTimeout(() => {setMessage('');}, 5000);
      setLoading(false);
      HandleRemoveAvatarModal();
    }
  };

  const HandleRemoveAvatarModal = () => {
    setShowRemoveAvatarModal(!showRemoveAvatarModal);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hidden file input for avatar */}
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <Avatar src={formData.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser'} alt={formData.username} size="xl" />
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Profile Picture</h3>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                    onClick={handleAvatarChange}
                    disabled={loading}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Change</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={HandleRemoveAvatarModal}
                    disabled={loading || !formData.avatar_url || avatarFile !== null}  
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange(e)}
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-50 border border-green-200 text-green-600'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !formData.username || !formData.email}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </form>
        </Card>

        {/* Account Actions */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <LogOut className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Account Actions</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Sign Out</h3>
                <p className="text-sm text-gray-500">Sign out of your account</p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Sign Out
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={handleDeleteClick}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
              </div>
              <button
                onClick={handleDeleteCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> This will permanently delete:
                </p>
                <ul className="text-sm text-red-600 mt-2 list-disc list-inside">
                  <li>Your profile and personal information</li>
                  <li>All your posts and comments</li>
                  <li>Your account settings and preferences</li>
                  <li>All associated data</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                className="flex-1"
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={deleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Avatar Confirmation Modal */}
      {showRemoveAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Remove Profile Picture</h3>
              </div>
              <button
                onClick={HandleRemoveAvatarModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to remove your profile picture? This will set your avatar back to the default image.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-700">
                  <strong>Note:</strong> Your profile picture will be permanently removed and cannot be restored.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={HandleRemoveAvatarModal}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemoveAvatar}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : ''} {loading ? 'Removing...' : 'Remove Picture'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;