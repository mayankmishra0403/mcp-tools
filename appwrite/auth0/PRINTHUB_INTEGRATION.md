# Auth0 MCP Server Integration with PrintHub

Complete guide for integrating Auth0 MCP Server with PrintHub Next.js application.

## Architecture

```
┌──────────────────────────┐
│   PrintHub Frontend      │
│   (Next.js 15)           │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────────┐
│   PrintHub API Routes        │
│   (pages/api/auth/...)       │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│   Appwrite Functions         │
│   (Auth0 MCP Server)         │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│   Auth0 + Supabase           │
│   (Authentication & DB)      │
└──────────────────────────────┘
```

## Setup Steps

### Step 1: Environment Configuration

Create `.env.local` in PrintHub root:

```env
# Auth0
NEXT_PUBLIC_AUTH0_DOMAIN=login.ritambharat.software
NEXT_PUBLIC_AUTH0_CLIENT_ID=JqvWx2irDcCaWHYXr3bJcH0JpJBokKax
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_FUNCTIONS_URL=https://fra.cloud.appwrite.io/v1/functions

# Internal
AUTH0_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### Step 2: Create Auth Context

**`src/contexts/auth-context.tsx`** - Already exists, update:

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  metadata?: Record<string, any>;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  signup: (email: string, password: string, metadata?: any) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: any) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        const storedToken = localStorage.getItem('auth_token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setAccessToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/init');
      if (!response.ok) throw new Error('Failed to initiate login');
      
      // Redirect handled by server
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, metadata?: any): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, metadata })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      const newUser: User = {
        id: data.user.userId,
        email: data.user.email,
        metadata: data.user.metadata || {}
      };

      setUser(newUser);
      localStorage.setItem('auth_user', JSON.stringify(newUser));

      return newUser;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      setUser(null);
      setAccessToken(null);
      
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: any): Promise<User> => {
    if (!user) throw new Error('Not authenticated');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (!response.ok) throw new Error('Profile update failed');

      const data = await response.json();
      const updatedUser: User = {
        ...user,
        ...data.user,
        metadata: data.user.metadata || {}
      };

      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error('Password reset failed');
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  };

  const getAccessToken = async (): Promise<string> => {
    if (!accessToken) throw new Error('No access token');
    return accessToken;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        resetPassword,
        getAccessToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Step 3: Create API Routes

#### **`src/app/api/auth/init.ts`** - Initialize OAuth

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APPWRITE_FUNCTIONS_URL}/auth0-login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          state: crypto.randomUUID() 
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get authorization URL');
    }

    const { authorizationUrl } = await response.json();

    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    console.error('Auth init error:', error);
    return NextResponse.json(
      { error: 'Authentication initialization failed' },
      { status: 500 }
    );
  }
}
```

#### **`src/app/api/auth/callback.ts`** - Handle OAuth Callback

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APPWRITE_FUNCTIONS_URL}/auth0-login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state })
      }
    );

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    const { accessToken, idToken, expiresIn } = await response.json();

    // Decode ID token to get user info
    const decodedToken = JSON.parse(
      Buffer.from(idToken.split('.')[1], 'base64').toString()
    );

    // Create response with token in httpOnly cookie
    const res = NextResponse.redirect(new URL('/dashboard', request.url));
    
    res.cookies.set({
      name: 'auth_token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn
    });

    res.cookies.set({
      name: 'auth_user',
      value: JSON.stringify({
        id: decodedToken.sub,
        email: decodedToken.email,
        name: decodedToken.name
      }),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
```

#### **`src/app/api/auth/signup.ts`** - User Registration

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, metadata } = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APPWRITE_FUNCTIONS_URL}/auth0-signup`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, metadata })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 500 }
    );
  }
}
```

#### **`src/app/api/auth/profile.ts`** - User Profile Management

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    const query = new URLSearchParams();
    if (userId) query.append('userId', userId);
    if (email) query.append('email', email);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APPWRITE_FUNCTIONS_URL}/auth0-profile?${query}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { updates } = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APPWRITE_FUNCTIONS_URL}/auth0-profile`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates })
      }
    );

    if (!response.ok) {
      throw new Error('Profile update failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Profile update failed' },
      { status: 500 }
    );
  }
}
```

#### **`src/app/api/auth/reset-password.ts`** - Password Reset

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APPWRITE_FUNCTIONS_URL}/auth0-password-reset`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Password reset failed' },
      { status: 500 }
    );
  }
}
```

### Step 4: Create UI Components

#### **`src/components/auth/LoginButton.tsx`**

```typescript
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

export function LoginButton() {
  const { isLoading, login } = useAuth();

  return (
    <Button 
      onClick={login}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? 'Signing in...' : 'Sign In with Auth0'}
    </Button>
  );
}
```

#### **`src/components/auth/SignupForm.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SignupForm() {
  const { signup, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signup(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      // Redirect on success handled by context
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">First Name</label>
        <Input
          type="text"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Last Name</label>
        <Input
          type="text"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
}
```

### Step 5: Update App Layout

**`src/app/layout.tsx`**

```typescript
import { AuthProvider } from '@/contexts/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Testing Integration

### Test 1: Login Flow

1. Click "Sign In with Auth0"
2. Should redirect to Auth0 login page
3. After authentication, should redirect to callback
4. Token should be stored in httpOnly cookie
5. User should be authenticated

### Test 2: Signup Flow

1. Fill signup form
2. Submit
3. User should be created in Auth0
4. Redirect to dashboard
5. User context should be populated

### Test 3: Profile Update

```typescript
const { user, updateProfile } = useAuth();

await updateProfile({
  user_metadata: {
    firstName: 'Updated',
    company: 'New Company'
  }
});
```

## Security Checklist

✅ Use httpOnly cookies for tokens
✅ Validate all inputs on backend
✅ Use HTTPS only in production
✅ Implement CSRF protection
✅ Set correct CORS headers
✅ Don't expose secrets in frontend
✅ Validate JWT tokens
✅ Implement rate limiting

## Deployment

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| OAuth redirect fails | Check REDIRECT_URI in env vars |
| Token not set | Check httpOnly cookie settings |
| CORS errors | Verify Appwrite function CORS config |
| User not persisted | Check AuthContext localStorage |

---

**Status:** Integration Guide Complete ✅
**Created:** December 2024
