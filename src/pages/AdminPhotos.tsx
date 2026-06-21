import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PhotoUploader from '../components/PhotoUploader';
import { Image as ImageIcon, Camera, ArrowLeft, Info, HelpCircle } from 'lucide-react';

export const AdminPhotos: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Retrieve any auto-selected memberId from query, e.g. /admin/photos?memberId=1003
  const preSelectedMemberId = useMemo(() => {
    return searchParams.get('memberId') || '';
  }, [searchParams]);

  return (
    <div id="admin-photos-page" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        
        {/* Navigation back and title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-850 pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Camera className="w-6 h-6 text-indigo-600" />
              Admin Photo Studio
            </h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider font-extrabold">
              Upload custom portraits, convert files to base64 encoding and bind them with family profile cards
            </p>
          </div>

          <button
            id="btn-photos-back-dash"
            onClick={() => navigate('/admin')}
            className="px-3.5 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-gray-50 transition-all self-start sm:self-center"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
        </div>

        {/* Portray Guidance Board */}
        <div id="photos-guidance-box" className="p-4.5 bg-indigo-50/70 dark:bg-indigo-950/25 border border-indigo-100/50 dark:border-indigo-900/25 text-indigo-800 dark:text-indigo-400 rounded-2xl text-xs space-y-2 shadow-sm">
          <div className="flex items-center gap-2 font-bold">
            <Info className="w-4.5 h-4.5" />
            <span className="uppercase tracking-wider">Historical Portrait Guidelines:</span>
          </div>
          <p className="leading-relaxed">
            Genealogical portraits are encoded directly inside Google Cloud storage as Base64 strings. For the best visual result inside tree nodes and profile sheets, utilize high contrast square-ratio images (JPG or PNG) with a resolution of 400x400px. Standard sizes should not exceed 3 Megabytes to maintain rapid database loading speeds.
          </p>
        </div>

        {/* Primary PhotoUploader wrapper card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-6 sm:p-8 rounded-3xl shadow-md">
          <PhotoUploader
            initialMemberId={preSelectedMemberId}
            onUploadSuccess={() => {
              // Success toast is shown by PhotoUploader, represent option here
              // We avoid forcing page redirections per user preference
              console.log('Member photo updated successfully! Staying on page.');
            }}
          />
        </div>

        {/* FAQs */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            Frequently Asked Questions (FAQs)
          </h3>
          <div className="space-y-3.5 text-xs text-gray-500 dark:text-zinc-400">
            <div>
              <span className="font-extrabold text-[#4a4947] dark:text-zinc-300 block">Can I overwrite a member's photo multiple times?</span>
              Yes! Submitting a new image automatically replaces the existing portrait URL linked to that member's row without disrupting secondary identity connections.
            </div>
            <div>
              <span className="font-extrabold text-[#4a4947] dark:text-zinc-300 block">Where are the files hosted?</span>
              Images are uploaded to Google Drive folder systems as cloud-hosted assets, returning public content-delivery links that bypass third-party restrictions.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPhotos;
