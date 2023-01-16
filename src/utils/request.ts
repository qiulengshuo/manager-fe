import axios from 'axios';

const service = axios.create({
  baseURL: '',
  timeout: 8000,
});

function request(options) {
  return service(options);
}

export default request;
