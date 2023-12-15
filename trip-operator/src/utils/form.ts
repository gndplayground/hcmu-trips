import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { ClassConstructor } from "class-transformer";

export function getClassValidatorResolver<
  T extends {
    [_: string]: any;
  }
>(c: ClassConstructor<T>) {
  return classValidatorResolver(c);
}

export function appendFormData(
  formData: FormData,
  data: any,
  parentKey?: string
) {
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      appendFormData(formData, item, `${parentKey}[${index}]`);
    });
  } else if (
    typeof data === "object" &&
    data !== null &&
    !(data instanceof File)
  ) {
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (parentKey) {
        appendFormData(formData, value, `${parentKey}.${key}`);
      } else {
        appendFormData(formData, value, key);
      }
    });
  } else if (parentKey) {
    const value = data == null ? "" : data;
    formData.append(parentKey, value);
  }
}
