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

export const useBookStore = create<BookState>((set) => ({
  books: [],
  loading: false,
  error: '',
  searchTerm: '',
  page: 1,
  totalPages: 1,
  totalBooks: 0,
  
  setBooks: (books: Book[]) => set({ books }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string) => set({ error }),
  setSearchTerm: (searchTerm: string) => set({ searchTerm }),
  setPage: (page: number) => set({ page }),
  setTotalPages: (totalPages: number) => set({ totalPages }),
  setTotalBooks: (totalBooks: number) => set({ totalBooks }),
  
  addBook: (book: Book) => set((state) => ({
    books: [...state.books, book]
  })),
  
  updateBook: (id: string, updatedBook: Partial<Book>) => set((state) => ({
    books: state.books.map(book =>
      book._id === id ? { ...book, ...updatedBook } : book
    )
  })),
  
  removeBook: (id: string) => set((state) => ({
    books: state.books.filter(book => book._id !== id)
  }))
}));