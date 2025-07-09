import { Member, User, Group } from '../models/index.js';
import { Op } from 'sequelize';

// Add member to group
export const addMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { userId, role = 'member' } = req.body;
    const currentUserId = req.user.id;

    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if current user is admin of the group
    const currentUserMembership = await Member.findOne({
      where: {
        group_id: groupId,
        user_id: currentUserId,
        role: 'admin',
        status: 'active'
      }
    });

    if (!currentUserMembership) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can add members'
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const existingMembership = await Member.findOne({
      where: {
        group_id: groupId,
        user_id: userId
      }
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this group'
      });
    }

    // Add member
    const member = await Member.create({
      group_id: groupId,
      user_id: userId,
      role,
      status: 'pending'
    });

    // Fetch the created member with user details
    const memberWithUser = await Member.findByPk(member.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: {
        member: memberWithUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get pending members for a group
export const getPendingMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if current user is a member of the group
    const currentUserMembership = await Member.findOne({
      where: {
        group_id: groupId,
        user_id: currentUserId,
        status: 'active'
      }
    });

    if (!currentUserMembership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    // Get pending members
    const pendingMembers = await Member.findAll({
      where: {
        group_id: groupId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        pendingMembers
      }
    });
  } catch (error) {
    next(error);
  }
};

// Search users by name or email
export const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${query}%`
            }
          },
          {
            email: {
              [Op.iLike]: `%${query}%`
            }
          }
        ]
      },
      attributes: ['id', 'name', 'email'],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

// Accept/Activate membership (user accepts invitation)
export const activateMembership = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Find pending membership
    const membership = await Member.findOne({
      where: {
        group_id: groupId,
        user_id: userId,
        status: 'pending'
      }
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'No pending membership found'
      });
    }

    // Activate membership
    membership.status = 'active';
    await membership.save();

    res.json({
      success: true,
      message: 'Membership activated successfully',
      data: {
        membership
      }
    });
  } catch (error) {
    next(error);
  }
};
