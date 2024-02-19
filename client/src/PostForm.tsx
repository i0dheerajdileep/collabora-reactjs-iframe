// PostForm.tsx
import React, { ChangeEvent, FormEvent, useState } from 'react';

interface PostFormProps {
  onSubmit: (message: string) => void;
}

const PostForm: React.FC<PostFormProps> = ({ onSubmit }) => {
  const [postMessage, setPostMessage] = useState<string>('');

  const handlePostInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPostMessage(event.target.value);
  };

  const handlePostMessageSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(postMessage);
    setPostMessage('');
  };

  return (
    <form onSubmit={handlePostMessageSubmit}>
      <label>Enter post message</label>
      <input type='text' value={postMessage} onChange={handlePostInputChange} />
      <button type='submit'>Submit</button>
    </form>
  );
};

export default PostForm;
