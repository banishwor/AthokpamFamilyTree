import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Member } from '../types';
import SearchableSelect from './SearchableSelect';
import { sortedByName } from '../utils/memberSave';
import { Camera, Image as ImageIcon, Loader2, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PhotoUploaderProps {
  initialMemberId?: string;
  membersList?: Member[];
  onUploadSuccess?: () => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  initialMemberId = '',
  membersList = [],
  onUploadSuccess,
}) => {
  const [members, setMembers] = useState<Member[]>(membersList);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMemberId);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64String, setBase64String] = useState<string | null>(null);

  // Load members if not provided
  useEffect(() => {
    if (membersList.length > 0) {
      setMembers(membersList);
    } else {
      const load = async () => {
        setLoadingMembers(true);
        try {
          const list = await apiService.getMembers();
          if (Array.isArray(list)) {
            setMembers(list);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingMembers(false);
        }
      };
      load();
    }
  }, [membersList.length]);

  useEffect(() => {
    if (initialMemberId) {
      setSelectedMemberId(initialMemberId);
    }
  }, [initialMemberId]);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, JPEG)');
      return;
    }

    // Limit size if needed, but Base64 limits are soft. Let's do a warning for huge files (>3MB) but process them.
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image is larger than 3MB. Please upload a smaller image.');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      // Remove header from base64 string
      const fullBase64 = reader.result as string;
      const base64Content = fullBase64.split(',')[1];
      setBase64String(base64Content);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMemberId) {
      toast.error('Please select a family member first.');
      return;
    }

    if (!base64String || !selectedFile) {
      toast.error('Please select or drag an image to upload.');
      return;
    }

    setUploading(true);
    const uploadToast = toast.loading('Converting image and uploading to cloud storage...');

    try {
      // 1. Call uploadPhoto with base64 and filename
      const uploadRes = await apiService.uploadPhoto(base64String, selectedFile.name);

      const photoUrl = uploadRes.fileUrl || uploadRes.photoUrl;

      if (!uploadRes.success || !photoUrl) {
        throw new Error(uploadRes.message || 'Failed to upload photo file.');
      }

      // 2. Call updateMemberPhoto to bind payload to member
      const updateRes = await apiService.updateMemberPhoto(selectedMemberId, photoUrl);

      if (!updateRes.success) {
        throw new Error(updateRes.message || 'Failed to link uploaded photo to member profile.');
      }

      toast.success('Member photo updated successfully!', { id: uploadToast });

      // Reset state on success
      setSelectedFile(null);
      setPreviewUrl(null);
      setBase64String(null);

      // Re-load list so the updated member has the correct photoUrl in dropdown lists
      try {
        const list = await apiService.getMembers();
        if (Array.isArray(list)) {
          setMembers(list);
        }
      } catch (err) {
        console.error('Failed to reload members list after photo update', err);
      }

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred during upload progression.', { id: uploadToast });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form id="photo-upload-form" onSubmit={handleUploadSubmit} className="space-y-6">
      {/* 1. Member Selector */}
      <div id="member-select-block" className="space-y-2">
        <label htmlFor="upload-member-select" className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider block">
          1. Select Family Member
        </label>
        {loadingMembers ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span>Loading members list...</span>
          </div>
        ) : (
          <SearchableSelect
            id="upload-member-select"
            value={selectedMemberId}
            onChange={setSelectedMemberId}
            emptyLabel="-- Choose Member to Update --"
            placeholder="Choose member to update"
            disabled={!!initialMemberId}
            options={sortedByName(members).map((m) => ({ id: String(m.id), name: `${m.firstName} ${m.middleName ? `${m.middleName} ` : ''}${m.lastName}` }))}
          />
        )}
      </div>

      {/* 2. Drag & Drop File Container */}
      <div id="image-dropzone-block" className="space-y-2">
        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider block">
          2. Choose Image
        </label>

        <div
          id="photo-dragzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center transition-all ${
            dragOver
              ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/10'
              : previewUrl
              ? 'border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/50'
              : 'border-gray-300 dark:border-zinc-700 hover:border-amber-500/50 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30'
          }`}
        >
          {previewUrl ? (
            <div id="photo-upload-preview" className="space-y-4">
              <div className="relative inline-block w-40 h-40 rounded-full border-4 border-white dark:border-zinc-800 shadow-lg overflow-hidden group">
                <img
                  src={previewUrl}
                  alt="Selected Preview"
                  className="w-full h-full object-cover"
                />
                <label
                  htmlFor="change-photo-input"
                  className="absolute inset-0 flex items-end justify-center cursor-pointer"
                >
                  <span className="mb-2 px-3 py-1.5 bg-black/65 text-white text-xs font-bold rounded-full">
                    Change Image
                  </span>
                  <input
                    id="change-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-xs text-gray-500 dark:text-zinc-400">
                <span className="font-semibold text-gray-700 dark:text-zinc-200 block">
                  {selectedFile?.name}
                </span>
                {(selectedFile!.size / 1024).toFixed(1)} KB
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 dark:bg-zinc-800 rounded-full text-amber-600 dark:text-amber-400 inline-block">
                <Camera className="w-8 h-8" />
              </div>
              <div className="text-sm font-semibold text-gray-600 dark:text-zinc-300">
                <span className="hidden sm:inline">Drag and drop your image here, or</span>
                <span className="sm:hidden">Take a photo or pick one from your gallery</span>
              </div>
              <label className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 bg-amber-600 hover:bg-amber-700 text-white text-base font-extrabold rounded-xl cursor-pointer shadow-md">
                <Camera className="w-5 h-5" />
                Choose Photo
                <input
                  id="hidden-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
              <div className="text-[11px] text-gray-400 dark:text-zinc-500">
                Supports JPG, JPEG, and PNG files up to 3MB
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Action Block */}
      <button
        id="btn-photo-upload-submit"
        type="submit"
        disabled={uploading || !selectedMemberId || !base64String}
        className="w-full min-h-[52px] py-3.5 text-base bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-zinc-600 text-white font-extrabold rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Uploading & Associating...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Upload Member Photo
          </>
        )}
      </button>
    </form>
  );
};

export default PhotoUploader;
