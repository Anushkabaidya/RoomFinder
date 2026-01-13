import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchIdRef = useRef(0);

    const fetchProfile = async (userId, userMetadata = null, email = null) => {
        const thisFetchId = ++fetchIdRef.current;

        try {
            // 1. Try to fetch existing profile
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            // If a newer fetch has started, ignore this one
            if (thisFetchId !== fetchIdRef.current) return;

            if (error && error.code === 'PGRST116') {
                const metadataRole = userMetadata?.role;

                if (metadataRole) {
                    const { data: newData, error: insertError } = await supabase
                        .from('profiles')
                        .insert([{
                            id: userId,
                            role: metadataRole,
                            email: email || userMetadata?.email || null
                        }])
                        .select();

                    if (!insertError && newData && newData.length > 0) {
                        setRole(newData[0].role);
                        return;
                    }
                }
                setRole(null);
            } else if (error) {
                console.warn("Profile fetch error:", error.message);
                setRole(null);
            } else {
                setRole(data?.role);
            }
        } catch (err) {
            if (err.name === 'AbortError') return; // Silence abort errors
            console.error("Fetch profile failed:", err);
            setRole(null);
        }
    };

    useEffect(() => {
        let isMounted = true;

        // Consolidate both initial session and auth changes
        const setupAuth = async () => {
            const { data: { session: initialSession } } = await supabase.auth.getSession();
            if (isMounted) {
                setSession(initialSession);
                setUser(initialSession?.user ?? null);
                if (initialSession?.user) {
                    await fetchProfile(initialSession.user.id, initialSession.user.user_metadata, initialSession.user.email);
                }
                setLoading(false);
            }
        };

        setupAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id, session.user.user_metadata, session.user.email);
            } else {
                setRole(null);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const value = {
        session,
        user,
        role,
        refreshRole: () => fetchProfile(user?.id),
        signOut: () => supabase.auth.signOut(),
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
