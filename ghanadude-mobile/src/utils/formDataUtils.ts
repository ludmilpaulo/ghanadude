// utils/formDataUtils.ts
export interface RNImageFile {
  uri: string;
  name: string;
  type: string;
}

export const appendImageToFormData = (
  formData: FormData,
  fieldName: string,
  image: RNImageFile | null,
) => {
  if (image) {
    formData.append(fieldName, image as unknown as Blob);
  }
};
