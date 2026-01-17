import React, { useState, useEffect } from "react";
import { Outlet } from "react-router"; 
import { useDispatch } from "react-redux";
import { Login, Logout } from "./store/feature/auth.js";

// Imports now resolve correctly because the files exist
import Header from "./Header.jsx"; 
import fetchData from "./apiClient"; 

function App() {
  const Dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check user session on App load (Refresh)
    const getCurrentUser = async () => {
      try {
        const response = await fetchData(
          "GET",
          "http://localhost:5000/api/v1/users/current-user"
        );

        if (response !== undefined) {
          // console.log(response);
          
          Dispatch(Login(response.Data));
          
        } else {
          Dispatch(Logout());
        }
      // console.log(response);
      // console.log(response.Data);
      
      } catch (error) {
        console.log("No active session found (User needs to login).");
        Dispatch(Logout());
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []); 

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
        <p className="text-xl animate-pulse">Starting App...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;