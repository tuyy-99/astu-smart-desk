import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';

/**
 * Chat Message interface
 */
export interface IChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sources?: Array<{
        documentId: mongoose.Types.ObjectId;
        title: string;
        category: string;
    }>;
}

/**
 * Chat History interface
 */
export interface IChatHistory extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId | IUser;
    sessionId: string;
    messages: IChatMessage[];
    language: 'en' | 'am';
    mode?: 'general' | 'where-to-go' | 'deadline';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Chat History Schema
 */
const chatHistorySchema = new Schema<IChatHistory>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        sessionId: {
            type: String,
            required: true
        },
        messages: [{
            role: {
                type: String,
                enum: ['user', 'assistant'],
                required: true
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            sources: [{
                documentId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Document'
                },
                title: String,
                category: String
            }]
        }],
        language: {
            type: String,
            enum: ['en', 'am'],
            default: 'en'
        },
        mode: {
            type: String,
            enum: ['general', 'where-to-go', 'deadline'],
            default: 'general'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Index for efficient queries
chatHistorySchema.index({ userId: 1, createdAt: -1 });
chatHistorySchema.index({ sessionId: 1 });

const ChatHistory: Model<IChatHistory> = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);

export default ChatHistory;
