import { create } from 'zustand';
import { BookshelfItem } from '@/types';

interface BookshelfState {
  bookshelf: BookshelfItem[];
  loading: boolean;
  error: string;
  addingToShelf: string | null;
  showStatusDropdown: string | null;
  setBookshelf: (bookshelf: BookshelfItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setAddingToShelf: (bookId: string | null) => void;
  setShowStatusDropdown: (bookId: string | null) => void;
  addToBookshelf: (item: BookshelfItem) => void;
  updateBookshelfItem: (id: string, item: Partial<BookshelfItem>) => void;
  removeFromBookshelf: (id: string) => void;
  filterByStatus: (status: string) => BookshelfItem[];
}

export const useBookshelfStore = create<BookshelfState>((set, get) => ({
  bookshelf: [],
  loading: false,
  error: '',
  addingToShelf: null,
  showStatusDropdown: null,
  
  setBookshelf: (bookshelf) => set({ bookshelf }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setAddingToShelf: (addingToShelf) => set({ addingToShelf }),
  setShowStatusDropdown: (showStatusDropdown) => set({ showStatusDropdown }),
  
  addToBookshelf: (item) => set((state) => ({ 
    bookshelf: [...state.bookshelf, item] 
  })),
  
  updateBookshelfItem: (id, updatedItem) => set((state) => ({
    bookshelf: state.bookshelf.map(item => 
      item._id === id ? { ...item, ...updatedItem } : item
    )
  })),
  
  removeFromBookshelf: (id) => set((state) => ({
    bookshelf: state.bookshelf.filter(item => item._id !== id)
  })),
  
  filterByStatus: (status) => {
    const { bookshelf } = get();
    return bookshelf.filter(item => item.status === status);
  }
}));