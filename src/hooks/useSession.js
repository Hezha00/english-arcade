import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { SessionManager } from '../utils/validation';

export const useSession = (timeoutMs = 3600000) => { // 1 hour default
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionManager] = useState(() => new SessionManager(timeoutMs));

    const checkSession = useCallback(async () => {
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();

            if (currentSession) {
                // Check if session is still valid
                const isValid = sessionManager.checkSession();
                if (isValid) {
                    setSession(currentSession);
                } else {
                    // Session expired, logout
                    await supabase.auth.signOut();
                    setSession(null);
                }
            } else {
                setSession(null);
            }
        } catch (error) {
            console.error('Session check error:', error);
            setSession(null);
        } finally {
            setLoading(false);
        }
    }, [sessionManager]);

    const logout = useCallback(async () => {
        try {
            await supabase.auth.signOut();
            sessionManager.logout();
            setSession(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, [sessionManager]);

    const refreshSession = useCallback(async () => {
        try {
            const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
            if (refreshedSession) {
                setSession(refreshedSession);
                sessionManager.updateActivity();
            }
        } catch (error) {
            console.error('Session refresh error:', error);
            await logout();
        }
    }, [sessionManager, logout]);

    useEffect(() => {
        checkSession();

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN') {
                    setSession(session);
                    sessionManager.updateActivity();
                } else if (event === 'SIGNED_OUT') {
                    setSession(null);
                } else if (event === 'TOKEN_REFRESHED') {
                    setSession(session);
                    sessionManager.updateActivity();
                }
            }
        );

        // Start activity monitoring
        sessionManager.startActivityMonitor();

        // Set up periodic session checks
        const interval = setInterval(() => {
            if (session) {
                const isValid = sessionManager.checkSession();
                if (!isValid) {
                    logout();
                }
            }
        }, 60000); // Check every minute

        return () => {
            subscription?.unsubscribe();
            clearInterval(interval);
        };
    }, [checkSession, logout, sessionManager, session]);

    return {
        session,
        loading,
        logout,
        refreshSession,
        isAuthenticated: !!session,
        user: session?.user || null
    };
};

export const useStudentSession = () => {
    const { session, loading, logout, isAuthenticated, user } = useSession();
    const [student, setStudent] = useState(null);
    const [studentLoading, setStudentLoading] = useState(true);

    useEffect(() => {
        const loadStudent = async () => {
            if (!isAuthenticated) {
                setStudent(null);
                setStudentLoading(false);
                return;
            }

            try {
                // Try to get from localStorage first
                const saved = localStorage.getItem('student');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setStudent(parsed);
                    setStudentLoading(false);
                    return;
                }

                // If not in localStorage, fetch from database
                const { data: studentData, error } = await supabase
                    .from('students')
                    .select('*')
                    .eq('auth_id', user.id)
                    .single();

                if (error) {
                    console.error('Error loading student:', error);
                    setStudent(null);
                } else {
                    setStudent(studentData);
                    localStorage.setItem('student', JSON.stringify(studentData));
                }
            } catch (error) {
                console.error('Student session error:', error);
                setStudent(null);
            } finally {
                setStudentLoading(false);
            }
        };

        loadStudent();
    }, [isAuthenticated, user]);

    const logoutStudent = useCallback(() => {
        localStorage.removeItem('student');
        setStudent(null);
        logout();
    }, [logout]);

    return {
        student,
        loading: loading || studentLoading,
        logout: logoutStudent,
        isAuthenticated: !!student,
        session,
        user
    };
};

export const useTeacherSession = () => {
    const { session, loading, logout, isAuthenticated, user } = useSession();
    const [teacher, setTeacher] = useState(null);
    const [teacherLoading, setTeacherLoading] = useState(true);

    useEffect(() => {
        const loadTeacher = async () => {
            if (!isAuthenticated) {
                setTeacher(null);
                setTeacherLoading(false);
                return;
            }

            try {
                const { data: teacherData, error } = await supabase
                    .from('teachers')
                    .select('*')
                    .eq('auth_id', user.id)
                    .single();

                if (error) {
                    console.error('Error loading teacher:', error);
                    setTeacher(null);
                } else {
                    setTeacher(teacherData);
                }
            } catch (error) {
                console.error('Teacher session error:', error);
                setTeacher(null);
            } finally {
                setTeacherLoading(false);
            }
        };

        loadTeacher();
    }, [isAuthenticated, user]);

    return {
        teacher,
        loading: loading || teacherLoading,
        logout,
        isAuthenticated: !!teacher,
        session,
        user
    };
}; 