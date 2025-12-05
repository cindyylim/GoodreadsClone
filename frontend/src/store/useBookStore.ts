import { create } from 'zustand';
import { Book } from '@/types';

interface BookState {
  books: Book[];
  loading: boolean;
  error: string;
  searchTerm: string;
  page: number;
  totalPages: number;
  totalBooks: number;
  setBooks: (books: Book[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setSearchTerm: (term: string) => void;
  setPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setTotalBooks: (total: number) => void;
  addBook: (book: Book) => void;
  updateBook: (id: string, book: Partial<Book>) => void;
  removeBook: (id: string) => void;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  loading: false,
  error: '',
  searchTerm: '',
  page: 1,
  totalPages: 1,
  totalBooks: 0,
  
  setBooks: (books) => set({ books }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setPage: (page) => set({ page }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setTotalBooks: (totalBooks) => set({ totalBooks }),
  
  addBook: (book) => set((state) => ({ 
    books: [...state.books, book] 
  })),
  
  updateBook: (id, updatedBook) => set((state) => ({
    books: state.books.map(book => 
      book._id === id ? { ...book, ...updatedBook } : book
    )
  })),
  
  removeBook: (id) => set((state) => ({
    books: state.books.filter(book => book._id !== id)
  }))
}));