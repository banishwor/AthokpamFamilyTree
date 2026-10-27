import React, { useId, useRef, useState } from 'react';
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
  /**
   * large: full photo area + two buttons (creation flows).
   * compact: avatar row with a camera badge; tapping opens a
   * native-style bottom action sheet (one-screen edit screens).
   */
  variant?: 'large' | 'compact';
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
  variant = 'large',
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const uid = useId().replace(/[:]/g, '');
  const cameraId = `camera-input-${uid}`;
  const galleryId = `gallery-input-${uid}`;
  // Trigger the inputs via refs + real buttons. The previous
  // <label htmlFor> activation proved unreliable on Android
  // browsers (notably when the label unmounted mid-tap inside the
  // action sheet, the file dialog never opened).
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const openCamera = () => cameraRef.current?.click();
  const openGallery = () => galleryRef.current?.click();
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

  if (variant === 'compact') {
    return (
      <div>
        <input ref={cameraRef} id={cameraId} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        <input ref={galleryRef} id={galleryId} type="file" accept="image/*" onChange={handleFile} className="hidden" />

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="relative flex-shrink-0 active:scale-[0.97] transition"
            aria-label="Change portrait photo"
          >
            <span className="block w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
              {shownUrl ? (
                <img src={shownUrl} alt={memberName || 'Member portrait'} className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center">
                  <ImagePlus className="w-8 h-8 text-gray-400" />
                </span>
              )}
            </span>
            <span className="absolute bottom-0 right-0 w-8 h-8 bg-amber-600 border-2 border-white dark:border-zinc-900 rounded-full flex items-center justify-center">
              {processing ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
            </span>
          </button>
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-900 dark:text-white truncate">{memberName || 'Portrait'}</p>
            <p className="text-sm text-gray-400 mt-0.5">Tap the photo to change it</p>
            {value && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                New photo ready · {formatBytes(value.originalBytes)} → {formatBytes(value.compressedBytes)}
              </p>
            )}
          </div>
        </div>

        {sheetOpen && (
          <div className="fixed inset-0 z-[80] bg-black/50 flex items-end justify-center" onClick={() => setSheetOpen(false)}>
            <div className="w-full max-w-md p-3 pb-5 animate-sheet-up" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }} onClick={(e) => e.stopPropagation()}>
              <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
                <button type="button" onClick={() => { openCamera(); setSheetOpen(false); }} className="w-full min-h-[56px] px-5 flex items-center gap-3 text-base font-semibold text-gray-900 dark:text-white active:bg-gray-50 dark:active:bg-zinc-800 text-left">
                  <Camera className="w-5 h-5 text-amber-600" /> Take Photo
                </button>
                <div className="h-px bg-gray-100 dark:bg-zinc-800 mx-5" />
                <button type="button" onClick={() => { openGallery(); setSheetOpen(false); }} className="w-full min-h-[56px] px-5 flex items-center gap-3 text-base font-semibold text-gray-900 dark:text-white active:bg-gray-50 dark:active:bg-zinc-800 text-left">
                  <ImagePlus className="w-5 h-5 text-amber-600" /> Choose from Gallery
                </button>
                {value && (
                  <>
                    <div className="h-px bg-gray-100 dark:bg-zinc-800 mx-5" />
                    <button type="button" onClick={() => { onChange(null); setSheetOpen(false); }} className="w-full min-h-[56px] px-5 flex items-center gap-3 text-base font-semibold text-red-600 dark:text-red-400 text-left active:bg-red-50 dark:active:bg-red-950/20">
                      <X className="w-5 h-5" /> Remove New Photo
                    </button>
                  </>
                )}
              </div>
              <button type="button" onClick={() => setSheetOpen(false)} className="w-full min-h-[52px] mt-2 bg-white dark:bg-zinc-900 rounded-3xl text-base font-bold text-gray-700 dark:text-zinc-200">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

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

      <input ref={cameraRef} id={cameraId} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
      <input ref={galleryRef} id={galleryId} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={openCamera}
          className="min-h-[52px] px-3 bg-amber-600 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] transition"
        >
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          Take Photo
        </button>
        <button
          type="button"
          onClick={openGallery}
          className="min-h-[52px] px-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-100 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition"
        >
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {value || currentPhotoUrl ? 'Change Photo' : 'From Gallery'}
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center">
        Photos are resized &amp; compressed on your phone before upload.
      </p>
    </div>
  );
};

export default PhotoPickerField;
