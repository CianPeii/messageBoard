import { useCallback, useEffect, useState } from "react";
import "./App.css";
import styled from "styled-components";

const API_ENDPOINT =
  "https://student-json-api.lidemy.me/comments?_sort=createdAt&_order=desc";

const Page = styled.div`
  width: 300px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
`;

const MessageForm = styled.form`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
`;

const MessageTextArea = styled.textarea`
  width: initial;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
`;

const SubmitButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }
`;

const MessageList = styled.div`
  margin-top: 16px;
`;

const MessageContainer = styled.div`
  border: 1px solid #ddd;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: white;
`;

const MessageHead = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #666;
  border-bottom: 2px solid #ccc;
  padding-bottom: 4px;
`;

const MessageAuthor = styled.span`
  font-weight: bold;
`;

const MessageTime = styled.span`
  font-size: 0.8em;
`;

const MessageBody = styled.div`
  margin-bottom: 16px;
  color: #333;
`;

const ErroMessage = styled.div`
  margin-top: 16px;
  color: red;
`;
const Loading = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function Message({ author, time, children }) {
  return (
    <MessageContainer>
      <MessageHead>
        <MessageAuthor>{author}</MessageAuthor>
        <MessageTime>{time}</MessageTime>
      </MessageHead>
      <MessageBody>{children}</MessageBody>
    </MessageContainer>
  );
}

function App() {
  const [message, setMessage] = useState([]);
  const [messageApiError, setMessageApiError] = useState(null);
  const [value, setValue] = useState("");
  const [postMessageError, setPostMessageError] = useState(null);
  const [isLoadingPostMessage, setIsLoadingPostMessage] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINT);
      const data = await res.json();
      setMessage(data);
    } catch (err) {
      setMessageApiError(err.message);
    }
  }, []);
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // 限制輸入150字
  const handleTextAreaChange = useCallback((e) => {
    const inputValue = e.target.value;
    if (inputValue.length <= 150) {
      setValue(inputValue);
    }
  }, []);

  const handleTextAreaFocus = () => {
    setPostMessageError(null);
  };
  const handleFormSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isLoadingPostMessage) {
        return;
      }
      setIsLoadingPostMessage(true);

      try {
        const res = await fetch("https://student-json-api.lidemy.me/comments", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            nickname: "User Pei",
            body: value,
          }),
        });
        const data = await res.json();
        setIsLoadingPostMessage(false);
        if (!data.ok) {
          setPostMessageError(data.message);
        }
        setValue("");
        fetchMessages();
      } catch (err) {
        setIsLoadingPostMessage(false);
        setPostMessageError(err.message);
      }
    },
    [isLoadingPostMessage, value, fetchMessages]
  );

  return (
    <Page>
      {isLoadingPostMessage && <Loading>Loading...</Loading>}
      <Title>留言板</Title>
      <MessageForm onSubmit={handleFormSubmit}>
        <MessageTextArea
          rows="5"
          value={value}
          onChange={handleTextAreaChange}
          onFocus={handleTextAreaFocus}
          placeholder="請輸入留言（限150字）"
          maxLength={150}
        />
        <SubmitButton>發送留言</SubmitButton>
        {postMessageError && <ErroMessage>{postMessageError}</ErroMessage>}
      </MessageForm>
      {messageApiError && (
        <ErroMessage>
          Something went worng.{messageApiError.toString()}
        </ErroMessage>
      )}
      <MessageList>
        {message && message.length === 0 && (
          <div style={{ fontWeight: 700 }}>No message</div>
        )}
        {message &&
          message.map((message) => {
            return (
              <Message
                key={message.id}
                author={message.nickname}
                time={new Date(message.createdAt).toLocaleString()}
              >
                {message.body}
              </Message>
            );
          })}
      </MessageList>
    </Page>
  );
}

export default App;
