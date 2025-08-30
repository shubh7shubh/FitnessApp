// Quick test to verify Supabase connection
import { supabase } from './lib/supabase.js';

async function testSupabaseConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    console.log('Supabase connection test:');
    console.log('- URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('- Session data:', data);
    console.log('- Error:', error);
    
    // Test sign up (with a temporary email)
    const testEmail = 'test@example.com';
    const testPassword = 'testpass123';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    console.log('Sign up test:');
    console.log('- Data:', signUpData);
    console.log('- Error:', signUpError);
    
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testSupabaseConnection();