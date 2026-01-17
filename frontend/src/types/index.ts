export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  genres?: string[];
  averageRating?: number;
  publishedYear?: number;
  addedToShelf?: boolean;
  shelfStatus?: string;
  isExternal?: boolean;
}

export interface BookshelfItem {
  _id: string;
  user: string;
  book: Book;
  status: 'read' | 'currently-reading' | 'want-to-read';
  rating?: number;
  review?: string;
  dateAdded: string;
  dateRead?: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  tags: string[];
  members: User[];
  createdBy: User;
  createdAt: string;
}

export interface Post {
  _id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Topic {
  _id: string;
  title: string;
  group: Group;
  author: User;
  posts: Post[];
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}
