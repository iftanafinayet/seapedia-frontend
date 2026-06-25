import { useState, useRef } from 'react';
import { Upload, X, Loader2, Plus } from 'lucide-react';
import api from '../../api/client';

export default function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try { return JSON.parse(value); } catch { return value ? [value] : []; }
  });
  const fileRef = useRef(null);
  const allImages = images;

  const updateParent = (imgs) => {
    onChange(imgs.length > 0 ? JSON.stringify(imgs) : '');
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const uploaded = [];
    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) continue;
        const form = new FormData();
        form.append('image', file);
        const { data } = await api.post('/upload', form);
        uploaded.push(data.data.url);
      }
      const newImages = [...allImages, ...uploaded];
      setImages(newImages);
      updateParent(newImages);
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = allImages.filter((_, i) => i !== index);
    setImages(newImages);
    updateParent(newImages);
  };

  return (
    <div>
      <label className="text-[14px] font-medium text-on-surface-variant mb-2 block">
        Product Images ({allImages.length}/5)
      </label>
      <div className="flex flex-wrap gap-3">
        {allImages.map((url, i) => (
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
        {allImages.length < 5 && (
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
