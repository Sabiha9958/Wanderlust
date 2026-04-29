import React from "react";
import { MAX_IMAGES } from "../utils/formConstants";

const ImagesSection = ({
  formData,
  handleImageUpload,
  removeImage,
  fileInputRef,
  isUploading,
  uploadProgress,
  errors,
  touched,
  isBusy,
}) => {
  return (
    <section className="form-section">
      <div className="form-section-header">
        <h2 className="form-section-title mb-0">
          Property Photos <span className="text-red-500">*</span>
        </h2>
        <span className="form-badge">
          {formData.images.length}/{MAX_IMAGES}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        You must upload at least 2 images. The first image will be used as the
        cover photo.
      </p>

      <label
        className={`form-file-upload ${isBusy || formData.images.length >= MAX_IMAGES ? "disabled" : ""}`}
        style={
          touched.images && errors.images
            ? {
                borderColor: "var(--fi-danger)",
                background: "var(--fi-danger-light)",
              }
            : {}
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="form-file-input"
          disabled={isBusy || formData.images.length >= MAX_IMAGES}
        />
        <div className="form-file-content">
          <svg viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeWidth="2"
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
            />
          </svg>
          <div>
            <p>Click or drag to upload photos</p>
            <p className="subtext">
              {formData.images.length >= MAX_IMAGES
                ? "Maximum limit reached"
                : `Upload up to ${MAX_IMAGES - formData.images.length} more (JPG, PNG, WebP)`}
            </p>
          </div>
        </div>
      </label>

      {touched.images && errors.images && (
        <p className="form-field-error" style={{ marginTop: "12px" }}>
          ⚠ {errors.images}
        </p>
      )}

      {isUploading && (
        <div className="upload-progress">
          <div className="progress-header">
            <span className="fi-dot-pulse"></span> Uploading to cloud...
          </div>
          <div className="fi-progress-track">
            <div
              className="fi-progress-fill"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {formData.images.length > 0 && (
        <div className="form-image-grid mt-4">
          {formData.images.map((img, i) => (
            <div
              key={`${img.url}-${i}`}
              className={`form-image-card ${img.isCover ? "ring-2 ring-indigo-500" : ""}`}
            >
              <img
                src={img.url}
                alt={`Preview ${i + 1}`}
                loading="lazy"
                className="object-cover"
              />
              {img.isCover && (
                <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                  COVER
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="form-image-remove"
                disabled={isBusy}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ImagesSection;
