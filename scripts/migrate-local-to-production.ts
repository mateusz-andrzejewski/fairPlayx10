/**
 * Script to migrate local data to production
 * This script creates users, players, events and signups on production
 */

import { createClient } from '@supabase/supabase-js';

const PRODUCTION_URL = process.env.PUBLIC_SUPABASE_URL;
const PRODUCTION_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY;
const PASSWORD = '12345678A';

if (!PRODUCTION_URL || !PRODUCTION_ANON_KEY) {
  console.error('Missing environment variables. Please set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(PRODUCTION_URL, PRODUCTION_ANON_KEY);

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  position: 'forward' | 'midfielder' | 'defender' | 'goalkeeper';
  skill_rate: number | null;
  date_of_birth: string | null;
}

interface User {
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'organizer' | 'player';
  status: 'pending' | 'approved';
  player?: Player;
}

const users: User[] = [
  {
    email: 'yegomejl@gmail.com',
    first_name: 'Tobiasz',
    last_name: 'Tobiaszowski',
    role: 'admin',
    status: 'approved',
    player: {
      id: 559,
      first_name: 'Michał',
      last_name: 'Playmaker',
      position: 'midfielder',
      skill_rate: 8,
      date_of_birth: '1994-11-05',
    },
  },
  {
    email: 'testowy_zawodnik@gmail.com',
    first_name: 'Zawodnik',
    last_name: 'Zawodnik',
    role: 'player',
    status: 'approved',
    player: {
      id: 7,
      first_name: 'Zawodnik',
      last_name: 'Zawodnik',
      position: 'midfielder',
      skill_rate: 7,
      date_of_birth: '1996-01-26',
    },
  },
  {
    email: 'testowy_organizator@gmail.com',
    first_name: 'Organizator',
    last_name: 'Organizator',
    role: 'player',
    status: 'approved',
    player: {
      id: 8,
      first_name: 'Organizator',
      last_name: 'Organizator',
      position: 'midfielder',
      skill_rate: 5,
      date_of_birth: null,
    },
  },
];

const players: Player[] = [
  { id: 555, first_name: 'Dev', last_name: 'Administrator', position: 'midfielder', skill_rate: 8, date_of_birth: '1995-04-12' },
  { id: 556, first_name: 'Anna', last_name: 'Striker', position: 'forward', skill_rate: 9, date_of_birth: '1998-08-21' },
  { id: 557, first_name: 'Bartek', last_name: 'Keeper', position: 'goalkeeper', skill_rate: 8, date_of_birth: '1992-02-10' },
  { id: 558, first_name: 'Alicja', last_name: 'Defender', position: 'defender', skill_rate: 7, date_of_birth: '1996-06-18' },
  { id: 1, first_name: 'Marian', last_name: 'Huja', position: 'defender', skill_rate: 4, date_of_birth: '2000-05-05' },
  { id: 2, first_name: 'Taras', last_name: 'Rozmaryńczuk', position: 'forward', skill_rate: 7, date_of_birth: '1995-05-05' },
  { id: 3, first_name: 'Jan', last_name: 'Urban', position: 'forward', skill_rate: 8, date_of_birth: '1980-08-08' },
  { id: 4, first_name: 'Tymoteusz', last_name: 'Puchacz', position: 'defender', skill_rate: 5, date_of_birth: '1990-06-06' },
  { id: 5, first_name: 'Junior', last_name: 'Magalaeus', position: 'midfielder', skill_rate: 7, date_of_birth: '2000-09-30' },
  { id: 6, first_name: 'Krajci', last_name: 'Rejan', position: 'forward', skill_rate: 3, date_of_birth: '2000-05-03' },
];

async function registerUser(user: User): Promise<void> {
  console.log(`\n📝 Registering user: ${user.email}...`);

  const response = await fetch(`${PRODUCTION_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': PRODUCTION_ANON_KEY,
    },
    body: JSON.stringify({
      email: user.email,
      password: PASSWORD,
      options: {
        data: {
          first_name: user.first_name,
          last_name: user.last_name,
        },
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.msg?.includes('already registered')) {
      console.log(`   ⚠️  User ${user.email} already exists, skipping...`);
      return;
    }
    throw new Error(`Failed to register ${user.email}: ${data.msg || JSON.stringify(data)}`);
  }

  console.log(`   ✅ User registered successfully`);

  // Wait a bit for the database trigger to create the user profile
  await new Promise(resolve => setTimeout(resolve, 2000));
}

async function createPlayers(): Promise<void> {
  console.log('\n👥 Creating players...');

  for (const player of players) {
    const { error } = await supabase
      .from('players')
      .upsert({
        id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        position: player.position,
        skill_rate: player.skill_rate,
        date_of_birth: player.date_of_birth,
      }, {
        onConflict: 'id',
      });

    if (error) {
      console.error(`   ❌ Failed to create player ${player.first_name} ${player.last_name}:`, error);
    } else {
      console.log(`   ✅ Player created: ${player.first_name} ${player.last_name}`);
    }
  }
}

async function approveUsersAndLinkPlayers(): Promise<void> {
  console.log('\n🔗 Approving users and linking to players...');

  for (const user of users) {
    // Get user ID from public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      console.error(`   ❌ Failed to find user ${user.email}:`, userError);
      continue;
    }

    // Create player if exists
    let playerId = null;
    if (user.player) {
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .upsert({
          id: user.player.id,
          first_name: user.player.first_name,
          last_name: user.player.last_name,
          position: user.player.position,
          skill_rate: user.player.skill_rate,
          date_of_birth: user.player.date_of_birth,
        }, {
          onConflict: 'id',
        })
        .select('id')
        .single();

      if (playerError) {
        console.error(`   ❌ Failed to create player for ${user.email}:`, playerError);
      } else {
        playerId = playerData.id;
      }
    }

    // Update user status and link player
    const { error: updateError } = await supabase
      .from('users')
      .update({
        role: user.role,
        status: user.status,
        player_id: playerId,
      })
      .eq('id', userData.id);

    if (updateError) {
      console.error(`   ❌ Failed to update user ${user.email}:`, updateError);
    } else {
      console.log(`   ✅ User ${user.email} approved and linked to player ${playerId || 'none'}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting migration from local to production...\n');
  console.log(`Production URL: ${PRODUCTION_URL}`);

  try {
    // Step 1: Register users
    console.log('\n=== Step 1: Register Users ===');
    for (const user of users) {
      await registerUser(user);
    }

    // Step 2: Create all players
    console.log('\n=== Step 2: Create Players ===');
    await createPlayers();

    // Step 3: Approve users and link to players
    console.log('\n=== Step 3: Approve Users and Link Players ===');
    await approveUsersAndLinkPlayers();

    console.log('\n\n✅ Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - ${users.length} users created and approved`);
    console.log(`   - ${players.length} players created`);
    console.log('\n🔑 All accounts use password: 12345678A');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();

