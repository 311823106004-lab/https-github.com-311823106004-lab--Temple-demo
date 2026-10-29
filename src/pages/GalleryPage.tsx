import React, { useState, useEffect } from 'react';
import { Image, X, ZoomIn, Sparkles, Filter } from 'lucide-react';
import { GalleryImage } from '../types';
import { fetchGallery } from '../services/api';

export const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery()
      .then((data) => {
        setImages(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const categories = ['All', 'Sanctum & Rituals', 'Architecture', 'Festivals', 'Annadhanam'];

  const filteredImages = images.filter(
    (img) => selectedCategory === 'All' || img.category === selectedCategory
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Sacred Darshan
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white">
            Temple Photo Gallery
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Experience the divine visual splendor of Sri Amman Temple. Glimpse the 145-foot Dravidian
            Rajagopuram, auspicious deepam lamps, celestial festival processions, and sacred sevas.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-950 text-amber-300 shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-purple-900 border-t-amber-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Loading sacred gallery...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <Image className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No images found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setActiveImage(img)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Click to Enlarge</span>
                    </span>
                  </div>
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-amber-400/30">
                    {img.category}
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-cinzel text-base font-bold text-slate-900 group-hover:text-purple-950 transition-colors">
                    {img.title}
                  </h3>
                  {img.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {img.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[75vh] flex items-center justify-center bg-black">
              <img
                src={activeImage.url}
                alt={activeImage.title}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-6 bg-slate-900 text-white space-y-2 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-purple-900 text-purple-200">
                  {activeImage.category}
                </span>
                <h3 className="font-cinzel text-xl font-bold text-amber-300">
                  {activeImage.title}
                </h3>
              </div>
              {activeImage.description && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeImage.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
