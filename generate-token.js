// Script temporaire pour générer un token JWT manuellement
const jwt = require('jsonwebtoken');

const payload = { 
  sub: 'dev-admin', 
  email: 'admin@e4d.test', 
  roles: ['ADMIN'] 
};

const secret = 'dev-jwt-access-secret-key-change-in-production';
const expiresIn = '1h'; // 1 hour

try {
  const token = jwt.sign(payload, secret, { expiresIn });
  console.log('Generated JWT token:');
  console.log(token);
  console.log('\nTo use this token, add to your requests:');
  console.log(`Authorization: Bearer ${token}`);
} catch (error) {
  console.error('Error generating token:', error);
}