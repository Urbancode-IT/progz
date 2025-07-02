const User = require('../../models/User');
const apiClient = require('../../services/apiClient');
const { hashPassword } = require('../../utils/passwordUtils');

exports.syncInstructors = async () => {
  try {
    const { data } = await apiClient.get('/trainers/progz');
    if (data.success) {
      for (const t of data.trainers) {
        const exists = await User.findOne({ email: t.trainer_email });
        if (!exists) {
          const password = await hashPassword('progz1234');
          await User.create({
            name: t.trainer_name,
            email: t.trainer_email,
            phone: t.trainer_mobile,
            instructor_id: t.trainer_id,
            password,
            role: 'instructor'
          });
        }
      }
      console.log('✅ Instructors synced');
    }
  } catch (err) {
    console.error('Error syncing instructors:', err.message);
  }
};
