import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface ModalFormProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleEditorChange?: (event: any, editor: any) => void;
  title: string;
  isAboutUs?: boolean;
}

const ModalForm: React.FC<ModalFormProps> = ({
  isOpen,
  onRequestClose,
  onSubmit,
  formData,
  handleChange,
  handleEditorChange,
  title,
  isAboutUs = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-auto">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl relative overflow-auto max-h-full">
        <button
          className="absolute top-2 right-2 text-gray-700"
          onClick={onRequestClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {isAboutUs && handleEditorChange && (
            <CKEditor
              editor={ClassicEditor}
              data={formData.about || ""}
              onChange={handleEditorChange}
            />
          )}
          <input
            type="date"
            name="born_date"
            placeholder="Born Date"
            value={formData.born_date || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="github"
            placeholder="GitHub"
            value={formData.github || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="linkedin"
            placeholder="LinkedIn"
            value={formData.linkedin || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="facebook"
            placeholder="Facebook"
            value={formData.facebook || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="twitter"
            placeholder="Twitter"
            value={formData.twitter || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="instagram"
            placeholder="Instagram"
            value={formData.instagram || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
