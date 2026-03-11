const LiveClass = require('../models/LiveClass');
const Course = require('../models/Course');

// Get all live classes
exports.getLiveClasses = async (req, res) => {
  try {
    const { status, courseId } = req.query;

    let query = {};
    if (status) query.status = status;
    if (courseId) query.courseId = courseId;

    const liveClasses = await LiveClass.find(query)
      .populate('staffId', 'name email')
      .populate('courseId', 'title')
      .sort({ scheduledStartTime: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: liveClasses.length,
      data: liveClasses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching live classes',
      error: error.message,
    });
  }
};

// Get single live class
exports.getLiveClass = async (req, res) => {
  try {
    const { id } = req.params;

    const liveClass = await LiveClass.findById(id)
      .populate('staffId', 'name email')
      .populate('courseId', 'title description')
      .populate('chatMessages.studentId', 'name profilePicture')
      .populate('attendanceRecords.studentId', 'name')
      .populate('raisedHands.studentId', 'name');

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    // Increment views (do not await)
    LiveClass.updateOne({ _id: id }, { $inc: { viewsCount: 1 } }).exec();

    res.status(200).json({
      success: true,
      data: liveClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching live class',
      error: error.message,
    });
  }
};

// Get live classes for a course
exports.getCourseActiveLiveClasses = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const liveClasses = await LiveClass.find({
      courseId,
      status: { $in: ['live', 'scheduled'] },
    })
      .populate('staffId', 'name email')
      .sort({ scheduledStartTime: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: liveClasses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course live classes',
      error: error.message,
    });
  }
};

// Create live class (Staff only)
exports.createLiveClass = async (req, res) => {
  try {
    const { courseId, title, description, scheduledStartTime, duration } =
      req.body;
    const staffId = req.user._id;

    // Validate course exists and staff owns it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.staffId.toString() !== staffId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only create live classes for your own courses',
      });
    }

    // Validate time is in future
    if (new Date(scheduledStartTime) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled start time must be in the future',
      });
    }

    const liveClass = new LiveClass({
      courseId,
      staffId,
      title,
      description,
      scheduledStartTime,
      duration,
    });

    await liveClass.save();
    await liveClass.populate('staffId', 'name email');
    await liveClass.populate('courseId', 'title');

    res.status(201).json({
      success: true,
      message: 'Live class scheduled successfully',
      data: liveClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating live class',
      error: error.message,
    });
  }
};

// Start live class (Staff only)
exports.startLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user._id;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    // Verify staff ownership
    if (liveClass.staffId.toString() !== staffId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only start your own live classes',
      });
    }

    if (liveClass.status === 'live') {
      return res.status(400).json({
        success: false,
        message: 'This live class is already live',
      });
    }

    liveClass.status = 'live';
    liveClass.actualStartTime = new Date();

    if (liveClass.recordingEnabled) {
      liveClass.isRecording = true;
      liveClass.recordingStartTime = new Date();
    }

    await liveClass.save();

    res.status(200).json({
      success: true,
      message: 'Live class started successfully',
      data: liveClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting live class',
      error: error.message,
    });
  }
};

// End live class (Staff only)
exports.endLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user._id;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    // Verify staff ownership
    if (liveClass.staffId.toString() !== staffId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only end your own live classes',
      });
    }

    if (liveClass.status !== 'live') {
      return res.status(400).json({
        success: false,
        message: 'Only active live classes can be ended',
      });
    }

    liveClass.status = 'ended';
    liveClass.actualEndTime = new Date();

    if (liveClass.isRecording) {
      liveClass.isRecording = false;
      liveClass.recordingEndTime = new Date();
    }

    // Calculate attendance durations
    liveClass.attendanceRecords.forEach((record) => {
      if (!record.leaveTime) {
        record.leaveTime = new Date();
        const durationMs = record.leaveTime - record.joinTime;
        record.duration = Math.round(durationMs / (1000 * 60)); // convert to minutes
      }
    });

    await liveClass.save();

    res.status(200).json({
      success: true,
      message: 'Live class ended successfully',
      data: liveClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error ending live class',
      error: error.message,
    });
  }
};

// Update live class settings
exports.updateLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user._id;
    const {
      title,
      description,
      chatEnabled,
      raiseHandEnabled,
      screenShareEnabled,
      recordingEnabled,
    } = req.body;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    // Verify staff ownership
    if (liveClass.staffId.toString() !== staffId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own live classes',
      });
    }

    // Only allow updates if not started yet
    if (liveClass.status === 'live' || liveClass.status === 'ended') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update live class after it has started',
      });
    }

    if (title) liveClass.title = title;
    if (description) liveClass.description = description;
    if (chatEnabled !== undefined) liveClass.chatEnabled = chatEnabled;
    if (raiseHandEnabled !== undefined)
      liveClass.raiseHandEnabled = raiseHandEnabled;
    if (screenShareEnabled !== undefined)
      liveClass.screenShareEnabled = screenShareEnabled;
    if (recordingEnabled !== undefined)
      liveClass.recordingEnabled = recordingEnabled;

    await liveClass.save();

    res.status(200).json({
      success: true,
      message: 'Live class updated successfully',
      data: liveClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating live class',
      error: error.message,
    });
  }
};

// Delete live class (Staff only)
exports.deleteLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user._id;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    // Verify staff ownership
    if (liveClass.staffId.toString() !== staffId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own live classes',
      });
    }

    // Only allow deletion if not live
    if (liveClass.status === 'live') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a live class that is currently active',
      });
    }

    await LiveClass.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Live class deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting live class',
      error: error.message,
    });
  }
};

// Student joins live class
exports.joinLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;
    const { studentName } = req.body;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    if (liveClass.status !== 'live') {
      return res.status(400).json({
        success: false,
        message: 'Live class is not currently active',
      });
    }

    // Add student to current students
    if (!liveClass.currentStudents.includes(studentId)) {
      liveClass.currentStudents.push(studentId);
      liveClass.totalStudentsJoined += 1;
    }

    // Track attendance
    const existingAttendance = liveClass.attendanceRecords.find(
      (record) => record.studentId.toString() === studentId.toString()
    );

    if (!existingAttendance) {
      liveClass.attendanceRecords.push({
        studentId,
        studentName,
        joinTime: new Date(),
        status: 'present',
      });
    }

    // Update peak viewers
    if (liveClass.currentStudents.length > liveClass.peakViewers) {
      liveClass.peakViewers = liveClass.currentStudents.length;
    }

    await liveClass.save();

    res.status(200).json({
      success: true,
      message: 'Joined live class successfully',
      data: {
        classId: liveClass._id,
        studentCount: liveClass.currentStudents.length,
        chatEnabled: liveClass.chatEnabled,
        raiseHandEnabled: liveClass.raiseHandEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining live class',
      error: error.message,
    });
  }
};

// Student leaves live class
exports.leaveLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    // Remove student from current students
    liveClass.currentStudents = liveClass.currentStudents.filter(
      (sid) => sid.toString() !== studentId.toString()
    );

    // Update attendance record with leave time
    const attendanceRecord = liveClass.attendanceRecords.find(
      (record) => record.studentId.toString() === studentId.toString()
    );

    if (attendanceRecord && !attendanceRecord.leaveTime) {
      attendanceRecord.leaveTime = new Date();
      const durationMs = attendanceRecord.leaveTime - attendanceRecord.joinTime;
      attendanceRecord.duration = Math.round(durationMs / (1000 * 60));
    }

    await liveClass.save();

    res.status(200).json({
      success: true,
      message: 'Left live class successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving live class',
      error: error.message,
    });
  }
};

// Add chat message
exports.addChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, type } = req.body;
    const studentId = req.user._id;
    const studentName = req.user.name;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    if (!liveClass.chatEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Chat is disabled for this live class',
      });
    }

    liveClass.chatMessages.push({
      studentId,
      studentName,
      message,
      type: type || 'message',
    });

    await liveClass.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: liveClass.chatMessages[liveClass.chatMessages.length - 1],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

// Raise hand
exports.raiseHand = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;
    const studentName = req.user.name;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    if (!liveClass.raiseHandEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Raise hand is disabled for this live class',
      });
    }

    // Check if student already has active raised hand
    const activeHand = liveClass.raisedHands.find(
      (hand) =>
        hand.studentId.toString() === studentId.toString() && !hand.isAnswered
    );

    if (activeHand) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active raised hand',
      });
    }

    liveClass.raisedHands.push({
      studentId,
      studentName,
    });

    await liveClass.save();

    res.status(201).json({
      success: true,
      message: 'Hand raised successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error raising hand',
      error: error.message,
    });
  }
};

// Answer raised hand (Staff only)
exports.answerRaisedHand = async (req, res) => {
  try {
    const { id, handId } = req.params;
    const staffId = req.user._id;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    // Verify staff ownership
    if (liveClass.staffId.toString() !== staffId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the instructor can answer raised hands',
      });
    }

    const raisedHand = liveClass.raisedHands.id(handId);
    if (!raisedHand) {
      return res.status(404).json({
        success: false,
        message: 'Raised hand not found',
      });
    }

    raisedHand.isAnswered = true;
    raisedHand.answeredAt = new Date();

    await liveClass.save();

    res.status(200).json({
      success: true,
      message: 'Raised hand marked as answered',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error answering raised hand',
      error: error.message,
    });
  }
};

// Get live class attendance report (Staff only)
exports.getAttendanceReport = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user._id;

    const liveClass = await LiveClass.findById(id).populate(
      'attendanceRecords.studentId',
      'name email'
    );

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    // Verify staff ownership
    if (liveClass.staffId.toString() !== staffId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view attendance for your own live classes',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        classTitle: liveClass.title,
        totalStudentsJoined: liveClass.totalStudentsJoined,
        peakViewers: liveClass.peakViewers,
        attendanceRecords: liveClass.attendanceRecords,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance report',
      error: error.message,
    });
  }
};
