import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://orhisfnskjwcmordjwka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaGlzZm5za2p3Y21vcmRqd2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0OTIxNzMsImV4cCI6MjA0NTA2ODE3M30.h6ahhR3iMUy0jV41UzWgPArII6rRnhXOs9Fu0kWvqTQ';
export const supabase = createClient(supabaseUrl, supabaseKey);
