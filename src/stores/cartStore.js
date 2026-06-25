import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,
      storeName: null,

      addItem: (product) => {
        const { items, storeId } = get();
        if (storeId && product.storeId && product.storeId !== storeId) {
          return { conflict: true, currentStoreName: get().storeName, newStoreName: product.storeName };
        }
        const existing = items.find((i) => i.productId === product.productId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product.productId
                ? { ...i, quantity: i.quantity + (product.quantity || 1) }
                : i
            ),
            storeId: product.storeId || storeId,
            storeName: product.storeName || get().storeName,
          });
        } else {
          set({
            items: [...items, { ...product, quantity: product.quantity || 1, selected: true }],
            storeId: product.storeId || storeId,
            storeName: product.storeName || get().storeName,
          });
        }
        return { conflict: false };
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter((i) => i.productId !== productId) });
        } else {
          set({ items: items.map((i) => (i.productId === productId ? { ...i, quantity } : i)) });
        }
      },

      removeItem: (productId) => {
        const newItems = get().items.filter((i) => i.productId !== productId);
        set({
          items: newItems,
          storeId: newItems.length > 0 ? get().storeId : null,
          storeName: newItems.length > 0 ? get().storeName : null,
        });
      },

      toggleSelect: (productId) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, selected: !i.selected } : i
          ),
        });
      },

      selectAll: () => set({ items: get().items.map((i) => ({ ...i, selected: true })) }),
      deselectAll: () => set({ items: get().items.map((i) => ({ ...i, selected: false })) }),

      clearCart: () => set({ items: [], storeId: null, storeName: null }),

      getSelectedItems: () => get().items.filter((i) => i.selected !== false),

      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
      get totalPrice() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
    }),
    { name: 'seapedia-cart' }
  )
);

export default useCartStore;
