const express = require('express');
const Blog = require('../model/blog');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Public - Get all blogs with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const blogs = await Blog.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Blog.countDocuments();

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            totalBlogs: total,
            blogs,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});
  

// Public - Get blog by ID
router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
});


//  Delete blog
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});



// Admin Only - Create blog
router.post('/', authenticate, upload.single('image'), async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);
        const { title, content } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const newBlog = new Blog({
            title,
            content,
            imageUrl
        });

        await newBlog.save();
        res.status(201).json({msg: "blog is created sucessfully" , Blog : newBlog});
    } catch (err) {
        res.status(500).json({ error: 'Failed to create blog', message: err.message });
    }
});

// Editing blog using patch
router.patch('/:id', authenticate, upload.single('image'), async (req, res) => {
    try {
        const updates = {};

        if (req.body.title) updates.title = req.body.title;
        if (req.body.content) updates.content = req.body.content;
        if (req.file) updates.imageUrl = `/uploads/${req.file.filename}`;

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedBlog) return res.status(404).json({ error: 'Blog not found' });

        res.json({
            msg: "The blog is updated successfully",
            blog: updatedBlog
        });
          
    } catch (err) {
        res.status(500).json({ error: 'Failed to update blog', message: err.message });
    }
});


module.exports = router;
