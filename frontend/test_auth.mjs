import axios from 'axios';
import FormData from 'form-data';

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

const fd = new FormData();
fd.append('name', 'Test');
fd.append('tagline', '');
fd.append('description', '');
fd.append('status', 'upcoming');
fd.append('website_url', '');
fd.append('display_order', '0');
fd.append('is_featured', 'false');

// simulate frontend
apiClient.post('http://localhost:8000/api/companies/', fd, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg5ODM5ODUyLCJpYXQiOjE3ODk4MzgwNTIsImp0aSI6IjY1MDE0NzE0ZjU2ODRhMzE4NWJmZDlkY2I3YzY2NjZkIiwidXNlcl9pZCI6ImE4YTFmNDk1LTFiOGQtNGVkYS1iYWU5LTQ1MjkzMmNlZjQwYiJ9.9s3JZI9vOlnEoYk5AkoKOhWxxPadMXqjmMsnv06Zoj8'
  }
}).then(res => console.log(res.data)).catch(err => {
    console.log(err.response.data);
});
