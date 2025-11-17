import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index.jsx";
import "./index.css";

// 🧩 Redux imports
import { Provider } from "react-redux";
import store from "./redux/Store.js";

// 🎨 Theme Context
import { ThemeProvider } from "./context/ThemeContext";
import AuthInitializer from "./components/AuthInitializer.js";

// 🔔 React Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AuthInitializer>
          <RouterProvider router={router} />
          {/* Global Toast Container */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AuthInitializer>
      </ThemeProvider>
    </Provider>
  </StrictMode>
);