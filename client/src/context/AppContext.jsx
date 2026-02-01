import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiRequest } from "../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || 'http://localhost:3001';
axios.defaults.baseURL = API_BASE_URL;

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAdminLoading, setIsAdminLoading] = useState(true);
    const [shows, setShows] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);

    const navigate = useNavigate();

    const { user, isLoaded: isUserLoaded } = useUser();
    const { getToken } = useAuth();
    const location = useLocation();
    
    // Use refs to prevent multiple simultaneous admin checks and track checked user
    const isCheckingAdmin = useRef(false);
    const lastCheckedUserId = useRef(null);

    useEffect(() => {
        const checkAdminStatus = async () => {
            // If no user, reset admin status
            if (!user) {
                setIsAdmin(false);
                setIsAdminLoading(false);
                lastCheckedUserId.current = null;
                return;
            }

            // If we've already checked this user, don't check again
            if (lastCheckedUserId.current === user.id) {
                return;
            }

            // If already checking, don't start another check
            if (isCheckingAdmin.current) {
                return;
            }

            try {
                isCheckingAdmin.current = true;
                lastCheckedUserId.current = user.id;
                setIsAdminLoading(true);
                
                const token = await getToken();
                const data = await apiRequest("/api/admin/is-admin", {
                    method: 'GET',
                }, token);
                
                setIsAdmin(data.isAdmin);

                // Check location after setting admin status
                const currentPath = window.location.pathname;
                if (!data.isAdmin && currentPath.startsWith("/admin")) {
                    navigate("/");
                    toast.error("You are not authorized to access admin dashboard");
                }
            } catch (err) {
                // If the API returns 403 or any error, user is not admin
                console.error("Admin check error:", err);
                setIsAdmin(false);
                const currentPath = window.location.pathname;
                if (currentPath.startsWith("/admin")) {
                    navigate("/");
                    toast.error("You are not authorized to access admin dashboard");
                }
            } finally {
                setIsAdminLoading(false);
                isCheckingAdmin.current = false;
            }
        };

        checkAdminStatus();
    }, [user?.id]); // Only depend on user.id, not the whole user object


    const fetchShow = async () => {
        try {
            console.log("[AppContext] Fetching shows from /api/show/all");
            const data = await apiRequest("/api/show/all", {
                method: 'GET',
            });
            console.log("[AppContext] Shows API response:", {
                success: data?.success,
                showsCount: data?.shows?.length,
                shows: data?.shows
            });
            if(data.success){
                setShows(data.shows || []);
            }else{
                console.error("[AppContext] Shows API returned error:", data.message);
                toast.error(data.message || "Failed to fetch shows");
                setShows([]);
            }
        } catch (err) {
            console.error("[AppContext] Error fetching shows:", {
                error: err,
                errorMessage: err?.message,
                errorStack: err?.stack
            });
            toast.error(err.message || "Failed to fetch shows. Make sure the backend is running.");
            setShows([]);
        }
    }

    useEffect(() => {
        fetchShow();
    }, []);

    
    const fetchFavoriteMovies = useCallback(async () => {
        if (!user) return;
        
        try {
            const token = await getToken();
            const data = await apiRequest("/api/user/favorites", {
                method: 'GET',
            }, token);
            if(data.success){
                setFavoriteMovies(data.movies);
            } else {
                toast(data.message);
            }
        } catch (err) {
            console.error("Error fetching favorite movies:", err);
        }
    }, [user, getToken]);

    useEffect(() => {
        if (user) {
            fetchFavoriteMovies();
        }
    }, [user, fetchFavoriteMovies]);

    const value = {
        axios,
        user, isUserLoaded, getToken, navigate, isAdmin, isAdminLoading, shows,
        favoriteMovies, fetchFavoriteMovies, IMAGE_URL
    };
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext);