// Test file to verify Supabase connection
// This file can be run to test if Supabase is properly configured
// Usage: Run this in your development environment to verify connection

import { supabase, isAuthEnabled } from './supabase.js';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  // Check if auth is enabled
  if (!isAuthEnabled()) {
    console.log('⚠️  User authentication is disabled via ENABLE_USER_AUTH environment variable');
    return false;
  }
  
  try {
    // Test 1: Check if we can connect to Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test 2: Check if we can query the database (this will fail if tables don't exist)
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('count', { count: 'exact', head: true });
      
      if (profileError) {
        console.warn('⚠️  Database tables may not be set up yet:', profileError.message);
        console.log('💡 Please run the setup-database.sql file in your Supabase SQL Editor');
        return false;
      }
      
      console.log('✅ Database tables are accessible');
      
    } catch (dbError) {
      console.warn('⚠️  Database query failed:', dbError);
      console.log('💡 Please run the setup-database.sql file in your Supabase SQL Editor');
      return false;
    }
    
    // Test 3: Check environment variables
    const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars.join(', '));
      return false;
    }
    
    console.log('✅ All environment variables are set');
    console.log('🎉 Supabase setup is complete and working!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during Supabase test:', error);
    return false;
  }
}

// Auto-run test if this file is imported
if (typeof window === 'undefined') {
  // Only run in server environment
  testSupabaseConnection().then((success) => {
    if (!success) {
      console.log('\n📋 Setup checklist:');
      console.log('1. Create a Supabase project at https://supabase.com');
      console.log('2. Copy your project URL and anon key to .env file');
      console.log('3. Run the setup-database.sql file in Supabase SQL Editor');
      console.log('4. Set ENABLE_USER_AUTH=true in your .env file');
    }
  });
}