import imageCompression from "browser-image-compression";

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1, // Max 1MB
    maxWidthOrHeight: 1920, // Max width/height
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, {
      ...defaultOptions,
      ...options,
    });

    // If compression didn't help much, return original
    if (compressedFile.size >= file.size * 0.9) {
      return file;
    }

    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    // Return original if compression fails
    return file;
  }
}

export async function compressImages(
  files: File[],
  options?: CompressionOptions
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPG, PNG, and WebP are allowed.",
    };
  }

  // Check file size (10MB max before compression)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File is too large. Maximum size is 10MB.",
    };
  }

  return { valid: true };
}
