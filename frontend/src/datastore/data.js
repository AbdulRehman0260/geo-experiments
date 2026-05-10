import { create } from 'zustand'

export const useData = create((set) => ({
    dataLoad: null,
    updateData: (newData) => set({ dataLoad: newData }),
}))