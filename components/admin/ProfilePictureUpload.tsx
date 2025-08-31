'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { updateProfilePicture } from '@/lib/store/slices/authSlice';

interface ProfilePictureUploadProps {
  onUpdate?: () => void;
}

export function ProfilePictureUpload({ onUpdate }: ProfilePictureUploadProps) {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(user?.profile_picture_url || '');
  const [tempImageUrl, setTempImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state with Redux store when user changes
  useEffect(() => {
    const newImageUrl = user?.profile_picture_url || '';
    if (newImageUrl !== imageUrl) {
      console.log(
        'ProfilePictureUpload: Syncing local state with Redux store:',
        newImageUrl
      );
      setImageUrl(newImageUrl);
    }
  }, [user?.profile_picture_url, imageUrl]);

  // Refresh user data to ensure consistency
  const refreshUserData = async () => {
    if (!token) return;

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data refreshed:', data);
        // Check if we have valid user data
        if (data.data && data.data.profile_picture_url !== undefined) {
          const profilePictureUrl = data.data.profile_picture_url;
          console.log('Updating profile picture in store:', profilePictureUrl);
          dispatch(updateProfilePicture(profilePictureUrl));
        } else if (
          data.data &&
          data.data.user &&
          data.data.user.profile_picture_url !== undefined
        ) {
          const profilePictureUrl = data.data.user.profile_picture_url;
          console.log('Updating profile picture in store:', profilePictureUrl);
          dispatch(updateProfilePicture(profilePictureUrl));
        } else {
          console.log(
            'No profile picture URL found in response or user data is incomplete'
          );
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB');
      return;
    }

    // Create temporary URL for preview
    const tempUrl = URL.createObjectURL(file);
    setTempImageUrl(tempUrl);
  };

  const handleUrlInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempImageUrl(event.target.value);
  };

  const handleUpload = async () => {
    if (!tempImageUrl || !token) return;

    setIsUploading(true);
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

      // Check if this is a blob URL (file upload) or regular URL
      if (tempImageUrl.startsWith('blob:')) {
        // Convert blob URL to file and upload
        const response = await fetch(tempImageUrl);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append('file', blob, 'profile-picture.jpg');

        const uploadResponse = await fetch(
          `${backendUrl}/api/users/profile/picture/upload`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(
            errorData.error || 'Failed to upload profile picture'
          );
        }

        const data = await uploadResponse.json();
        console.log('Upload response:', data);

        // Safely extract the profile picture URL from the response
        let newProfilePictureUrl = tempImageUrl; // fallback to temp URL

        if (data.data && data.data.profile_picture_url) {
          newProfilePictureUrl = data.data.profile_picture_url;
        } else if (
          data.data &&
          data.data.user &&
          data.data.user.profile_picture_url
        ) {
          newProfilePictureUrl = data.data.user.profile_picture_url;
        } else if (data.user && data.user.profile_picture_url) {
          newProfilePictureUrl = data.user.profile_picture_url;
        } else if (data.profile_picture_url) {
          newProfilePictureUrl = data.profile_picture_url;
        }
        console.log('New profile picture URL:', newProfilePictureUrl);

        // Update local state
        setImageUrl(newProfilePictureUrl);

        // Update Redux store immediately for real-time header update
        dispatch(updateProfilePicture(newProfilePictureUrl));

        // Also refresh user data to ensure consistency
        await refreshUserData();
      } else {
        // Regular URL update
        const response = await fetch(
          `${backendUrl}/api/users/profile/picture`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              profile_picture_url: tempImageUrl,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Failed to update profile picture'
          );
        }

        const data = await response.json();
        console.log('URL update response:', data);

        // Update local state
        setImageUrl(tempImageUrl);

        // Update Redux store immediately for real-time header update
        dispatch(updateProfilePicture(tempImageUrl));

        // Also refresh user data to ensure consistency
        await refreshUserData();
      }

      setTempImageUrl('');

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('Profile picture updated successfully!');

      // Call the onUpdate callback to notify parent component
      if (onUpdate) {
        console.log('ProfilePictureUpload: Calling onUpdate callback');
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update profile picture'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!token) return;

    setIsUploading(true);
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

      const response = await fetch(`${backendUrl}/api/users/profile/picture`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_picture_url: '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove profile picture');
      }

      // Update local state
      setImageUrl('');

      // Update Redux store immediately for real-time header update
      dispatch(updateProfilePicture(''));

      // Also refresh user data to ensure consistency
      await refreshUserData();

      toast.success('Profile picture removed successfully!');

      // Call the onUpdate callback to notify parent component
      if (onUpdate) {
        console.log('ProfilePictureUpload: Calling onUpdate callback');
        onUpdate();
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to remove profile picture'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setTempImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasChanges = tempImageUrl !== (user?.profile_picture_url || '');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5" />
          <span>Profile Picture</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload or update your profile picture
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Profile Picture */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={imageUrl || undefined}
              alt={user?.name || 'Profile'}
            />
            <AvatarFallback className="text-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {imageUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
                className="mt-2"
              >
                <X className="h-4 w-4 mr-2" />
                Remove Picture
              </Button>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={tempImageUrl}
              onChange={handleUrlInput}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-file">Or upload from file</Label>
            <Input
              id="image-file"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              ref={fileInputRef}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </p>
          </div>

          {/* Preview */}
          {tempImageUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={tempImageUrl} alt="Preview" />
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || !hasChanges}
                    size="sm"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Update Picture
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isUploading}
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button for URL */}
          {tempImageUrl && !tempImageUrl.startsWith('blob:') && hasChanges && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Update Profile Picture
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
