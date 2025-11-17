import { motion } from 'framer-motion';
import { Link, useRouteError } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6"
    >
      <div className="text-center">
        <motion.h1
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-9xl font-bold text-gray-300 dark:text-gray-600 mb-4"
        >
          404
        </motion.h1>
        
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
          Sorry, we couldn't find the page you're looking for.
        </p>
        
        <Link
          to="/"
          className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </motion.div>
  );
};

export default ErrorPage;