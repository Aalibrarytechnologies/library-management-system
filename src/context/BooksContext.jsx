import { createContext, useContext, useState } from "react";

const BooksContext = createContext();

export const BooksProvider = ({ children }) => {
  const [selectedBooks, setSelectedBooks] = useState([]);

  return (
    <BooksContext.Provider value={{ selectedBooks, setSelectedBooks }}>
      {children}
    </BooksContext.Provider>
  );
};

export const useBooksContext = () => useContext(BooksContext);
