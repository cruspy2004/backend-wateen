import { Message, Group, Member, User } from '../models/index.js';

// Compose a message
export const composeMessage = async (req, res, next) => {
  try {
    const { groupId, message } = req.body;
    const senderId = req.user.id;

    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is an active member of the group
    const membership = await Member.findOne({
      where: {
        group_id: groupId,
        user_id: senderId,
        status: 'active'
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You must be an active member of the group to send messages'
      });
    }

    // Create the message
    const newMessage = await Message.create({
      group_id: groupId,
      sender_id: senderId,
      message
    });

    // Fetch the created message with sender details
    const messageWithDetails = await Message.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: messageWithDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get messages for a group
export const getGroupMessages = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is a member of the group
    const membership = await Member.findOne({
      where: {
        group_id: groupId,
        user_id: userId,
        status: 'active'
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of the group to view messages'
      });
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get messages with pagination
    const { count, rows: messages } = await Message.findAndCountAll({
      where: {
        group_id: groupId
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalMessages: count,
          hasNext: page * limit < count,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
