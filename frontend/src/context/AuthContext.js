import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchIdRef = useRef(0);

    const fetchProfile = useCallback(async (userId, userMetadata = null, email = null) => {
        const thisFetchId = ++fetchIdRef.current;
        console.log(`[Auth] Fetching profile for ${userId} (Fetch ID: ${thisFetchId})`);

        try {
            // 1. Try to fetch existing profile
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            // If a newer fetch has started, ignore this one
            if (thisFetchId !== fetchIdRef.current) return;

            if (data) {
                console.log(`[Auth] Profile found. Role: ${data.role}`);
                setRole(data.role);
                return;
            }

            // 2. If no profile, check metadata for auto-creation
            if (error && error.code === 'PGRST116') {
                console.log("[Auth] No profile record found. checking metadata...");
                const metadataRole = userMetadata?.role;

                if (metadataRole) {
                    console.log(`[Auth] Creating profile from metadata role: ${metadataRole}`);
                    const { data: newData, error: insertError } = await supabase
                        .from('profiles')
                        .upsert([{
                            id: userId,
                            role: metadataRole,
                            email: email || userMetadata?.email || null
                        }])
                        .select();

                    if (!insertError && newData && newData.length > 0) {
                        setRole(newData[0].role);
                        return;
                    } else if (insertError) {
                        console.error("[Auth] Metadata upsert failed:", insertError);
                    }
                }
                console.log("[Auth] No role found in metadata either.");
                setRole(null);
            } else if (error) {
                console.warn("[Auth] Profile fetch error:", error.message);
                setRole(null);
            }
        } catch (err) {
            console.error("[Auth] Unexpected fetch profile failure:", err);
            setRole(null);
        } finally {
            if (thisFetchId === fetchIdRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        // Consolidate both initial session and auth changes
        const setupAuth = async () => {
            const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
            if (isMounted) {
                if (sessionError) {
                    console.error("[Auth] Session fetch error:", sessionError);
                    setLoading(false);
                    return;
                }

                setSession(initialSession);
                const currentUser = initialSession?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    console.log("[Auth] Initial Session user detected:", currentUser.id);
                    // CRITICAL: Set role from metadata immediately if available
                    // This fixes the "First Go" issue by making the role available instantly
                    const metadataRole = currentUser.user_metadata?.role;
                    if (metadataRole) {
                        console.log(`[Auth] Pre-setting role from metadata: ${metadataRole}`);
                        setRole(metadataRole);
                    }

                    // Fetch profile to verify/persist
                    await fetchProfile(currentUser.id, currentUser.user_metadata, currentUser.email);
                } else {
                    setLoading(false);
                }
            }
        };

        setupAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;
            console.log(`[Auth] Auth event: ${event}`);

            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                // If it's a login/signup, ensure we start with a clean loading state if needed
                // OR just use the metadata role instantly
                const metadataRole = currentUser.user_metadata?.role;
                if (metadataRole) {
                    console.log(`[Auth] Syncing role from metadata on event: ${metadataRole}`);
                    setRole(metadataRole);
                }
                await fetchProfile(currentUser.id, currentUser.user_metadata, currentUser.email);
            } else {
                setRole(null);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const value = {
        session,
        user,
        role,
        refreshRole: () => user ? fetchProfile(user.id) : null,
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
