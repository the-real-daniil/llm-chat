import PaperPlane from '../ui/paper-plane';

const MainEmptyState = () => {
  const name = 'Mauro Sicard';

  return (
    <div className="flex justify-center items-center mt-10 px-4  ">
      <div className="flex flex-col items-center justify-center rounded-3xl w-[775px] h-[235px] p-11 border border-gray-400 bg-gradient-to-b from-white-200 via-purple-200 to-blue-200 shadow-lg">
        <h1 className="text-2xl text-gray-600 font-bold">Welcome back, {name}</h1>
        <h4 className="text-gray-600 mt-2">Напиши мне, пожалуйста</h4>
        <div className="relative flex-1">
          <input
            placeholder="How can I help you?"
            className="w-full h-12 pl-4 pr-14 rounded-lg border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div
            onClick={() => {
              console.log('Я отправил тебе письмо');
            }}>
            <PaperPlane />
          </div>
        </div>
      </div>
    </div>
  );
};
export default MainEmptyState;