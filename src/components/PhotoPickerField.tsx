import React, { useId, useState } from 'react';
import { Camera, ImagePlus, Loader2, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDirectPhotoUrl } from '../utils';
import { ProcessedPhoto, formatBytes, processPhotoFile } from '../utils/image';

interface PhotoPickerFieldProps {
  /** Existing portrait (edit mode), shown until a new photo is picked */
  currentPhotoUrl?: string;
  memberName?: string;
  value: ProcessedPhoto | null;
  onChange: (photo: ProcessedPhoto | null) => void;
}

/**
 * Touch-first photo picker: explicit Take Photo (camera) and
 * Choose from Gallery buttons. Picked photos are compressed
 * on-device (see utils/image) and the size saving is shown.
 */
export const PhotoPickerField: React.FC<PhotoPickerFieldProps> = ({
  currentPhotoUrl,
  memberName,
  value,
  onChange,
}) => {
  const uid = useId().replace(/[:]/g, '');
  const cameraId = `camera-input-${uid}`;
  const galleryId = `gallery-input-${uid}`;
  const [processing, setProcessing] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setProcessing(true);
    try {
      const processed = await processPhotoFile(file);
      onChange(processed);
      if (processed.fallback) {
        toast('Photo could not be compressed on this device — original will be used.', { icon: '⚠️' });
      }
    } catch {
      toast.error('Could not read that photo. Please try another.');
    } finally {
      setProcessing(false);
    }
  };

  const shownUrl = value?.previewUrl || (currentPhotoUrl ? getDirectPhotoUrl(currentPhotoUrl) : '');

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center">
        {shownUrl ? (
          <img src={shownUrl} alt={memberName || 'Member portrait'} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-400 px-6">
            <ImagePlus className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm font-semibold">No portrait yet</p>
          </div>
        )}
        {value && (
          <span className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/65 text-white text-[11px] font-bold rounded-full">
            {formatBytes(value.originalBytes)} → {formatBytes(value.compressedBytes)}
          </span>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-black/55 text-white rounded-full"
            aria-label="Remove new photo"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <input id={cameraId} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
      <input id={galleryId} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      <div className="grid grid-cols-2 gap-2">
        <label
          htmlFor={cameraId}
          className="min-h-[52px] px-3 bg-amber-600 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] transition"
        >
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          Take Photo
        </label>
        <label
          htmlFor={galleryId}
          className="min-h-[52px] px-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-100 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition"
        >
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {value || currentPhotoUrl ? 'Change Photo' : 'From Gallery'}
        </label>
      </div>
      <p className="text-xs text-gray-400 text-center">
        Photos are resized &amp; compressed on your phone before upload.
      </p>
    </div>
  );
};

export default PhotoPickerField;
