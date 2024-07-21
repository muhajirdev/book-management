import { type SubmitHandler, useForm } from "react-hook-form";
import "./App.css";
import {
  type Atom,
  Provider,
  type PrimitiveAtom,
  atom,
  createStore,
  useAtom,
  useSetAtom,
} from "jotai";

const store = createStore();
type Book = {
  id: string;
  title: string;
  author: string;
  stock: number;
  price: number;
  img?: string;
};

const defaultBookImage = "https://biotrop.org/images/default-book.png";

const bookPool = new Map<string, Atom<Book>>();
const bookList = atom<string[]>([]);

const addInitialBooks = () => {
  if (localStorage.getItem("booksList") || localStorage.getItem("booksPools"))
    return;

  const bookListJson = JSON.stringify(["1", "2", "3", "4", "5"]);
  localStorage.setItem("booksList", bookListJson);

  const bookPoolsJson = JSON.stringify({
    "1": {
      id: "1",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      stock: 10,
      price: 50000,
      img: "https://marketplace.canva.com/EAFaQMYuZbo/1/0/1003w/canva-brown-rusty-mystery-novel-book-cover-hG1QhA7BiBU.jpg",
    },
    "2": {
      id: "2",
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      stock: 3,
      price: 100000,
      img: "https://marketplace.canva.com/EAFaQMYuZbo/1/0/1003w/canva-brown-rusty-mystery-novel-book-cover-hG1QhA7BiBU.jpg",
    },
    "3": {
      id: "3",
      title: "How to Win Friends and Influence People",
      author: "Dale Carnegie",
      stock: 10,
      price: 100000,
      img: "https://marketplace.canva.com/EAFaQMYuZbo/1/0/1003w/canva-brown-rusty-mystery-novel-book-cover-hG1QhA7BiBU.jpg",
    },
    "4": {
      id: "4",
      title: "Psychology of the Unconscious",
      author: "Carl Jung",
      stock: 10,
      price: 100000,
      img: "https://marketplace.canva.com/EAFaQMYuZbo/1/0/1003w/canva-brown-rusty-mystery-novel-book-cover-hG1QhA7BiBU.jpg",
    },
    "5": {
      id: "5",
      title: "Atomic Habits",
      author: "James Clear",
      stock: 5,
      price: 50000,
      img: "https://marketplace.canva.com/EAFaQMYuZbo/1/0/1003w/canva-brown-rusty-mystery-novel-book-cover-hG1QhA7BiBU.jpg",
    },
  });

  localStorage.setItem("booksPools", bookPoolsJson);
};

addInitialBooks();

const saveBooks = () => {
  // save book list
  const bookIds = store.get(bookList);
  const bookListJson = JSON.stringify(bookIds);
  localStorage.setItem("booksList", bookListJson);

  const bookPoolsJson = bookIds.reduce((acc, id) => {
    const bookAtom = bookPool.get(id);
    if (!bookAtom) return acc;
    const book = store.get(bookAtom);
    return {
      // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
      ...acc,
      [id]: book,
    };
  }, {});

  localStorage.setItem("booksPools", JSON.stringify(bookPoolsJson));
};

const loadBooks = () => {
  // load book pools
  const bookPoolsJson = localStorage.getItem("booksPools");
  if (!bookPoolsJson) return;
  const bookPools = JSON.parse(bookPoolsJson);

  console.log(typeof bookPools);

  // biome-ignore lint/complexity/noForEach: <explanation>
  Object.entries(bookPools).forEach(([id, book]) => {
    const bookAtom = atom<Book>(book as Book);
    bookPool.set(id, bookAtom);
  });

  // load book list
  const bookListJson = localStorage.getItem("booksList");
  if (!bookListJson) return;
  store.set(bookList, JSON.parse(bookListJson));
};

loadBooks();

const formatCurrency = (price: number) => {
  return price.toLocaleString("id-ID", {});
};

const useBook = (id: string) => {
  const bookAtom = bookPool.get(id);
  if (!bookAtom) {
    throw new Error("Book not found");
  }

  const [book] = useAtom(bookAtom);
  return book;
};

const BookCard = (props: { bookId: string }) => {
  const book = useBook(props.bookId);
  const setEditingId = useSetAtom(editingBookId);

  const onDelete = (id: string) => {
    store.set(bookList, (prev) => prev.filter((b) => b !== id));
    saveBooks();
  };

  return (
    <div className="flex flex-col items-start space-y-2 border rounded overflow-hidden relative group">
      <img
        className="overflow-hidden rounded max-w-full"
        src={book.img}
        alt={book.title}
      />
      <div className="space-y-2 px-2 py-2 flex flex-col justify-between flex-1 ">
        <div>
          <p className="font-bold">{book.title}</p>
          <p className="text-gray-500 text-sm">{book.author}</p>
        </div>
        <div>
          <p className="font-medium">Rp {formatCurrency(book.price)}</p>
          <p className="text-sm text-gray-600">Sisa {book.stock}</p>
        </div>
      </div>
      <div className="justify-between hidden group-hover:flex space-x-4 absolute px-2 w-full">
        <button
          type="button"
          className="text-white bg-black px-4 py-2 rounded-lg"
          onClick={() => setEditingId(book.id)}
        >
          Edit
        </button>
        <button
          type="button"
          className="text-white bg-red-500 px-4 py-2 rounded-lg"
          onClick={() => onDelete(book.id)}
        >
          Hapus
        </button>
      </div>
    </div>
  );
};

const RenderBooks = () => {
  const [booksIds] = useAtom(bookList);
  const [search] = useAtom(searchInput);

  const books = booksIds.map((id) => {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const bookAtom = bookPool.get(id)!;
    console.log("getting book", id, bookAtom);
    const book = store.get(bookAtom);
    console.log(book);
    return book;
  });

  const filteredBooks = books.filter((book) => {
    return book.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="grid grid-cols-3 gap-12">
      {filteredBooks.map((book) => {
        return <BookCard key={book.id} bookId={book.id} />;
      })}
    </div>
  );
};

const searchInput = atom("");

const SearchBar = () => {
  const [search, setSearch] = useAtom(searchInput);

  return (
    <input
      className="border rounded-lg px-4 py-2 w-full"
      type="text"
      placeholder="Cari Buku"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
};

const AddBook = () => {
  const setIsAdding = useSetAtom(isAddingBookAtom);
  return (
    <div className="flex flex-col items-center justify-center w-32">
      <button
        type="button"
        className="bg-black px-4 py-2 text-white rounded-lg block whitespace-pre"
        onClick={() => setIsAdding(true)}
      >
        Tambah Buku
      </button>
    </div>
  );
};

type BookInput = Omit<Book, "id">;
const BookForm = (props: {
  onSubmit: SubmitHandler<BookInput>;
  initialValues?: BookInput;
  submitLabel: string;
}) => {
  const { register, handleSubmit } = useForm<BookInput>({
    values: props.initialValues,
  });

  return (
    <form
      onSubmit={handleSubmit(props.onSubmit)}
      className="flex flex-col space-y-4"
    >
      <input
        className="border rounded-lg px-4 py-2 w-full"
        {...register("title", { required: true })}
        placeholder="Judul Buku"
      />
      <input
        className="border rounded-lg px-4 py-2 w-full"
        {...register("author", { required: true })}
        placeholder="Pengarang"
      />
      <input
        className="border rounded-lg px-4 py-2 w-full"
        type="number"
        {...register("stock", { valueAsNumber: true, required: true })}
        placeholder="Jumlah Stok"
      />
      <input
        className="border rounded-lg px-4 py-2 w-full"
        type="number"
        {...register("price", { valueAsNumber: true, required: true })}
        placeholder="Harga"
      />
      <input
        className="border rounded-lg px-4 py-2 w-full"
        {...register("img")}
        placeholder="URL Gambar"
      />
      <button
        type="submit"
        className="bg-black px-4 py-2 text-white rounded-lg block whitespace-pre"
      >
        {props.submitLabel}
      </button>
    </form>
  );
};

const isAddingBookAtom = atom(false);

const BookAddForm = () => {
  const [isAdding, setIsAdding] = useAtom(isAddingBookAtom);
  if (!isAdding) return null;
  return (
    <div className="fixed z-10 w-full h-full inset-0 flex items-center justify-center">
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        className="absolute w-full h-full bg-black opacity-50"
        onClick={() => setIsAdding(false)}
      />
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg space-y-4 relative">
        <div className="text-3xl">Tambah buku baru</div>
        <BookForm
          submitLabel="Tambah Buku"
          onSubmit={(data) => {
            const id = Math.random().toString(36).substring(2, 15);
            const book: Book = {
              id: id,
              title: data.title,
              author: data.author,
              stock: data.stock,
              price: data.price,
              img: data.img || defaultBookImage,
            };
            const bookAtom = atom(book);
            bookPool.set(id, bookAtom);
            store.set(bookList, (prev) => [...prev, id]);
            saveBooks();
            setIsAdding(false);
          }}
        />
      </div>
    </div>
  );
};

const editingBookId = atom<string | null>(null);

const BookEditFormContainer = () => {
  const [editingId] = useAtom(editingBookId);
  if (!editingId) return null;
  return <BookEditForm bookId={editingId} />;
};

const BookEditForm = (props: { bookId: string }) => {
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const bookAtom = bookPool.get(props.bookId)!;

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const [book] = useAtom(bookAtom!);
  const setEditingId = useSetAtom(editingBookId);

  return (
    <div className="fixed z-10 w-full h-full inset-0 flex items-center justify-center">
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        className="absolute w-full h-full bg-black opacity-50"
        onClick={() => setEditingId(null)}
      />
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg space-y-4 relative">
        <div className="text-3xl">Edit Buku</div>
        <BookForm
          submitLabel="Ubah Buku"
          initialValues={book}
          onSubmit={(data) => {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const bookAtom = bookPool.get(props.bookId)! as PrimitiveAtom<Book>;
            const book = store.get(bookAtom);
            const updatedBook = {
              ...book,
              ...data,
            };
            store.set(bookAtom, updatedBook);

            saveBooks();

            setEditingId(null);
          }}
        />
      </div>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <div className="max-w-3xl mx-auto py-12 space-y-4">
        <div className="w-full flex items-center space-x-4">
          <div className="flex-1">
            <SearchBar />
          </div>
          <AddBook />
        </div>
        <RenderBooks />
      </div>
      <BookAddForm />
      <BookEditFormContainer />
    </Provider>
  );
}

export default App;
