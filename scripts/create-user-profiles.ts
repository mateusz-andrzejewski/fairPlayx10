/**
 * Create user profiles for existing auth users
 */

import { createClient } from '@supabase/supabase-js';

const PRODUCTION_URL = process.env.PUBLIC_SUPABASE_URL;
const PRODUCTION_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY;
const PASSWORD = '12345678A';

if (!PRODUCTION_URL || !PRODUCTION_ANON_KEY) {
  console.error('Missing environment variables');
  process.exit(1);
}

interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'player';
  status: 'approved';
  player_id: number;
  position: 'midfielder' | 'goalkeeper';
}

const userProfiles: UserProfile[] = [
  {
    email: 'yegomejl@gmail.com',
    first_name: 'Tobiasz',
    last_name: 'Tobiaszowski',
    role: 'admin',
    status: 'approved',
    player_id: 559,
    position: 'midfielder',
  },
  {
    email: 'testowy_zawodnik@gmail.com',
    first_name: 'Zawodnik',
    last_name: 'Zawodnik',
    role: 'player',
    status: 'approved',
    player_id: 7,
    position: 'midfielder',
  },
  {
    email: 'testowy_organizator@gmail.com',
    first_name: 'Organizator',
    last_name: 'Organizator',
    role: 'player',
    status: 'approved',
    player_id: 8,
    position: 'midfielder',
  },
];

async function createProfiles() {
  console.log('🔧 Creating user profiles...\n');

  const supabase = createClient(PRODUCTION_URL!, PRODUCTION_ANON_KEY!);

  // Step 1: Create players that are referenced by user profiles
  console.log('👥 Creating referenced players...');
  const playersToCreate = [
    { id: 559, first_name: 'Michał', last_name: 'Playmaker', position: 'midfielder' as const, skill_rate: 8, date_of_birth: '1994-11-05' },
    { id: 7, first_name: 'Zawodnik', last_name: 'Zawodnik', position: 'midfielder' as const, skill_rate: 7, date_of_birth: '1996-01-26' },
    { id: 8, first_name: 'Organizator', last_name: 'Organizator', position: 'midfielder' as const, skill_rate: 5, date_of_birth: null },
  ];

  for (const player of playersToCreate) {
    const { error } = await supabase.from('players').upsert(player, { onConflict: 'id' });
    if (error) {
      console.error(`   ❌ Failed to create player ${player.id}:`, error.message);
    } else {
      console.log(`   ✅ Player ${player.first_name} ${player.last_name} (ID: ${player.id}) created`);
    }
  }

  console.log('\n📝 Creating user profiles...');

  for (const profile of userProfiles) {
    console.log(`\n   Processing ${profile.email}...`);

    // Check if profile exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, status, player_id')
      .eq('email', profile.email)
      .maybeSingle();

    if (userError && userError.code !== 'PGRST116') {
      console.error(`      ❌ Error checking profile:`, userError.message);
      continue;
    }

    if (!userData) {
      console.log(`      ⚠️  Profile not found, creating...`);

      // Create profile
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          email: profile.email,
          password_hash: 'supabase-auth-managed',
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role,
          status: profile.status,
          player_id: profile.player_id,
          consent_date: new Date().toISOString(),
          consent_version: '1.0',
          deleted_at: null,
        });

      if (insertError) {
        console.error(`      ❌ Failed to create profile:`, insertError.message);
      } else {
        console.log(`      ✅ Profile created successfully`);
      }
    } else {
      console.log(`      ℹ️  Profile exists, updating...`);

      // Update it to ensure correct role, status and player_id
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: profile.role,
          status: profile.status,
          player_id: profile.player_id,
        })
        .eq('id', userData.id);

      if (updateError) {
        console.error(`      ❌ Failed to update profile:`, updateError.message);
      } else {
        console.log(`      ✅ Profile updated to: role=${profile.role}, status=${profile.status}, player_id=${profile.player_id}`);
      }
    }
  }

  console.log('\n✅ All profiles processed!');
}

createProfiles();

