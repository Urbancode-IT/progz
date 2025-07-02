const bcrypt = require('bcrypt');
const SALT = 10;

exports.hashPassword = async (plain) => {
  return await bcrypt.hash(plain, SALT);
};
