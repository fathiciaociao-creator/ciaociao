// src/store/useCheckout.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BRANDING } from '@/constants/branding';

interface CheckoutForm {
  name: string;
  phone: string;
  address: string;
  deliveryArea: string;
  notes: string;
  pickupTime: string;
  reservationPeople: number;
  reservationTime: string;
  orderType: 'DELIVERY' | 'PICKUP' | 'TABLE';
  selectedZoneId: string;
  couponCode: string;
  discountPercent: number;
}

interface CheckoutStore {
  form: CheckoutForm;
  setForm: (form: Partial<CheckoutForm>) => void;
  resetForm: () => void;
}

const initialForm: CheckoutForm = {
  name: '',
  phone: '',
  address: '',
  deliveryArea: '',
  notes: '',
  pickupTime: '',
  reservationPeople: 2,
  reservationTime: '',
  orderType: 'DELIVERY',
  selectedZoneId: '',
  couponCode: '',
  discountPercent: 0,
};

export const useCheckout = create<CheckoutStore>()(
  persist(
    (set) => ({
      form: initialForm,
      setForm: (newFields) => set((state) => ({ form: { ...state.form, ...newFields } })),
      resetForm: () => set({ form: initialForm }),
    }),
    {
      name: `${BRANDING.shortNameEn.toLowerCase()}-checkout-storage`,
    }
  )
);
