// components/AuthInitializer.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { refreshAuth, setInitialCheckDone } from '../redux/slices/authSlice';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is authenticated from localStorage on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      dispatch(refreshAuth());
    } else {
      // If no token found, mark initial check as done
      dispatch(setInitialCheckDone(true));
    }
  }, [dispatch]);

  return children;
};

export default AuthInitializer;