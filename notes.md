Overall Flow When Using Context

- Initialization:
  When your application starts, you wrap your component tree (or part of it) with <AuthProvider>.
- Context Availability:
  Every component within this tree can call useAuth() to fetch the latest authentication details.
- Reacting to Changes:
  As the authentication state changes (e.g., when a user logs in or logs out), the state inside AuthProvider updates, which then automatically updates any component consuming this state through useAuth().
- Managing Loading State:
  The loading property helps components understand when the authentication data is still being fetched. This is useful to display spinners or loading screens before showing sensitive parts of your UI.

In Summary

- createContext sets up a shared state container. here: AuthContext will be share
- useContext lets any component access the value stored in that container. here: AuthContext will be accessed
- AuthProvider is responsible for obtaining the initial auth state, listening for changes from Supabase, and providing the state to the rest of your application.
- useAuth is a custom hook that abstracts away the context consumption, ensuring it’s used properly within a provider.
  This pattern is excellent for managing global state in a React application because it decouples the data-fetching logic (authentication, in this case) from the UI components

         [ App ]
            |
      -----------------
      |  AuthProvider  |
      -----------------
            |
   ----------------------                  <-- Provides auth data (user, session, loading)
   |                    |
[ Child Component A ]  [ Child Component B ]
          |                   |
          +---- useAuth() --- +


Explanation in Simple Words
- AuthProvider:
- Think of the AuthProvider as the parent that holds important data, like who is logged in (user), session details, and a flag for loading (true/false).
- It talks to Supabase to check if someone is already signed in or if anything changes later (like logging in or out).
- AuthContext:
- The AuthContext is like a mailbox that the AuthProvider fills with the current authentication data.
- All child components (smaller parts of the app) that need to know if a user is logged in can get this data from the mailbox.
- useAuth (Custom Hook):
- useAuth is a shortcut function that helps child components read the data from the AuthContext easily.
- Instead of reaching into the mailbox every time, components simply call useAuth() and get the current auth info.
- Child Components:
- These parts of your app (like pages or widgets) want to know if a user is logged in to display the right content.
- By calling useAuth(), they can quickly check if the user is there and act accordingly (for example, show a login page if no user, or display user details if logged in).

This diagram and explanation show the basic flow:
- The AuthProvider wraps around your app.
- It gathers and holds authentication data.
- Child components use useAuth to get access to that data anytime they need it.



