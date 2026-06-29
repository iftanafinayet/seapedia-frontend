import { useState, useRef } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import api from '../../api/client';
import useUiStore from '../../stores/uiStore';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGES = 5;

export default function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try { return JSON.parse(value); } catch { return value ? [value] : []; }
  });
  const fileRef = useRef(null);
  const addNotification = useUiStore((s) => s.addNotification);

  const updateParent = (imgs) => {
    onChange(imgs.length > 0 ? JSON.stringify(imgs) : '');
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const slot = MAX_IMAGES - images.length;
    if (slot <= 0) return;

    const toUpload = files.slice(0, slot);
    let skipped = 0;
    setUploading(true);

    const results = await Promise.allSettled(
      toUpload.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          skipped++;
          return null;
        }
        const form = new FormData();
        form.append('image', file);
        const { data } = await api.post('/upload', form);
        return data.data.url;
      })
    );

    setUploading(false);

    if (skipped > 0) {
      addNotification(`${skipped} file(s) skipped (max 10MB each)`, 'warning');
    }

    const uploaded = results
      .filter((r) => r.status === 'fulfilled' && r.value)
      .map((r) => r.value);

    const errors = results.filter((r) => r.status === 'rejected');
    if (errors.length > 0) {
      const msgs = errors.map(r => r.reason?.response?.data?.message || r.reason?.message).filter(Boolean);
      addNotification(msgs[0] || `${errors.length} image(s) failed to upload`, 'error');
    }

    if (uploaded.length === 0) return;

    const newImages = [...images, ...uploaded];
    setImages(newImages);
    updateParent(newImages);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    updateParent(newImages);
  };

  return (
    <div>
      <label className="text-[14px] font-medium text-on-surface-variant mb-2 block">
        Product Images ({images.length}/{MAX_IMAGES})
      </label>
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-outline-variant">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <label className="flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary cursor-pointer transition-colors bg-surface-container-low">
            {uploading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4 text-outline mb-0.5" />
                <span className="text-[10px] text-on-surface-variant">Add</span>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}
