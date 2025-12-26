"use client";

import { useState } from "react";

interface Props {
  images: string[];
  title: string;
}

export function ListingImageGallery({ images, title }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <>
      {/* Main Image */}
      <div className="mb-4 overflow-hidden rounded-lg bg-white dark:bg-gray-800">
        <img
          src={images[selectedImage]}
          alt={title}
          className="h-96 w-full object-contain"
        />
      </div>

      {/* Thumbnail gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((img: string, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`h-20 w-full overflow-hidden rounded-lg ${
                selectedImage === index
                  ? "ring-2 ring-blue-500"
                  : "hover:opacity-75"
              }`}
            >
              <img
                src={img}
                alt={`${title} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
