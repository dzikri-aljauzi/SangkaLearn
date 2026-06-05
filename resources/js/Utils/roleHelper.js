/**
 * Role Helper Utilities
 * Provides helper functions for role-based routing and permissions
 */

/**
 * Get route prefix based on user's role
 * @param {Object} user - User object from auth
 * @returns {string} - Route prefix (admin, student, instructor, subadmin)
 */
export const getRoutePrefix = (user) => {
    if (!user) {
        console.warn('No user provided to getRoutePrefix, defaulting to student');
        return 'student';
    }

    // Check if user has roles array
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
        const roleName = user.roles[0].name;

        switch (roleName) {
            case 'admin':
                return 'admin';
            case 'sub_admin':
                return 'subadmin';
            case 'instructor':
                return 'instructor';
            case 'student':
                return 'student';
            default:
                console.warn(`Unknown role: ${roleName}, defaulting to student`);
                return 'student';
        }
    }

    // Fallback: check role_name property
    if (user.role_name) {
        switch (user.role_name) {
            case 'admin':
                return 'admin';
            case 'sub_admin':
                return 'subadmin';
            case 'instructor':
                return 'instructor';
            case 'student':
                return 'student';
            default:
                console.warn(`Unknown role_name: ${user.role_name}, defaulting to student`);
                return 'student';
        }
    }

    console.warn('Could not determine user role, defaulting to student');
    return 'student';
};

/**
 * Get full route name for messaging
 * @param {Object} user - User object from auth
 * @param {string} routeName - Route name (e.g., 'messages.index', 'messages.create')
 * @returns {string} - Full route name with prefix (e.g., 'admin.messages.index')
 */
export const getMessageRoute = (user, routeName) => {
    const prefix = getRoutePrefix(user);
    return `${prefix}.${routeName}`;
};

/**
 * Get API URL for messaging
 * @param {Object} user - User object from auth
 * @param {string} path - API path (e.g., 'messages/1/send')
 * @returns {string} - Full API URL with prefix (e.g., '/admin/messages/1/send')
 */
export const getMessageApiUrl = (user, path) => {
    const prefix = getRoutePrefix(user);
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `/${prefix}/${cleanPath}`;
};

export default {
    getRoutePrefix,
    getMessageRoute,
    getMessageApiUrl
};
