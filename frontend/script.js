const BASE_URL = 'https://blog-website-dva5.onrender.com';
const token = localStorage.getItem('token');

// =================== LOGIN PAGE ===================
if (window.location.pathname.includes('login.html')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = 'admin.html';
            } else {
                document.getElementById('error').textContent = data.error || 'Login failed';
            }
        } catch (err) {
            document.getElementById('error').textContent = 'Network error';
        }
    });
}

// =================== ADMIN DASHBOARD ===================
if (window.location.pathname.includes('admin.html')) {
    if (!token) {
        alert('Unauthorized! Redirecting to login...');
        window.location.href = 'login.html';
    }

    // Submit New Blog
    document.getElementById('blog-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const res = await fetch(`${BASE_URL}/api/blogs`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const result = await res.json();
        if (res.ok) {
            alert("Blog posted successfully!");
            form.reset();
            location.reload(); // Reload to show new blog
        } else {
            alert(result.error || "Failed to post blog");
        }
    });

    // Fetch Blogs
    fetch(`${BASE_URL}/api/blogs`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('admin-blogs');
            list.innerHTML = '';

            data.blogs.forEach(blog => {
                const div = document.createElement('div');
                div.className = 'blog';
                div.innerHTML = `
                <h4>${blog.title}</h4>
                ${blog.imageUrl ? `<img src="${BASE_URL}${blog.imageUrl}" style="max-width:100px;" />` : ''}
                <p><small>${new Date(blog.createdAt).toLocaleString()}</small></p>
                <button onclick="editBlog('${blog._id}')">✏ Edit</button>
                <button onclick="deleteBlog('${blog._id}')">🗑 Delete</button>
                <hr/>
              `;
                list.appendChild(div);
            });
        });

    // Delete Blog
    window.deleteBlog = async function (id) {
        if (!confirm('Are you sure?')) return;

        const res = await fetch(`${BASE_URL}/api/blogs/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            alert('Deleted!');
            location.reload();
        }
    };

    // Edit Blog
    window.editBlog = async function (id) {
        const res = await fetch(`${BASE_URL}/api/blogs/${id}`);
        const blog = await res.json();

        document.querySelector('input[name="title"]').value = blog.title;
        document.querySelector('textarea[name="content"]').value = blog.content;

        document.getElementById('blog-form').onsubmit = async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

            const res = await fetch(`${BASE_URL}/api/blogs/${id}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const result = await res.json();
            alert("Blog updated!");
            form.reset();
            location.reload();
        };
    };
}

// =================== LOGOUT ===================
window.logout = function () {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
};

