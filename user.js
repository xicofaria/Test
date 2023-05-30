const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['admin', 'visitor'],
    required: true
  },
  age: {
    type: Number,
    min: 0
  },
  customerPoints: {
    type: Number,
    default: 0,
    required: function() {
      return this.type === 'visitor';
    }
  }
});

// Generate authentication Token
UserSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, 'your-secret-key');
  return token;
};

UserSchema.statics.findByCredentials = async function(username, password) {
  const user = await this.findOne({ username });

  if (!user) {
    throw new Error('Invalid login credentials');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new Error('Invalid login credentials');
  }

  return user;
}

UserSchema.pre('save', async function(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

