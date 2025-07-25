import { createContext, useContext, useEffect, useState } from "react";
import { retryFetch } from "../utils/retryFetch";
import { useUserContext } from "./UserContext";

const BooksContext = createContext();

export const BooksProvider = ({ children }) => {
  const { token, user, logout } = useUserContext();

  const [allBooks, setAllBooks] = useState([]);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);

  const fetchAllBooks = async () => {
    try {
      const res = await retryFetch(
        "https://libarybackend.vercel.app/books/?skip=0&limit=10000",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setAllBooks(data);
    } catch (err) {
      console.error("Error loading books:", err);
    }
  };

  const fetchBorrowHistory = async () => {
    try {
      const res = await retryFetch(
        "https://libarybackend.vercel.app/users/me/borrow_history/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setBorrowHistory(data);
      setBorrowedBooks(data.filter((b) => !b.returned_date));
      setReturnedBooks(data.filter((b) => b.returned_date));
    } catch (err) {
      console.error("Error loading borrow history:", err);
      logout();
    }
  };

  const reloadBooks = () => {
    fetchAllBooks();
    fetchBorrowHistory();
  };

  useEffect(() => {
    if (token && user) {
      fetchAllBooks();
      fetchBorrowHistory();
    }
  }, [token, user]);

  return (
    <BooksContext.Provider
      value={{
        allBooks,
        borrowedBooks,
        returnedBooks,
        borrowHistory,
        selectedBooks,
        setSelectedBooks,
        reloadBooks,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
};

export const useBooksContext = () => useContext(BooksContext);
