// User DB queries (PostgreSQL example, replace with your DB logic)
const users = [];
let id = 1;

exports.getUserByEmail = async (email) => users.find(u => u.email === email);
exports.createUser = async ({ username, email, password, role }) => {
  const user = { id: id++, username, email, password, role };
  users.push(user);
  return user;
};
