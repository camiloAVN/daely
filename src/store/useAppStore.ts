import { create } from "zustand";
import type { LeadErrors, LeadInput } from "@/lib/leads";

const emptyForm: LeadInput = { name: "", phone: "", email: "", instagram: "" };

type AppState = {
  /** El loading del vinilo ya se mostró en esta visita */
  introDone: boolean;
  finishIntro: () => void;

  form: LeadInput;
  errors: LeadErrors;
  setField: (field: keyof LeadInput, value: string) => void;
  setErrors: (errors: LeadErrors) => void;
  resetForm: () => void;

  /** Nombre del fan que acaba de registrarse (para personalizar la página de gracias) */
  fanName: string;
  setFanName: (name: string) => void;

  /** Modal secreto de acceso al dashboard */
  adminOpen: boolean;
  setAdminOpen: (open: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  introDone: false,
  finishIntro: () => set({ introDone: true }),

  form: emptyForm,
  errors: {},
  setField: (field, value) =>
    set((s) => ({
      form: { ...s.form, [field]: value },
      errors: { ...s.errors, [field]: undefined },
    })),
  setErrors: (errors) => set({ errors }),
  resetForm: () => set({ form: emptyForm, errors: {} }),

  fanName: "",
  setFanName: (fanName) => set({ fanName }),

  adminOpen: false,
  setAdminOpen: (adminOpen) => set({ adminOpen }),
}));
