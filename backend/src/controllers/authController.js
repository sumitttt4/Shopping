const bcrypt = require('bcryptjs');
const { User, AuditLog } = require('../models');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');

const authController = {
  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials.'
        });
      }

      // Check password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials.'
        });
      }

      // Check user status
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive. Please contact administrator.'
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Update user last login and refresh token
      await user.update({
        last_login: new Date(),
        refresh_token: refreshToken
      });

      // Log successful login
      await AuditLog.logAction({
        userId: user.id,
        action: 'login',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      logger.info(`User ${user.email} logged in successfully`);

      res.json({
        success: true,
        message: 'Login successful.',
        data: {
          user: user.toJSON(),
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Refresh token
  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required.'
        });
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      // Find user and validate refresh token
      const user = await User.findByPk(decoded.id);
      if (!user || user.refresh_token !== refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token.'
        });
      }

      // Check user status
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive.'
        });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

      // Update refresh token
      await user.update({ refresh_token: newRefreshToken });

      res.json({
        success: true,
        message: 'Token refreshed successfully.',
        data: {
          accessToken,
          refreshToken: newRefreshToken
        }
      });

    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }
  },

  // Logout
  logout: async (req, res) => {
    try {
      const user = req.user;

      // Clear refresh token
      await user.update({ refresh_token: null });

      // Log logout
      await AuditLog.logAction({
        userId: user.id,
        action: 'logout',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      logger.info(`User ${user.email} logged out`);

      res.json({
        success: true,
        message: 'Logout successful.'
      });

    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Get current user profile
  profile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'refresh_token'] }
      });

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      logger.error('Profile fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Update profile
  updateProfile: async (req, res) => {
    try {
      const { first_name, last_name, email, username } = req.body;
      const user = req.user;

      const updateData = {};
      if (first_name) updateData.first_name = first_name;
      if (last_name) updateData.last_name = last_name;
      if (email && email !== user.email) updateData.email = email;
      if (username && username !== user.username) updateData.username = username;

      const updatedUser = await user.update(updateData);

      // Log profile update
      await AuditLog.logAction({
        userId: user.id,
        action: 'update_profile',
        resourceType: 'user',
        resourceId: user.id,
        oldValues: { 
          first_name: user.first_name, 
          last_name: user.last_name,
          email: user.email,
          username: user.username
        },
        newValues: updateData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user: updatedUser.toJSON() }
      });

    } catch (error) {
      logger.error('Profile update error:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Email or username already exists.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required.'
        });
      }

      // Validate current password
      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.'
        });
      }

      // Update password
      await user.update({ password: newPassword });

      // Log password change
      await AuditLog.logAction({
        userId: user.id,
        action: 'change_password',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      logger.info(`User ${user.email} changed password`);

      res.json({
        success: true,
        message: 'Password changed successfully.'
      });

    } catch (error) {
      logger.error('Password change error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  }
};

module.exports = authController;