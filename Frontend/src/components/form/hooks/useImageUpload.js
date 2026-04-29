import { useState, useRef, useCallback } from "react";
import { MAX_IMAGES, CLOUDINARY_CONFIG } from "../utils/formConstants";
import { getFriendlyUploadError } from "../utils/formHelpers";

export const useImageUpload = (
  formData,
  setFormData,
  setErrors,
  setFormError,
  touched,
) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleImageUpload = useCallback(
    async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      const remainingSlots = MAX_IMAGES - formData.images.length;
      if (files.length > remainingSlots) {
        setFormError(
          `Maximum ${MAX_IMAGES} images allowed. You can add ${remainingSlots} more.`,
        );
        return;
      }

      setIsUploading(true);
      setFormError("");
      setUploadProgress(10);

      try {
        const uploadPromises = files.map(async (file) => {
          const formDataUpload = new FormData();
          formDataUpload.append("file", file);
          formDataUpload.append(
            "upload_preset",
            CLOUDINARY_CONFIG.uploadPreset,
          );

          const response = await fetch(CLOUDINARY_CONFIG.url, {
            method: "POST",
            body: formDataUpload,
          });

          if (!response.ok)
            throw new Error(getFriendlyUploadError(response.status));

          const data = await response.json();
          return {
            filename: data.original_filename || file.name,
            url: data.secure_url || data.url,
            isCover: false,
          };
        });

        const uploadedImages = await Promise.all(uploadPromises);

        setFormData((prev) => {
          const updatedImages = [...prev.images, ...uploadedImages];
          if (
            updatedImages.length > 0 &&
            !updatedImages.some((img) => img.isCover)
          ) {
            updatedImages[0].isCover = true;
          }
          if (updatedImages.length >= 2) {
            setErrors((e) => ({ ...e, images: "" }));
          }
          return { ...prev, images: updatedImages };
        });

        setUploadProgress(100);
      } catch (error) {
        setFormError(
          error.message || "Image upload failed. Please check your connection.",
        );
      } finally {
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [formData.images.length, setFormData, setErrors, setFormError],
  );

  const removeImage = useCallback(
    (index) => {
      setFormData((prev) => {
        const newImages = prev.images.filter((_, i) => i !== index);
        if (prev.images[index]?.isCover && newImages.length > 0) {
          newImages[0].isCover = true;
        }

        if (newImages.length < 2 && touched.images) {
          setErrors((e) => ({
            ...e,
            images: "At least two photos are required",
          }));
        }
        return { ...prev, images: newImages };
      });
    },
    [touched.images, setFormData, setErrors],
  );

  return {
    isUploading,
    uploadProgress,
    fileInputRef,
    handleImageUpload,
    removeImage,
  };
};
