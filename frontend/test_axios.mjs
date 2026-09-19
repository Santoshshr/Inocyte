import axios from 'axios';
import FormData from 'form-data';

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

const fd = new FormData();
fd.append('name', 'Test');

apiClient.interceptors.request.use(config => {
  console.log("Headers before send:", config.headers);
  return config;
});

apiClient.post('http://localhost:8000/api/companies/', fd, {
  headers: {
    'Content-Type': undefined,
  }
}).catch(err => {
    console.log(err.message);
});
