import { Group, Member, User } from '../models/index.js';

// Create a new group
export const createGroup = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    // Create the group
    const group = await Group.create({ name });

    // Add the creator as an admin member
    await Member.create({
      group_id: group.id,
      user_id: userId,
      status: 'active',
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: {
        group: {
          id: group.id,
          name: group.name,
          createdAt: group.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all groups
export const getAllGroups = async (req, res, next) => {
  try {
    const groups = await Group.findAll({
      attributes: ['id', 'name', 'created_at'],
      include: [
        {
          model: Member,
          as: 'members',
          attributes: ['status', 'role'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        groups: groups.map(group => ({
          id: group.id,
          name: group.name,
          createdAt: group.created_at,
          memberCount: group.members.length,
          members: group.members
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific group
export const getGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = await Group.findByPk(id, {
      include: [
        {
          model: Member,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.json({
      success: true,
      data: {
        group: {
          id: group.id,
          name: group.name,
          createdAt: group.created_at,
          members: group.members
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
