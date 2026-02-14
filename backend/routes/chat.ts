import express, { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';
import {
    askQuestion,
    uploadDocument,
    uploadFile,
    getDocuments,
    deleteDocument,
    getChatHistory,
    getChatSession,
    deleteChatSession
} from '../controllers/chatController';
import { protect, authorize } from '../middleware/auth';

const router: Router = express.Router();

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (
            file.mimetype === 'application/pdf' ||
            file.mimetype === 'text/plain' ||
            file.originalname.endsWith('.pdf') ||
            file.originalname.endsWith('.txt')
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only .pdf and .txt files are supported'));
        }
    }
});

/**
 * @route   POST /api/chat/ask
 * @desc    Ask chatbot a question
 * @access  Private
 */
router.post(
    '/ask',
    protect,
    [
        body('question')
            .trim()
            .notEmpty()
            .withMessage('Question is required')
            .isLength({ min: 3, max: 1000 })
            .withMessage('Question must be between 3 and 1000 characters'),
        body('language')
            .optional()
            .isIn(['en', 'am'])
            .withMessage('Language must be en or am'),
        body('mode')
            .optional()
            .isIn(['general', 'where-to-go', 'deadline'])
            .withMessage('Mode must be general, where-to-go, or deadline'),
        body('sessionId')
            .optional()
            .isString()
            .withMessage('Session ID must be a string')
    ],
    askQuestion
);

/**
 * @route   POST /api/chat/upload/text
 * @desc    Upload document text for RAG system (with automatic chunking)
 * @access  Private (Admin/Staff only)
 */
router.post(
    '/upload/text',
    protect,
    authorize('admin', 'staff'),
    [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required')
            .isLength({ min: 3, max: 200 })
            .withMessage('Title must be between 3 and 200 characters'),
        body('content')
            .trim()
            .notEmpty()
            .withMessage('Content is required')
            .isLength({ min: 10 })
            .withMessage('Content must be at least 10 characters'),
        body('category')
            .optional()
            .isIn(['registrar', 'academic', 'department', 'fees', 'deadline', 'lab', 'internship', 'service', 'policy', 'other'])
            .withMessage('Invalid category'),
        body('tags')
            .optional()
            .isArray()
            .withMessage('Tags must be an array')
    ],
    uploadDocument
);

/**
 * @route   POST /api/chat/upload/file
 * @desc    Upload document file for RAG system (PDF/TXT)
 * @access  Private (Admin/Staff only)
 */
router.post(
    '/upload/file',
    protect,
    authorize('admin', 'staff'),
    upload.single('file'),
    uploadFile
);

/**
 * @route   GET /api/chat/documents
 * @desc    Get all documents
 * @access  Private
 */
router.get('/documents', protect, getDocuments);

/**
 * @route   DELETE /api/chat/documents/:id
 * @desc    Delete document and its chunks
 * @access  Private (Admin/Staff only)
 */
router.delete('/documents/:id', protect, authorize('admin', 'staff'), deleteDocument);

/**
 * @route   GET /api/chat/history
 * @desc    Get user's chat history
 * @access  Private
 */
router.get('/history', protect, getChatHistory);

/**
 * @route   GET /api/chat/history/:sessionId
 * @desc    Get specific chat session
 * @access  Private
 */
router.get('/history/:sessionId', protect, getChatSession);

/**
 * @route   DELETE /api/chat/history/:sessionId
 * @desc    Delete chat session
 * @access  Private
 */
router.delete('/history/:sessionId', protect, deleteChatSession);

export default router;
