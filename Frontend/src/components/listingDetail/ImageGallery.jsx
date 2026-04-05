import React, { useState } from "react";

const ImageGallery = ({ images = [] }) => {
  const [index, setIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-200 rounded-2xl">
        No Image
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <img
          src={images[index].url}
          className="w-full h-[420px] object-cover"
        />

        <button
          onClick={() => setIndex(index === 0 ? images.length - 1 : index - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full"
        >
          ‹
        </button>

        <button
          onClick={() => setIndex(index === images.length - 1 ? 0 : index + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full"
        >
          ›
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {images.map((img, i) => (
          <img
            key={i}
            src={img.url}
            onClick={() => setIndex(i)}
            className={`h-20 w-28 object-cover rounded-lg cursor-pointer border ${
              i === index ? "border-black" : "border-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
