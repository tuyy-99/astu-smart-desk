import { Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { validationResult, Result, ValidationError } from 'express-validator';
import DocumentModel, { IDocument } from '../models/Document';
import ChatHistory from '../models/ChatHistory';
import { IAuthRequest } from '../types';
import { chunkText, cleanText, extractTextFromFile, truncateText } from '../utils/textProcessing';

/**
 * Voyage AI API response structure
 */
interface VoyageEmbeddingResponse {
    data: Array<{
        embedding: number[];
    }>;
}

/**
 * Initialize Google Gemini AI with 2.0 Flash
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model names
const VOYAGE_MODEL = 'voyage-3-large'; // 1024 dimensions
const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Generate text embeddings using Voyage AI voyage-3-large model
 * @param {string} text - Text to embed
 * @returns {Promise<number[] | null>} Embedding vector (1024 dimensions)
 */
const generateEmbedding = async (text: string): Promise<number[] | null> => {
    try {
        console.log(`🔢 Generating embedding with ${VOYAGE_MODEL}...`);
        console.log('   Text preview:', truncateText(text, 80));

        // Validate API key exists
        if (!process.env.VOYAGE_API_KEY) {
            throw new Error('VOYAGE_API_KEY is not configured');
        }

        const response: AxiosResponse<VoyageEmbeddingResponse> = await axios.post(
            'https://api.voyageai.com/v1/embeddings',
            {
                input: text,
                model: VOYAGE_MODEL
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            }
        );

        if (response.data && response.data.data && response.data.data[0]) {
            const embedding = response.data.data[0].embedding;
            console.log(`✅ Embedding generated successfully (${embedding.length} dimensions)`);

            // Validate embedding has correct dimensions
            if (embedding.length !== 1024) {
                throw new Error(`Invalid embedding dimensions: expected 1024, got ${embedding.length}`);
            }

            return embedding;
        }

        throw new Error('Invalid response from Voyage AI');
    } catch (error) {
        const err = error as any;
        console.error('❌ Error generating embedding:', err.message);

        if (err.response) {
            console.error('Voyage AI API error:', err.response.status, err.response.data);

            // Provide more specific error messages
            if (err.response.status === 401) {
                throw new Error('Voyage AI API key is invalid');
            } else if (err.response.status === 429) {
                throw new Error('Voyage AI rate limit exceeded');
            }
        }

        // Re-throw the error instead of returning null
        throw new Error(`Failed to generate embedding: ${err.message}`);
    }
};

/**
 * Find relevant documents using vector similarity search
 * @param {number[]} queryEmbedding - Query embedding vector
 * @param {number} limit - Max documents to return
 * @returns {Promise<Array<IDocument & { similarity: number }>>} Relevant documents with similarity scores
 */
const findRelevantDocumentsByEmbedding = async (
    queryEmbedding: number[],
    limit: number = 3
): Promise<Array<IDocument & { similarity: number }>> => {
    try {
        console.log('🔍 Searching relevant documents using Atlas Vector Search...');

        // Use native Atlas Vector Search method
        const results = await DocumentModel.vectorSearch(queryEmbedding, limit);

        console.log(`✅ Found ${results.length} relevant documents via Atlas`);
        results.forEach((doc, idx) => {
            console.log(`   ${idx + 1}. "${doc.title}" (score: ${doc.similarity.toFixed(3)})`);
        });

        return results;
    } catch (error) {
        console.error('❌ Error in findRelevantDocumentsByEmbedding:', error);
        return [];
    }
};

/**
 * Find relevant documents for RAG (fallback to text search if no embedding provided)
 * @param {string} query - User query
 * @param {number} limit - Max documents to return
 * @returns {Promise<IDocument[]>} Relevant documents
 */
const findRelevantDocuments = async (query: string, limit: number = 3): Promise<IDocument[]> => {
    try {
        console.log('🔍 Searching for relevant documents (text search fallback)...');

        // Try to use text search
        const documents = await DocumentModel.findSimilar(query, limit);

        if (documents && documents.length > 0) {
            console.log(`✅ Found ${documents.length} relevant documents`);
            return documents;
        }

        console.log('ℹ️  No relevant documents found');
        return [];
    } catch (error) {
        console.error('❌ Error finding relevant documents:', error);
        return [];
    }
};

/**
 * Generate AI response using Google Gemini 2.0 Flash with ASTU-specific context
 * @param {string} question - User question
 * @param {Array} context - Relevant documents for context
 * @param {string} language - Response language ('en' or 'am')
 * @param {string} mode - Chat mode ('general', 'where-to-go', 'deadline')
 * @returns {Promise<string>} AI response
 */
const generateAIResponse = async (
    question: string,
    context: Array<IDocument & { similarity?: number }> = [],
    language: string = 'en',
    mode: string = 'general'
): Promise<string> => {
    try {
        console.log(`🤖 Generating AI response with ${GEMINI_MODEL}...`);
        console.log(`   Language: ${language}, Mode: ${mode}`);

        // Validate API key exists
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        // Initialize Gemini 2.5 Flash model
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        // Build context from documents
        let contextText = '';
        if (context.length > 0) {
            contextText = '\n\nRelevant Information from ASTU Documents:\n';
            context.forEach((doc, index) => {
                const similarityInfo = doc.similarity
                    ? ` (Relevance: ${(doc.similarity * 100).toFixed(1)}%)`
                    : '';
                const contentPreview = truncateText(doc.content, 500);
                contextText += `\n${index + 1}. ${doc.title}${similarityInfo}\n${contentPreview}\n`;

                // Add ASTU-specific metadata if available
                if (doc.officeLocation) {
                    contextText += `   Office Location: ${doc.officeLocation}\n`;
                }
                if (doc.requiredDocuments && doc.requiredDocuments.length > 0) {
                    contextText += `   Required Documents: ${doc.requiredDocuments.join(', ')}\n`;
                }
                if (doc.processSteps && doc.processSteps.length > 0) {
                    contextText += `   Process Steps: ${doc.processSteps.join(' → ')}\n`;
                }
                if (doc.deadlineDate) {
                    contextText += `   Deadline: ${doc.deadlineDate.toLocaleDateString()}\n`;
                }
                if (doc.contactInfo) {
                    contextText += `   Contact: ${doc.contactInfo.phone || ''} ${doc.contactInfo.email || ''}\n`;
                }
            });
        } else {
            console.warn('⚠️  No context documents provided - response may be generic');
        }

        // Base system prompt for ASTU SmartDesk
        let systemPrompt = `You are ASTU SmartDesk, an AI assistant for Adama Science and Technology University (ASTU). Your role is to:

1. Provide accurate information about ASTU services, procedures, and policies
2. Help students navigate university processes (registration, fees, deadlines, etc.)
3. Answer questions about departments, labs, internships, and campus services
4. Be clear, concise, and helpful in your responses
5. Always cite the source documents when providing information
6. If you don't know something, admit it and suggest contacting the relevant office`;

        // Mode-specific instructions
        if (mode === 'where-to-go') {
            systemPrompt += `\n\nSPECIAL MODE: "Where Should I Go?"
- Always include the specific office location
- List all required documents the student needs to bring
- Provide step-by-step process instructions
- Include contact information (phone, email, office hours)`;
        } else if (mode === 'deadline') {
            systemPrompt += `\n\nSPECIAL MODE: "Deadline Assistant"
- Highlight all important dates and deadlines
- Provide clear timeline information
- Warn about upcoming deadlines
- Suggest preparation steps before deadlines`;
        }

        // Language-specific instructions
        if (language === 'am') {
            systemPrompt += `\n\nIMPORTANT: Respond in Amharic (አማርኛ). Provide clear, natural Amharic translations while maintaining accuracy.`;
        } else {
            systemPrompt += `\n\nIMPORTANT: Respond in English. Be clear and professional.`;
        }

        // Combine system prompt, context, and user question
        const fullPrompt = `${systemPrompt}${contextText}\n\nStudent Question: ${question}\n\nAssistant Response:`;

        // Generate response with timeout
        const result = await Promise.race([
            model.generateContent(fullPrompt),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Gemini API timeout after 30 seconds')), 30000)
            )
        ]) as any;

        const response = await result.response;
        const text = response.text();

        if (!text || text.trim().length === 0) {
            throw new Error('Gemini returned empty response');
        }

        console.log('✅ AI response generated successfully');
        console.log('   Response preview:', truncateText(text, 100));

        return text;
    } catch (error) {
        const err = error as Error;
        console.error('❌ Error generating AI response:', err.message);

        // Re-throw with more context instead of returning fallback
        if (err.message && err.message.includes('API_KEY')) {
            throw new Error('Gemini API key is invalid or missing');
        } else if (err.message && err.message.includes('leaked')) {
            throw new Error('Gemini API key has been blocked. Please update GEMINI_API_KEY in .env file with a new key from https://makersuite.google.com/app/apikey');
        } else if (err.message && err.message.includes('403')) {
            throw new Error('Gemini API access forbidden. Please check your API key.');
        } else if (err.message && err.message.includes('timeout')) {
            throw new Error('AI response generation timed out');
        } else if (err.message && err.message.includes('quota')) {
            throw new Error('Gemini API quota exceeded');
        }

        throw new Error(`Failed to generate AI response: ${err.message}`);
    }
};

/**
 * @desc    Ask chatbot a question (RAG implementation with vector search + chat history)
 * @route   POST /api/chat/ask
 * @access  Private
 */
export const askQuestion = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { question, language = 'en', mode = 'general', sessionId } = req.body;

        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
            return;
        }

        console.log('💬 Chat request from user:', req.user.email);
        console.log('Question:', question);
        console.log('Language:', language, 'Mode:', mode);

        // Validate question
        if (!question || question.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Please provide a question'
            });
            return;
        }

        if (question.length > 1000) {
            res.status(400).json({
                success: false,
                message: 'Question is too long (max 1000 characters)'
            });
            return;
        }

        // Generate or use existing session ID
        const chatSessionId = sessionId || `session_${req.user.id}_${Date.now()}`;

        // Step 1: Generate embedding for the question
        let queryEmbedding: number[] | null = null;
        try {
            queryEmbedding = await generateEmbedding(question);
        } catch (embeddingError) {
            console.warn('⚠️  Embedding generation failed, will use text search fallback');
            console.warn('   Error:', (embeddingError as Error).message);
            // Continue with null embedding - will fallback to text search
        }

        let relevantDocs: Array<IDocument & { similarity?: number }> = [];

        // Step 2: Find relevant documents using embedding or fallback to text search
        if (queryEmbedding && queryEmbedding.length > 0) {
            relevantDocs = await findRelevantDocumentsByEmbedding(queryEmbedding, 3);

            // If vector search returns no results, try text search as fallback
            if (relevantDocs.length === 0) {
                console.log('⚠️  Vector search returned no results, trying text search...');
                relevantDocs = await findRelevantDocuments(question, 3);
            }
        } else {
            console.log('⚠️  Using text search (no embedding available)');
            relevantDocs = await findRelevantDocuments(question, 3);
        }

        // Check if we have any relevant documents
        if (relevantDocs.length === 0) {
            console.warn('⚠️  No relevant documents found for question');
        }

        // Step 3: Generate AI response with context (RAG generation)
        const aiResponse = await generateAIResponse(question, relevantDocs, language, mode);

        // Step 4: Save to chat history
        try {
            let chatHistory = await ChatHistory.findOne({
                userId: req.user.id,
                sessionId: chatSessionId,
                isActive: true
            });

            if (!chatHistory) {
                chatHistory = new ChatHistory({
                    userId: req.user.id,
                    sessionId: chatSessionId,
                    messages: [],
                    language,
                    mode
                });
            }

            // Add user message
            chatHistory.messages.push({
                role: 'user',
                content: question,
                timestamp: new Date()
            });

            // Add assistant response with sources
            chatHistory.messages.push({
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date(),
                sources: relevantDocs.map(doc => ({
                    documentId: doc._id,
                    title: doc.title,
                    category: doc.category
                }))
            });

            await chatHistory.save();
            console.log('✅ Chat history saved');
        } catch (historyError) {
            console.error('⚠️  Failed to save chat history:', historyError);
            // Continue even if history save fails
        }

        // Step 5: Return response
        res.status(200).json({
            success: true,
            data: {
                question,
                answer: aiResponse,
                language,
                mode,
                sessionId: chatSessionId,
                sources: relevantDocs.map(doc => ({
                    id: doc._id,
                    title: doc.title,
                    category: doc.category,
                    similarity: doc.similarity,
                    officeLocation: doc.officeLocation,
                    requiredDocuments: doc.requiredDocuments,
                    processSteps: doc.processSteps,
                    deadlineDate: doc.deadlineDate,
                    contactInfo: doc.contactInfo,
                    isChunk: doc.isChunk,
                    chunkIndex: doc.chunkIndex
                })),
                timestamp: new Date()
            }
        });

        console.log('✅ Chat response sent successfully');
    } catch (error) {
        const err = error as Error;
        console.error('❌ Chat error:', err);
        res.status(500).json({
            success: false,
            message: 'Error processing your question',
            error: err.message
        });
    }
};

/**
 * @desc    Upload document for RAG system (with automatic chunking)
 * @route   POST /api/chat/upload/text
 * @access  Private (Admin only)
 */
/**
 * Helper to process and save documents to the database (handles chunking and embeddings)
 */
const processAndSaveDocument = async (
    title: string,
    content: string,
    userId: string,
    category: string = 'other',
    tags: string[] = []
) => {
    // Clean content
    const cleanedContent = cleanText(content);

    // Determine if chunking is needed (>2000 characters)
    const needsChunking = cleanedContent.length > 2000;

    if (needsChunking) {
        console.log(`📑 Document is large (${cleanedContent.length} chars), chunking...`);

        // Create chunks
        const chunks = chunkText(cleanedContent, 1000, 200);
        console.log(`   Created ${chunks.length} chunks`);

        // Create parent document (without embedding, just metadata)
        const parentDoc = await DocumentModel.create({
            title,
            content: cleanedContent,
            category: category || 'other',
            tags: tags || [],
            embedding: [], // Parent doesn't have embedding
            uploadedBy: userId,
            isPublic: true,
            isChunk: false,
            chunkCount: chunks.length
        });

        console.log('✅ Parent document created:', parentDoc._id);

        // Create chunk documents with embeddings
        const chunkPromises = chunks.map(async (chunk, index) => {
            const embedding = await generateEmbedding(chunk.text);

            return DocumentModel.create({
                title: `${title} (Chunk ${index + 1}/${chunks.length})`,
                content: chunk.text,
                category: category || 'other',
                tags: tags || [],
                embedding: embedding || [],
                uploadedBy: userId,
                isPublic: true,
                isChunk: true,
                parentDocumentId: parentDoc._id,
                chunkIndex: chunk.index,
                chunkCount: chunks.length
            });
        });

        await Promise.all(chunkPromises);

        console.log(`✅ All ${chunks.length} chunks created with embeddings`);

        return {
            id: parentDoc._id,
            title: parentDoc.title,
            category: parentDoc.category,
            chunksCreated: chunks.length,
            createdAt: parentDoc.createdAt
        };
    } else {
        console.log('📄 Document is small, creating single document with embedding...');

        // Generate embedding for the document
        const embedding = await generateEmbedding(cleanedContent);

        // Create single document
        const document = await DocumentModel.create({
            title,
            content: cleanedContent,
            category: category || 'other',
            tags: tags || [],
            embedding: embedding || [],
            uploadedBy: userId,
            isPublic: true,
            isChunk: false
        });

        console.log('✅ Document uploaded successfully:', document.title);

        return {
            id: document._id,
            title: document.title,
            category: document.category,
            createdAt: document.createdAt
        };
    }
};

/**
 * @desc    Upload document for RAG system (manual text input)
 * @route   POST /api/chat/upload/text
 * @access  Private (Admin only)
 */
export const uploadDocument = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { title, content, category, tags } = req.body;

        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
            return;
        }

        console.log('📄 Document upload from user:', req.user.email);

        // Validate input
        if (!title || !content) {
            res.status(400).json({
                success: false,
                message: 'Please provide title and content'
            });
            return;
        }

        const result = await processAndSaveDocument(title, content, req.user.id, category, tags);

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: { document: result }
        });
    } catch (error) {
        const err = error as Error;
        console.error('❌ Document upload error:', err);
        res.status(500).json({
            success: false,
            message: 'Error uploading document',
            error: err.message
        });
    }
};

/**
 * @desc    Upload file for RAG system (PDF/TXT)
 * @route   POST /api/chat/upload/file
 * @access  Private (Admin only)
 */
export const uploadFile = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { category, tags } = req.body;
        const file = req.file;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
            return;
        }

        if (!file) {
            res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
            return;
        }

        console.log('📁 File upload from user:', req.user.email);
        console.log(`   File name: ${file.originalname}, size: ${file.size} bytes, mimetype: ${file.mimetype}`);

        if (!file.buffer || file.buffer.length === 0) {
            console.error('❌ File buffer is empty!');
        }

        // Extract text from file
        const content = await extractTextFromFile(file.buffer, file.mimetype || file.originalname);

        if (!content || content.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Could not extract text from the uploaded file'
            });
            return;
        }

        // Use original filename as title if not provided
        const title = req.body.title || file.originalname;

        const result = await processAndSaveDocument(title, content, req.user.id, category, tags);

        res.status(201).json({
            success: true,
            message: 'File uploaded and processed successfully',
            data: { document: result }
        });
    } catch (error: any) {
        console.error('❌ File upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing uploaded file',
            error: error.message
        });
    }
};

/**
 * @desc    Get all documents
 * @route   GET /api/chat/documents
 * @access  Private
 */
export const getDocuments = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { category, search, limit = '20', page = '1', includeChunks = 'false' } = req.query;

        console.log('📚 Fetching documents...');

        // Build query - exclude chunks by default
        const query: any = { isPublic: true };
        if (includeChunks !== 'true') {
            query.isChunk = false;
        }

        if (category) query.category = category;
        if (search) {
            query.$text = { $search: search as string };
        }

        // Parse pagination params
        const limitNum = parseInt(limit as string);
        const pageNum = parseInt(page as string);

        // Execute query with pagination
        const documents = await DocumentModel.find(query)
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const total = await DocumentModel.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                documents,
                pagination: {
                    total,
                    page: pageNum,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        const err = error as Error;
        console.error('❌ Get documents error:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching documents',
            error: err.message
        });
    }
};

/**
 * @desc    Delete document and its chunks
 * @route   DELETE /api/chat/documents/:id
 * @access  Private (Admin only)
 */
export const deleteDocument = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
            return;
        }

        console.log('🗑️  Deleting document:', id);

        // Find the document
        const document = await DocumentModel.findById(id);

        if (!document) {
            res.status(404).json({
                success: false,
                message: 'Document not found'
            });
            return;
        }

        // If it's a parent document, delete all chunks
        if (!document.isChunk && document.chunkCount && document.chunkCount > 0) {
            const deleteResult = await DocumentModel.deleteMany({ parentDocumentId: id });
            console.log(`   Deleted ${deleteResult.deletedCount} chunks`);
        }

        await document.deleteOne();

        console.log('✅ Document deleted successfully');

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        const err = error as Error;
        console.error('❌ Delete document error:', err);
        res.status(500).json({
            success: false,
            message: 'Error deleting document',
            error: err.message
        });
    }
};

/**
 * @desc    Get user's chat history
 * @route   GET /api/chat/history
 * @access  Private
 */
export const getChatHistory = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
            return;
        }

        const { limit = '10', page = '1', sessionId } = req.query;

        console.log('📜 Fetching chat history for user:', req.user.email);

        const query: any = {
            userId: req.user.id,
            isActive: true
        };

        if (sessionId) {
            query.sessionId = sessionId;
        }

        const limitNum = parseInt(limit as string);
        const pageNum = parseInt(page as string);

        const chatHistories = await ChatHistory.find(query)
            .sort({ updatedAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const total = await ChatHistory.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                chatHistories,
                pagination: {
                    total,
                    page: pageNum,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        const err = error as Error;
        console.error('❌ Get chat history error:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching chat history',
            error: err.message
        });
    }
};

/**
 * @desc    Get specific chat session
 * @route   GET /api/chat/history/:sessionId
 * @access  Private
 */
export const getChatSession = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
            return;
        }

        const { sessionId } = req.params;

        console.log('📜 Fetching chat session:', sessionId);

        const chatHistory = await ChatHistory.findOne({
            userId: req.user.id,
            sessionId,
            isActive: true
        });

        if (!chatHistory) {
            res.status(404).json({
                success: false,
                message: 'Chat session not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: { chatHistory }
        });
    } catch (error) {
        const err = error as Error;
        console.error('❌ Get chat session error:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching chat session',
            error: err.message
        });
    }
};

/**
 * @desc    Delete chat session
 * @route   DELETE /api/chat/history/:sessionId
 * @access  Private
 */
export const deleteChatSession = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
            return;
        }

        const { sessionId } = req.params;

        console.log('🗑️  Deleting chat session:', sessionId);

        const result = await ChatHistory.findOneAndUpdate(
            {
                userId: req.user.id,
                sessionId,
                isActive: true
            },
            { isActive: false },
            { new: true }
        );

        if (!result) {
            res.status(404).json({
                success: false,
                message: 'Chat session not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Chat session deleted successfully'
        });
    } catch (error) {
        const err = error as Error;
        console.error('❌ Delete chat session error:', err);
        res.status(500).json({
            success: false,
            message: 'Error deleting chat session',
            error: err.message
        });
    }
};

