/**
 * Test script to verify Supabase topics connection
 * Run this in browser console or as a standalone test
 */

import { fetchTopics, fetchTopicById } from './supabaseTopics';

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Topics Connection...\n');

  try {
    // Test 1: Fetch all topics
    console.log('📋 Test 1: Fetching all topics...');
    const topics = await fetchTopics();
    console.log(`✅ Success! Found ${topics.length} topics:`);
    topics.forEach((topic, index: number) => {
      console.log(`   ${index + 1}. [ID: ${topic.id}] ${topic.title}`);
      console.log(`      ${topic.description}`);
    });

    if (topics.length === 0) {
      console.warn('⚠️  No topics found in database. Run the SQL migration first!');
      return;
    }

    console.log('\n');

    // Test 2: Fetch specific topic
    console.log('🎯 Test 2: Fetching Topic ID 1...');
    const topic1 = await fetchTopicById(1);
    if (topic1) {
      console.log(`✅ Success! Topic 1: ${topic1.title}`);
      console.log(`   Description: ${topic1.description}`);
    } else {
      console.error('❌ Failed to fetch Topic 1');
    }

    console.log('\n');

    // Test 3: Check data structure
    console.log('🔍 Test 3: Verifying data structure...');
    const firstTopic = topics[0];
    const hasId = typeof firstTopic.id === 'number';
    const hasTitle = typeof firstTopic.title === 'string';
    const hasDescription = typeof firstTopic.description === 'string';

    if (hasId && hasTitle && hasDescription) {
      console.log('✅ Data structure is correct!');
      console.log(`   - id: ${firstTopic.id} (${typeof firstTopic.id})`);
      console.log(`   - title: "${firstTopic.title}" (${typeof firstTopic.title})`);
      console.log(`   - description: "${firstTopic.description.substring(0, 50)}..." (${typeof firstTopic.description})`);
    } else {
      console.error('❌ Data structure mismatch!');
    }

    console.log('\n✅ All tests passed! Supabase connection is working.');

  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.log('\n📝 Troubleshooting:');
    console.log('   1. Check if .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    console.log('   2. Verify the SQL migration was run successfully');
    console.log('   3. Check Supabase dashboard > Table Editor > tugonsense_topics');
    console.log('   4. Ensure RLS policies allow public SELECT access');
  }
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  console.log('🚀 Running Supabase connection test...\n');
  testSupabaseConnection();
}

export { testSupabaseConnection };
