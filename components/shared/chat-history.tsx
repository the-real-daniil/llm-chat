const ChatHistory = () => {
  const chats = ["chat 1", "chat 2", "chat 3"];
  return (
    <div>
      <h1 className="mb-5 text-2xl text-gray-400">CHAT HISTORY</h1>
      {chats.map((item, index) => {
        return (
          <div
            key={index}
            className={"mb-7 hover:cursor-pointer text-gray-600"
            }>
            {item}
          </div>
        );
      })}
    </div>
  );
};
export default ChatHistory;