import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface CustomCKEditorProps {
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
}

const CustomCKEditor: React.FC<CustomCKEditorProps> = ({ description, setDescription }) => {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={description}
      onChange={(event, editor) => setDescription(editor.getData())}
    />
  );
};

export default CustomCKEditor;
