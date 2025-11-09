import React, { useState } from 'react';
import { Image, X } from 'lucide-react';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import Card from './ui/Card';
import api from '../context/axios';
import { useUser } from '../hooks/useUser';

const convertToBase64 = (file: File | null): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) return reject("No file provided");

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
};

interface CreatePostProps {
  reloadPosts?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ reloadPosts }) => {
  const { user } = useUser();
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [temp_file, setTempFile] = useState('');

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const post = new FormData();
      post.append("file", file as any);
      post.append("description", description);

      // Upload file and description
      const res = await api.post("/posts/create-post", post, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      reloadPosts?.();
      setMessage(res.data.msg);
      setTimeout(() => {setMessage('');}, 5000);
      // Reset form after successful post
      setDescription('');
      setFile(null);
      setTempFile('');
      setLoading(false);
    } catch (error: any) {
      setMessage(error.response.data.msg);
      setTimeout(() => {setMessage('');}, 5000);
      setLoading(false);
    }
  };

  const generateFileDescription = async () => {
    if (!file) return;
  
    setGenerating(true);
    try {
      setMessage("Analyzing image...");
      const base64Image = await convertToBase64(file);
  
      const res = await api.post("/posts/analyze-image", { image: base64Image });
  
      setDescription(res.data.description);
      setTimeout(() => {setMessage('');}, 3000);
    } catch (error: any) {
      console.log(error);
      setMessage("Error generating description");
      setTimeout(() => {setMessage('');}, 3000);
    } finally {
      setGenerating(false);
    }
  };

  const handleFileInput = () => {
    const fileInput = document.getElementById('media-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempFile(e.target?.result as string)
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value so the same file can be selected again if needed
    e.target.value = '';
  }

  const removeFile = () => {
    setFile(null);
    setTempFile('');
  }

  return (
    <Card className="p-6 mb-6">
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('success') || message.includes('created') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      <form onSubmit={createPost}>
        {/* File Preview */}
        {temp_file && (
          <div className="mb-4 flex justify-center">
            <div className="relative" style={{ width: '320px', height: '180px' }}>
              <div className="w-full h-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                {file?.type.startsWith('video/') ? (
                  <video
                    src={temp_file}
                    controls
                    className="w-full h-full object-contain"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                ) : (
                  <img
                    src={temp_file}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 p-1"
                onClick={removeFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex space-x-3 mb-4">
          <Avatar src={user?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} alt="user" size="md" />
          <div className="flex-1">
            <textarea
              placeholder="What's on your mind, user?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Hidden file input for media */}
            <input
              id="media-input"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-500"
              onClick={handleFileInput}
            >
              <Image className="w-5 h-5 mr-2" />
              Media
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            {file && !file.type.startsWith('video/') && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateFileDescription}
                disabled={!file || generating || loading}
                className="transition-all duration-200"
              >
                {generating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate Text'
                )}
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={loading || !file}
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default CreatePost;
