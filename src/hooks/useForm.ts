import { ChangeEvent, useState } from "react";

/**
 * Hook para manejar estado de formularios de manera genérica.
 *
 * @param initialValues Valores iniciales del formulario.
 * @returns Un objeto con valores del formulario, actualizador y funciones helper.
 */
export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setValues(initialValues);
  }

  return {
    values,
    setValues,
    handleChange,
    resetForm,
  };
}
