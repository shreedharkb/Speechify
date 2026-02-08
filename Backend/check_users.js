const { pool } = require('./config/db');

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users');
    console.log(`\nFound ${result.rows.length} users:`);
    result.rows.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
