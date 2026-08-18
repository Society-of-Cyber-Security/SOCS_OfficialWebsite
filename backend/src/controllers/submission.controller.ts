import { Request, Response, NextFunction } from 'express';
import Submission, { SubmissionStatus } from '../models/Submission';
import ErrorResponse from '../utils/errorResponse';

// @desc    Create new submission (project or event)
// @route   POST /api/submissions
// @access  Private (Member+)
export const createSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body.submittedBy = req.user?.id;

    const submission = await Submission.create(req.body);

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get my submissions
// @route   GET /api/submissions/mine
// @access  Private (Member+)
export const getMySubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissions = await Submission.find({ submittedBy: req.user?.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get pending submissions
// @route   GET /api/submissions/pending
// @access  Private (Admin+)
export const getPendingSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissions = await Submission.find({ status: SubmissionStatus.PENDING })
      .populate('submittedBy', 'name email')
      .sort('createdAt');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (err) {
    next(err);
  }
};

import Project from '../models/Project';
import Event from '../models/Event';
import Resource from '../models/Resource';

// @desc    Review submission (Approve/Reject)
// @route   PATCH /api/submissions/:id/review
// @access  Private (Admin+)
export const reviewSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let submission = await Submission.findById(req.params.id);

    if (!submission) {
      return next(new ErrorResponse(`Submission not found with id of ${req.params.id}`, 404));
    }

    // Update fields
    submission.status = req.body.status;
    submission.reviewNote = req.body.reviewNote;
    submission.reviewedBy = req.user?.id as any;

    if (submission.status === SubmissionStatus.APPROVED && submission.payload) {
      const p = submission.payload;
      if (submission.type === 'project') {
        await Project.create({
          title: submission.title,
          description: submission.description,
          tags: p.tags || [],
          repoUrl: p.repoUrl || submission.attachmentUrl,
          uploadedBy: submission.submittedBy,
          isPublished: true
        });
      } else if (submission.type === 'event') {
        await Event.create({
          title: submission.title,
          description: submission.description,
          date: p.date || new Date(),
          location: p.location || 'TBA',
          type: p.type || 'other',
          registrationLink: p.registrationLink || submission.attachmentUrl,
          isPublished: true
        });
      } else if (submission.type === 'resource') {
        await Resource.create({
          title: submission.title,
          description: submission.description,
          category: p.category || 'other',
          url: p.url || p.fileUrl || submission.attachmentUrl || 'https://example.com',
          tags: p.tags || [],
          uploadedBy: submission.submittedBy
        });
      }
    }

    await submission.save();

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (err) {
    next(err);
  }
};
