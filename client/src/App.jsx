import {useEffect, useState} from 'react'
import { Upload } from 'antd';
import axios from 'axios';
import { InboxOutlined } from '@ant-design/icons';
import './App.css'
import 'antd/dist/antd.css';

const { Dragger } = Upload;

const chunkSize = 10 * 1024; // 10KB

function App() {
  const [file, setFile] = useState(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(null);
  const [completed, setCompleted] = useState(false);

  function readAndUploadCurrentChunk() {
    const reader = new FileReader();
    const from = currentChunkIndex * chunkSize;
    const to = from + chunkSize;
    const blob = file.slice(from, to);
    reader.onload = e => uploadChunk(e);
    reader.readAsDataURL(blob);
  }

  function uploadChunk(readerEvent) {
    const data = readerEvent.target.result;
    const params = new URLSearchParams();
    params.set('name', file.name);
    params.set('currentChunkIndex', currentChunkIndex);
    params.set('totalChunks', Math.ceil(file.size / chunkSize));
    const headers = {'Content-Type': 'application/octet-stream'};
    const url = 'http://localhost:3000/upload?'+params.toString();

    axios.post(url, data, {headers})
      .then(response => {
        const chunks = Math.ceil(file.size / chunkSize) - 1;
        const isLastChunk = currentChunkIndex === chunks;
        if (isLastChunk) {
          setCompleted(true);
        } else {
          setCurrentChunkIndex(currentChunkIndex + 1);
        }
      });
  }

  function handleDrop(e) {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  }

  useEffect(() => {
    if (file) {
      setCurrentChunkIndex(0);
    }
  }, [file]);

  useEffect(() => {
    if (currentChunkIndex !== null) {
      readAndUploadCurrentChunk();
    }
  }, [currentChunkIndex]);

  useEffect(() => {
    if (completed) {
      console.info('업로드 완료');
    }
  }, [completed]);

  return (
    <div className="App">
      <Dragger
          name='file'
          disabled={!!file}
          openFileDialogOnClick={false}
          beforeUpload={() => false}
          onDrop={e => handleDrop(e)}
          multiple={false}
      >
          <p className="ant-upload-drag-icon">
              <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibit from uploading company data or other
              band files
          </p>
      </Dragger>
    </div>
  )
}

export default App
